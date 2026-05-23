import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Calendar } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { blurDataURL } from "@/lib/images";
import { getDestinationBySlug } from "@/modules/city-guide/repo";
import {
  TOURISM_TYPES,
  type TourismTypeKey,
} from "@/modules/city-guide/schemas";
import { FeaturedCarousel } from "@/components/city-guide/FeaturedCarousel";
import { CategoryGrid } from "@/components/city-guide/CategoryGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = await getDestinationBySlug(city, { publicOnly: true });
  if (!c) return { title: "Destino no encontrado" };
  return {
    title: `${c.name} · Guía Patagonia`,
    description: c.tagline ?? c.shortDescription ?? c.name,
    openGraph: {
      title: c.name,
      description: c.tagline ?? c.shortDescription ?? c.name,
      images: c.bannerImage ? [c.bannerImage] : [],
    },
  };
}

/**
 * /destinos/[city] — hub editorial por ciudad.
 *
 * Estructura:
 *   1. Hero 16:9 puro (sin overlays, sin texto encima). Listo para
 *      reemplazar la <img> por <video> sin tocar el layout.
 *   2. Texto editorial (tagline + nombre + short description).
 *   3. Cuerpo de identidad (longDescription) + sidebar con metadata.
 *   4. Carrusel de destacados (TourismItem.featured) — mezcla categorías
 *      pero sólo de ESTA ciudad.
 *   5. Grid de subpáginas (6 categorías).
 *   6. Gallery de fotos de la ciudad (Destination.galleryImages).
 *   7. CTA hospedaje filtrado por nombre de ciudad.
 *
 * Mobile-first: aspect ratios consistentes, scroll-snap en el destacado,
 * sin animaciones pesadas.
 */
export default async function CityHubPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = await getDestinationBySlug(slug, { publicOnly: true });
  if (!city || !city.isPublished) notFound();

  // Conteo por categoría para el grid de accesos.
  const counts = TOURISM_TYPES.reduce(
    (acc, t) => ({
      ...acc,
      [t]: city.items.filter((i) => i.type === t).length,
    }),
    {} as Record<TourismTypeKey, number>
  );

  // Destacados de esta ciudad. Fallback: primeros 6 lugares para no
  // dejar la sección vacía si el admin todavía no marcó featured.
  const featured = city.items.filter((i) => i.featured);
  const heroPicks = (featured.length ? featured : city.items.slice(0, 6)).map(
    (i) => ({
      id: i.id,
      slug: i.slug,
      title: i.title,
      description: i.description,
      type: i.type as TourismTypeKey,
      image: i.mainImage ?? i.images[0]?.url ?? null,
    })
  );

  return (
    <div className="space-y-16 pb-24 md:space-y-24">
      {/* ─── 1. Hero 16:9 limpio ─── */}
      <section className="container-page pt-24">
        <Link
          href="/destinos"
          className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        >
          <ArrowLeft size={12} strokeWidth={1.75} />
          Destinos
        </Link>

        <div className="relative overflow-hidden rounded-[2rem] bg-[color:var(--color-surface-muted)]">
          <div className="relative aspect-[16/9] w-full">
            {city.bannerImage ? (
              <SafeImage
                src={city.bannerImage}
                alt={city.name}
                fill
                priority
                placeholder="blur"
                blurDataURL={blurDataURL}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Título debajo del banner, NUNCA encima de la imagen */}
        <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {city.tagline && <p className="text-eyebrow">{city.tagline}</p>}
            <h1 className="heading-display text-balance text-4xl md:text-6xl">
              {city.name}
            </h1>
          </div>
          <p className="max-w-prose text-base/relaxed text-[color:var(--color-text-secondary)] md:self-end">
            {city.shortDescription ?? city.longDescription.slice(0, 240)}
          </p>
        </div>
      </section>

      {/* ─── 2. Identidad editorial ─── */}
      <section className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="space-y-5">
            <p className="text-eyebrow">Por qué visitarla</p>
            <h2 className="heading-section !text-3xl md:!text-4xl">
              Una identidad que vale el viaje
            </h2>
            <p className="max-w-3xl whitespace-pre-wrap text-base/relaxed text-[color:var(--color-text-primary)]/90">
              {city.longDescription}
            </p>
          </div>
          <aside className="surface-paper space-y-4 p-6 text-sm">
            <h3 className="text-base font-medium tracking-tight">
              Para tener en mente
            </h3>
            <ul className="space-y-3 text-[color:var(--color-text-secondary)]">
              <li className="flex items-start gap-2">
                <Calendar
                  size={14}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  Buena en cualquier estación; cada época cambia el carácter
                  del paisaje.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin
                  size={14}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                />
                <span>{city.name}, Patagonia argentina.</span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* ─── 3. Destacados ─── */}
      {heroPicks.length > 0 && (
        <FeaturedCarousel items={heroPicks} citySlug={city.slug} />
      )}

      {/* ─── 4. Subpáginas ─── */}
      <section className="container-page space-y-5">
        <header className="space-y-1">
          <p className="text-eyebrow">Explorar {city.name}</p>
          <h2 className="heading-section !text-3xl md:!text-4xl">
            ¿Qué buscás hoy?
          </h2>
        </header>
        <CategoryGrid citySlug={city.slug} counts={counts} />
      </section>

      {/* ─── 5. Gallery propia de la ciudad ─── */}
      {city.galleryImages.length > 0 && (
        <section className="container-page space-y-5">
          <header className="space-y-1">
            <p className="text-eyebrow">Fotos de {city.name}</p>
            <h2 className="heading-section !text-3xl md:!text-4xl">
              Lo que vas a ver
            </h2>
          </header>
          <ImageCarousel
            images={city.galleryImages.map((url) => ({
              url,
              alt: city.name,
            }))}
            aspectClassName="aspect-[16/9]"
          />
        </section>
      )}

      {/* ─── 6. CTA hospedaje ─── */}
      <section className="container-page">
        <div className="surface-paper flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-eyebrow flex items-center gap-1.5">
              <MapPin size={12} strokeWidth={2} />
              Cabañas y hoteles cerca
            </p>
            <h3 className="mt-1 text-2xl font-medium tracking-tight">
              Reservá tu hospedaje en {city.name}
            </h3>
          </div>
          <Link
            href={`/cabins?location=${encodeURIComponent(city.name)}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--color-primary)] px-5 py-2 text-sm font-medium text-[color:var(--color-primary-foreground)] transition hover:bg-[color:var(--color-primary-hover)]"
          >
            Ver hospedajes
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
