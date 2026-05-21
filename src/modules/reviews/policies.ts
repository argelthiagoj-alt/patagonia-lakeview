import "server-only";

import { isAdmin, isSuperAdmin, type CurrentUser } from "@/shared/auth-roles";

/**
 * Pure auth predicates for reviews + appeals. No I/O — the service fetches
 * the rows and passes them in.
 */

type ReservationLike = {
  userId: string | null;
  status: string;
  checkOut: Date;
};

/**
 * A guest can submit a review for their own reservation, when the stay is
 * over (status COMPLETED, or CONFIRMED with checkOut in the past).
 */
export function canSubmitReview(
  user: CurrentUser,
  reservation: ReservationLike
): boolean {
  if (user.isBanned) return false;
  if (reservation.userId !== user.id) return false;
  if (reservation.status === "COMPLETED") return true;
  if (reservation.status === "CONFIRMED" && reservation.checkOut < new Date()) {
    return true;
  }
  return false;
}

/**
 * Owner of the cabin (admin) or any super-admin can file an appeal.
 */
export function canFileAppeal(
  user: CurrentUser,
  cabin: { ownerId: string }
): boolean {
  if (!isAdmin(user)) return false;
  if (isSuperAdmin(user)) return true;
  return cabin.ownerId === user.id;
}

/**
 * Only super-admins resolve appeals.
 */
export function canResolveAppeal(user: CurrentUser): boolean {
  return isSuperAdmin(user);
}
