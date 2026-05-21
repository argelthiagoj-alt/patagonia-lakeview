import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Auth repository — sessions, OAuth accounts and verification codes.
 *
 * User-table queries (find by email/id, create, update password, mark
 * verified, OAuth profile patches) live in `@/modules/users/repo`. The
 * auth service composes both modules.
 */

// Re-export the user-table helpers we need so internal auth code reads
// from a single import surface. Routes should still import directly from
// `@/modules/users/repo` when they need a user.
export {
  createUser,
  createUserWithGoogleAccount,
  findUserByEmail,
  findUserById,
  markEmailVerified,
  updateUserPartial,
  updateUserPassword,
} from "@/modules/users/repo";

/* ─────────── Sessions ─────────── */

export function insertSession(args: {
  userId: string;
  token: string;
  expiresAt: Date;
}) {
  return prisma.session.create({ data: args });
}

export function findSessionWithUser(token: string) {
  return prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
}

export function deleteSessionByToken(token: string) {
  return prisma.session.delete({ where: { token } });
}

export function deleteAllSessionsForUser(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}

/* ─────────── Password reset codes ─────────── */

export function invalidatePasswordResetCodesForUser(userId: string) {
  return prisma.passwordResetCode.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export function insertPasswordResetCode(args: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
}) {
  return prisma.passwordResetCode.create({ data: args });
}

export function findLatestValidPasswordResetCode(userId: string) {
  return prisma.passwordResetCode.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function markPasswordResetCodeUsed(id: string) {
  return prisma.passwordResetCode.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

/* ─────────── OAuth accounts ─────────── */

export function findAccountWithUser(args: {
  provider: string;
  providerAccountId: string;
}) {
  return prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: args.provider,
        providerAccountId: args.providerAccountId,
      },
    },
    include: { user: true },
  });
}

export function linkAccount(args: {
  userId: string;
  provider: string;
  providerAccountId: string;
  email: string | null;
}) {
  return prisma.account.create({ data: args });
}

/* `updateUserPartial` and `createUserWithGoogleAccount` live in
   `@/modules/users/repo` and are re-exported from this module's index. */

/* ─────────── Email verification codes ─────────── */

export function invalidateEmailVerificationCodesForUser(userId: string) {
  return prisma.emailVerificationCode.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

export function insertEmailVerificationCode(args: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
}) {
  return prisma.emailVerificationCode.create({ data: args });
}

export function findLatestValidEmailVerificationCode(userId: string) {
  return prisma.emailVerificationCode.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function markEmailVerificationCodeUsed(id: string) {
  return prisma.emailVerificationCode.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
