import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  isAdmin as isAdminUser,
  isSuperAdmin,
} from "@/lib/auth";
import { reservationActionSchema } from "@/lib/validations";
import {
  sendReservationConfirmedEmail,
  sendReservationRejectedEmail,
} from "@/lib/email";

type Action = "confirm" | "reject" | "cancel";

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
    return NextResponse.json(
      { error: "Acción inválida" },
      { status: 400 }
    );
  }
  const action = parsed.data.action as Action;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        payment: true,
        cabin: { select: { ownerId: true, title: true } },
      },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = reservation.userId === user.id;
    const isAdmin = isAdminUser(user);
    const ownsCabin =
      isSuperAdmin(user) || reservation.cabin.ownerId === user.id;

    // Authorization per action
    if (action === "cancel") {
      // Owner of the reservation OR an admin who owns the cabin
      if (!isOwner && !(isAdmin && ownsCabin)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // confirm / reject are admin-only AND require ownership of the cabin
      if (!isAdmin || !ownsCabin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Don't act on already-final reservations
    const finalStates = ["CANCELLED", "REJECTED", "COMPLETED"];
    if (finalStates.includes(reservation.status)) {
      return NextResponse.json(
        { error: "La reserva ya está en un estado final." },
        { status: 409 }
      );
    }

    if (action === "confirm") {
      const updated = await prisma.$transaction(async (tx) => {
        const r = await tx.reservation.update({
          where: { id },
          data: { status: "CONFIRMED" },
        });
        if (reservation.payment) {
          await tx.payment.update({
            where: { id: reservation.payment.id },
            data: { status: "SIMULATED_CAPTURED" },
          });
        }
        return r;
      });

      void sendReservationConfirmedEmail({
        to: reservation.guestEmail,
        guestName: reservation.guestName,
        cabinTitle: reservation.cabin.title,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        total: reservation.totalPrice,
      }).catch(() => undefined);

      return NextResponse.json({ reservation: updated });
    }

    if (action === "reject") {
      const updated = await prisma.$transaction(async (tx) => {
        const r = await tx.reservation.update({
          where: { id },
          data: { status: "REJECTED" },
        });
        if (reservation.payment) {
          await tx.payment.update({
            where: { id: reservation.payment.id },
            data: { status: "SIMULATED_REFUNDED" },
          });
        }
        return r;
      });

      void sendReservationRejectedEmail({
        to: reservation.guestEmail,
        guestName: reservation.guestName,
        cabinTitle: reservation.cabin.title,
        total: reservation.totalPrice,
      }).catch(() => undefined);

      return NextResponse.json({ reservation: updated });
    }

    // action === "cancel"
    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      if (reservation.payment && reservation.payment.status !== "SIMULATED_CAPTURED") {
        await tx.payment.update({
          where: { id: reservation.payment.id },
          data: { status: "SIMULATED_REFUNDED" },
        });
      }
      return r;
    });
    return NextResponse.json({ reservation: updated });
  } catch (err) {
    console.error("[PATCH /api/reservations/:id]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
