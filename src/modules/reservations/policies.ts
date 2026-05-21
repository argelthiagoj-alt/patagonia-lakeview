import {
  isAdmin,
  isSuperAdmin,
  type CurrentUser,
} from "@/shared/auth-roles";

/**
 * Authorization predicates for reservation operations. Pure functions —
 * no side effects, no DB. Used by routes and pages alike.
 */

export type ReservationContext = {
  userId: string | null;
  cabinOwnerId: string;
};

/** Can read the reservation detail / chat. */
export function canViewReservation(
  user: CurrentUser | null | undefined,
  ctx: ReservationContext
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (ctx.userId === user.id) return true;
  if (isAdmin(user) && ctx.cabinOwnerId === user.id) return true;
  return false;
}

/** Can act on the chat conversation (send/read messages). */
export function canChatOnReservation(
  user: CurrentUser | null | undefined,
  ctx: ReservationContext
): boolean {
  return canViewReservation(user, ctx);
}

/** Only the cabin owner (or super-admin) can confirm/reject. */
export function canDecideReservation(
  user: CurrentUser | null | undefined,
  ctx: ReservationContext
): boolean {
  if (!user || !isAdmin(user)) return false;
  return isSuperAdmin(user) || ctx.cabinOwnerId === user.id;
}

/** The guest who owns the reservation OR the cabin owner/super-admin can cancel. */
export function canCancelReservation(
  user: CurrentUser | null | undefined,
  ctx: ReservationContext
): boolean {
  if (!user) return false;
  if (ctx.userId === user.id) return true;
  return canDecideReservation(user, ctx);
}

/**
 * Sólo el huésped dueño puede pagar su propia reserva, y sólo si está en
 * estado APPROVED (es decir: el anfitrión ya aprobó la solicitud).
 */
export function canPayReservation(
  user: CurrentUser | null | undefined,
  ctx: ReservationContext & { status: string }
): boolean {
  if (!user) return false;
  if (user.isBanned) return false;
  if (ctx.userId !== user.id) return false;
  return ctx.status === "APPROVED";
}
