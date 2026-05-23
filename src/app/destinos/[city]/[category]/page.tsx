import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getDestinationBySlug,
  listItemsByType,
} from "@/modules/city-guide/repo";
import {
  tourismTypeFromSlug as categoryFromSlug,
  TOURISM_TYPE_LABELS as PLACE_CATEGORY_LABELS,
} from "@/modules/city-guide/schemas";
import { PlaceCard } from "@/components/city-guide/PlaceCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city, category } = await params;
  const cat = categoryFromSlug(category);
  const c = await getDestinationBySlug(city, { publicOnly: true });
  if (!c || !cat) return { title: "Categoría no encontrada" };
  return {
    title: `${PLACE_CATEGORY_LABELS[cat]} en ${c.name}`,
    description: `${PLACE_CATEGORY_LABELS[cat]} seleccionados de ${c.name}.`,
  };
}

/**
 * /destinos/[city]/[category] — listado completo de una sección.
 *
 * Mismo componente parametrizado para las 6 categorías. Cada slug
 * (`senderos`, `restaurantes`, etc.) se resuelve al enum correspondiente
 * vía `categoryFromSlug` en `city-guide/schemas`.
 */
export default async function CityCategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: categorySlug } = await params;
  const cat = categoryFromSlug(categorySlug);
  const city = await getDestinationBySlug(citySlug, { publicOnly: true });
  if (!cat || !city || !city.isPublished) notFound();

  const places = await listItemsByType(citySlug, cat);

  return (
    <div className="container-page space-y-10 pt-28 pb-24">
      <div className="space-y-3">
        <Link
          href={`/destinos/${city.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {city.name}
        </Link>
        <p className="text-eyebrow">{PLACE_CATEGORY_LABELS[cat]}</p>
        <h1 className="heading-section">
          {PLACE_CATEGORY_LABELS[cat]} en {city.name}
        </h1>
      </div>

      {places.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
          Todavía no hay lugares en esta categoría.
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <li key={p.id}>
              <PlaceCard
                citySlug={city.slug}
                place={{
                  slug: p.slug,
                  name: p.title,
                  summary: p.description,
                  duration: p.duration,
                  priceHint: p.priceRange,
                  images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
