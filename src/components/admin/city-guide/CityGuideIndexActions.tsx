"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { slugify } from "@/lib/utils";

/** Botón "Nueva ciudad" + modal de creación (campos mínimos). */
export function CityGuideIndexActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/city-guide/cities", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            slug: slug || slugify(name),
            name,
            tagline,
            description,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos crear la ciudad.");
          return;
        }
        const data = (await res.json()) as { city: { slug: string } };
        setOpen(false);
        router.push(`/admin/city-guide/${data.city.slug}`);
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary)] px-4 py-1.5 text-xs font-medium text-[color:var(--color-primary-foreground)] transition hover:bg-[color:var(--color-primary-hover)]"
      >
        <Plus size={14} strokeWidth={1.75} />
        Nueva ciudad
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form
            onSubmit={submit}
            className="surface-paper w-full max-w-lg space-y-4 p-6"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-medium tracking-tight">
                Nueva ciudad
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </header>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="cg-name">
                <Input
                  id="cg-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Bariloche"
                  required
                />
              </Field>
              <Field label="Slug" htmlFor="cg-slug">
                <Input
                  id="cg-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="bariloche"
                  required
                />
              </Field>
              <Field label="Tagline" htmlFor="cg-tagline" className="sm:col-span-2">
                <Input
                  id="cg-tagline"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="El lago, la montaña, la postal clásica."
                  required
                />
              </Field>
              <Field
                label="Descripción"
                htmlFor="cg-desc"
                className="sm:col-span-2"
              >
                <textarea
                  id="cg-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
                />
              </Field>
            </div>

            {error && (
              <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-error)]">
                <AlertCircle size={12} strokeWidth={1.75} /> {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={pending}>
                {pending ? "Creando…" : "Crear ciudad"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
