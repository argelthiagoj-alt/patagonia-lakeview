import "server-only";

import type { CurrentUser } from "@/shared/auth-roles";
import { prisma } from "@/lib/prisma";
import * as repo from "./repo";
import { canSubmitReview, canFileAppeal, canResolveAppeal } from "./policies";

/**
 * Reviews service. Routes call here; this module owns the business rules
 * and the cabin-aggregate recompute after writes.
 */

/* ─────────── submitReview ─────────── */

export type SubmitReviewInput = {
  reservationId: string;
  cleanliness: number;
  accuracy: number;
  checkin: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
};

export type SubmitReviewResult =
  | { ok: true; review: Awaited<ReturnType<typeof repo.insertReview>> }
  | {
      ok: false;
      reason:
        | "NOT_FOUND"
        | "FORBIDDEN"
        | "NOT_ELIGIBLE"
        | "ALREADY_REVIEWED"
        | "BANNED"
        | "SERVER";
    };

export async function submitReview(
  user: CurrentUser,
  input: SubmitReviewInput
): Promise<SubmitReviewResult> {
  if (user.isBanned) return { ok: false, reason: "BANNED" };

  try {
    const reservation = await repo.findReservationForReview(input.reservationId);
    if (!reservation) return { ok: false, reason: "NOT_FOUND" };
    if (reservation.userId !== user.id) return { ok: false, reason: "FORBIDDEN" };

    if (!canSubmitReview(user, reservation)) {
      return { ok: false, reason: "NOT_ELIGIBLE" };
    }

    const existing = await repo.findReviewByReservationId(reservation.id);
    if (existing) return { ok: false, reason: "ALREADY_REVIEWED" };

    // Rating general = promedio simple de las 6 categorías, redondeado al
    // entero más cercano (mantiene `rating Int` en la DB).
    const avg = Math.round(
      (input.cleanliness +
        input.accuracy +
        input.checkin +
        input.communication +
        input.location +
        input.value) /
        6
    );

    const review = await repo.insertReview({
      userId: user.id,
      cabinId: reservation.cabinId,
      reservationId: reservation.id,
      rating: avg,
      comment: input.comment,
      ratingCleanliness: input.cleanliness,
      ratingAccuracy: input.accuracy,
      ratingCheckin: input.checkin,
      ratingCommunication: input.communication,
      ratingLocation: input.location,
      ratingValue: input.value,
    });

    await repo.recomputeCabinAggregate(
      // We pass the prisma module directly via repo's helper signature.
      // recomputeCabinAggregate accepts either tx or prisma.
      (await import("@/lib/prisma")).prisma,
      reservation.cabinId
    );

    return { ok: true, review };
  } catch (err) {
    console.error("[reviews.submitReview]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── removeReview (super-admin) ─────────── */

export type RemoveReviewResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "SERVER" };

export async function removeReview(reviewId: string): Promise<RemoveReviewResult> {
  try {
    const review = await repo.findReviewById(reviewId);
    if (!review) return { ok: false, reason: "NOT_FOUND" };

    await repo.markReviewRemoved({
      id: reviewId,
      reason: "Removed by super-admin",
    });
    await repo.recomputeCabinAggregate(
      (await import("@/lib/prisma")).prisma,
      review.cabinId
    );
    return { ok: true };
  } catch (err) {
    console.error("[reviews.removeReview]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── fileAppeal ─────────── */

export type FileAppealResult =
  | { ok: true; appeal: Awaited<ReturnType<typeof repo.insertReviewAppeal>> }
  | {
      ok: false;
      reason: "NOT_FOUND" | "FORBIDDEN" | "ALREADY_PENDING" | "SERVER";
    };

export async function fileAppeal(
  user: CurrentUser,
  reviewId: string,
  reason: string
): Promise<FileAppealResult> {
  try {
    const review = await repo.findReviewById(reviewId);
    if (!review) return { ok: false, reason: "NOT_FOUND" };

    if (!canFileAppeal(user, review.cabin)) {
      return { ok: false, reason: "FORBIDDEN" };
    }

    const pending = await repo.findPendingAppealForReview(reviewId);
    if (pending) return { ok: false, reason: "ALREADY_PENDING" };

    const appeal = await repo.insertReviewAppeal({
      reviewId,
      adminId: user.id,
      reason,
    });
    return { ok: true, appeal };
  } catch (err) {
    console.error("[reviews.fileAppeal]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── resolveAppeal (super-admin) ─────────── */

export type ResolveAppealInput = {
  decision: "APPROVED" | "REJECTED";
  resolution?: string;
};

export type ResolveAppealResult =
  | { ok: true }
  | {
      ok: false;
      reason: "NOT_FOUND" | "FORBIDDEN" | "ALREADY_RESOLVED" | "SERVER";
    };

export async function resolveAppeal(
  user: CurrentUser,
  appealId: string,
  input: ResolveAppealInput
): Promise<ResolveAppealResult> {
  if (!canResolveAppeal(user)) return { ok: false, reason: "FORBIDDEN" };

  try {
    const appeal = await repo.findAppealWithReview(appealId);
    if (!appeal) return { ok: false, reason: "NOT_FOUND" };
    if (appeal.status !== "PENDING") {
      return { ok: false, reason: "ALREADY_RESOLVED" };
    }

    await repo.transactional(async (tx) => {
      await tx.reviewAppeal.update({
        where: { id: appealId },
        data: {
          status: input.decision,
          resolution: input.resolution || null,
          resolvedById: user.id,
          resolvedAt: new Date(),
        },
      });

      if (input.decision === "APPROVED") {
        await tx.review.update({
          where: { id: appeal.review.id },
          data: {
            isRemoved: true,
            removedReason: input.resolution || "Removed via appeal",
          },
        });
        await repo.recomputeCabinAggregate(tx, appeal.review.cabinId);
      }
    });

    return { ok: true };
  } catch (err) {
    console.error("[reviews.resolveAppeal]", err);
    return { ok: false, reason: "SERVER" };
  }
}
