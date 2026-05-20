"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Wallet,
  Waves,
  Filter,
  X,
  Search,
  BedDouble,
  CalendarDays,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { CabinCard } from "@/components/cabins/CabinCard";
import { AmenityIcon } from "@/components/cabins/AmenityIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { amenityLabels, type Amenity } from "@/data/cabins";
import type { CabinWithReservations } from "@/lib/db/cabins";
import { rangesOverlap } from "@/lib/utils";
import { cn, formatCurrency } from "@/lib/utils";

type Sort = "recent" | "price-asc" | "price-desc" | "rating" | "capacity";

type Props = {
  cabins: CabinWithReservations[];
  initial?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
};

const sortLabels: Record<Sort, string> = {
  recent: "Más recientes",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  rating: "Mejor rating",
  capacity: "Mayor capacidad",
};

export function CabinCatalog({ cabins, initial }: Props) {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<number | null>(initial?.guests ?? null);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState<string>(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState<string>(initial?.checkOut ?? "");
  const [lakeOnly, setLakeOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<Amenity>>(
    new Set()
  );
  const [sort, setSort] = useState<Sort>("recent");
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedBeds, setSelectedBeds] = useState<Set<string>>(new Set());

  // Universe of amenity keys used by the current cabin set
  const availableAmenities = useMemo(() => {
    const set = new Set<Amenity>();
    cabins.forEach((c) => c.amenities.forEach((a) => set.add(a)));
    return Array.from(set);
  }, [cabins]);

  // Universe of bed types present in current cabin set
  const availableBeds = useMemo(() => {
    const set = new Set<string>();
    cabins.forEach((c) => (c.beds ?? []).forEach((b) => set.add(b.type)));
    return Array.from(set);
  }, [cabins]);

  const filtered = useMemo(() => {
    const ci = checkIn ? new Date(checkIn) : null;
    const co = checkOut ? new Date(checkOut) : null;
    const validDateRange = ci && co && co > ci;

    let result = cabins.filter((c) => {
      if (
        search &&
        !`${c.title} ${c.location} ${c.shortDescription}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }
      if (guests !== null && c.maxGuests < guests) return false;
      if (bedrooms !== null && c.bedrooms < bedrooms) return false;
      if (minPrice !== null && c.pricePerNight < minPrice) return false;
      if (maxPrice !== null && c.pricePerNight > maxPrice) return false;
      if (lakeOnly && !c.lakeView) return false;
      if (selectedAmenities.size > 0) {
        for (const a of selectedAmenities) {
          if (!c.amenities.includes(a)) return false;
        }
      }
      if (selectedBeds.size > 0) {
        const cabinBedTypes = new Set((c.beds ?? []).map((b) => b.type));
        for (const b of selectedBeds) {
          if (!cabinBedTypes.has(b as never)) return false;
        }
      }
      if (validDateRange) {
        // Count overlapping reservations and compare against total units.
        const overlapping = c.reservations.filter((r) =>
          rangesOverlap(new Date(r.checkIn), new Date(r.checkOut), ci, co)
        ).length;
        const total = c.totalUnits ?? 1;
        if (total - overlapping <= 0) return false;
      }
      return true;
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "capacity":
        result = [...result].sort((a, b) => b.maxGuests - a.maxGuests);
        break;
      // "recent" keeps the order from the server (createdAt asc)
    }

    // Pro hosts ALWAYS surface first regardless of the chosen sort.
    result = [...result].sort((a, b) => {
      const aPro = a.proHost ? 1 : 0;
      const bPro = b.proHost ? 1 : 0;
      return bPro - aPro;
    });

    return result;
  }, [
    cabins,
    search,
    guests,
    bedrooms,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    lakeOnly,
    selectedAmenities,
    sort,
  ]);

  const activeCount = [
    search,
    guests,
    bedrooms,
    minPrice,
    maxPrice,
    checkIn,
    checkOut,
    lakeOnly || null,
    selectedAmenities.size > 0 || null,
    selectedBeds.size > 0 || null,
  ].filter((v) => v !== null && v !== "").length;

  function clear() {
    setSearch("");
    setGuests(null);
    setBedrooms(null);
    setMinPrice(null);
    setMaxPrice(null);
    setCheckIn("");
    setCheckOut("");
    setLakeOnly(false);
    setSelectedAmenities(new Set());
    setSelectedBeds(new Set());
  }

  function toggleBed(b: string) {
    setSelectedBeds((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  }

  function toggleAmenity(key: Amenity) {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      {/* Top bar — primary filters */}
      <div className="surface-paper p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <ChunkWithIcon icon={<Search size={16} strokeWidth={1.5} />}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o ubicación"
              className="h-10 border-0 bg-transparent px-0 focus:bg-transparent"
            />
          </ChunkWithIcon>

          <ChunkWithIcon icon={<Users size={16} strokeWidth={1.5} />}>
            <select
              value={guests ?? ""}
              onChange={(e) =>
                setGuests(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="h-10 w-full bg-transparent text-sm focus:outline-none"
            >
              <option value="">Huéspedes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}+ huésped{n > 1 ? "es" : ""}
                </option>
              ))}
            </select>
          </ChunkWithIcon>

          <ChunkWithIcon icon={<ArrowUpDown size={16} strokeWidth={1.5} />}>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 w-full bg-transparent text-sm focus:outline-none"
            >
              {Object.entries(sortLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  Ordenar · {v}
                </option>
              ))}
            </select>
          </ChunkWithIcon>

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium transition",
              moreOpen
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
                : "border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]"
            )}
          >
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            Filtros
            {activeCount > 0 && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-medium",
                  moreOpen
                    ? "bg-white/15 text-white"
                    : "bg-[color:var(--color-primary)] text-white"
                )}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {moreOpen && (
          <div className="mt-5 grid gap-5 border-t border-[color:var(--color-border)] pt-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Dates */}
            <div className="space-y-2">
              <p className="text-eyebrow flex items-center gap-1.5">
                <CalendarDays size={12} strokeWidth={1.5} /> Fechas
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm"
                />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || undefined}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div className="space-y-2">
              <p className="text-eyebrow flex items-center gap-1.5">
                <BedDouble size={12} strokeWidth={1.5} /> Habitaciones
              </p>
              <select
                value={bedrooms ?? ""}
                onChange={(e) =>
                  setBedrooms(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="h-10 w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 text-sm"
              >
                <option value="">Cualquiera</option>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}+ habitación{n > 1 ? "es" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-eyebrow flex items-center gap-1.5">
                <Wallet size={12} strokeWidth={1.5} /> Precio por noche (USD)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min={0}
                  value={minPrice ?? ""}
                  onChange={(e) =>
                    setMinPrice(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  placeholder="Mín."
                />
                <Input
                  type="number"
                  min={0}
                  value={maxPrice ?? ""}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  placeholder="Máx."
                />
              </div>
            </div>

            {/* Lake view + amenities */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <p className="text-eyebrow flex items-center gap-1.5">
                <Filter size={12} strokeWidth={1.5} /> Características
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterToggle
                  active={lakeOnly}
                  onClick={() => setLakeOnly((v) => !v)}
                  icon={<Waves size={14} strokeWidth={1.5} />}
                >
                  Vista al lago
                </FilterToggle>
                {availableAmenities.map((a) => {
                  if (a === "lake-view") return null;
                  const active = selectedAmenities.has(a);
                  return (
                    <FilterToggle
                      key={a}
                      active={active}
                      onClick={() => toggleAmenity(a)}
                      icon={<AmenityIcon amenity={a} size={14} />}
                    >
                      {amenityLabels[a]}
                    </FilterToggle>
                  );
                })}
              </div>
            </div>

            {availableBeds.length > 0 && (
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <p className="text-eyebrow">Camas</p>
                <div className="flex flex-wrap gap-2">
                  {availableBeds.map((b) => {
                    const active = selectedBeds.has(b);
                    const label = (
                      {
                        TWIN: "Individual",
                        DOUBLE: "Matrimonial",
                        QUEEN: "Queen",
                        KING: "King",
                        SOFA_BED: "Sofá cama",
                        BUNK: "Litera",
                      } as Record<string, string>
                    )[b];
                    return (
                      <FilterToggle
                        key={b}
                        active={active}
                        onClick={() => toggleBed(b)}
                        icon={<span className="text-[10px]">🛏</span>}
                      >
                        {label ?? b}
                      </FilterToggle>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-4 text-xs text-[color:var(--color-text-secondary)]">
          <span>
            {filtered.length} {filtered.length === 1 ? "cabaña" : "cabañas"}
            {activeCount > 0 && ` · ${activeCount} filtro${activeCount > 1 ? "s" : ""}`}
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]"
            >
              <X size={12} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips (compact summary) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {checkIn && checkOut && (
            <Badge tone="moss">
              {checkIn} → {checkOut}
            </Badge>
          )}
          {guests && <Badge tone="moss">{guests}+ huéspedes</Badge>}
          {bedrooms && <Badge tone="moss">{bedrooms}+ habs</Badge>}
          {minPrice !== null && <Badge tone="moss">≥ {formatCurrency(minPrice)}</Badge>}
          {maxPrice !== null && <Badge tone="moss">≤ {formatCurrency(maxPrice)}</Badge>}
          {lakeOnly && <Badge tone="moss">Vista al lago</Badge>}
          {Array.from(selectedAmenities).map((a) => (
            <Badge key={a} tone="stone">
              {amenityLabels[a]}
            </Badge>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados con esos filtros"
          description="Probá ajustar las fechas, ampliar el rango de precios o quitar algún amenity."
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

function ChunkWithIcon({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white/70 px-3 transition-colors focus-within:border-[color:var(--color-text-primary)]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}

function FilterToggle({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white"
          : "border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] hover:border-[color:var(--color-text-primary)]"
      )}
    >
      <span className={active ? "" : "text-[color:var(--color-text-secondary)]"}>
        {icon}
      </span>
      {children}
    </button>
  );
}
