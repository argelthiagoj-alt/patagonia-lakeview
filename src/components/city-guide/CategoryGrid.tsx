import Link from "next/link";
import {
  Footprints,
  UtensilsCrossed,
  Snowflake,
  Mountain,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";
import {
  TOURISM_TYPES,
  TOURISM_TYPE_LABELS,
  TOURISM_TYPE_SLUGS,
  type TourismTypeKey,
} from "@/modules/city-guide/schemas";

const CATEGORY_ICONS: Record<TourismTypeKey, typeof Footprints> = {
  TRAIL: Footprints,
  RESTAURANT: UtensilsCrossed,
  SKI_RENTAL: Snowflake,
  ADVENTURE: Mountain,
  KEY_PLACE: Sparkles,
  STORE: ShoppingBag,
};

const CATEGORY_BLURB: Record<TourismTypeKey, string> = {
  TRAIL: "Caminatas, miradores, rutas escénicas.",
  RESTAURANT: "Mesas locales, productores y especialidades.",
  SKI_RENTAL: "Equipos, alquileres y temporada blanca.",
  ADVENTURE: "Expediciones, deporte y exploración.",
  KEY_PLACE: "Bienestar, spas y rincones clave.",
  STORE: "Chocolaterías, outdoor, artesanías, recuerdos.",
};

/**
 * Grid de accesos a las subpáginas de una ciudad. Server component puro.
 * Una card por TourismType con icono, copy breve y contador de lugares
 * publicados en esa categoría. Si una categoría está vacía, muestra
 * "Próximamente" en lugar de un cero crudo.
 */
export function CategoryGrid({
  citySlug,
  counts,
}: {
  citySlug: string;
  counts: Record<TourismTypeKey, number>;
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TOURISM_TYPES.map((type) => {
        const Icon = CATEGORY_ICONS[type];
        const count = counts[type] ?? 0;
        return (
          <li key={type}>
            <Link
              href={`/destinos/${citySlug}/${TOURISM_TYPE_SLUGS[type]}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[color:var(--color-primary)]/40 hover:shadow-[var(--shadow-soft)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-primary)] transition group-hover:bg-[color:var(--color-primary)] group-hover:text-[color:var(--color-primary-foreground)]">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <div className="flex-1 space-y-0.5">
                <p className="text-base font-medium tracking-tight">
                  {TOURISM_TYPE_LABELS[type]}
                </p>
                <p className="text-xs text-[color:var(--color-text-secondary)]">
                  {CATEGORY_BLURB[type]}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
                  {count > 0
                    ? `${count} ${count === 1 ? "lugar" : "lugares"}`
                    : "Próximamente"}
                </p>
              </div>
              <ArrowUpRight
                size={16}
                strokeWidth={1.5}
                className="shrink-0 text-[color:var(--color-text-muted)] transition group-hover:text-[color:var(--color-accent)]"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
