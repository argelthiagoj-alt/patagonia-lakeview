import "server-only";

import { cookies } from "next/headers";
import {
  isAdmin,
  isSuperAdmin,
  type CurrentUser,
} from "@/shared/auth-roles";
import {
  deleteSessionByToken,
  findSessionWithUser,
  insertSession,
} from "@/modules/auth/repo";

/**
 * Session cookie + current-user resolver. Server-only.
 *
 * The cookie value is a 64-char hex token stored in the `Session` table.
 * Lookups join the `User` row, normalised to the `CurrentUser` shape.
 */

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "pl_session";
const SESSION_DURATION_DAYS = 30;

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );
  await insertSession({ userId, token, expiresAt });

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) {
    await deleteSessionByToken(token).catch(() => undefined);
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await findSessionWithUser(token);
    if (!session || session.expiresAt < new Date()) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      emailVerified: session.user.emailVerified,
      isBanned: session.user.isBanned,
      adminPlan: session.user.adminPlan,
      proUntil: session.user.proUntil,
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) throw new Error("FORBIDDEN");
  return user;
}

export async function requireSuperAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!isSuperAdmin(user)) throw new Error("FORBIDDEN");
  return user!;
}
