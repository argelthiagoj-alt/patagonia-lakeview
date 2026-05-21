import { rangesOverlap } from "@/lib/utils";
import type { Amenity } from "@/data/cabins";

/**
 * Pure cabin-filtering + sorting. No React, no DB. Easy to unit-test and
 * to reuse between the public catalog (`CabinFilters` client component)
 * and any future server-side filtering.
 */

export type SortKey =
  | "recent"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "capacity";

export type FilterableCabin = {
  id: string;
  title: string;
  location: string;
  shortDescription: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  rating: number;
  lakeView: boolean;
  amenities: readonly Amenity[];
  beds?: { type: string; quantity: number }[];
  totalUnits?: number;
  proHost?: boolean;
  reservations: { checkIn: string; checkOut: string }[];
  /** Nuevos campos del marketplace. Opcionales para compatibilidad con
   *  data mockeada que no los trae. */
  propertyType?: "CABIN" | "HOTEL";
  features?: Partial<Record<string, boolean>>;
};

export type FilterCriteria = {
  search?: string;
  guests?: number | null;
  bedrooms?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
  lakeOnly?: boolean;
  amenities?: ReadonlySet<Amenity>;
  beds?: ReadonlySet<string>;
  sort?: SortKey;
  /** Filtros del marketplace. */
  propertyType?: "CABIN" | "HOTEL" | null;
  /** Lista de feature keys (hasWifi, hasPool…) que deben estar todas en true. */
  features?: ReadonlySet<string>;
};

export function applyCabinFilters<T extends FilterableCabin>(
  cabins: readonly T[],
  criteria: FilterCriteria
): T[] {
  const ci = criteria.checkIn ? new Date(criteria.checkIn) : null;
  const co = criteria.checkOut ? new Date(criteria.checkOut) : null;
  const validDateRange = Boolean(ci && co && co > ci);

  let result = cabins.filter((c) => {
    if (criteria.search) {
      const q = criteria.search.toLowerCase();
      if (
        !`${c.title} ${c.location} ${c.shortDescription}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
    }
    if (criteria.guests != null && c.maxGuests < criteria.guests) return false;
    if (criteria.bedrooms != null && c.bedrooms < criteria.bedrooms) return false;
    if (criteria.minPrice != null && c.pricePerNight < criteria.minPrice)
      return false;
    if (criteria.maxPrice != null && c.pricePerNight > criteria.maxPrice)
      return false;
    if (criteria.lakeOnly && !c.lakeView) return false;

    if (criteria.amenities && criteria.amenities.size > 0) {
      for (const a of criteria.amenities) {
        if (!c.amenities.includes(a)) return false;
      }
    }
    if (criteria.beds && criteria.beds.size > 0) {
      const cabinBedTypes = new Set((c.beds ?? []).map((b) => b.type));
      for (const b of criteria.beds) {
        if (!cabinBedTypes.has(b)) return false;
      }
    }
    if (criteria.propertyType && c.propertyType && c.propertyType !== criteria.propertyType) {
      return false;
    }
    if (criteria.features && criteria.features.size > 0) {
      for (const k of criteria.features) {
        if (!c.features?.[k]) return false;
      }
    }
    if (validDateRange) {
      const overlapping = c.reservations.filter((r) =>
        rangesOverlap(new Date(r.checkIn), new Date(r.checkOut), ci!, co!)
      ).length;
      const total = c.totalUnits ?? 1;
      if (total - overlapping <= 0) return false;
    }
    return true;
  });

  switch (criteria.sort) {
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
    // "recent" → preserve incoming order
  }

  // Pro hosts ALWAYS surface first regardless of the chosen sort.
  return [...result].sort((a, b) => (b.proHost ? 1 : 0) - (a.proHost ? 1 : 0));
}

/** Active filter count for the UI "X filters" indicator. */
export function countActiveFilters(criteria: FilterCriteria): number {
  return [
    criteria.search,
    criteria.guests,
    criteria.bedrooms,
    criteria.minPrice,
    criteria.maxPrice,
    criteria.checkIn,
    criteria.checkOut,
    criteria.lakeOnly || null,
    criteria.amenities && criteria.amenities.size > 0 ? true : null,
    criteria.beds && criteria.beds.size > 0 ? true : null,
    criteria.propertyType ?? null,
    criteria.features && criteria.features.size > 0 ? true : null,
  ].filter((v) => v !== null && v !== "" && v !== undefined).length;
}
