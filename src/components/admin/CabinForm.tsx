"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";

export type CabinFormValues = {
  id?: string;
  title: string;
  slug: string;
  location: string;
  shortDescription: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  cleaningFee: number;
  lakeView: boolean;
  isActive: boolean;
};

const empty: CabinFormValues = {
  title: "",
  slug: "",
  location: "",
  shortDescription: "",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  pricePerNight: 200,
  cleaningFee: 30,
  lakeView: false,
  isActive: true,
};

export function CabinForm({ initial }: { initial?: Partial<CabinFormValues> }) {
  const router = useRouter();
  const [values, setValues] = useState<CabinFormValues>({
    ...empty,
    ...initial,
  } as CabinFormValues);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof CabinFormValues>(key: K, value: CabinFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const url = values.id ? `/api/admin/cabins/${values.id}` : "/api/admin/cabins";
      const method = values.id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          slug: values.slug || slugify(values.title),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No pudimos guardar los cambios.");
        return;
      }
      router.push("/admin/cabins");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-6 p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Título" htmlFor="cf-title" className="sm:col-span-2">
          <Input
            id="cf-title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </Field>
        <Field label="Slug" htmlFor="cf-slug">
          <Input
            id="cf-slug"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="se genera del título"
          />
        </Field>
        <Field label="Ubicación" htmlFor="cf-location">
          <Input
            id="cf-location"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            required
          />
        </Field>
        <Field
          label="Descripción corta"
          htmlFor="cf-short"
          className="sm:col-span-2"
        >
          <Input
            id="cf-short"
            value={values.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            required
            maxLength={180}
          />
        </Field>
        <Field label="Descripción" htmlFor="cf-desc" className="sm:col-span-2">
          <textarea
            id="cf-desc"
            rows={5}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            required
          />
        </Field>

        <NumField label="Habitaciones" id="cf-bed" value={values.bedrooms} onChange={(v) => set("bedrooms", v)} />
        <NumField label="Baños" id="cf-bath" value={values.bathrooms} onChange={(v) => set("bathrooms", v)} />
        <NumField label="Máx. huéspedes" id="cf-guests" value={values.maxGuests} onChange={(v) => set("maxGuests", v)} />
        <NumField label="Precio por noche (USD)" id="cf-price" value={values.pricePerNight} onChange={(v) => set("pricePerNight", v)} />
        <NumField label="Limpieza (USD)" id="cf-clean" value={values.cleaningFee} onChange={(v) => set("cleaningFee", v)} />

        <div className="flex flex-col gap-3 sm:col-span-2">
          <ToggleField
            label="Vista al lago"
            checked={values.lakeView}
            onChange={(v) => set("lakeView", v)}
          />
          <ToggleField
            label="Cabaña activa (visible al público)"
            checked={values.isActive}
            onChange={(v) => set("isActive", v)}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-sm text-[color:var(--color-error)]">
          <AlertCircle size={16} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-[color:var(--color-border)] pt-5">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={() => router.push("/admin/cabins")}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Guardando…" : values.id ? "Guardar cambios" : "Crear cabaña"}
        </Button>
      </div>
    </form>
  );
}

function NumField({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Input
        id={id}
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span
        className={[
          "relative inline-flex h-6 w-10 cursor-pointer items-center rounded-full border transition",
          checked
            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]"
            : "border-[color:var(--color-border)] bg-white",
        ].join(" ")}
        onClick={() => onChange(!checked)}
      >
        <span
          className={[
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </span>
      <span className="text-[color:var(--color-text-primary)]">{label}</span>
    </label>
  );
}
