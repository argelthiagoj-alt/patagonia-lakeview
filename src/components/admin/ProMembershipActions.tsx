"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Botonera cliente del panel /admin/pro-membership.
 * - Si NO está activo, muestra "Suscribirme a Pro".
 * - Si está activo, muestra "Cancelar suscripción" con confirmación.
 */
export function ProMembershipActions({ isActive }: { isActive: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<"subscribed" | "cancelled" | null>(
    null
  );

  function subscribe() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/pro/subscribe", { method: "POST" });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos suscribirte. Probá nuevamente.");
          return;
        }
        setSuccess("subscribed");
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  function cancel() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/pro/cancel", { method: "POST" });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos cancelar tu suscripción.");
          return;
        }
        setSuccess("cancelled");
        setConfirmOpen(false);
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  if (success === "subscribed") {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-success)]">
        <Check size={14} strokeWidth={1.75} /> Suscripción activada.
      </p>
    );
  }
  if (success === "cancelled") {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)]">
        <Check size={14} strokeWidth={1.75} /> Membresía cancelada.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {!isActive ? (
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={subscribe}
          disabled={pending}
        >
          <Crown size={14} strokeWidth={1.75} />
          {pending ? "Activando…" : "Suscribirme a Pro"}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
        >
          Cancelar suscripción
        </Button>
      )}

      {error && (
        <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-error)]">
          <AlertCircle size={12} strokeWidth={1.75} /> {error}
        </p>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div className="surface-paper w-full max-w-md space-y-4 p-6">
            <h3 className="text-lg font-medium tracking-tight">
              ¿Anular tu membresía Pro?
            </h3>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Vas a perder la prioridad en el catálogo y el badge Pro Host.
              Podés volver a suscribirte cuando quieras.
            </p>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setConfirmOpen(false)}
                disabled={pending}
              >
                Mantener Pro
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={cancel}
                disabled={pending}
              >
                {pending ? "Cancelando…" : "Sí, cancelar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
