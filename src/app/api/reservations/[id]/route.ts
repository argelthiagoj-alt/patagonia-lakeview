import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { reservationActionSchema } from "@/modules/reservations/schemas";
import { findReservationCore } from "@/modules/reservations/repo";
import {
  approveReservation,
  cancelReservation,
  confirmReservation,
  rejectReservation,
} from "@/modules/reservations/service";
import {
  canCancelReservation,
  canDecideReservation,
} from "@/modules/reservations/policies";

/**
 * PATCH /api/reservations/:id — drive a state transition.
 *
 * Authorization is delegated to `@/modules/reservations/policies`.
 * Side-effects (Payment status, emails) live in the service.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reservationActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }
  const action = parsed.data.action;

  // Load just enough context to authorize
  const reservation = await findReservationCore(id);
  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ctx = {
    userId: reservation.userId,
    cabinOwnerId: reservation.cabin.ownerId,
  };

  if (action === "cancel") {
    if (!canCancelReservation(user, ctx)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!canDecideReservation(user, ctx)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result =
    action === "approve"
      ? await approveReservation(id)
      : action === "confirm"
      ? await confirmReservation(id)
      : action === "reject"
      ? await rejectReservation(id)
      : await cancelReservation(id);

  if (!result.ok) {
    if (result.reason === "ALREADY_FINAL") {
      return NextResponse.json(
        { error: "La reserva ya está en un estado final." },
        { status: 409 }
      );
    }
    if (result.reason === "INVALID_TRANSITION") {
      return NextResponse.json(
        { error: "Transición no permitida desde el estado actual." },
        { status: 409 }
      );
    }
    if (result.reason === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ reservation: result.reservation });
}
