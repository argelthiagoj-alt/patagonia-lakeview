import "server-only";

import { computeBookingPrice, hasOverlap } from "@/lib/booking";
import {
  sendReservationConfirmedEmail,
  sendReservationReceivedEmail,
  sendReservationRejectedEmail,
} from "@/modules/email/senders";
import { buildSimulatedPaymentData } from "@/modules/payments/service";
import type { PaymentInput } from "@/modules/payments/schemas";
import {
  attachPaymentAndConfirm,
  createReservationRequest,
  findCabinForBooking,
  findReservationCore,
  transitionReservation,
} from "@/modules/reservations/repo";

/**
 * Reservations service.
 *
 * State machine (post major update):
 *
 *   createReservation  →  PENDING
 *   approveReservation →  APPROVED        (admin/host)
 *   payReservation     →  CONFIRMED       (guest, sólo si APPROVED)
 *   rejectReservation  →  REJECTED        (admin/host, desde PENDING)
 *   cancelReservation  →  CANCELLED       (guest dueño o admin/host)
 *
 * Todas las acciones devuelven tagged-unions; las rutas hacen switch sobre
 * `reason` para mapear a HTTP status.
 */

/* ─────────── Create (sin payment) ─────────── */

export type CreateReservationInput = {
  cabinSlug: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestName: string;
  guestEmail: string;
  notes?: string;
  userId?: string;
};

export type CreateReservationResult =
  | {
      ok: true;
      reservation: { id: string };
      price: ReturnType<typeof computeBookingPrice>;
    }
  | {
      ok: false;
      reason: "CABIN_NOT_FOUND" | "OVER_CAPACITY" | "UNAVAILABLE" | "SERVER";
      capacity?: number;
    };

export async function createReservation(
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  try {
    const cabin = await findCabinForBooking({
      cabinSlug: input.cabinSlug,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });

    if (!cabin || !cabin.isActive) {
      return { ok: false, reason: "CABIN_NOT_FOUND" };
    }

    if (input.guests > cabin.maxGuests) {
      return { ok: false, reason: "OVER_CAPACITY", capacity: cabin.maxGuests };
    }

    const overlapCount = cabin.reservations.filter(
      (r) => r.status !== "CANCELLED" && r.status !== "REJECTED"
    ).length;
    if (overlapCount >= cabin.totalUnits) {
      return { ok: false, reason: "UNAVAILABLE" };
    }
    if (
      cabin.totalUnits === 1 &&
      hasOverlap(cabin.reservations, input.checkIn, input.checkOut)
    ) {
      return { ok: false, reason: "UNAVAILABLE" };
    }

    const price = computeBookingPrice({
      pricePerNight: cabin.pricePerNight,
      cleaningFee: cabin.cleaningFee,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });

    const reservation = await createReservationRequest({
      cabin: { connect: { id: cabin.id } },
      ...(input.userId
        ? { user: { connect: { id: input.userId } } }
        : {}),
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      notes: input.notes,
      totalPrice: price.total,
    });

    // Mail "solicitud recibida — esperando aprobación del anfitrión".
    // Re-usa la plantilla existente; el copy actual ya menciona que el
    // anfitrión va a aceptar/rechazar.
    void sendReservationReceivedEmail({
      to: input.guestEmail,
      guestName: input.guestName,
      cabinTitle: reservation.cabin.title,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      total: price.total,
    }).catch(() => undefined);

    return { ok: true, reservation: { id: reservation.id }, price };
  } catch (err) {
    console.error("[reservations.service.createReservation]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Pay (guest, APPROVED → CONFIRMED) ─────────── */

export type PayReservationInput = {
  reservationId: string;
  guestName: string;
  payment: PaymentInput;
};

export type PayReservationResult =
  | { ok: true; reservation: { id: string; status: string } }
  | {
      ok: false;
      reason: "NOT_FOUND" | "NOT_APPROVED" | "ALREADY_PAID" | "SERVER";
    };

export async function payReservation(
  input: PayReservationInput
): Promise<PayReservationResult> {
  try {
    const r = await findReservationCore(input.reservationId);
    if (!r) return { ok: false, reason: "NOT_FOUND" };
    if (r.payment) return { ok: false, reason: "ALREADY_PAID" };
    if (r.status !== "APPROVED") {
      return { ok: false, reason: "NOT_APPROVED" };
    }

    const paymentData = buildSimulatedPaymentData(
      input.payment,
      r.totalPrice,
      input.guestName
    );

    const updated = await attachPaymentAndConfirm({
      reservationId: r.id,
      payment: paymentData,
    });

    void sendReservationConfirmedEmail({
      to: r.guestEmail,
      guestName: r.guestName,
      cabinTitle: r.cabin.title,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      total: r.totalPrice,
    }).catch(() => undefined);

    return { ok: true, reservation: { id: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[reservations.service.payReservation]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── State transitions (admin/host) ─────────── */

type LoadedReservation = NonNullable<
  Awaited<ReturnType<typeof findReservationCore>>
>;

export type TransitionResult =
  | { ok: true; reservation: { id: string; status: string } }
  | {
      ok: false;
      reason: "NOT_FOUND" | "ALREADY_FINAL" | "INVALID_TRANSITION" | "SERVER";
    };

const FINAL_STATES: ReadonlyArray<LoadedReservation["status"]> = [
  "CANCELLED",
  "REJECTED",
  "COMPLETED",
];

async function loadOrFail(id: string) {
  const r = await findReservationCore(id);
  if (!r) return { ok: false as const, reason: "NOT_FOUND" as const };
  if (FINAL_STATES.includes(r.status))
    return { ok: false as const, reason: "ALREADY_FINAL" as const };
  return { ok: true as const, reservation: r };
}

/**
 * Anfitrión aprueba la solicitud: PENDING → APPROVED.
 * Manda mail "solicitud aprobada — ya podés pagar". No mueve el pago.
 */
export async function approveReservation(id: string): Promise<TransitionResult> {
  const load = await loadOrFail(id);
  if (!load.ok) return load;
  const r = load.reservation;
  if (r.status !== "PENDING") {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }
  try {
    const updated = await transitionReservation({
      id,
      status: "APPROVED",
    });
    // Re-usamos el mismo template "received" — el contenido sigue siendo
    // útil ("estamos revisando" / "vas a recibir indicaciones"). El mail
    // específico de "approved → pagá" puede sumarse después como una
    // plantilla nueva sin alterar este flujo.
    void sendReservationReceivedEmail({
      to: r.guestEmail,
      guestName: r.guestName,
      cabinTitle: r.cabin.title,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      total: r.totalPrice,
    }).catch(() => undefined);
    return { ok: true, reservation: { id: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[reservations.service.approve]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/**
 * Confirm explícito (compat con el flujo viejo). En el nuevo modelo, se
 * llega a CONFIRMED vía `payReservation`. Esta función queda para casos
 * en que el admin quiera forzar CONFIRMED sin pago — útil para reservas
 * sembradas. PENDING/APPROVED → CONFIRMED.
 */
export async function confirmReservation(id: string): Promise<TransitionResult> {
  const load = await loadOrFail(id);
  if (!load.ok) return load;
  const r = load.reservation;
  if (r.status !== "PENDING" && r.status !== "APPROVED") {
    return { ok: false, reason: "INVALID_TRANSITION" };
  }
  try {
    const updated = await transitionReservation({
      id,
      status: "CONFIRMED",
      paymentId: r.payment?.id,
      paymentStatus: r.payment ? "SIMULATED_CAPTURED" : undefined,
    });
    void sendReservationConfirmedEmail({
      to: r.guestEmail,
      guestName: r.guestName,
      cabinTitle: r.cabin.title,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      total: r.totalPrice,
    }).catch(() => undefined);
    return { ok: true, reservation: { id: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[reservations.service.confirm]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function rejectReservation(id: string): Promise<TransitionResult> {
  const load = await loadOrFail(id);
  if (!load.ok) return load;
  const r = load.reservation;
  try {
    const updated = await transitionReservation({
      id,
      status: "REJECTED",
      paymentId: r.payment?.id,
      paymentStatus: r.payment ? "SIMULATED_REFUNDED" : undefined,
    });
    void sendReservationRejectedEmail({
      to: r.guestEmail,
      guestName: r.guestName,
      cabinTitle: r.cabin.title,
      total: r.totalPrice,
    }).catch(() => undefined);
    return { ok: true, reservation: { id: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[reservations.service.reject]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function cancelReservation(id: string): Promise<TransitionResult> {
  const load = await loadOrFail(id);
  if (!load.ok) return load;
  const r = load.reservation;
  try {
    // Sólo refunding si había payment y todavía no estaba capturado.
    const shouldRefund =
      r.payment && r.payment.status !== "SIMULATED_CAPTURED";
    const updated = await transitionReservation({
      id,
      status: "CANCELLED",
      paymentId: shouldRefund ? r.payment!.id : undefined,
      paymentStatus: shouldRefund ? "SIMULATED_REFUNDED" : undefined,
    });
    return { ok: true, reservation: { id: updated.id, status: updated.status } };
  } catch (err) {
    console.error("[reservations.service.cancel]", err);
    return { ok: false, reason: "SERVER" };
  }
}
