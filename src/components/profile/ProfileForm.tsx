"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { profileSchema, type ProfileInput } from "@/modules/users/schemas";

export type ProfileData = {
  name: string | null;
  phone: string | null;
  documentId: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  billingName: string | null;
};

export function ProfileForm({
  initial,
  email,
}: {
  initial: ProfileData;
  email: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initial.name ?? "",
      phone: initial.phone ?? "",
      documentId: initial.documentId ?? "",
      address: initial.address ?? "",
      city: initial.city ?? "",
      state: initial.state ?? "",
      country: initial.country ?? "",
      billingName: initial.billingName ?? "",
    },
  });

  function onSubmit(values: ProfileInput) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data?.error ?? "No pudimos guardar tus datos.");
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="surface-paper space-y-6 p-6 md:p-8">
      <header className="space-y-1.5">
        <h2 className="text-lg font-medium tracking-tight">Mis datos</h2>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          Estos datos se usan para precargar el checkout y armar la factura
          simulada. Podés modificarlos cuando quieras.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre completo" htmlFor="p-name" error={errors.name?.message}>
          <Input id="p-name" {...register("name")} placeholder="Nombre y apellido" />
        </Field>

        <Field label="Email" htmlFor="p-email" hint="Para cambiarlo, escribinos.">
          <Input id="p-email" value={email} disabled readOnly />
        </Field>

        <Field label="DNI / Documento" htmlFor="p-doc" error={errors.documentId?.message}>
          <Input id="p-doc" {...register("documentId")} placeholder="32.456.789" />
        </Field>

        <Field label="Teléfono" htmlFor="p-phone" error={errors.phone?.message}>
          <Input id="p-phone" type="tel" {...register("phone")} placeholder="+54 9 …" />
        </Field>

        <Field
          label="Dirección"
          htmlFor="p-addr"
          className="sm:col-span-2"
          error={errors.address?.message}
        >
          <Input id="p-addr" {...register("address")} placeholder="Calle, número, depto." />
        </Field>

        <Field label="Ciudad" htmlFor="p-city" error={errors.city?.message}>
          <Input id="p-city" {...register("city")} placeholder="Buenos Aires" />
        </Field>

        <Field
          label="Provincia / Estado"
          htmlFor="p-state"
          error={errors.state?.message}
        >
          <Input id="p-state" {...register("state")} placeholder="CABA" />
        </Field>

        <Field label="País" htmlFor="p-country" error={errors.country?.message}>
          <Input id="p-country" {...register("country")} placeholder="Argentina" />
        </Field>

        <Field
          label="Nombre para facturación"
          htmlFor="p-billing"
          hint="Si va a otro nombre / razón social. Si no, usamos tu nombre."
          error={errors.billingName?.message}
        >
          <Input id="p-billing" {...register("billingName")} placeholder="Como figura en la factura" />
        </Field>
      </div>

      {serverError && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/10 p-3 text-sm text-[color:var(--color-success)]">
          <Check size={16} strokeWidth={1.5} className="mt-0.5" />
          <span>Datos guardados.</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-[color:var(--color-border)] pt-5">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={pending || !isDirty}
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
