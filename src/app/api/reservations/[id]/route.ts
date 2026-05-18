import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin as isAdminUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id } = await params;
  let body: { action?: "cancel" | "confirm" } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = reservation.userId === user.id;
    const isAdmin = isAdminUser(user);

    if (body.action === "cancel") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ reservation: updated });
    }

    if (body.action === "confirm") {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const updated = await prisma.reservation.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });
      return NextResponse.json({ reservation: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/reservations/:id]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
