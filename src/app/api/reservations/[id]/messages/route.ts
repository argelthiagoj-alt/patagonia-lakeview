import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

/**
 * Authorization: the guest who owns the reservation, the admin who owns the
 * cabin, or a super-admin can read/write messages for that reservation.
 */
async function loadAuthorized(reservationId: string, userId: string, isSuper: boolean) {
  const r = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      cabin: { select: { ownerId: true, title: true } },
    },
  });
  if (!r) return null;
  if (!isSuper && r.userId !== userId && r.cabin.ownerId !== userId) return null;
  return r;
}

async function ensureConversation(reservationId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { reservationId },
  });
  if (existing) return existing;
  return prisma.conversation.create({ data: { reservationId } });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { id } = await params;

  try {
    const r = await loadAuthorized(id, me.id, isSuperAdmin(me));
    if (!r) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const conv = await prisma.conversation.findUnique({
      where: { reservationId: id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            body: true,
            createdAt: true,
            readAt: true,
            senderId: true,
            sender: { select: { name: true, email: true, role: true } },
          },
        },
      },
    });

    // Mark unread inbound messages as read for the current viewer
    if (conv) {
      await prisma.message.updateMany({
        where: {
          conversationId: conv.id,
          senderId: { not: me.id },
          readAt: null,
        },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json({
      messages: conv?.messages ?? [],
      currentUserId: me.id,
    });
  } catch (err) {
    console.error("[GET messages]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const sendSchema = z.object({
  body: z.string().min(1, "Escribí algo").max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (me.isBanned) {
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

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Mensaje inválido" },
      { status: 400 }
    );
  }

  try {
    const r = await loadAuthorized(id, me.id, isSuperAdmin(me));
    if (!r) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const conv = await ensureConversation(id);

    const msg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId: me.id,
        body: parsed.data.body,
      },
      select: {
        id: true,
        body: true,
        createdAt: true,
        readAt: true,
        senderId: true,
        sender: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error("[POST messages]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
