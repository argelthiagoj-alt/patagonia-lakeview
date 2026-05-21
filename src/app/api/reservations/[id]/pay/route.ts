import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { payReservationSchema } from "@/modules/reservations/schemas";
import { findReservationCore } from "@/modules/reservations/repo";
import { canPayReservation } from "@/modules/reservations/policies";
import { payReservation } from "@/modules/reservations/service";

/**
 * POST /api/reservations/:id/pay — el huésped paga (simuladamente) una
 * reserva en estado APPROVED. Mueve la reserva a CONFIRMED.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (user.isBanned) {
    return NextResponse.json(
      { error: "Cuenta suspendida." },
      { status: 403 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const reservation = await findReservationCore(id);
  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ctx = {
    userId: reservation.userId,
    cabinOwnerId: reservation.cabin.ownerId,
    status: reservation.status,
  };
  if (!canPayReservation(user, ctx)) {
    return NextResponse.json(
      {
        error:
          "Sólo podés pagar tu propia reserva una vez que el anfitrión la haya aprobado.",
      },
      { status: 403 }
    );
  }

  const result = await payReservation({
    reservationId: id,
    guestName: reservation.guestName,
    payment: parsed.data,
  });

  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "NOT_APPROVED":
        return NextResponse.json(
          { error: "La reserva aún no fue aprobada." },
          { status: 409 }
        );
      case "ALREADY_PAID":
        return NextResponse.json(
          { error: "Esta reserva ya tiene un pago registrado." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ reservation: result.reservation });
}
