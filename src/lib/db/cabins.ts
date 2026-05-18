import { prisma } from "@/lib/prisma";
import {
  cabins as mockCabins,
  amenityLabels,
  type Cabin as MockCabin,
} from "@/data/cabins";

export type CabinView = MockCabin;

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

export async function listCabins(): Promise<CabinView[]> {
  return safeDb(async () => {
    const rows = await prisma.cabin.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(mapCabin);
  }, mockCabins);
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
          images: { orderBy: { order: "asc" } },
          amenities: { include: { amenity: true } },
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
    mockCabins.map((c) => ({ ...c, reservations: [] }))
  );
}

export async function getCabinBySlug(
  slug: string
): Promise<CabinView | null> {
  return safeDb(async () => {
    const row = await prisma.cabin.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
      },
    });
    return row ? mapCabin(row) : null;
  }, mockCabins.find((c) => c.slug === slug) ?? null);
}

type Row = Awaited<ReturnType<typeof prisma.cabin.findFirstOrThrow>> & {
  images: { url: string; alt: string | null }[];
  amenities: { amenity: { key: string } }[];
};

function mapCabin(row: Row): CabinView {
  const knownAmenityKeys = Object.keys(
    amenityLabels
  ) as (keyof typeof amenityLabels)[];

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
  };
}
