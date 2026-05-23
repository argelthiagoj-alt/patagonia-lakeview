import "server-only";

import type { DestinationInput, TourismItemInput } from "./schemas";
import * as repo from "./repo";

/**
 * Destinations / TourismItem service. Tagged-union results.
 */

function normalizeImages(images: TourismItemInput["images"]) {
  return (images ?? [])
    .filter((i) => i.url && i.url.length > 0)
    .slice(0, 15)
    .map((i, order) => ({
      url: i.url,
      alt: i.alt || null,
      order,
    }));
}

/* ─────────── Destination ─────────── */

export type DestinationResult =
  | { ok: true; destination: { id: string; slug: string } }
  | { ok: false; reason: "SLUG_TAKEN" | "NOT_FOUND" | "SERVER" };

export async function createDestination(
  data: DestinationInput
): Promise<DestinationResult> {
  try {
    const row = await repo.createDestinationRow({
      slug: data.slug,
      name: data.name,
      tagline: data.tagline ?? null,
      shortDescription: data.shortDescription ?? null,
      longDescription: data.longDescription,
      bannerImage: data.bannerImage ?? null,
      galleryImages: data.galleryImages,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      isPublished: data.isPublished,
      order: data.order,
    });
    return { ok: true, destination: { id: row.id, slug: row.slug } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") return { ok: false, reason: "SLUG_TAKEN" };
    console.error("[destinations.create]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function updateDestination(
  id: string,
  data: Partial<DestinationInput>
): Promise<DestinationResult> {
  try {
    const row = await repo.updateDestinationRow(id, {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.tagline !== undefined && { tagline: data.tagline }),
      ...(data.shortDescription !== undefined && {
        shortDescription: data.shortDescription,
      }),
      ...(data.longDescription !== undefined && {
        longDescription: data.longDescription,
      }),
      ...(data.bannerImage !== undefined && { bannerImage: data.bannerImage }),
      ...(data.galleryImages !== undefined && {
        galleryImages: data.galleryImages,
      }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.order !== undefined && { order: data.order }),
    });
    return { ok: true, destination: { id: row.id, slug: row.slug } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") return { ok: false, reason: "SLUG_TAKEN" };
    if (code === "P2025") return { ok: false, reason: "NOT_FOUND" };
    console.error("[destinations.update]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export type DeleteResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "SERVER" };

export async function deleteDestination(id: string): Promise<DeleteResult> {
  try {
    await repo.deleteDestinationRow(id);
    return { ok: true };
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return { ok: false, reason: "NOT_FOUND" };
    }
    console.error("[destinations.delete]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── TourismItem ─────────── */

export type TourismItemResult =
  | { ok: true; item: { id: string; slug: string } }
  | {
      ok: false;
      reason:
        | "SLUG_TAKEN"
        | "DESTINATION_NOT_FOUND"
        | "NOT_FOUND"
        | "SERVER";
    };

export async function createTourismItem(
  destinationId: string,
  data: TourismItemInput
): Promise<TourismItemResult> {
  try {
    const row = await repo.createItemWithImages(
      destinationId,
      {
        type: data.type,
        slug: data.slug,
        title: data.title,
        description: data.description,
        mainImage: data.mainImage ?? null,
        locationName: data.locationName ?? null,
        address: data.address ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        featured: data.featured,
        isPublished: data.isPublished,
        order: data.order,
        phone: data.phone ?? null,
        website: data.website ?? null,
        instagram: data.instagram ?? null,
        contact: data.contact ?? null,
        openingHours: data.openingHours ?? null,
        lengthKm: data.lengthKm ?? null,
        elevation: data.elevation ?? null,
        difficulty: data.difficulty ?? null,
        duration: data.duration ?? null,
        idealSeason: data.idealSeason ?? null,
        specialty: data.specialty ?? null,
        priceRange: data.priceRange ?? null,
        rating: data.rating ?? null,
        equipmentTypes: data.equipmentTypes,
        experienceType: data.experienceType ?? null,
        meetingPoint: data.meetingPoint ?? null,
        ...(data.keyPlaceCategoryId
          ? {
              keyPlaceCategory: {
                connect: { id: data.keyPlaceCategoryId },
              },
            }
          : {}),
        ...(data.storeTypeId
          ? { storeType: { connect: { id: data.storeTypeId } } }
          : {}),
      },
      normalizeImages(data.images)
    );
    return { ok: true, item: { id: row.id, slug: row.slug } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") return { ok: false, reason: "SLUG_TAKEN" };
    if (code === "P2025")
      return { ok: false, reason: "DESTINATION_NOT_FOUND" };
    console.error("[tourismItem.create]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function updateTourismItem(
  id: string,
  data: Partial<TourismItemInput>
): Promise<TourismItemResult> {
  try {
    const row = await repo.updateItemWithImages(
      id,
      {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.mainImage !== undefined && { mainImage: data.mainImage }),
        ...(data.locationName !== undefined && {
          locationName: data.locationName,
        }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.instagram !== undefined && { instagram: data.instagram }),
        ...(data.contact !== undefined && { contact: data.contact }),
        ...(data.openingHours !== undefined && {
          openingHours: data.openingHours,
        }),
        ...(data.lengthKm !== undefined && { lengthKm: data.lengthKm }),
        ...(data.elevation !== undefined && { elevation: data.elevation }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.idealSeason !== undefined && {
          idealSeason: data.idealSeason,
        }),
        ...(data.specialty !== undefined && { specialty: data.specialty }),
        ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.equipmentTypes !== undefined && {
          equipmentTypes: data.equipmentTypes,
        }),
        ...(data.experienceType !== undefined && {
          experienceType: data.experienceType,
        }),
        ...(data.meetingPoint !== undefined && {
          meetingPoint: data.meetingPoint,
        }),
        ...(data.keyPlaceCategoryId !== undefined && {
          keyPlaceCategory: data.keyPlaceCategoryId
            ? { connect: { id: data.keyPlaceCategoryId } }
            : { disconnect: true },
        }),
        ...(data.storeTypeId !== undefined && {
          storeType: data.storeTypeId
            ? { connect: { id: data.storeTypeId } }
            : { disconnect: true },
        }),
      },
      data.images !== undefined ? normalizeImages(data.images) : null
    );
    return { ok: true, item: { id: row.id, slug: row.slug } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") return { ok: false, reason: "SLUG_TAKEN" };
    if (code === "P2025") return { ok: false, reason: "NOT_FOUND" };
    console.error("[tourismItem.update]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function deleteTourismItem(id: string): Promise<DeleteResult> {
  try {
    await repo.deleteItemRow(id);
    return { ok: true };
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return { ok: false, reason: "NOT_FOUND" };
    }
    console.error("[tourismItem.delete]", err);
    return { ok: false, reason: "SERVER" };
  }
}
