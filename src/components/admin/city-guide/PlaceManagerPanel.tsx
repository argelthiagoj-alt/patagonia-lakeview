"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";
import {
  TOURISM_TYPE_LABELS,
  type TourismTypeKey,
} from "@/modules/city-guide/schemas";
import { TourismItemEditor } from "@/components/admin/city-guide/TourismItemEditor";

type PlaceSummary = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  isPublished: boolean;
  featured: boolean;
  imageCount: number;
};

type Group = {
  category: TourismTypeKey;
  label: string;
  places: PlaceSummary[];
};

type Taxonomy = { id: string; slug: string; name: string };

/**
 * Panel de gestión de TourismItem de una ciudad.
 *
 * - Lista los items agrupados por categoría con badge de destacado +
 *   estado de publicación + cantidad de fotos.
 * - Botón "Agregar" por categoría abre el editor unificado con `type`
 *   precargado.
 * - "Editar" abre el mismo editor en modo `edit` (carga el item entero
 *   vía GET).
 */
export function PlaceManagerPanel({
  cityId,
  citySlug,
  groups,
  storeTypes,
  keyPlaceCategories,
}: {
  cityId: string;
  citySlug: string;
  groups: Group[];
  storeTypes: Taxonomy[];
  keyPlaceCategories: Taxonomy[];
}) {
  const [editing, setEditing] = useState<
    | { kind: "create"; type: TourismTypeKey }
    | { kind: "edit"; itemId: string }
    | null
  >(null);

  return (
    <section className="space-y-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      <header className="flex items-center justify-between">
        <h2 className="text-base font-medium tracking-tight">
          Publicaciones turísticas
        </h2>
      </header>

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.category} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
                {g.label}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setEditing({ kind: "create", type: g.category })
                }
                className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] bg-white/60 px-2.5 py-0.5 text-[11px] font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-primary)]"
              >
                <Plus size={11} strokeWidth={1.75} />
                Agregar
              </button>
            </div>
            {g.places.length === 0 ? (
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Sin lugares en esta categoría.
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {g.places.map((p) => (
                  <li
                    key={p.id}
                    className="surface-paper flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="flex items-center gap-1.5 truncate font-medium">
                        {p.featured && (
                          <Star
                            size={12}
                            strokeWidth={1.75}
                            className="shrink-0 fill-[color:var(--color-accent)] text-[color:var(--color-accent)]"
                          />
                        )}
                        {p.name}
                      </p>
                      <p className="truncate text-[11px] text-[color:var(--color-text-muted)]">
                        /{p.slug} · {p.imageCount} fotos
                        {!p.isPublished && " · oculto"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing({ kind: "edit", itemId: p.id })}
                      className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-3 py-1 text-[11px] font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[color:var(--color-text-muted)]">
        Marcá un lugar como <strong>destacado</strong> desde su editor —
        aparece en el carrusel superior de /destinos/{citySlug}.
      </p>

      {editing && (
        <TourismItemEditor
          cityId={cityId}
          citySlug={citySlug}
          mode={editing}
          storeTypes={storeTypes}
          keyPlaceCategories={keyPlaceCategories}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

export type { TourismTypeKey };
export { TOURISM_TYPE_LABELS };
