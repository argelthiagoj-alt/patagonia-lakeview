"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

const RESEND_COOLDOWN_S = 60;

export function VerifyEmailForm({
  email,
  alreadyVerified = false,
}: {
  email: string;
  alreadyVerified?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, code }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.error ?? "No pudimos verificar el código.");
          return;
        }
        setSuccess(data?.message ?? "Email verificado.");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 800);
      } catch {
        setError("Sin conexión. Intentá de nuevo.");
      }
    });
  }

  async function resend() {
    if (cooldown > 0) return;
    setResending(true);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setInfo(data?.message ?? "Te enviamos otro código.");
        setCooldown(RESEND_COOLDOWN_S);
      } else {
        setError(data?.error ?? "No pudimos enviar el código.");
      }
    } finally {
      setResending(false);
    }
  }

  if (alreadyVerified) {
    return (
      <div className="surface-paper space-y-3 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]">
          <Check size={22} strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-medium">Tu email está verificado</h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Listo, no hace falta volver a confirmar.
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => router.push("/dashboard")}
        >
          Ir al dashboard
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-5 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Verificá tu email</h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Te enviamos un código de 6 dígitos a <strong>{email}</strong>. Ingresalo
          acá para confirmar la cuenta.
        </p>
      </div>

      <Field label="Código" htmlFor="ve-code">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <KeyRound size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="ve-code"
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
      {info && !error && !success && (
        <p className="text-xs text-[color:var(--color-text-muted)]">{info}</p>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Verificando…" : "Confirmar email"}
      </Button>

      <div className="border-t border-[color:var(--color-border)] pt-4 text-center text-sm text-[color:var(--color-text-secondary)]">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resending}
          className="text-[color:var(--color-text-primary)] underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {resending
            ? "Enviando…"
            : cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : "Reenviar código"}
        </button>
      </div>
    </form>
  );
}
