"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = "FREE" | "PRO";

export function UserPlanToggle({
  userId,
  plan,
  isAdminTarget,
  proUntil,
}: {
  userId: string;
  plan: Plan;
  isAdminTarget: boolean;
  proUntil: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAdminTarget) {
    return (
      <span className="text-[11px] text-[color:var(--color-text-muted)]">—</span>
    );
  }

  function toggle() {
    const next: Plan = plan === "PRO" ? "FREE" : "PRO";
    if (
      next === "PRO" &&
      !confirm(
        "¿Activar plan Pro? Las cabañas de este anfitrión van a aparecer primero en el catálogo público."
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: next, durationDays: 365 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No se pudo cambiar el plan.");
        return;
      }
      router.refresh();
    });
  }

  const proStillActive = plan === "PRO" && (!proUntil || new Date(proUntil) > new Date());

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition",
          proStillActive
            ? "bg-[color:var(--color-accent)]/15 text-[color:var(--color-accent-hover)] hover:bg-[color:var(--color-accent)]/25"
            : "border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-hover)]",
          pending && "opacity-50"
        )}
      >
        <Sparkles size={11} strokeWidth={2} />
        {proStillActive ? "Pro" : "Free"}
      </button>
      {error && (
        <span title={error} className="text-[10px] text-[color:var(--color-error)]">
          !
        </span>
      )}
    </div>
  );
}
