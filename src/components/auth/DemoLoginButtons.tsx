"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

type DemoUser = {
  email: string;
  label: string;
  caption: string;
  tone: "moss" | "accent" | "stone";
  icon: React.ReactNode;
};

const DEMO_USERS: DemoUser[] = [
  {
    email: "superadmin@patagonialakeview.demo",
    label: "Super-admin",
    caption: "Ve todo · banear · asignar roles",
    tone: "moss",
    icon: <ShieldCheck size={14} strokeWidth={1.75} />,
  },
  {
    email: "admin1@patagonialakeview.demo",
    label: "Admin 1 · Pro",
    caption: "Lucía · Arrayán + Ciprés",
    tone: "accent",
    icon: <Sparkles size={14} strokeWidth={1.75} />,
  },
  {
    email: "admin2@patagonialakeview.demo",
    label: "Admin 2",
    caption: "Martín · Cóndor Mountain Refuge",
    tone: "stone",
    icon: <User size={14} strokeWidth={1.75} />,
  },
  {
    email: "admin3@patagonialakeview.demo",
    label: "Admin 3",
    caption: "Sofía · Lenga Superior Cabin",
    tone: "stone",
    icon: <User size={14} strokeWidth={1.75} />,
  },
  {
    email: "user@patagonialakeview.demo",
    label: "Usuario",
    caption: "Tomás · perfil + reservas demo",
    tone: "stone",
    icon: <User size={14} strokeWidth={1.75} />,
  },
];

const toneClass: Record<DemoUser["tone"], string> = {
  moss: "border-[color:var(--color-moss)]/40 hover:bg-[color:var(--color-moss)]/10",
  accent: "border-[color:var(--color-accent)]/40 hover:bg-[color:var(--color-accent)]/10",
  stone: "border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-muted)]",
};

export function DemoLoginButtons() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loginAs(email: string) {
    setError(null);
    setActiveEmail(email);
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/demo-login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error ?? "No se pudo entrar como demo.");
          setActiveEmail(null);
          return;
        }
        router.push(
          data?.user?.role === "SUPER_ADMIN" || data?.user?.role === "ADMIN"
            ? "/admin"
            : "/dashboard"
        );
        router.refresh();
      } catch {
        setError("Sin conexión.");
        setActiveEmail(null);
      }
    });
  }

  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]/40 p-5 space-y-3">
      <div className="space-y-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
          Modo demo
        </p>
        <p className="text-sm text-[color:var(--color-text-primary)]">
          Entrá con un click usando cuentas de prueba.
        </p>
      </div>
      <div className="grid gap-2">
        {DEMO_USERS.map((u) => {
          const loading = pending && activeEmail === u.email;
          return (
            <button
              key={u.email}
              type="button"
              onClick={() => loginAs(u.email)}
              disabled={pending}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border bg-white/70 px-4 py-3 text-left text-sm transition-all",
                toneClass[u.tone],
                pending && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-surface)]">
                  {u.icon}
                </span>
                <div className="space-y-0.5">
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    {u.label}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    {u.caption}
                  </p>
                </div>
              </div>
              {loading ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[color:var(--color-text-secondary)] border-r-transparent" />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                  Entrar →
                </span>
              )}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-xs text-[color:var(--color-error)]">{error}</p>
      )}
      <p className="text-[10px] text-[color:var(--color-text-muted)]">
        Password compartida para login manual:{" "}
        <code className="rounded bg-black/5 px-1">demo1234</code>
      </p>
    </div>
  );
}
