"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminAppealButton({
  reviewId,
  canAppeal,
  canDelete,
}: {
  reviewId: string;
  canAppeal: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canAppeal && !canDelete) return null;

  function appeal() {
    const reason = prompt(
      "Motivo de la apelación (mínimo 10 caracteres). Un super-admin va a revisarla."
    );
    if (!reason || reason.trim().length < 10) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}/appeal`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No se pudo apelar.");
        return;
      }
      router.refresh();
    });
  }

  function remove() {
    if (!confirm("¿Eliminar la review? Acción de super-admin.")) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No se pudo eliminar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {canAppeal && (
        <button
          type="button"
          onClick={appeal}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[10px] font-medium text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-warning)] hover:text-[color:var(--color-warning)]",
            pending && "opacity-50"
          )}
          title="Apelar"
        >
          <Flag size={11} strokeWidth={2} />
          Apelar
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[10px] font-medium text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-error)] hover:text-[color:var(--color-error)]",
            pending && "opacity-50"
          )}
          title="Eliminar (super-admin)"
        >
          <Trash2 size={11} strokeWidth={2} />
          Eliminar
        </button>
      )}
      {error && (
        <span className="text-[10px] text-[color:var(--color-error)]" title={error}>
          !
        </span>
      )}
    </div>
  );
}
