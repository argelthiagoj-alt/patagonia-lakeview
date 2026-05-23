import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL } from "@/lib/images";

type Place = {
  slug: string;
  name: string;
  summary: string;
  duration: string | null;
  priceHint?: string | null;
  images: { url: string; alt: string | null }[];
};

/**
 * Card editorial para un lugar de la guía. Server component (sin hooks).
 *
 * - Aspect 4/5 para una grilla suave, no banco de noticias.
 * - Si no hay imagen, se muestra placeholder cálido.
 * - Click → detalle `/destinos/[city]/lugar/[placeSlug]`.
 */
export function PlaceCard({
  place,
  citySlug,
}: {
  place: Place;
  citySlug: string;
}) {
  const img = place.images[0];
  return (
    <Link
      href={`/destinos/${citySlug}/lugar/${place.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--color-surface-muted)]">
        {img ? (
          <SafeImage
            src={img.url}
            alt={img.alt ?? place.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-medium tracking-tight">{place.name}</h3>
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            className="mt-1 shrink-0 text-[color:var(--color-text-muted)] transition group-hover:text-[color:var(--color-accent)]"
          />
        </div>
        <p className="line-clamp-3 text-sm/relaxed text-[color:var(--color-text-secondary)]">
          {place.summary}
        </p>
        {(place.duration || place.priceHint) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
            {place.duration && (
              <span className="inline-flex items-center gap-1">
                <Clock size={11} strokeWidth={1.5} />
                {place.duration}
              </span>
            )}
            {place.priceHint && <span>· {place.priceHint}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
