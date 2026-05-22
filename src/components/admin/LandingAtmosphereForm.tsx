"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type {
  LandingConfigRecord,
  SeasonalHeroes,
} from "@/modules/admin/landing-config";

const SEASONS: Array<{ key: keyof SeasonalHeroes; label: string }> = [
  { key: "summer", label: "Verano" },
  { key: "autumn", label: "Otoño" },
  { key: "winter", label: "Invierno" },
  { key: "spring", label: "Primavera" },
];

/**
 * Form del panel SUPER_ADMIN para editar la atmósfera de la landing.
 * Persiste a `/api/admin/landing-config` (PUT). Toda la UI es client-side
 * para feedback instantáneo; el form se hidrata desde la prop `initial`.
 */
export function LandingAtmosphereForm({
  initial,
}: {
  initial: LandingConfigRecord | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [heroTitle, setHeroTitle] = useState(initial?.heroTitle ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(initial?.heroSubtitle ?? "");
  const [heroCtaLabel, setHeroCtaLabel] = useState(initial?.heroCtaLabel ?? "");
  const [heroCtaHref, setHeroCtaHref] = useState(initial?.heroCtaHref ?? "");
  const [highlightText, setHighlightText] = useState(
    initial?.highlightText ?? ""
  );
  const [fallbackImage, setFallbackImage] = useState(
    initial?.fallbackImage ?? ""
  );
  const [atmosphereEnabled, setAtmosphereEnabled] = useState(
    initial?.atmosphereEnabled ?? true
  );
  const [atmosphereIntensity, setAtmosphereIntensity] = useState(
    initial?.atmosphereIntensity ?? "MEDIUM"
  );
  const [seasonal, setSeasonal] = useState<Record<string, string>>(
    initial?.seasonalHeroes ?? {}
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/landing-config", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            heroTitle,
            heroSubtitle,
            heroCtaLabel,
            heroCtaHref,
            highlightText,
            fallbackImage,
            atmosphereEnabled,
            atmosphereIntensity,
            seasonalHeroes: seasonal,
          }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d?.error ?? "No pudimos guardar los cambios.");
          return;
        }
        setSuccess(true);
        router.refresh();
      } catch {
        setError("Sin conexión.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Section title="Hero principal">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Título del hero"
            htmlFor="lc-hero-title"
            className="sm:col-span-2"
          >
            <Input
              id="lc-hero-title"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Despertá frente al lago…"
            />
          </Field>
          <Field
            label="Subtítulo"
            htmlFor="lc-hero-subtitle"
            className="sm:col-span-2"
          >
            <textarea
              id="lc-hero-subtitle"
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Cabañas boutique diseñadas para descansar…"
              className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            />
          </Field>
          <Field label="Texto del CTA" htmlFor="lc-cta-label">
            <Input
              id="lc-cta-label"
              value={heroCtaLabel}
              onChange={(e) => setHeroCtaLabel(e.target.value)}
              placeholder="Ver cabañas"
            />
          </Field>
          <Field label="Link del CTA" htmlFor="lc-cta-href">
            <Input
              id="lc-cta-href"
              value={heroCtaHref}
              onChange={(e) => setHeroCtaHref(e.target.value)}
              placeholder="/cabins"
            />
          </Field>
          <Field
            label="Texto destacado (opcional)"
            htmlFor="lc-highlight"
            className="sm:col-span-2"
          >
            <Input
              id="lc-highlight"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              placeholder="Apertura temporada 2026"
            />
          </Field>
        </div>
      </Section>

      <Section title="Imágenes hero por estación">
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          Arrastrá una imagen o hacé click para elegirla. Si dejás una
          casilla vacía, la landing usa la imagen default del módulo
          seasonal-theme para esa estación.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {SEASONS.map((s) => (
            <ImageUploadField
              key={s.key}
              label={`Hero · ${s.label}`}
              value={seasonal[s.key] ?? null}
              onChange={(next) =>
                setSeasonal((prev) => {
                  const copy = { ...prev };
                  if (next) copy[s.key] = next;
                  else delete copy[s.key];
                  return copy;
                })
              }
              aspect="16/9"
            />
          ))}
          <div className="sm:col-span-2">
            <ImageUploadField
              label="Imagen fallback global"
              hint="Se usa cuando la imagen estacional falla o no está cargada."
              value={fallbackImage || null}
              onChange={(next) => setFallbackImage(next ?? "")}
              aspect="16/9"
            />
          </div>
        </div>
      </Section>

      <Section title="Animación ambiental">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={atmosphereEnabled}
              onChange={(e) => setAtmosphereEnabled(e.target.checked)}
              className="h-4 w-4 accent-[color:var(--color-primary)]"
            />
            <span>Partículas / animación activas</span>
          </label>
          <Field label="Intensidad" htmlFor="lc-intensity">
            <select
              id="lc-intensity"
              value={atmosphereIntensity}
              onChange={(e) =>
                setAtmosphereIntensity(
                  e.target.value as "LOW" | "MEDIUM" | "HIGH"
                )
              }
              className="flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Preview básico */}
      {(heroTitle || heroSubtitle || fallbackImage) && (
        <Section title="Vista previa">
          <div className="surface-paper relative overflow-hidden rounded-3xl p-8">
            {fallbackImage && (
              <div className="pointer-events-none absolute inset-0 -z-0 opacity-20">
                <img
                  src={fallbackImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="relative space-y-3">
              {highlightText && (
                <p className="text-eyebrow text-[color:var(--color-accent)]">
                  {highlightText}
                </p>
              )}
              {heroTitle && (
                <h3 className="heading-section">{heroTitle}</h3>
              )}
              {heroSubtitle && (
                <p className="max-w-prose text-sm text-[color:var(--color-text-secondary)]">
                  {heroSubtitle}
                </p>
              )}
              {heroCtaLabel && (
                <span className="inline-flex rounded-full bg-[color:var(--color-primary)] px-4 py-1.5 text-xs font-medium text-[color:var(--color-primary-foreground)]">
                  {heroCtaLabel}
                </span>
              )}
            </div>
          </div>
        </Section>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-6">
        <div className="text-xs">
          {success && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-success)]">
              <Check size={12} strokeWidth={1.75} /> Cambios guardados.
            </p>
          )}
          {error && (
            <p className="inline-flex items-center gap-1.5 text-[color:var(--color-error)]">
              <AlertCircle size={12} strokeWidth={1.75} /> {error}
            </p>
          )}
        </div>
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          <ImageIcon size={14} strokeWidth={1.75} />
          {pending ? "Guardando…" : "Guardar atmósfera"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <h2 className="text-base font-medium tracking-tight text-[color:var(--color-text-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
