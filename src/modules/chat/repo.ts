import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Chat repository. Encapsulates Conversation + Message table access for the
 * per-reservation chat between guest and host.
 */

export function findReservationForChat(reservationId: string) {
  return prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      id: true,
      userId: true,
      cabin: { select: { ownerId: true, title: true } },
    },
  });
}

export function findConversationByReservation(reservationId: string) {
  return prisma.conversation.findUnique({
    where: { reservationId },
  });
}

export async function ensureConversation(reservationId: string) {
  const existing = await prisma.conversation.findUnique({
    where: { reservationId },
  });
  if (existing) return existing;
  return prisma.conversation.create({ data: { reservationId } });
}

export function findConversationWithMessages(reservationId: string) {
  return prisma.conversation.findUnique({
    where: { reservationId },
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
}

export function markMessagesRead(args: {
  conversationId: string;
  viewerId: string;
}) {
  return prisma.message.updateMany({
    where: {
      conversationId: args.conversationId,
      senderId: { not: args.viewerId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export function insertMessage(args: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  return prisma.message.create({
    data: args,
    select: {
      id: true,
      body: true,
      createdAt: true,
      readAt: true,
      senderId: true,
      sender: { select: { name: true, email: true, role: true } },
    },
  });
}
