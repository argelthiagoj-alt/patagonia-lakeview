import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { reservationSchema } from "@/lib/validations";
import { computeBookingPrice, hasOverlap } from "@/lib/booking";
import { getCurrentUser } from "@/lib/auth";

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

  const { cabinSlug, checkIn, checkOut, guests, guestName, guestEmail, notes } =
    parsed.data;

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

    if (hasOverlap(cabin.reservations, checkIn, checkOut)) {
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
      },
    });

    return NextResponse.json({ reservation, price }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reservations]", err);
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }
}
