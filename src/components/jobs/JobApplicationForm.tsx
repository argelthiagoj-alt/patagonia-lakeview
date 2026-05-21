"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import {
  jobApplicationSchema,
  type JobApplicationInput,
} from "@/modules/jobs/schemas";

const ROLES: { value: JobApplicationInput["role"]; label: string }[] = [
  { value: "anfitrion", label: "Anfitrión / host" },
  { value: "limpieza", label: "Limpieza y mantenimiento" },
  { value: "atencion-huesped", label: "Atención al huésped" },
  { value: "mantenimiento", label: "Mantenimiento técnico" },
  { value: "marketing", label: "Marketing y contenido" },
  { value: "operaciones", label: "Operaciones" },
  { value: "otro", label: "Otro" },
];

export function JobApplicationForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    mode: "onBlur",
    defaultValues: {
      acceptsPrivacy: false as unknown as true,
      website: "",
    },
  });

  function onSubmit(data: JobApplicationInput) {
    setServerError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/jobs/apply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(data),
        });
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 429) {
            setServerError(payload?.error ?? "Demasiados envíos. Probá más tarde.");
            return;
          }
          setServerError(payload?.error ?? "No pudimos enviar tu postulación.");
          return;
        }

        setSuccessMsg(
          payload?.message ?? "Recibimos tu postulación. Te respondemos pronto."
        );
        reset();
      } catch {
        setServerError("Sin conexión. Intentá de nuevo.");
      }
    });
  }

  if (successMsg) {
    return (
      <div className="surface-paper space-y-4 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-success)]/15 text-[color:var(--color-success)]">
          <Check size={22} strokeWidth={1.75} />
        </div>
        <h2 className="text-xl font-medium">Postulación enviada</h2>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          {successMsg}
        </p>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setSuccessMsg(null)}
        >
          Enviar otra
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="surface-paper space-y-5 p-6 md:p-8"
      noValidate
    >
      {/* Honeypot — invisible to humans, irresistible to bots */}
      <div
        aria-hidden
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo" htmlFor="job-name" error={errors.name?.message}>
          <Input id="job-name" {...register("name")} placeholder="Camila Pérez" />
        </Field>

        <Field label="Email" htmlFor="job-email" error={errors.email?.message}>
          <Input
            id="job-email"
            type="email"
            {...register("email")}
            placeholder="vos@email.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Teléfono (opcional)" htmlFor="job-phone" error={errors.phone?.message}>
          <Input
            id="job-phone"
            type="tel"
            {...register("phone")}
            placeholder="+54 9 …"
            autoComplete="tel"
          />
        </Field>

        <Field label="Ciudad / país" htmlFor="job-location" error={errors.location?.message}>
          <Input
            id="job-location"
            {...register("location")}
            placeholder="Bariloche, Argentina"
          />
        </Field>

        <Field label="Rol de interés" htmlFor="job-role" error={errors.role?.message}>
          <select
            id="job-role"
            {...register("role")}
            className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          >
            <option value="">Elegí un área</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Portfolio / LinkedIn (opcional)"
          htmlFor="job-portfolio"
          error={errors.portfolio?.message}
        >
          <Input
            id="job-portfolio"
            type="url"
            {...register("portfolio")}
            placeholder="https://…"
          />
        </Field>

        <Field
          label="Experiencia previa"
          htmlFor="job-exp"
          hint="Contanos brevemente dónde trabajaste antes."
          className="sm:col-span-2"
          error={errors.experience?.message}
        >
          <textarea
            id="job-exp"
            rows={4}
            {...register("experience")}
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </Field>

        <Field
          label="¿Por qué querés sumarte?"
          htmlFor="job-msg"
          className="sm:col-span-2"
          error={errors.message?.message}
        >
          <textarea
            id="job-msg"
            rows={4}
            {...register("message")}
            placeholder="Lo que te motiva, qué buscás del lugar…"
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm text-[color:var(--color-text-secondary)]">
        <input
          type="checkbox"
          {...register("acceptsPrivacy")}
          className="mt-0.5 h-4 w-4 rounded border-[color:var(--color-border)]"
        />
        <span>
          Acepto la{" "}
          <a
            href="/privacidad"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[color:var(--color-text-primary)] underline-offset-4 hover:underline"
          >
            política de privacidad
          </a>{" "}
          y entiendo que mis datos se usan únicamente para evaluar la postulación.
        </span>
      </label>
      {errors.acceptsPrivacy?.message && (
        <p className="text-xs text-[color:var(--color-error)]">
          {errors.acceptsPrivacy.message as string}
        </p>
      )}

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar postulación"}
      </Button>
    </form>
  );
}
