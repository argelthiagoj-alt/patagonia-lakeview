import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import {
  listStoreTypes,
  listKeyPlaceCategories,
} from "@/modules/city-guide/repo";
import { TaxonomyManager } from "@/components/admin/city-guide/TaxonomyManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Taxonomías · Destinos" };

/**
 * /admin/city-guide/taxonomies — gestión de taxonomías auxiliares.
 * - StoreType: chocolatería, outdoor, fishing, artesanías, etc.
 * - KeyPlaceCategory: spa, mirador, baños termales, etc.
 *
 * Sólo SUPER_ADMIN.
 */
export default async function TaxonomiesPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/city-guide/taxonomies");
  if (!isSuperAdmin(me)) redirect("/admin");

  const [storeTypes, keyPlaceCategories] = await Promise.all([
    listStoreTypes(),
    listKeyPlaceCategories(),
  ]);

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
        <p className="text-eyebrow flex items-center gap-1.5">
          <Tag size={12} strokeWidth={2} />
          Super-admin
        </p>
        <h1 className="heading-section">Taxonomías</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Estos valores se usan al cargar lugares: tipo de tienda
          (chocolaterías, outdoor, …) y categoría de lugares clave
          (spa, mirador, …).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <TaxonomyManager
          title="Tipos de tienda"
          endpoint="store-types"
          initial={storeTypes.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
          }))}
        />
        <TaxonomyManager
          title="Categorías de lugar clave"
          endpoint="key-place-categories"
          initial={keyPlaceCategories.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
          }))}
        />
      </div>
    </div>
  );
}
