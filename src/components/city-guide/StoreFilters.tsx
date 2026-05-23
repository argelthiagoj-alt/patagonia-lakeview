import Link from "next/link";
import { cn } from "@/lib/utils";

type Type = {
  slug: string;
  name: string;
  count: number;
};

/**
 * Barra de chips para filtrar tiendas por `storeType` dentro de una
 * ciudad. Server component puro — cada chip es un Link al mismo path
 * con `?type=<slug>`; "Todas" limpia el filtro.
 *
 * Se renderiza sin estado cliente (no requiere JS) y respeta el SEO de
 * cada combinación ciudad+tipo.
 */
export function StoreFilters({
  citySlug,
  types,
  totalCount,
  selectedTypeSlug,
}: {
  citySlug: string;
  types: Type[];
  totalCount: number;
  selectedTypeSlug: string | null;
}) {
  const base = `/destinos/${citySlug}/tiendas`;
  return (
    <nav
      aria-label="Filtrar tiendas por tipo"
      className="flex flex-wrap items-center gap-2"
    >
      <FilterChip
        href={base}
        label="Todas"
        count={totalCount}
        active={selectedTypeSlug === null}
      />
      {types.map((t) => (
        <FilterChip
          key={t.slug}
          href={`${base}?type=${t.slug}`}
          label={t.name}
          count={t.count}
          active={selectedTypeSlug === t.slug}
        />
      ))}
    </nav>
  );
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
          : "border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-primary)]/40"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px] tabular-nums",
          active
            ? "bg-white/15 text-white"
            : "bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-muted)]"
        )}
      >
        {count}
      </span>
    </Link>
  );
}
