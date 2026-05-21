import "server-only";

import type { CurrentUser } from "@/shared/auth-roles";
import { isSuperAdmin } from "@/shared/auth-roles";
import * as repo from "./repo";

/**
 * Chat service. Authorization rule: the guest who owns the reservation, the
 * admin who owns the cabin, or any super-admin can read/write messages.
 */

function isAuthorized(
  reservation: { userId: string | null; cabin: { ownerId: string } },
  user: CurrentUser
): boolean {
  if (isSuperAdmin(user)) return true;
  if (reservation.userId === user.id) return true;
  if (reservation.cabin.ownerId === user.id) return true;
  return false;
}

/* ─────────── listMessages ─────────── */

export type ListMessagesResult =
  | {
      ok: true;
      messages: NonNullable<
        Awaited<ReturnType<typeof repo.findConversationWithMessages>>
      >["messages"];
    }
  | { ok: false; reason: "FORBIDDEN" | "SERVER" };

export async function listMessages(
  user: CurrentUser,
  reservationId: string
): Promise<ListMessagesResult> {
  try {
    const reservation = await repo.findReservationForChat(reservationId);
    if (!reservation || !isAuthorized(reservation, user)) {
      return { ok: false, reason: "FORBIDDEN" };
    }

    const conv = await repo.findConversationWithMessages(reservationId);
    if (conv) {
      await repo.markMessagesRead({
        conversationId: conv.id,
        viewerId: user.id,
      });
    }
    return { ok: true, messages: conv?.messages ?? [] };
  } catch (err) {
    console.error("[chat.listMessages]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── sendMessage ─────────── */

export type SendMessageResult =
  | { ok: true; message: Awaited<ReturnType<typeof repo.insertMessage>> }
  | { ok: false; reason: "FORBIDDEN" | "BANNED" | "SERVER" };

export async function sendMessage(
  user: CurrentUser,
  reservationId: string,
  body: string
): Promise<SendMessageResult> {
  if (user.isBanned) return { ok: false, reason: "BANNED" };

  try {
    const reservation = await repo.findReservationForChat(reservationId);
    if (!reservation || !isAuthorized(reservation, user)) {
      return { ok: false, reason: "FORBIDDEN" };
    }

    const conv = await repo.ensureConversation(reservationId);
    const message = await repo.insertMessage({
      conversationId: conv.id,
      senderId: user.id,
      body,
    });
    return { ok: true, message };
  } catch (err) {
    console.error("[chat.sendMessage]", err);
    return { ok: false, reason: "SERVER" };
  }
}
