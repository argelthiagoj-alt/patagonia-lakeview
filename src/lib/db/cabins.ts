import { prisma } from "@/lib/prisma";
import {
  cabins as mockCabins,
  amenityLabels,
  type Cabin as MockCabin,
} from "@/data/cabins";

export type CabinView = MockCabin;

/**
 * Try to read from the DB. If the DB isn't reachable (no DATABASE_URL,
 * not seeded, build-time in CI…), gracefully fall back to mock data so
 * the site keeps rendering during development and on cold deploys.
 */
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
  const knownAmenityKeys = Object.keys(amenityLabels) as (keyof typeof amenityLabels)[];

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
