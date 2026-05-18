"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertCircle, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 429) {
          setError(data?.error ?? "Demasiados intentos. Esperá unos minutos.");
          return;
        }
        if (!res.ok && !data?.message) {
          setError(data?.error ?? "No pudimos procesar tu pedido.");
          return;
        }

        setSuccess(
          data?.message ??
            "Si el email está registrado, te enviamos un código. Revisá tu casilla."
        );

        // Forward the user straight to the reset step with the email prefilled
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1200);
      } catch {
        setError("Sin conexión. Intentá de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-5 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">¿Olvidaste la contraseña?</h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Ingresá tu email y te mandamos un código de 6 dígitos para crear una nueva.
        </p>
      </div>

      <Field label="Email" htmlFor="fp-email">
        <div className="flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3">
          <Mail size={15} strokeWidth={1.5} className="text-[color:var(--color-text-secondary)]" />
          <Input
            id="fp-email"
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
        {pending ? "Enviando…" : "Enviar código"}
      </Button>

      <div className="space-y-1 text-center text-sm text-[color:var(--color-text-secondary)]">
        <p>
          ¿Te acordaste?{" "}
          <Link
            href="/login"
            className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
          >
            Volver a ingresar
          </Link>
        </p>
        <p>
          ¿Ya tenés el código?{" "}
          <Link
            href="/reset-password"
            className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
          >
            Ingresalo acá
          </Link>
        </p>
      </div>
    </form>
  );
}
