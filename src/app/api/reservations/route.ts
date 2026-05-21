import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/session";
import { reservationSchema } from "@/modules/reservations/schemas";
import { createReservation } from "@/modules/reservations/service";

/**
 * POST /api/reservations — create a reservation with a simulated payment.
 *
 * Thin route: parse + auth gate (banned check) + delegate to service +
 * serialize. All domain logic (overlap, units, payment record) lives in
 * `@/modules/reservations/service`.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  const currentUser = await getCurrentUser();
  if (currentUser?.isBanned) {
    return NextResponse.json(
      {
        error:
          "Tu cuenta está suspendida. No podés reservar mientras esté en este estado.",
      },
      { status: 403 }
    );
  }

  const result = await createReservation({
    ...parsed.data,
    userId: currentUser?.id,
  });

  if (!result.ok) {
    switch (result.reason) {
      case "CABIN_NOT_FOUND":
        return NextResponse.json(
          { error: "Cabaña no disponible" },
          { status: 404 }
        );
      case "OVER_CAPACITY":
        return NextResponse.json(
          { error: `Esta cabaña admite hasta ${result.capacity} huéspedes.` },
          { status: 400 }
        );
      case "UNAVAILABLE":
        return NextResponse.json(
          { error: "Esas fechas ya no están disponibles." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json(
          { error: DEMO_MODE_MESSAGE, demoMode: true },
          { status: 503 }
        );
    }
  }

  return NextResponse.json(
    { reservation: result.reservation, price: result.price },
    { status: 201 }
  );
}
