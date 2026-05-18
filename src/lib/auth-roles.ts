/**
 * Pure role + ownership helpers — safe to import from client components.
 * Anything that touches cookies / DB lives in `src/lib/auth.ts`.
 */

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  emailVerified: Date | null;
};

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

export function isAdmin(user: CurrentUser | null | undefined): boolean {
  return Boolean(user && (ADMIN_ROLES as readonly string[]).includes(user.role));
}

export function isSuperAdmin(user: CurrentUser | null | undefined): boolean {
  return user?.role === "SUPER_ADMIN";
}

/**
 * Authorization helper for any operation on a cabin (read/edit/delete).
 *  - SUPER_ADMIN: anything.
 *  - ADMIN: only cabins they own.
 *  - USER / anonymous: nothing.
 */
export function canManageCabin(
  user: CurrentUser | null | undefined,
  cabin: { ownerId: string }
): boolean {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "ADMIN" && cabin.ownerId === user.id) return true;
  return false;
}
