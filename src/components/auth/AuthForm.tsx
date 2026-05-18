"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { GoogleButton } from "@/components/auth/GoogleButton";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [pending, startTransition] = useTransition();

  // Surface OAuth redirect errors carried in ?error=
  useEffect(() => {
    const e = params?.get("error");
    if (e) setError(e);
  }, [params]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDemoMode(false);

    startTransition(async () => {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.demoMode) {
            setDemoMode(true);
            return;
          }
          setError(
            data?.error ??
              (mode === "login"
                ? "No pudimos iniciar sesión."
                : "No pudimos crear tu cuenta.")
          );
          return;
        }

        // After register, take the user to email verification (we just sent a code)
        if (mode === "register") {
          router.push("/verify-email");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } catch {
        setError("Sin conexión. Intentá de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-5 p-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">
          {mode === "login" ? "Bienvenido de vuelta" : "Creá tu cuenta"}
        </h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          {mode === "login"
            ? "Ingresá con tu email y contraseña, o continuá con Google."
            : "Reservás más rápido y guardás tus estadías favoritas."}
        </p>
      </div>

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-[color:var(--color-text-muted)]">
        <span className="h-px flex-1 bg-[color:var(--color-border)]" />
        <span>o con email</span>
        <span className="h-px flex-1 bg-[color:var(--color-border)]" />
      </div>

      {mode === "register" && (
        <Field label="Nombre" htmlFor="auth-name">
          <Input
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            autoComplete="name"
          />
        </Field>
      )}

      <Field label="Email" htmlFor="auth-email">
        <Input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          autoComplete="email"
        />
      </Field>

      <Field
        label={
          mode === "login" ? (
            <span className="flex items-center justify-between gap-2">
              <span>Contraseña</span>
              <Link
                href="/forgot-password"
                className="text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
              >
                ¿Olvidaste?
              </Link>
            </span>
          ) : (
            "Contraseña"
          )
        }
        htmlFor="auth-pass"
      >
        <Input
          id="auth-pass"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </Field>

      {demoMode && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-warning)]/25 bg-[color:var(--color-warning)]/10 p-3 text-sm text-[color:var(--color-warning)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>
            <strong className="font-medium">Modo demo.</strong> Conectá una base
            de datos en <code className="rounded bg-black/5 px-1">DATABASE_URL</code>{" "}
            para activar login y registro reales.
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={pending}
      >
        {pending
          ? "Procesando…"
          : mode === "login"
          ? "Ingresar"
          : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-[color:var(--color-text-secondary)]">
        {mode === "login" ? (
          <>
            ¿Sin cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
            >
              Registrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
            >
              Ingresá
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
