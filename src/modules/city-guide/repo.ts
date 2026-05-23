import "server-only";

import type { Prisma, TourismType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Destinations / TourismItem repository.
 * - `*Published*` → sólo isPublished (rutas públicas).
 * - Sin sufijo → admin.
 */

const itemInclude = {
  images: { orderBy: { order: "asc" as const } },
  storeType: true,
  keyPlaceCategory: true,
} satisfies Prisma.TourismItemInclude;

export function listPublishedDestinations() {
  return prisma.destination.findMany({
    where: { isPublished: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { items: { where: { isPublished: true } } } },
    },
  });
}

export function listAllDestinations() {
  return prisma.destination.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });
}

export function getDestinationBySlug(
  slug: string,
  opts?: { publicOnly?: boolean }
) {
  return prisma.destination.findUnique({
    where: { slug },
    include: {
      items: {
        where: opts?.publicOnly ? { isPublished: true } : undefined,
        orderBy: [
          { featured: "desc" },
          { type: "asc" },
          { order: "asc" },
          { title: "asc" },
        ],
        include: itemInclude,
      },
    },
  });
}

export function findDestinationById(id: string) {
  return prisma.destination.findUnique({ where: { id } });
}

export function listItemsByType(
  destinationSlug: string,
  type: TourismType
) {
  return prisma.tourismItem.findMany({
    where: {
      isPublished: true,
      type,
      destination: { slug: destinationSlug, isPublished: true },
    },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { title: "asc" }],
    include: itemInclude,
  });
}

export function getItemBySlug(destinationSlug: string, itemSlug: string) {
  return prisma.tourismItem.findFirst({
    where: {
      slug: itemSlug,
      isPublished: true,
      destination: { slug: destinationSlug, isPublished: true },
    },
    include: {
      ...itemInclude,
      destination: { select: { name: true, slug: true } },
    },
  });
}

export function findItemForEdit(id: string) {
  return prisma.tourismItem.findUnique({
    where: { id },
    include: itemInclude,
  });
}

/* ─────────── Writes ─────────── */

export function createDestinationRow(data: Prisma.DestinationCreateInput) {
  return prisma.destination.create({ data });
}

export function updateDestinationRow(
  id: string,
  data: Prisma.DestinationUpdateInput
) {
  return prisma.destination.update({ where: { id }, data });
}

export function deleteDestinationRow(id: string) {
  return prisma.destination.delete({ where: { id } });
}

export function createItemWithImages(
  destinationId: string,
  data: Omit<Prisma.TourismItemCreateInput, "destination" | "images">,
  images: { url: string; alt: string | null; order: number }[]
) {
  return prisma.tourismItem.create({
    data: {
      ...data,
      destination: { connect: { id: destinationId } },
      images: { create: images },
    },
    include: itemInclude,
  });
}

export function updateItemWithImages(
  id: string,
  data: Prisma.TourismItemUpdateInput,
  images: { url: string; alt: string | null; order: number }[] | null
) {
  return prisma.$transaction(async (tx) => {
    if (images !== null) {
      await tx.tourismItemImage.deleteMany({ where: { tourismItemId: id } });
      if (images.length) {
        await tx.tourismItemImage.createMany({
          data: images.map((i) => ({ ...i, tourismItemId: id })),
        });
      }
    }
    return tx.tourismItem.update({
      where: { id },
      data,
      include: itemInclude,
    });
  });
}

export function deleteItemRow(id: string) {
  return prisma.tourismItem.delete({ where: { id } });
}

/* ─────────── Taxonomías ─────────── */

export function listStoreTypes() {
  return prisma.storeType.findMany({ orderBy: { name: "asc" } });
}

export function upsertStoreType(input: { slug: string; name: string }) {
  return prisma.storeType.upsert({
    where: { slug: input.slug },
    create: input,
    update: { name: input.name },
  });
}

export function deleteStoreType(id: string) {
  return prisma.storeType.delete({ where: { id } });
}

export function listKeyPlaceCategories() {
  return prisma.keyPlaceCategory.findMany({ orderBy: { name: "asc" } });
}

export function upsertKeyPlaceCategory(input: { slug: string; name: string }) {
  return prisma.keyPlaceCategory.upsert({
    where: { slug: input.slug },
    create: input,
    update: { name: input.name },
  });
}

export function deleteKeyPlaceCategory(id: string) {
  return prisma.keyPlaceCategory.delete({ where: { id } });
}
