import "server-only";

import bcrypt from "bcryptjs";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import {
  EMAIL_VERIFICATION_TTL_MS,
  PASSWORD_RESET_TTL_MS,
  generateNumericCode,
  hashCode,
  verifyCode,
} from "@/lib/codes";
import {
  sendEmailVerificationCode,
  sendPasswordResetCode,
} from "@/modules/email/senders";
import {
  createUser,
  createUserWithGoogleAccount,
  deleteAllSessionsForUser,
  findAccountWithUser,
  findLatestValidEmailVerificationCode,
  findLatestValidPasswordResetCode,
  findUserByEmail,
  findUserById,
  insertEmailVerificationCode,
  insertPasswordResetCode,
  invalidateEmailVerificationCodesForUser,
  invalidatePasswordResetCodesForUser,
  linkAccount,
  markEmailVerificationCodeUsed,
  markEmailVerified,
  markPasswordResetCodeUsed,
  updateUserPartial,
  updateUserPassword,
} from "@/modules/auth/repo";

/**
 * Auth service — domain logic on top of repo + cookies-less crypto.
 *
 * The shape of every public function is a **tagged result** so the route
 * handlers can map outcomes to HTTP status codes without try/catch.
 */

/* ─────────── Password hashing ─────────── */

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ─────────── Common types ─────────── */

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  emailVerified: Date | null;
  isBanned: boolean;
};

function pick(user: NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    isBanned: user.isBanned,
  };
}

/* ─────────── Authenticate (login) ─────────── */

export type AuthenticateResult =
  | { ok: true; user: AuthenticatedUser }
  | {
      ok: false;
      reason: "INVALID_CREDENTIALS" | "LOCKED_OUT";
      retryAfterSeconds?: number;
    };

const LOGIN_LOCKOUT_MAX = 5;
const LOGIN_LOCKOUT_WINDOW_MS = 10 * 60_000;

/**
 * Validates an email/password pair. Tracks per-(ip, email) failed attempts
 * and locks out after 5 fails in 10 min. Does **not** touch cookies — the
 * route layer is in charge of creating the session.
 */
export async function authenticate(
  email: string,
  password: string,
  ip: string
): Promise<AuthenticateResult> {
  const failKey = `login-fail:${ip}:${email.toLowerCase()}`;
  const rl = checkRateLimit({
    key: failKey,
    max: LOGIN_LOCKOUT_MAX,
    windowMs: LOGIN_LOCKOUT_WINDOW_MS,
  });
  if (!rl.allowed) {
    return {
      ok: false,
      reason: "LOCKED_OUT",
      retryAfterSeconds: rl.retryAfterSeconds,
    };
  }

  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return { ok: false, reason: "INVALID_CREDENTIALS" };
  }

  // Reset the failure counter on success
  resetRateLimit(failKey);

  return { ok: true, user: pick(user) };
}

/* ─────────── Register ─────────── */

export type RegisterResult =
  | { ok: true; user: AuthenticatedUser; verificationSent: boolean }
  | { ok: false; reason: "EMAIL_TAKEN" };

export async function register(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  const existing = await findUserByEmail(email);
  if (existing) return { ok: false, reason: "EMAIL_TAKEN" };

  const user = await createUser({
    name,
    email,
    passwordHash: await hashPassword(password),
  });

  // Fire-and-forget verification email. We don't fail registration if it bounces.
  let verificationSent = false;
  try {
    const code = generateNumericCode(6);
    const codeHash = await hashCode(code);
    await insertEmailVerificationCode({
      userId: user.id,
      codeHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });
    void sendEmailVerificationCode(user.email, code);
    verificationSent = true;
  } catch (err) {
    console.warn("[auth.service] verification email skipped:", err);
  }

  return { ok: true, user: pick(user), verificationSent };
}

/* ─────────── Password reset request ─────────── */

/**
 * Generates and emails a fresh code if the email exists. Always returns
 * `ok: true` — never reveals whether the address is registered.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const user = await findUserByEmail(email);
  // Only act when the user exists *and* has a password-based account.
  if (user && user.passwordHash) {
    try {
      const code = generateNumericCode(6);
      const codeHash = await hashCode(code);
      await invalidatePasswordResetCodesForUser(user.id);
      await insertPasswordResetCode({
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      });
      void sendPasswordResetCode(user.email, code);
    } catch (err) {
      console.warn("[auth.service] reset email failed:", err);
    }
  }
  return { ok: true };
}

/* ─────────── Password reset apply ─────────── */

export type ApplyPasswordResetResult =
  | { ok: true }
  | { ok: false; reason: "INVALID_OR_EXPIRED" };

export async function applyPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<ApplyPasswordResetResult> {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, reason: "INVALID_OR_EXPIRED" };

  const candidate = await findLatestValidPasswordResetCode(user.id);
  if (!candidate) return { ok: false, reason: "INVALID_OR_EXPIRED" };

  const matches = await verifyCode(code, candidate.codeHash);
  if (!matches) return { ok: false, reason: "INVALID_OR_EXPIRED" };

  await updateUserPassword(user.id, await hashPassword(newPassword));
  await markPasswordResetCodeUsed(candidate.id);
  await deleteAllSessionsForUser(user.id);

  return { ok: true };
}

/* ─────────── Email verification ─────────── */

export type IssueVerificationCodeResult =
  | { ok: true; alreadyVerified?: boolean }
  | { ok: false; reason: "NOT_FOUND" };

export async function issueEmailVerificationCode(
  userId: string
): Promise<IssueVerificationCodeResult> {
  const user = await findUserById(userId);
  if (!user) return { ok: false, reason: "NOT_FOUND" };
  if (user.emailVerified) return { ok: true, alreadyVerified: true };

  const code = generateNumericCode(6);
  const codeHash = await hashCode(code);
  await invalidateEmailVerificationCodesForUser(user.id);
  await insertEmailVerificationCode({
    userId: user.id,
    codeHash,
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  });
  await sendEmailVerificationCode(user.email, code);
  return { ok: true };
}

export type ConfirmEmailResult =
  | { ok: true; alreadyVerified?: boolean }
  | { ok: false; reason: "INVALID_OR_EXPIRED" };

export async function confirmEmail(
  email: string,
  code: string
): Promise<ConfirmEmailResult> {
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, reason: "INVALID_OR_EXPIRED" };
  if (user.emailVerified) return { ok: true, alreadyVerified: true };

  const candidate = await findLatestValidEmailVerificationCode(user.id);
  if (!candidate) return { ok: false, reason: "INVALID_OR_EXPIRED" };

  const matches = await verifyCode(code, candidate.codeHash);
  if (!matches) return { ok: false, reason: "INVALID_OR_EXPIRED" };

  await markEmailVerified(user.id);
  await markEmailVerificationCodeUsed(candidate.id);

  return { ok: true };
}

/* ─────────── OAuth (Google) ─────────── */

export type GoogleProfileInput = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

/**
 * Idempotent upsert for Google OAuth.
 *
 * Resolution order:
 *   1. Existing Account → return that user (backfill name/image if missing).
 *   2. Existing User by email → link a new Account, mark email verified.
 *   3. Neither → create a fresh User + Account in one statement.
 */
export async function linkOrCreateGoogleAccount(
  profile: GoogleProfileInput
): Promise<{ user: AuthenticatedUser }> {
  const email = profile.email.toLowerCase();

  // 1. Repeat login
  const existingAccount = await findAccountWithUser({
    provider: "google",
    providerAccountId: profile.sub,
  });
  if (existingAccount) {
    if (!existingAccount.user.name && profile.name) {
      await updateUserPartial(existingAccount.userId, {
        name: profile.name,
        image: profile.picture ?? null,
      });
    }
    return { user: pick(existingAccount.user) };
  }

  // 2. Local account exists with the same email — link Google to it
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    await linkAccount({
      userId: existingUser.id,
      provider: "google",
      providerAccountId: profile.sub,
      email,
    });
    if (!existingUser.emailVerified) {
      await updateUserPartial(existingUser.id, {
        emailVerified: new Date(),
        image: existingUser.image ?? profile.picture ?? null,
        name: existingUser.name ?? profile.name ?? null,
      });
    }
    return { user: pick(existingUser) };
  }

  // 3. Brand new
  const created = await createUserWithGoogleAccount({
    email,
    name: profile.name ?? null,
    image: profile.picture ?? null,
    providerAccountId: profile.sub,
  });
  return { user: pick(created) };
}
