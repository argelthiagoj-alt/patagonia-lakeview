"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Input, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/utils";

type Entry = { id: string; slug: string; name: string };

/**
 * Gestor genérico para taxonomías (StoreType / KeyPlaceCategory).
 * Sólo dos campos: name + slug auto. Lista compacta editable.
 */
export function TaxonomyManager({
  title,
  endpoint,
  initial,
}: {
  title: string;
  endpoint: "store-types" | "key-place-categories";
  initial: Entry[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [entries, setEntries] = useState<Entry[]>(initial);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    const finalSlug = slug || slugify(name);
    if (!name.trim() || !finalSlug) {
      setError("Nombre y slug son obligatorios.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/city-guide/${endpoint}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: name.trim(), slug: finalSlug }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos guardar.");
          return;
        }
        const data = (await res.json()) as { type: Entry };
        setEntries((prev) => {
          const existing = prev.find((e) => e.slug === data.type.slug);
          if (existing) {
            return prev.map((e) =>
              e.slug === data.type.slug ? { ...e, name: data.type.name } : e
            );
          }
          return [...prev, data.type].sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });
        setName("");
        setSlug("");
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar esta entrada?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/city-guide/${endpoint}/${id}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos eliminar.");
          return;
        }
        setEntries((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <h2 className="text-base font-medium tracking-tight">{title}</h2>

      <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
        <Field label="" htmlFor={`${endpoint}-name`} className="!space-y-0">
          <Input
            id={`${endpoint}-name`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            placeholder="Chocolatería"
          />
        </Field>
        <Field label="" htmlFor={`${endpoint}-slug`} className="!space-y-0">
          <Input
            id={`${endpoint}-slug`}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="chocolateria"
          />
        </Field>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={add}
          disabled={pending}
        >
          <Plus size={14} strokeWidth={1.75} />
          Agregar
        </Button>
      </div>

      {error && (
        <p className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-error)]">
          <AlertCircle size={12} strokeWidth={1.75} /> {error}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Todavía no hay entradas.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-border)]">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-[11px] text-[color:var(--color-text-muted)]">
                  /{e.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(e.id)}
                aria-label="Eliminar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-error)] transition hover:border-[color:var(--color-error)]"
              >
                <Trash2 size={12} strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
