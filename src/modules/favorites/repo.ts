import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Favorites repository — User ↔ Cabin saves.
 * Composite PK (userId, cabinId) garantiza no duplicar.
 */

export function findFavoriteIds(userId: string): Promise<string[]> {
  return prisma.favorite
    .findMany({ where: { userId }, select: { cabinId: true } })
    .then((rows) => rows.map((r) => r.cabinId));
}

export function isFavorited(userId: string, cabinId: string) {
  return prisma.favorite.findUnique({
    where: { userId_cabinId: { userId, cabinId } },
  });
}

export function addFavorite(userId: string, cabinId: string) {
  return prisma.favorite.upsert({
    where: { userId_cabinId: { userId, cabinId } },
    create: { userId, cabinId },
    update: {},
  });
}

export function removeFavorite(userId: string, cabinId: string) {
  return prisma.favorite.deleteMany({ where: { userId, cabinId } });
}

/**
 * Trae las publicaciones favoritas hidratadas con lo necesario para
 * renderizar CabinCard. Devuelve nada si el usuario aún no marcó ninguna.
 */
export function listFavoriteCabins(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      cabin: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      },
    },
  });
}
