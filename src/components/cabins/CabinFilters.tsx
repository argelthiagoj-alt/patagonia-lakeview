"use client";

import { useMemo, useState } from "react";
import { Users, Wallet, Waves, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Cabin } from "@/data/cabins";
import { CabinCard } from "@/components/cabins/CabinCard";
import { EmptyState } from "@/components/ui/EmptyState";

type Props = {
  cabins: Cabin[];
};

export function CabinCatalog({ cabins }: Props) {
  const [guests, setGuests] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [lakeOnly, setLakeOnly] = useState(false);

  const priceCeilings = useMemo(() => {
    const max = Math.max(...cabins.map((c) => c.pricePerNight));
    return [250, 400, 600, max + 100];
  }, [cabins]);

  const filtered = cabins.filter((c) => {
    if (guests !== null && c.maxGuests < guests) return false;
    if (maxPrice !== null && c.pricePerNight > maxPrice) return false;
    if (lakeOnly && !c.lakeView) return false;
    return true;
  });

  const activeCount = [guests, maxPrice, lakeOnly ? true : null].filter(
    (v) => v !== null && v !== false
  ).length;

  function clear() {
    setGuests(null);
    setMaxPrice(null);
    setLakeOnly(false);
  }

  return (
    <div className="space-y-10">
      <div className="surface-paper flex flex-wrap items-center gap-3 p-4 md:gap-4">
        <div className="flex items-center gap-2 pr-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
          <Filter size={14} strokeWidth={1.5} />
          Filtros
        </div>

        <FilterChip
          icon={<Users size={14} strokeWidth={1.5} />}
          active={guests !== null}
        >
          <select
            value={guests ?? ""}
            onChange={(e) =>
              setGuests(e.target.value === "" ? null : Number(e.target.value))
            }
            className="bg-transparent text-sm font-medium text-[color:var(--color-text-primary)] focus:outline-none"
          >
            <option value="">Huéspedes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </FilterChip>

        <FilterChip
          icon={<Wallet size={14} strokeWidth={1.5} />}
          active={maxPrice !== null}
        >
          <select
            value={maxPrice ?? ""}
            onChange={(e) =>
              setMaxPrice(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="bg-transparent text-sm font-medium text-[color:var(--color-text-primary)] focus:outline-none"
          >
            <option value="">Hasta…</option>
            {priceCeilings.map((p) => (
              <option key={p} value={p}>
                {formatCurrency(p)}/noche
              </option>
            ))}
          </select>
        </FilterChip>

        <button
          type="button"
          onClick={() => setLakeOnly((v) => !v)}
          className={[
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
            lakeOnly
              ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
              : "border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]",
          ].join(" ")}
        >
          <Waves size={14} strokeWidth={1.5} />
          Vista al lago
        </button>

        <div className="ml-auto flex items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
          <span>
            {filtered.length} {filtered.length === 1 ? "cabaña" : "cabañas"}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]"
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin resultados con esos filtros"
          description="Probá relajar las fechas, la cantidad de huéspedes o el precio máximo."
          action={
            <button
              onClick={clear}
              className="rounded-full bg-[color:var(--color-primary)] px-5 py-2 text-sm font-medium text-white"
            >
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {filtered.map((cabin, i) => (
            <CabinCard key={cabin.id} cabin={cabin} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  icon,
  active,
  children,
}: {
  icon: React.ReactNode;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-colors",
        active
          ? "border-[color:var(--color-text-primary)] bg-[color:var(--color-surface)]"
          : "border-[color:var(--color-border)] bg-white/70",
      ].join(" ")}
    >
      <span className="text-[color:var(--color-text-secondary)]">{icon}</span>
      {children}
    </label>
  );
}

export function ActiveFilterBadges({
  guests,
  maxPrice,
  lakeOnly,
}: {
  guests?: number | null;
  maxPrice?: number | null;
  lakeOnly?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {guests && <Badge tone="moss">{guests}+ huéspedes</Badge>}
      {maxPrice && <Badge tone="moss">Hasta {formatCurrency(maxPrice)}</Badge>}
      {lakeOnly && <Badge tone="moss">Vista al lago</Badge>}
    </div>
  );
}
