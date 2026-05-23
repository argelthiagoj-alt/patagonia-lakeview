"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";

type City = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  bannerImage: string | null;
  galleryImages: string[];
  isPublished: boolean;
  order: number;
};

/** Form de edición de ciudad — PUT + DELETE. */
export function CityEditPanel({ city }: { city: City }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(city.name);
  const [slug, setSlug] = useState(city.slug);
  const [tagline, setTagline] = useState(city.tagline);
  const [shortDescription, setShortDescription] = useState(
    city.shortDescription
  );
  const [longDescription, setLongDescription] = useState(city.longDescription);
  const [bannerImage, setBannerImage] = useState<string | null>(city.bannerImage);
  const [gallery, setGallery] = useState<
    { url: string; alt?: string | null }[]
  >((city.galleryImages ?? []).map((url) => ({ url, alt: null })));
  const [isPublished, setIsPublished] = useState(city.isPublished);
  const [order, setOrder] = useState(city.order);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/city-guide/cities/${city.id}`,
          {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              slug,
              name,
              tagline,
              shortDescription,
              longDescription,
              bannerImage,
              galleryImages: gallery.map((g) => g.url),
              isPublished,
              order,
            }),
          }
        );
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos guardar.");
          return;
        }
        setSuccess(true);
        // Si cambió el slug, redirigir.
        if (slug !== city.slug) {
          router.push(`/admin/city-guide/${slug}`);
        } else {
          router.refresh();
        }
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  function remove() {
    if (!confirm("¿Eliminar esta ciudad y todos sus lugares?")) return;
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/admin/city-guide/cities/${city.id}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos eliminar.");
          return;
        }
        router.push("/admin/city-guide");
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
    >
      <h2 className="text-base font-medium tracking-tight">Datos de la ciudad</h2>

      <ImageUploadField
        label="Banner del destino (16:9)"
        value={bannerImage}
        onChange={setBannerImage}
        aspect="16/9"
        emptyHint="Arrastrá o elegí la foto principal"
      />

      <MultiImageUploader
        label="Galería de la ciudad"
        value={gallery}
        onChange={(next) => setGallery(next)}
        max={20}
        hint="Arrastrá varias fotos para el carrusel de /destinos/{city}"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="city-name">
          <Input
            id="city-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Slug" htmlFor="city-slug">
          <Input
            id="city-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </Field>
        <Field label="Tagline" htmlFor="city-tagline" className="sm:col-span-2">
          <Input
            id="city-tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />
        </Field>
        <Field
          label="Descripción corta (card)"
          htmlFor="city-short"
          className="sm:col-span-2"
        >
          <textarea
            id="city-short"
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </Field>
        <Field
          label="Descripción larga (página)"
          htmlFor="city-long"
          className="sm:col-span-2"
        >
          <textarea
            id="city-long"
            rows={4}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            required
            className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
          />
        </Field>
        <Field label="Orden (0 = primero)" htmlFor="city-order">
          <Input
            id="city-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 accent-[color:var(--color-primary)]"
          />
          Publicada (visible en /destinos)
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--color-border)] pt-4">
        <div className="text-xs">
          {success && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-success)]">
              <Check size={12} strokeWidth={1.75} /> Guardado.
            </p>
          )}
          {error && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-error)]">
              <AlertCircle size={12} strokeWidth={1.75} /> {error}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={remove}
            disabled={pending}
            className="!text-[color:var(--color-error)]"
          >
            <Trash2 size={14} strokeWidth={1.75} />
            Eliminar ciudad
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            <Save size={14} strokeWidth={1.75} />
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
