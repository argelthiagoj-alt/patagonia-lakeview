import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import {
  getDestinationBySlug,
  listItemsByType,
  listStoreTypes,
} from "@/modules/city-guide/repo";
import { StoreFilters } from "@/components/city-guide/StoreFilters";
import { PlaceCard } from "@/components/city-guide/PlaceCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = await getDestinationBySlug(city, { publicOnly: true });
  if (!c) return { title: "Tiendas no encontradas" };
  return {
    title: `Tiendas en ${c.name} · Patagonia Lakeview`,
    description: `Chocolaterías, outdoor, fishing, artesanías y productos regionales seleccionados en ${c.name}.`,
  };
}

/**
 * /destinos/[city]/tiendas — listado de TourismItem con type=STORE.
 *
 * Filtros: por `storeType` (taxonomía editable). El filtro vive en query
 * string `?type=<storeSlug>`. Se renderiza server-side (sin estado
 * cliente) — el componente `StoreFilters` arma los Links.
 *
 * Por qué este archivo y no la ruta genérica `[category]`: las tiendas
 * tienen filtros propios y un copy específico ("chocolaterías, outdoor,
 * fishing…"). Next prefiere el segmento estático sobre el dinámico, así
 * que `/destinos/[city]/tiendas` gana sobre `/destinos/[city]/[category]`.
 */
export default async function CityStoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { city: citySlug } = await params;
  const search = await searchParams;
  const selectedTypeSlug =
    typeof search.type === "string" ? search.type : null;

  const city = await getDestinationBySlug(citySlug, { publicOnly: true });
  if (!city || !city.isPublished) notFound();

  const [stores, storeTypes] = await Promise.all([
    listItemsByType(citySlug, "STORE"),
    listStoreTypes(),
  ]);

  // Sólo mostramos los tipos que tengan al menos 1 tienda en ESTA ciudad
  // (para no llenar la barra con filtros vacíos cargados a nivel global).
  const typeIdsInCity = new Set(
    stores.map((s) => s.storeTypeId).filter(Boolean) as string[]
  );
  const availableTypes = storeTypes.filter((t) => typeIdsInCity.has(t.id));

  const selectedType =
    selectedTypeSlug !== null
      ? availableTypes.find((t) => t.slug === selectedTypeSlug) ?? null
      : null;

  const filteredStores = selectedType
    ? stores.filter((s) => s.storeTypeId === selectedType.id)
    : stores;

  return (
    <div className="container-page space-y-10 pt-24 pb-24">
      <div className="space-y-3">
        <Link
          href={`/destinos/${city.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          {city.name}
        </Link>
        <p className="text-eyebrow flex items-center gap-1.5">
          <ShoppingBag size={12} strokeWidth={1.75} />
          Tiendas en {city.name}
        </p>
        <h1 className="heading-section">Tiendas seleccionadas</h1>
        <p className="max-w-2xl text-base text-[color:var(--color-text-secondary)]">
          Chocolaterías, outdoor, fishing, artesanías, recuerdos, productos
          regionales y diseño local. Una curaduría — no un directorio.
        </p>
      </div>

      {availableTypes.length > 0 && (
        <StoreFilters
          citySlug={city.slug}
          types={availableTypes.map((t) => ({
            slug: t.slug,
            name: t.name,
            count: stores.filter((s) => s.storeTypeId === t.id).length,
          }))}
          totalCount={stores.length}
          selectedTypeSlug={selectedTypeSlug}
        />
      )}

      {filteredStores.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
          {selectedType
            ? `Todavía no hay tiendas de "${selectedType.name}" en ${city.name}.`
            : `Pronto vamos a sumar tiendas seleccionadas de ${city.name}.`}
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((p) => (
            <li key={p.id}>
              <PlaceCard
                citySlug={city.slug}
                place={{
                  slug: p.slug,
                  name: p.title,
                  summary: p.description,
                  duration: p.duration ?? null,
                  priceHint: p.priceRange ?? p.storeType?.name ?? null,
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
