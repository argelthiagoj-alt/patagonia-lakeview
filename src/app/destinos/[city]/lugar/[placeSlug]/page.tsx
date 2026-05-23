import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Tag, Activity } from "lucide-react";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { getItemBySlug } from "@/modules/city-guide/repo";
import {
  TOURISM_TYPE_LABELS as PLACE_CATEGORY_LABELS,
  TOURISM_TYPE_SLUGS as PLACE_CATEGORY_SLUGS,
  type TourismTypeKey as PlaceCategoryKey,
} from "@/modules/city-guide/schemas";
import { ContactButtons } from "@/components/cabins/HostCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; placeSlug: string }>;
}) {
  const { city, placeSlug } = await params;
  const p = await getItemBySlug(city, placeSlug);
  if (!p) return { title: "Lugar no encontrado" };
  return {
    title: `${p.title} · ${p.destination.name}`,
    description: p.description,
    openGraph: {
      title: p.title,
      description: p.description,
      images: p.images[0] ? [p.images[0].url] : [],
    },
  };
}

/**
 * /destinos/[city]/lugar/[placeSlug] — detalle de un lugar.
 *
 * Reusa `ImageCarousel` y `ContactButtons` para no duplicar UI.
 */
export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ city: string; placeSlug: string }>;
}) {
  const { city, placeSlug } = await params;
  const place = await getItemBySlug(city, placeSlug);
  if (!place) notFound();

  const cat = place.type as PlaceCategoryKey;
  const categoryHref = `/destinos/${place.destination.slug}/${PLACE_CATEGORY_SLUGS[cat]}`;

  return (
    <div className="container-page space-y-8 pt-24 pb-24">
      <div className="space-y-2 text-sm">
        <Link
          href={`/destinos/${place.destination.slug}`}
          className="inline-flex items-center gap-1.5 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {place.destination.name}
        </Link>
        <p className="text-eyebrow">
          <Link
            href={categoryHref}
            className="hover:text-[color:var(--color-text-primary)]"
          >
            {PLACE_CATEGORY_LABELS[cat]}
          </Link>
        </p>
      </div>

      <header className="space-y-3">
        <h1 className="heading-section">{place.title}</h1>
        <p className="max-w-3xl text-lg/relaxed text-[color:var(--color-text-secondary)]">
          {place.description}
        </p>
      </header>

      {place.images.length > 0 && (
        <ImageCarousel
          images={place.images.map((i) => ({
            url: i.url,
            alt: i.alt ?? place.title,
          }))}
          aspectClassName="aspect-[16/9]"
          priority
        />
      )}

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <article className="space-y-5">
          {place.description && (
            <p className="whitespace-pre-wrap text-base/relaxed text-[color:var(--color-text-primary)]/90">
              {place.description}
            </p>
          )}
        </article>

        <aside className="surface-paper space-y-4 p-6 text-sm">
          <h3 className="text-base font-medium tracking-tight">Información</h3>
          <ul className="space-y-2 text-[color:var(--color-text-secondary)]">
            {place.duration && (
              <li className="inline-flex items-center gap-2">
                <Clock size={13} strokeWidth={1.5} /> {place.duration}
              </li>
            )}
            {place.difficulty && (
              <li className="inline-flex items-center gap-2">
                <Activity size={13} strokeWidth={1.5} /> {place.difficulty}
              </li>
            )}
            {place.priceRange && (
              <li className="inline-flex items-center gap-2">
                <Tag size={13} strokeWidth={1.5} /> {place.priceRange}
              </li>
            )}
            {(place.latitude !== null && place.longitude !== null) ? (
              <li className="inline-flex items-center gap-2">
                <MapPin size={13} strokeWidth={1.5} />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-[color:var(--color-text-primary)]"
                >
                  Ver en Google Maps
                </a>
              </li>
            ) : null}
          </ul>

          <ContactButtons
            phone={place.phone}
            instagram={place.instagram}
            link={place.website}
          />
        </aside>
      </div>
    </div>
  );
}
