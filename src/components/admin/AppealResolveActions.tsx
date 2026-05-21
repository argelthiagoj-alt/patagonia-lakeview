"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppealResolveActions({ appealId }: { appealId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resolve(decision: "APPROVED" | "REJECTED") {
    const verbo = decision === "APPROVED" ? "aprobar" : "rechazar";
    const resolution =
      prompt(
        `Comentario para ${verbo} la apelación (opcional, queda registrado).`
      ) ?? "";

    if (
      decision === "APPROVED" &&
      !confirm(
        "Al aprobar, la review queda removida y deja de contar para el rating. ¿Continuar?"
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/appeals/${appealId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision, resolution }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No se pudo resolver la apelación.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 border-t border-[color:var(--color-border)] pt-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => resolve("APPROVED")}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-[color:var(--color-success)]/15 px-3 py-1 text-xs font-medium text-[color:var(--color-success)] transition hover:bg-[color:var(--color-success)]/25",
            pending && "opacity-50"
          )}
        >
          <Check size={11} strokeWidth={2} />
          Aprobar (remover review)
        </button>
        <button
          type="button"
          onClick={() => resolve("REJECTED")}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-[color:var(--color-error)]/12 px-3 py-1 text-xs font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error)]/20",
            pending && "opacity-50"
          )}
        >
          <X size={11} strokeWidth={2} />
          Rechazar
        </button>
      </div>
      {error && (
        <span className="text-[10px] text-[color:var(--color-error)]" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}
