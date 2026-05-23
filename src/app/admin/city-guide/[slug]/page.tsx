import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import {
  getDestinationBySlug,
  listStoreTypes,
  listKeyPlaceCategories,
} from "@/modules/city-guide/repo";
import {
  TOURISM_TYPES,
  TOURISM_TYPE_LABELS,
} from "@/modules/city-guide/schemas";
import { CityEditPanel } from "@/components/admin/city-guide/CityEditPanel";
import { PlaceManagerPanel } from "@/components/admin/city-guide/PlaceManagerPanel";

export const dynamic = "force-dynamic";

export default async function CityAdminEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/city-guide");
  if (!isSuperAdmin(me)) redirect("/admin");

  const { slug } = await params;
  const [city, storeTypes, keyPlaceCategories] = await Promise.all([
    getDestinationBySlug(slug),
    listStoreTypes(),
    listKeyPlaceCategories(),
  ]);
  if (!city) notFound();

  const itemsByType = TOURISM_TYPES.map((type) => ({
    category: type,
    label: TOURISM_TYPE_LABELS[type],
    places: city.items.filter((i) => i.type === type),
  }));

  return (
    <div className="space-y-8 pb-24">
      <Link
        href="/admin/city-guide"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Volver a ciudades
      </Link>

      <header className="space-y-2">
        <p className="text-eyebrow">Editar ciudad</p>
        <h1 className="heading-section">{city.name}</h1>
      </header>

      <CityEditPanel
        city={{
          id: city.id,
          slug: city.slug,
          name: city.name,
          tagline: city.tagline ?? "",
          shortDescription: city.shortDescription ?? "",
          longDescription: city.longDescription,
          bannerImage: city.bannerImage ?? null,
          galleryImages: city.galleryImages ?? [],
          isPublished: city.isPublished,
          order: city.order,
        }}
      />

      <PlaceManagerPanel
        cityId={city.id}
        citySlug={city.slug}
        groups={itemsByType.map((g) => ({
          category: g.category,
          label: g.label,
          places: g.places.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.title,
            summary: p.description.slice(0, 200),
            isPublished: p.isPublished,
            featured: p.featured,
            imageCount: p.images.length,
          })),
        }))}
        storeTypes={storeTypes}
        keyPlaceCategories={keyPlaceCategories}
      />
    </div>
  );
}
