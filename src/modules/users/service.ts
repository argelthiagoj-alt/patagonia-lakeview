import "server-only";

import type { UserRole } from "@prisma/client";
import {
  applyBan,
  countSuperAdmins,
  deleteAllSessionsForUser,
  getUserRole,
  liftBan,
  setAdminPlan,
  updateProfileFields,
  updateRole as updateRoleRow,
} from "@/modules/users/repo";
import type { ProfileInput } from "@/modules/users/schemas";

/**
 * Users service — profile edits + admin role/ban/plan transitions.
 * Safety rules live here, not in the routes.
 */

/* ─────────── Profile ─────────── */

export type UpdateProfileResult =
  | { ok: true; user: Awaited<ReturnType<typeof updateProfileFields>> }
  | { ok: false; reason: "BANNED" | "SERVER" };

export async function updateProfile(
  userId: string,
  isBanned: boolean,
  data: ProfileInput
): Promise<UpdateProfileResult> {
  if (isBanned) return { ok: false, reason: "BANNED" };
  try {
    const user = await updateProfileFields(userId, {
      name: data.name,
      phone: data.phone || null,
      documentId: data.documentId || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      billingName: data.billingName || null,
    });
    return { ok: true, user };
  } catch (err) {
    console.error("[users.service.updateProfile]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Role ─────────── */

export type UpdateRoleResult =
  | { ok: true; user: Awaited<ReturnType<typeof updateRoleRow>> }
  | {
      ok: false;
      reason: "NOT_FOUND" | "SELF_NOT_ALLOWED" | "LAST_SUPER_ADMIN" | "SERVER";
    };

export async function updateRole(
  actorId: string,
  targetId: string,
  newRole: UserRole
): Promise<UpdateRoleResult> {
  // 1. Lookup the target
  const target = await getUserRole(targetId);
  if (!target) return { ok: false, reason: "NOT_FOUND" };

  // 2. Safety: you cannot change your own role (avoids self-lockout)
  if (target.id === actorId) return { ok: false, reason: "SELF_NOT_ALLOWED" };

  // 3. Safety: never leave the system without a SUPER_ADMIN
  if (target.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
    const remaining = await countSuperAdmins(target.id);
    if (remaining === 0) return { ok: false, reason: "LAST_SUPER_ADMIN" };
  }

  try {
    const user = await updateRoleRow(targetId, newRole);
    return { ok: true, user };
  } catch (err) {
    console.error("[users.service.updateRole]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Ban / unban ─────────── */

export type BanResult =
  | { ok: true; user: Awaited<ReturnType<typeof applyBan>> }
  | { ok: false; reason: "SELF_NOT_ALLOWED" | "SERVER" };

export async function banUser(
  actorId: string,
  targetId: string,
  reason: string | null
): Promise<BanResult> {
  if (actorId === targetId) {
    return { ok: false, reason: "SELF_NOT_ALLOWED" };
  }
  try {
    const user = await applyBan({ userId: targetId, bannedById: actorId, reason });
    // Revoke active sessions so the user is logged out immediately
    await deleteAllSessionsForUser(targetId).catch(() => undefined);
    return { ok: true, user };
  } catch (err) {
    console.error("[users.service.banUser]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export async function unbanUser(
  actorId: string,
  targetId: string
): Promise<BanResult> {
  if (actorId === targetId) {
    return { ok: false, reason: "SELF_NOT_ALLOWED" };
  }
  try {
    const user = await liftBan(targetId);
    return { ok: true, user };
  } catch (err) {
    console.error("[users.service.unbanUser]", err);
    return { ok: false, reason: "SERVER" };
  }
}

/* ─────────── Admin plan ─────────── */

export type SetPlanResult =
  | { ok: true; user: Awaited<ReturnType<typeof setAdminPlan>> }
  | { ok: false; reason: "NOT_FOUND" | "ONLY_ADMINS" | "SERVER" };

export async function setPlan(
  targetId: string,
  plan: "FREE" | "PRO",
  durationDays?: number
): Promise<SetPlanResult> {
  const target = await getUserRole(targetId);
  if (!target) return { ok: false, reason: "NOT_FOUND" };

  // Only ADMIN users can hold a PRO plan
  if (target.role !== "ADMIN" && plan === "PRO") {
    return { ok: false, reason: "ONLY_ADMINS" };
  }

  const proUntil =
    plan === "PRO"
      ? new Date(Date.now() + (durationDays ?? 365) * 24 * 60 * 60 * 1000)
      : null;

  try {
    const user = await setAdminPlan({ userId: targetId, plan, proUntil });
    return { ok: true, user };
  } catch (err) {
    console.error("[users.service.setPlan]", err);
    return { ok: false, reason: "SERVER" };
  }
}
