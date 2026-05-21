import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  cabins as mockCabins,
  amenityLabels,
  type Cabin as MockCabin,
} from "@/data/cabins";

/**
 * Cabins repository. Public reads, admin reads/writes and amenity lookups
 * all live here. Mapping from Prisma rows to the public `CabinView` shape
 * is encapsulated below; callers never see raw Prisma types.
 *
 * When Prisma is unavailable, public reads gracefully fall back to the
 * static mock data in `src/data/cabins.ts`.
 */

/* ─────────── Public-facing types ─────────── */

export type BedSummary = {
  type: "TWIN" | "DOUBLE" | "QUEEN" | "KING" | "SOFA_BED" | "BUNK";
  quantity: number;
};

export type CabinView = MockCabin & {
  totalUnits: number;
  beds: BedSummary[];
  proHost: boolean;
  ownerName: string | null;
  /** Marketplace add-ons (opcionales; viene de la DB sólo si el row los
   *  trae, mock data los deja en undefined). */
  propertyType?: "CABIN" | "HOTEL";
  latitude?: number | null;
  longitude?: number | null;
  features?: Partial<Record<string, boolean>>;
  hostInfo?: {
    name: string | null;
    bio: string | null;
    photo: string | null;
    city: string | null;
    hostingSince: Date | null;
  } | null;
};

export type ReservationWindow = {
  checkIn: string;
  checkOut: string;
};

export type CabinWithReservations = CabinView & {
  reservations: ReservationWindow[];
};

/* ─────────── Includes / mapping ─────────── */

const includeForCabin = {
  images: { orderBy: { order: "asc" } as const },
  amenities: { include: { amenity: true } },
  beds: true,
  owner: {
    select: { name: true, adminPlan: true, proUntil: true },
  },
} satisfies Prisma.CabinInclude;

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string | null;
  location: string;
  lakeView: boolean;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  cleaningFee: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  totalUnits: number;
  images: { url: string; alt: string | null }[];
  amenities: { amenity: { key: string } }[];
  beds: { type: string; quantity: number }[];
  owner: { name: string | null; adminPlan: string; proUntil: Date | null };
  // Marketplace columns (opcionales — pueden no venir si Prisma client está desactualizado).
  propertyType?: "CABIN" | "HOTEL";
  latitude?: number | null;
  longitude?: number | null;
  hostDisplayName?: string | null;
  hostBio?: string | null;
  hostPhoto?: string | null;
  hostCity?: string | null;
  hostingSince?: Date | null;
} & Partial<Record<string, unknown>>;

function mapCabin(row: Row): CabinView {
  const knownAmenityKeys = Object.keys(
    amenityLabels
  ) as (keyof typeof amenityLabels)[];

  const proHost =
    row.owner.adminPlan === "PRO" &&
    (row.owner.proUntil === null || row.owner.proUntil > new Date());

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location,
    shortDescription: row.shortDescription ?? "",
    description: row.description,
    highlights: row.highlights ?? [],
    amenities: row.amenities
      .map((a) => a.amenity.key)
      .filter((k): k is (typeof knownAmenityKeys)[number] =>
        (knownAmenityKeys as string[]).includes(k)
      ),
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    maxGuests: row.maxGuests,
    pricePerNight: row.pricePerNight,
    cleaningFee: row.cleaningFee,
    rating: row.rating,
    reviewCount: row.reviewCount,
    lakeView: row.lakeView,
    images: row.images.map((i) => ({
      url: i.url,
      alt: i.alt ?? row.title,
    })),
    totalUnits: row.totalUnits,
    beds: row.beds.map((b) => ({
      type: b.type as BedSummary["type"],
      quantity: b.quantity,
    })),
    proHost,
    ownerName: row.owner.name,
    propertyType: row.propertyType,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    features: extractFeatures(row),
    hostInfo:
      row.hostDisplayName || row.hostBio || row.hostPhoto || row.hostCity
        ? {
            name: row.hostDisplayName ?? null,
            bio: row.hostBio ?? null,
            photo: row.hostPhoto ?? null,
            city: row.hostCity ?? null,
            hostingSince: row.hostingSince ?? null,
          }
        : null,
  };
}

const FEATURE_COLS = [
  "hasTv",
  "hasWifi",
  "hasHeating",
  "hasAirConditioning",
  "hasPhoneSignal",
  "hasRestaurant",
  "hasElevator",
  "has24hReception",
  "hasRoomService",
  "hasBreakfast",
  "hasSpa",
  "hasGym",
  "hasPool",
  "hasParking",
  "hasAccessibility",
] as const;

function extractFeatures(row: Record<string, unknown>) {
  const out: Record<string, boolean> = {};
  for (const k of FEATURE_COLS) {
    out[k] = Boolean(row[k]);
  }
  return out;
}

function toMockView(c: MockCabin): CabinView {
  return {
    ...c,
    totalUnits: 1,
    beds: [],
    proHost: false,
    ownerName: null,
  };
}

async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cabins.repo] falling back to mock data:", (err as Error).message);
    }
    return fallback;
  }
}

/* ─────────── Public reads ─────────── */

export async function listCabins(): Promise<CabinView[]> {
  return safeDb(async () => {
    const rows = await prisma.cabin.findMany({
      where: { isActive: true },
      include: includeForCabin,
      orderBy: { createdAt: "asc" },
    });
    return rows.map(mapCabin);
  }, mockCabins.map(toMockView));
}

export async function listCabinsWithReservations(): Promise<
  CabinWithReservations[]
> {
  return safeDb(
    async () => {
      const rows = await prisma.cabin.findMany({
        where: { isActive: true },
        include: {
          ...includeForCabin,
          reservations: {
            where: {
              status: { in: ["PENDING", "CONFIRMED"] },
              checkOut: { gte: new Date() },
            },
            select: { checkIn: true, checkOut: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      return rows.map((row) => ({
        ...mapCabin(row),
        reservations: row.reservations.map((r) => ({
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
        })),
      }));
    },
    mockCabins.map((c) => ({ ...toMockView(c), reservations: [] }))
  );
}

export async function getCabinBySlug(slug: string): Promise<CabinView | null> {
  return safeDb(
    async () => {
      const row = await prisma.cabin.findUnique({
        where: { slug },
        include: includeForCabin,
      });
      return row ? mapCabin(row) : null;
    },
    mockCabins.find((c) => c.slug === slug)
      ? toMockView(mockCabins.find((c) => c.slug === slug)!)
      : null
  );
}

/* ─────────── Amenities ─────────── */

export type AmenityOption = { key: string; name: string };

export async function listAmenities(): Promise<AmenityOption[]> {
  try {
    const rows = await prisma.amenity.findMany({
      orderBy: { name: "asc" },
      select: { key: true, name: true },
    });
    if (rows.length > 0) return rows;
  } catch {
    /* fall through to mock */
  }
  return Object.entries(amenityLabels).map(([key, name]) => ({ key, name }));
}

export async function resolveAmenityIds(keys: string[]) {
  if (keys.length === 0) return [];
  return prisma.amenity.findMany({
    where: { key: { in: keys } },
    select: { id: true },
  });
}

/* ─────────── Admin reads ─────────── */

/**
 * Admin inventory list. Pass `ownerId` to scope to a specific host or omit
 * for super-admin view.
 */
export function findCabinsForAdmin(ownerId?: string) {
  return prisma.cabin.findMany({
    where: ownerId ? { ownerId } : undefined,
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { reservations: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

/** Edit page lookup — includes everything the form needs. */
export function findCabinForEdit(id: string) {
  return prisma.cabin.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
      beds: true,
      roomTypes: { include: { beds: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

/** Minimal lookup used for authorization checks on PATCH/DELETE. */
export function findCabinOwnership(id: string) {
  return prisma.cabin.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });
}

/* ─────────── Admin writes ─────────── */

export function createCabinRow(data: Prisma.CabinCreateInput) {
  return prisma.cabin.create({ data });
}

export function updateCabinScalars(
  id: string,
  data: Prisma.CabinUpdateInput
) {
  return prisma.cabin.update({ where: { id }, data });
}

export function setCabinActive(id: string, isActive: boolean) {
  return prisma.cabin.update({ where: { id }, data: { isActive } });
}

/* ─────────── Transactional helpers for replace-on-save ─────────── */

type BedRow = { type: "TWIN" | "DOUBLE" | "QUEEN" | "KING" | "SOFA_BED" | "BUNK"; quantity: number };

export function replaceImages(
  tx: Prisma.TransactionClient,
  cabinId: string,
  images: { url: string; alt: string | null }[]
) {
  return (async () => {
    await tx.cabinImage.deleteMany({ where: { cabinId } });
    if (images.length === 0) return;
    await tx.cabinImage.createMany({
      data: images.map((img, order) => ({
        cabinId,
        url: img.url,
        alt: img.alt,
        order,
      })),
    });
  })();
}

export function replaceAmenities(
  tx: Prisma.TransactionClient,
  cabinId: string,
  amenityIds: { id: string }[]
) {
  return (async () => {
    await tx.cabinAmenity.deleteMany({ where: { cabinId } });
    if (amenityIds.length === 0) return;
    await tx.cabinAmenity.createMany({
      data: amenityIds.map((a) => ({ cabinId, amenityId: a.id })),
    });
  })();
}

export function replaceBeds(
  tx: Prisma.TransactionClient,
  cabinId: string,
  beds: BedRow[]
) {
  return (async () => {
    await tx.cabinBed.deleteMany({ where: { cabinId } });
    if (beds.length === 0) return;
    await tx.cabinBed.createMany({
      data: beds.map((b) => ({ cabinId, type: b.type, quantity: b.quantity })),
    });
  })();
}

type RoomTypeRow = {
  id?: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  maxGuests: number;
  totalUnits: number;
  amenities: string[];
  beds: BedRow[];
};

/**
 * Replace-on-save de los tipos de habitación de una publicación HOTEL.
 *
 * Estrategia: borrar todos los room types del cabin y recrearlos.
 * Es suficiente para el flujo de admin (forms tipo "guardar todo"),
 * y evita la complejidad de matchear por id cuando el form puede
 * mezclar room types existentes y nuevos.
 *
 * Trade-off conocido: si un room type existente tenía reservations
 * con `roomTypeId`, esos roomTypeId quedan en null por la FK
 * `onDelete: SetNull`. Las reservas no se borran. Si más adelante
 * importa preservar la referencia, hay que mover a un upsert-by-id.
 */
export function replaceRoomTypes(
  tx: Prisma.TransactionClient,
  cabinId: string,
  roomTypes: RoomTypeRow[]
) {
  return (async () => {
    await tx.roomType.deleteMany({ where: { cabinId } });
    if (roomTypes.length === 0) return;
    for (const rt of roomTypes) {
      await tx.roomType.create({
        data: {
          cabinId,
          name: rt.name,
          description: rt.description,
          pricePerNight: rt.pricePerNight,
          maxGuests: rt.maxGuests,
          totalUnits: rt.totalUnits,
          amenities: rt.amenities,
          beds: { create: rt.beds },
        },
      });
    }
  })();
}

export function transactional<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(fn);
}
