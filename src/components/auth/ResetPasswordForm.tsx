"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle, Check, KeyRound, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

const RESEND_COOLDOWN_S = 60;

export function ResetPasswordForm({
  initialEmail,
}: {
  initialEmail?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, code, password, confirmPassword }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 429) {
          setError(data?.error ?? "Demasiados intentos. Esperá unos minutos.");
          return;
        }
        if (!res.ok) {
          setError(data?.error ?? "No pudimos restablecer la contraseña.");
          return;
        }

        setSuccess(data?.message ?? "Contraseña actualizada.");
        setTimeout(() => router.push("/login"), 1000);
      } catch {
        setError("Sin conexión. Intentá de nuevo.");
      }
    });
  }

  async function resend() {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    setResentMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResentMessage("Te enviamos otro código si el email existe.");
        setResendCooldown(RESEND_COOLDOWN_S);
      } else if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Demasiados intentos.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-5 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">
          Nueva contraseña
        </h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Ingresá el código de 6 dígitos que recibiste por mail y elegí una
          nueva contraseña.
        </p>
      </div>

      <Field label="Email" htmlFor="rp-email">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Mail size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="rp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            required
            className="h-11 border-0 bg-transparent px-0 focus:bg-transparent"
          />
        </div>
      </Field>

      <Field label="Código (6 dígitos)" htmlFor="rp-code">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <KeyRound size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="rp-code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            autoComplete="one-time-code"
            required
            className="h-11 border-0 bg-transparent px-0 tracking-[0.3em] font-medium focus:bg-transparent"
          />
        </div>
      </Field>

      <Field label="Nueva contraseña" htmlFor="rp-pass" hint="Mínimo 8 caracteres.">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Lock size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="rp-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11 border-0 bg-transparent px-0 focus:bg-transparent"
          />
        </div>
      </Field>

      <Field label="Repetí la contraseña" htmlFor="rp-pass2">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Lock size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="rp-pass2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11 border-0 bg-transparent px-0 focus:bg-transparent"
          />
        </div>
      </Field>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/10 p-3 text-sm text-[color:var(--color-success)]">
          <Check size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Actualizando…" : "Guardar nueva contraseña"}
      </Button>

      <div className="space-y-1 border-t border-[color:var(--color-border)] pt-4 text-center text-sm text-[color:var(--color-text-secondary)]">
        <button
          type="button"
          onClick={resend}
          disabled={!email || resendCooldown > 0 || resending}
          className="text-[color:var(--color-text-primary)] underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resending
            ? "Enviando…"
            : resendCooldown > 0
            ? `Reenviar código en ${resendCooldown}s`
            : "Reenviar código"}
        </button>
        {resentMessage && (
          <p className="text-xs text-[color:var(--color-text-muted)]">
            {resentMessage}
          </p>
        )}
        <p>
          <Link
            href="/login"
            className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
          >
            Volver a ingresar
          </Link>
        </p>
      </div>
    </form>
  );
}
