import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import { computeBookingPrice, hasOverlap } from "@/lib/booking";
import { getCurrentUser } from "@/lib/auth";
import { detectCardBrand, lastFour } from "@/lib/payments";
import { sendReservationReceivedEmail } from "@/lib/email";

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

  const {
    cabinSlug,
    checkIn,
    checkOut,
    guests,
    guestName,
    guestEmail,
    notes,
    payment,
  } = parsed.data;

  try {
    const cabin = await prisma.cabin.findUnique({
      where: { slug: cabinSlug },
      include: {
        reservations: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            checkOut: { gt: checkIn },
            checkIn: { lt: checkOut },
          },
          select: { checkIn: true, checkOut: true, status: true },
        },
      },
    });

    if (!cabin || !cabin.isActive) {
      return NextResponse.json(
        { error: "Cabaña no disponible" },
        { status: 404 }
      );
    }

    if (guests > cabin.maxGuests) {
      return NextResponse.json(
        { error: `Esta cabaña admite hasta ${cabin.maxGuests} huéspedes.` },
        { status: 400 }
      );
    }

    // Unit-aware availability: count overlapping non-cancelled reservations
    const overlapCount = cabin.reservations.filter(
      (r) => r.status !== "CANCELLED" && r.status !== "REJECTED"
    ).length;
    if (overlapCount >= cabin.totalUnits) {
      return NextResponse.json(
        { error: "Esas fechas ya no están disponibles." },
        { status: 409 }
      );
    }
    // Keep the original overlap check as a belt-and-suspenders guard for
    // cabins with totalUnits=1 (the legacy behaviour).
    if (cabin.totalUnits === 1 && hasOverlap(cabin.reservations, checkIn, checkOut)) {
      return NextResponse.json(
        { error: "Esas fechas ya no están disponibles." },
        { status: 409 }
      );
    }

    const price = computeBookingPrice({
      pricePerNight: cabin.pricePerNight,
      cleaningFee: cabin.cleaningFee,
      checkIn,
      checkOut,
    });

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

    // Shared billing snapshot (lives on Payment, not on Reservation)
    const billing = {
      documentId: payment.documentId,
      phone: payment.phone,
      billingAddress: payment.billingAddress,
      city: payment.city,
      state: payment.state,
      country: payment.country,
    };

    // Simulated payment: we NEVER persist the full card number. Only last4 + brand.
    const paymentData =
      payment.provider === "CARD"
        ? {
            provider: "CARD" as const,
            status: "SIMULATED_APPROVED" as const,
            amount: price.total,
            cardBrand: detectCardBrand(payment.number),
            last4: lastFour(payment.number),
            payerEmail: payment.email,
            billingName: payment.cardholder,
            ...billing,
            simulated: true,
          }
        : {
            provider: "MERCADO_PAGO" as const,
            status: "SIMULATED_APPROVED" as const,
            amount: price.total,
            payerEmail: payment.email,
            billingName: guestName,
            ...billing,
            simulated: true,
          };

    const reservation = await prisma.reservation.create({
      data: {
        cabinId: cabin.id,
        userId: currentUser?.id,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        notes,
        totalPrice: price.total,
        status: "PENDING",
        payment: { create: paymentData },
      },
      include: { payment: true, cabin: { select: { title: true } } },
    });

    // Optional notification — don't block on it
    void sendReservationReceivedEmail({
      to: guestEmail,
      guestName,
      cabinTitle: reservation.cabin.title,
      checkIn,
      checkOut,
      total: price.total,
    }).catch(() => undefined);

    return NextResponse.json({ reservation, price }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reservations]", err);
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }
}
