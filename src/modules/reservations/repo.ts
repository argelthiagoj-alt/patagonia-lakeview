import "server-only";

import type { Prisma, ReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Reservations repository — Prisma queries grouped by use case.
 * No domain rules live here; the service layer composes these calls.
 */

/* ─────────── Listing / search ─────────── */

const cardInclude = {
  cabin: { select: { slug: true, title: true, location: true } },
  payment: {
    select: { provider: true, status: true, cardBrand: true, last4: true },
  },
} satisfies Prisma.ReservationInclude;

function unreadCountFor(viewerId: string) {
  return {
    _count: {
      select: {
        messages: {
          where: { senderId: { not: viewerId }, readAt: null },
        },
      },
    },
  } satisfies Prisma.ConversationDefaultArgs["select"];
}

/** Reservations belonging to a guest, newest stay first. */
export function findReservationsForGuest(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: {
      ...cardInclude,
      conversation: { select: unreadCountFor(userId) },
    },
    orderBy: { checkIn: "desc" },
  });
}

/** Upcoming reservations for the dashboard widget (max N). */
export function findUpcomingForGuest(userId: string, take = 3) {
  return prisma.reservation.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "APPROVED", "CONFIRMED"] },
      checkOut: { gte: new Date() },
    },
    include: {
      ...cardInclude,
      conversation: { select: unreadCountFor(userId) },
    },
    orderBy: { checkIn: "asc" },
    take,
  });
}

/**
 * Admin operations list. Pass `ownerId` to scope to a specific host,
 * or omit it for super-admin (sees everything).
 */
export function findReservationsForAdmin(ownerId?: string) {
  const where: Prisma.ReservationWhereInput | undefined = ownerId
    ? { cabin: { ownerId } }
    : undefined;
  return prisma.reservation.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      cabin: { select: { title: true } },
      payment: {
        select: { provider: true, status: true, cardBrand: true, last4: true },
      },
    },
  });
}

/** Admin metrics (recent activity table). */
export function findRecentForAdmin(ownerId: string | null, take = 6) {
  const where: Prisma.ReservationWhereInput | undefined = ownerId
    ? { cabin: { ownerId } }
    : undefined;
  return prisma.reservation.findMany({
    where,
    take,
    orderBy: { createdAt: "desc" },
    include: { cabin: { select: { title: true } } },
  });
}

/** Aggregate metrics for the admin dashboard cards. */
export async function aggregateAdminMetrics(ownerId: string | null) {
  const reservationFilter: Prisma.ReservationWhereInput | undefined = ownerId
    ? { cabin: { ownerId } }
    : undefined;
  const cabinFilter: Prisma.CabinWhereInput | undefined = ownerId
    ? { ownerId }
    : undefined;

  const [totalRes, pending, cabins, revenue] = await Promise.all([
    prisma.reservation.count({ where: reservationFilter }),
    prisma.reservation.count({
      where: { ...reservationFilter, status: "PENDING" },
    }),
    prisma.cabin.count({ where: { ...cabinFilter, isActive: true } }),
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      where: {
        ...reservationFilter,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
    }),
  ]);
  return {
    totalRes,
    pending,
    cabins,
    revenue: revenue._sum.totalPrice ?? 0,
  };
}

/* ─────────── Detail / one-off lookups ─────────── */

/** Detail page (guest view). */
export function findReservationForGuest(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      cabin: { select: { slug: true, title: true, location: true, ownerId: true } },
      payment: {
        select: { provider: true, status: true, cardBrand: true, last4: true },
      },
      review: { select: { id: true } },
    },
  });
}

/** Detail page (admin view) — joins extra billing fields + guest user. */
export function findReservationForAdmin(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      cabin: {
        select: { ownerId: true, title: true, location: true, slug: true },
      },
      payment: true,
      user: { select: { name: true, email: true, phone: true } },
    },
  });
}

/** Minimal lookup used by the chat / accept-reject endpoints. */
export function findReservationCore(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      payment: true,
      cabin: { select: { ownerId: true, title: true } },
    },
  });
}

/* ─────────── Create with simulated payment ─────────── */

/**
 * Cabin info needed to validate availability + price before insert.
 * Used by the service layer.
 */
export function findCabinForBooking(args: {
  cabinSlug: string;
  checkIn: Date;
  checkOut: Date;
}) {
  return prisma.cabin.findUnique({
    where: { slug: args.cabinSlug },
    include: {
      reservations: {
        where: {
          status: { in: ["PENDING", "APPROVED", "CONFIRMED"] },
          checkOut: { gt: args.checkIn },
          checkIn: { lt: args.checkOut },
        },
        select: { checkIn: true, checkOut: true, status: true },
      },
    },
  });
}

export function createReservationWithPayment(
  data: Prisma.ReservationCreateInput
) {
  return prisma.reservation.create({
    data,
    include: { payment: true, cabin: { select: { title: true } } },
  });
}

/**
 * Crear una solicitud de reserva sin Payment. Estado inicial PENDING;
 * el huésped recién paga después de que el host apruebe (ver
 * `attachPaymentAndConfirm`).
 */
export function createReservationRequest(
  data: Omit<Prisma.ReservationCreateInput, "payment" | "status">
) {
  return prisma.reservation.create({
    data: { ...data, status: "PENDING" },
    include: { cabin: { select: { title: true } } },
  });
}

/**
 * Adjuntar un Payment a una reserva APPROVED y dejarla CONFIRMED en una
 * sola transacción. Se usa cuando el huésped paga después de la
 * aprobación.
 */
export function attachPaymentAndConfirm(args: {
  reservationId: string;
  payment: Prisma.PaymentCreateWithoutReservationInput;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        ...args.payment,
        status: "SIMULATED_CAPTURED",
        reservation: { connect: { id: args.reservationId } },
      },
    });
    return tx.reservation.update({
      where: { id: args.reservationId },
      data: { status: "CONFIRMED" },
      include: {
        payment: true,
        cabin: { select: { title: true } },
      },
    });
  });
}

/* ─────────── State transitions ─────────── */

/** Run a transition that updates reservation + (optionally) its payment. */
export function transitionReservation(args: {
  id: string;
  status: ReservationStatus;
  paymentId?: string;
  paymentStatus?:
    | "SIMULATED_PENDING"
    | "SIMULATED_APPROVED"
    | "SIMULATED_CAPTURED"
    | "SIMULATED_REFUNDED"
    | "SIMULATED_FAILED";
}) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: { id: args.id },
      data: { status: args.status },
    });
    if (args.paymentId && args.paymentStatus) {
      await tx.payment.update({
        where: { id: args.paymentId },
        data: { status: args.paymentStatus },
      });
    }
    return updated;
  });
}
