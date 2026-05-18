import { prisma } from "@/lib/prisma";
import { amenityLabels } from "@/data/cabins";

export type AmenityOption = { key: string; name: string };

/**
 * List available amenities for the admin form.
 * - Reads from DB when available.
 * - Falls back to the static label map so the form keeps working in demo mode.
 */
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
