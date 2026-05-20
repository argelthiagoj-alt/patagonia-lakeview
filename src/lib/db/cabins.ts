import { prisma } from "@/lib/prisma";
import {
  cabins as mockCabins,
  amenityLabels,
  type Cabin as MockCabin,
} from "@/data/cabins";

export type BedSummary = {
  type: "TWIN" | "DOUBLE" | "QUEEN" | "KING" | "SOFA_BED" | "BUNK";
  quantity: number;
};

export type CabinView = MockCabin & {
  totalUnits: number;
  beds: BedSummary[];
  proHost: boolean;
  ownerName: string | null;
};

/** Active reservation window used for date-availability filtering. */
export type ReservationWindow = {
  checkIn: string;
  checkOut: string;
};

export type CabinWithReservations = CabinView & {
  reservations: ReservationWindow[];
};

async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[db] falling back to mock data:", (err as Error).message);
    }
    return fallback;
  }
}

const includeForCabin = {
  images: { orderBy: { order: "asc" } as const },
  amenities: { include: { amenity: true } },
  beds: true,
  owner: {
    select: {
      name: true,
      adminPlan: true,
      proUntil: true,
    },
  },
} as const;

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

/**
 * Same as `listCabins` but each cabin includes its active (PENDING/CONFIRMED)
 * reservations. Used by the public catalog to filter by date range.
 */
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

export async function getCabinBySlug(
  slug: string
): Promise<CabinView | null> {
  return safeDb(async () => {
    const row = await prisma.cabin.findUnique({
      where: { slug },
      include: includeForCabin,
    });
    return row ? mapCabin(row) : null;
  }, mockCabins.find((c) => c.slug === slug) ? toMockView(mockCabins.find((c) => c.slug === slug)!) : null);
}

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
};

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
  };
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
