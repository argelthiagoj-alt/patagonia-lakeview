import "server-only";

import type { CabinInput, RoomTypeInput } from "@/modules/cabins/schemas";
import type { BedType } from "@/modules/cabins/beds";
import { FEATURE_KEYS, type FeatureKey } from "@/modules/cabins/schemas";
import {
  createCabinRow,
  replaceAmenities,
  replaceBeds,
  replaceImages,
  replaceRoomTypes,
  resolveAmenityIds,
  setCabinActive,
  transactional,
} from "@/modules/cabins/repo";

/**
 * Cabins service — high-level CRUD for admin operations. Encapsulates:
 *   • amenity-key → id resolution (unknown keys are dropped silently)
 *   • bed dedupe by type (summing quantities)
 *   • ownership enforcement on create (route passes the owner)
 *   • single-transaction updates of scalars + images + amenities + beds
 */

/* ─────────── Helpers ─────────── */

function dedupeBeds(beds: { type: BedType; quantity: number }[]) {
  const byType = new Map<BedType, number>();
  for (const b of beds) {
    byType.set(b.type, (byType.get(b.type) ?? 0) + b.quantity);
  }
  return Array.from(byType.entries()).map(([type, quantity]) => ({
    type,
    quantity,
  }));
}

function normalizeImages(images: CabinInput["images"]) {
  return images.map((img) => ({ url: img.url, alt: img.alt ?? null }));
}

/** Convierte el objeto `features` (booleanos) a un payload Prisma-ready
 *  con las columnas físicas. Si una key no viene, no se setea. */
function featuresToColumns(
  features: Partial<CabinInput["features"]> | undefined
): Partial<Record<FeatureKey, boolean>> {
  if (!features) return {};
  const out: Partial<Record<FeatureKey, boolean>> = {};
  for (const k of FEATURE_KEYS) {
    if (features[k] !== undefined) out[k] = Boolean(features[k]);
  }
  return out;
}

/** Normaliza camas de un RoomType (mismo dedupe que cabin-level). */
function normalizeRoomTypes(roomTypes: RoomTypeInput[]) {
  return roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description ?? null,
    pricePerNight: rt.pricePerNight,
    maxGuests: rt.maxGuests,
    totalUnits: rt.totalUnits,
    amenities: rt.amenities,
    beds: dedupeBeds(rt.beds),
  }));
}

/* ─────────── Create ─────────── */

export type CreateCabinResult =
  | { ok: true; cabin: { id: string; slug: string } }
  | { ok: false; reason: "SLUG_TAKEN" | "SERVER" };

export async function createCabin(
  ownerId: string,
  data: CabinInput
): Promise<CreateCabinResult> {
  try {
    const amenities = await resolveAmenityIds(data.amenityKeys);
    const beds = dedupeBeds(data.beds);
    const images = normalizeImages(data.images);

    const cabin = await createCabinRow({
      slug: data.slug,
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      location: data.location,
      lakeView: data.lakeView,
      maxGuests: data.maxGuests,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      pricePerNight: data.pricePerNight,
      cleaningFee: data.cleaningFee,
      totalUnits: data.totalUnits,
      isActive: data.isActive,
      highlights: data.highlights,
      propertyType: data.propertyType,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      cancellationPolicy: data.cancellationPolicy ?? null,
      houseRules: data.houseRules ?? null,
      checkInTime: data.checkInTime ?? null,
      checkOutTime: data.checkOutTime ?? null,
      hostDisplayName: data.hostDisplayName ?? null,
      hostBio: data.hostBio ?? null,
      hostPhoto: data.hostPhoto ?? null,
      hostCity: data.hostCity ?? null,
      hostingSince: data.hostingSince ?? null,
      ...featuresToColumns(data.features),
      // Ownership is set from the route's session, NEVER trusted from input.
      owner: { connect: { id: ownerId } },
      images: {
        create: images.map((img, order) => ({
          url: img.url,
          alt: img.alt,
          order,
        })),
      },
      amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
      beds: { create: beds },
      // Room types: sólo para HOTEL. Si vienen, se crean en el mismo insert.
      ...(data.propertyType === "HOTEL" && data.roomTypes.length
        ? {
            roomTypes: {
              create: normalizeRoomTypes(data.roomTypes).map((rt) => ({
                name: rt.name,
                description: rt.description,
                pricePerNight: rt.pricePerNight,
                maxGuests: rt.maxGuests,
                totalUnits: rt.totalUnits,
                amenities: rt.amenities,
                beds: { create: rt.beds },
              })),
            },
          }
        : {}),
    });

    return { ok: true, cabin: { id: cabin.id, slug: cabin.slug } };
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return { ok: false, reason: "SLUG_TAKEN" };
    }
    console.error("[cabins.service.createCabin]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Update ─────────── */

export type UpdateCabinResult =
  | { ok: true; cabin: { id: string } }
  | { ok: false; reason: "NOT_FOUND" | "SLUG_TAKEN" | "SERVER" };

export async function updateCabin(
  id: string,
  data: Partial<CabinInput>
): Promise<UpdateCabinResult> {
  try {
    const amenities = data.amenityKeys
      ? await resolveAmenityIds(data.amenityKeys)
      : null;

    const updated = await transactional(async (tx) => {
      const u = await tx.cabin.update({
        where: { id },
        data: {
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.shortDescription !== undefined && {
            shortDescription: data.shortDescription,
          }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.lakeView !== undefined && { lakeView: data.lakeView }),
          ...(data.maxGuests !== undefined && { maxGuests: data.maxGuests }),
          ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
          ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
          ...(data.pricePerNight !== undefined && {
            pricePerNight: data.pricePerNight,
          }),
          ...(data.cleaningFee !== undefined && {
            cleaningFee: data.cleaningFee,
          }),
          ...(data.totalUnits !== undefined && { totalUnits: data.totalUnits }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.highlights !== undefined && { highlights: data.highlights }),
          ...(data.propertyType !== undefined && {
            propertyType: data.propertyType,
          }),
          ...(data.latitude !== undefined && { latitude: data.latitude }),
          ...(data.longitude !== undefined && { longitude: data.longitude }),
          ...(data.cancellationPolicy !== undefined && {
            cancellationPolicy: data.cancellationPolicy,
          }),
          ...(data.houseRules !== undefined && { houseRules: data.houseRules }),
          ...(data.checkInTime !== undefined && {
            checkInTime: data.checkInTime,
          }),
          ...(data.checkOutTime !== undefined && {
            checkOutTime: data.checkOutTime,
          }),
          ...(data.hostDisplayName !== undefined && {
            hostDisplayName: data.hostDisplayName,
          }),
          ...(data.hostBio !== undefined && { hostBio: data.hostBio }),
          ...(data.hostPhoto !== undefined && { hostPhoto: data.hostPhoto }),
          ...(data.hostCity !== undefined && { hostCity: data.hostCity }),
          ...(data.hostingSince !== undefined && {
            hostingSince: data.hostingSince,
          }),
          ...featuresToColumns(data.features),
        },
      });

      if (data.images !== undefined) {
        await replaceImages(tx, id, normalizeImages(data.images));
      }
      if (amenities !== null) {
        await replaceAmenities(tx, id, amenities);
      }
      if (data.beds !== undefined) {
        await replaceBeds(tx, id, dedupeBeds(data.beds));
      }
      if (data.roomTypes !== undefined) {
        await replaceRoomTypes(tx, id, normalizeRoomTypes(data.roomTypes));
      }
      return u;
    });

    return { ok: true, cabin: { id: updated.id } };
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") return { ok: false, reason: "NOT_FOUND" };
    if (code === "P2002") return { ok: false, reason: "SLUG_TAKEN" };
    console.error("[cabins.service.updateCabin]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Deactivate ─────────── */

export async function deactivateCabin(id: string) {
  try {
    await setCabinActive(id, false);
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: "NOT_FOUND" as const };
  }
}
