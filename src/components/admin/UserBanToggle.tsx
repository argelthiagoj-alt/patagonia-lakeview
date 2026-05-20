"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserBanToggle({
  userId,
  isBanned,
  isSelf,
}: {
  userId: string;
  isBanned: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    if (isSelf) return;
    setError(null);

    if (!isBanned) {
      const reason = prompt("Motivo del baneo (opcional)") ?? undefined;
      if (
        !confirm(
          "¿Banear este usuario? Va a perder el acceso y se cerrarán sus sesiones."
        )
      ) {
        return;
      }
      startTransition(async () => {
        const res = await fetch(`/api/admin/users/${userId}/ban`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isBanned: true, reason }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data?.error ?? "No se pudo banear.");
          return;
        }
        router.refresh();
      });
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isBanned: false }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No se pudo desbanear.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending || isSelf}
        title={
          isSelf
            ? "No podés banearte a vos mismo"
            : isBanned
            ? "Desbanear"
            : "Banear"
        }
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
          isSelf && "cursor-not-allowed opacity-50",
          isBanned
            ? "bg-[color:var(--color-error)]/15 text-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/25"
            : "border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-error)] hover:text-[color:var(--color-error)]",
          pending && "opacity-50"
        )}
      >
        {isBanned ? <ShieldOff size={11} strokeWidth={2} /> : <Ban size={11} strokeWidth={2} />}
        {isBanned ? "Baneado" : "Banear"}
      </button>
      {error && (
        <span title={error} className="text-[10px] text-[color:var(--color-error)]">
          !
        </span>
      )}
    </div>
  );
}
