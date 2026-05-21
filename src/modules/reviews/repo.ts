import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Reviews + appeals repository. Encapsulates rating recompute on the
 * Cabin row so the service never has to know that detail.
 */

/* ─────────── Lookups ─────────── */

export function findReviewById(id: string) {
  return prisma.review.findUnique({
    where: { id },
    include: { cabin: { select: { ownerId: true } } },
  });
}

export function findReservationForReview(reservationId: string) {
  return prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      cabinId: true,
      status: true,
      checkOut: true,
    },
  });
}

export function findReviewByReservationId(reservationId: string) {
  return prisma.review.findUnique({ where: { reservationId } });
}

export function listReviewsForCabin(cabinId: string) {
  return prisma.review.findMany({
    where: { cabinId, isRemoved: false },
    include: {
      user: { select: { name: true, email: true } },
      appeals: { where: { status: "PENDING" }, select: { id: true } },
      cabin: { select: { ownerId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/* ─────────── Writes ─────────── */

export function insertReview(data: {
  userId: string;
  cabinId: string;
  reservationId: string;
  rating: number;
  comment: string | null;
  ratingCleanliness?: number;
  ratingAccuracy?: number;
  ratingCheckin?: number;
  ratingCommunication?: number;
  ratingLocation?: number;
  ratingValue?: number;
}) {
  return prisma.review.create({ data });
}

export function markReviewRemoved(args: {
  id: string;
  reason: string;
}) {
  return prisma.review.update({
    where: { id: args.id },
    data: { isRemoved: true, removedReason: args.reason },
  });
}

/**
 * Recompute the cabin's aggregate rating + review count after a write.
 * Excludes removed reviews from the calculation.
 */
export async function recomputeCabinAggregate(
  tx: Prisma.TransactionClient | typeof prisma,
  cabinId: string
) {
  const stats = await tx.review.aggregate({
    where: { cabinId, isRemoved: false },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await tx.cabin.update({
    where: { id: cabinId },
    data: {
      rating: stats._avg.rating ?? 5,
      reviewCount: stats._count._all,
    },
  });
}

/* ─────────── Appeals ─────────── */

export function findPendingAppealForReview(reviewId: string) {
  return prisma.reviewAppeal.findFirst({
    where: { reviewId, status: "PENDING" },
  });
}

export function insertReviewAppeal(args: {
  reviewId: string;
  adminId: string;
  reason: string;
}) {
  return prisma.reviewAppeal.create({
    data: { ...args, status: "PENDING" },
  });
}

export function findAppealWithReview(id: string) {
  return prisma.reviewAppeal.findUnique({
    where: { id },
    include: { review: { select: { id: true, cabinId: true } } },
  });
}

export function listPendingAppeals() {
  return prisma.reviewAppeal.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      review: {
        select: {
          id: true,
          rating: true,
          comment: true,
          user: { select: { name: true, email: true } },
          cabin: { select: { title: true, slug: true } },
        },
      },
      admin: { select: { name: true, email: true } },
    },
  });
}

export function resolveAppealRow(args: {
  id: string;
  status: "APPROVED" | "REJECTED";
  resolution: string | null;
  resolvedById: string;
}) {
  return prisma.reviewAppeal.update({
    where: { id: args.id },
    data: {
      status: args.status,
      resolution: args.resolution,
      resolvedById: args.resolvedById,
      resolvedAt: new Date(),
    },
  });
}

export function transactional<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(fn);
}
