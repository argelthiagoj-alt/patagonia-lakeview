"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Power } from "lucide-react";
import { cn } from "@/lib/utils";

export function CabinActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(`/api/admin/cabins/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Desactivar cabaña" : "Activar cabaña"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-50",
        active
          ? "bg-[color:var(--color-success)]/12 text-[color:var(--color-success)] hover:bg-[color:var(--color-success)]/20"
          : "bg-[color:var(--color-text-muted)]/15 text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-text-muted)]/25"
      )}
    >
      <Power size={12} strokeWidth={2} />
      {pending ? "…" : active ? "Activa" : "Inactiva"}
    </button>
  );
}
