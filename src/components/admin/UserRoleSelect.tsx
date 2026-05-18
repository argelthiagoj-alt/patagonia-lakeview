"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

const ROLES: { value: Role; label: string }[] = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super-admin" },
];

export function UserRoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: Role;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function onChange(role: Role) {
    if (role === currentRole) return;

    if (
      role === "USER" &&
      currentRole === "ADMIN" &&
      !confirm("Este admin perderá acceso al panel. ¿Continuar?")
    )
      return;
    if (
      role === "SUPER_ADMIN" &&
      !confirm(
        "Vas a otorgar permisos de super-admin. Esta cuenta podrá ver TODO y cambiar roles. ¿Continuar?"
      )
    )
      return;

    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "No pudimos actualizar el rol.");
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 1500);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={currentRole}
        onChange={(e) => onChange(e.target.value as Role)}
        disabled={pending || isSelf}
        title={isSelf ? "No podés cambiar tu propio rol" : undefined}
        className={cn(
          "h-9 rounded-full border bg-white/70 px-3 text-xs font-medium transition",
          isSelf
            ? "border-[color:var(--color-border)] text-[color:var(--color-text-muted)] cursor-not-allowed"
            : "border-[color:var(--color-border)] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]",
          pending && "opacity-50"
        )}
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>

      {pending && (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[color:var(--color-text-secondary)] border-r-transparent" />
      )}
      {success && !pending && (
        <Check
          size={14}
          strokeWidth={2}
          className="text-[color:var(--color-success)]"
          aria-label="Guardado"
        />
      )}
      {error && (
        <span
          title={error}
          className="inline-flex items-center text-[color:var(--color-error)]"
        >
          <AlertCircle size={14} strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}
