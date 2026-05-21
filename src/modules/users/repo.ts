import "server-only";

import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Users repository — owns the User table. Auth, reservations, reviews
 * and chat all read users through this module.
 */

/* ─────────── Lookups ─────────── */

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      documentId: true,
      address: true,
      city: true,
      state: true,
      country: true,
      billingName: true,
    },
  });
}

export function listAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      isBanned: true,
      adminPlan: true,
      proUntil: true,
    },
  });
}

export function countSuperAdmins(excludeId?: string) {
  return prisma.user.count({
    where: {
      role: "SUPER_ADMIN",
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

/* ─────────── Auth-adjacent writes ─────────── */

export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return prisma.user.create({ data });
}

export function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export function markEmailVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
}

export function updateUserPartial(
  userId: string,
  data: {
    name?: string | null;
    image?: string | null;
    emailVerified?: Date | null;
  }
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export function createUserWithGoogleAccount(args: {
  email: string;
  name: string | null;
  image: string | null;
  providerAccountId: string;
}) {
  return prisma.user.create({
    data: {
      email: args.email,
      name: args.name,
      image: args.image,
      emailVerified: new Date(),
      accounts: {
        create: {
          provider: "google",
          providerAccountId: args.providerAccountId,
          email: args.email,
        },
      },
    },
  });
}

/* ─────────── Profile / role / ban / plan ─────────── */

export function updateProfileFields(
  userId: string,
  data: {
    name: string;
    phone: string | null;
    documentId: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    billingName: string | null;
  }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      phone: true,
      documentId: true,
      address: true,
      city: true,
      state: true,
      country: true,
      billingName: true,
    },
  });
}

export function updateRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, role: true, email: true, name: true },
  });
}

export function applyBan(args: {
  userId: string;
  bannedById: string;
  reason: string | null;
}) {
  return prisma.user.update({
    where: { id: args.userId },
    data: {
      isBanned: true,
      bannedAt: new Date(),
      banReason: args.reason,
      bannedById: args.bannedById,
    },
    select: { id: true, isBanned: true, banReason: true, bannedAt: true },
  });
}

export function liftBan(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: false,
      bannedAt: null,
      banReason: null,
      bannedById: null,
    },
    select: { id: true, isBanned: true, banReason: true, bannedAt: true },
  });
}

export function deleteAllSessionsForUser(userId: string) {
  return prisma.session.deleteMany({ where: { userId } });
}

export function setAdminPlan(args: {
  userId: string;
  plan: "FREE" | "PRO";
  proUntil: Date | null;
  proSince?: Date | null;
}) {
  return prisma.user.update({
    where: { id: args.userId },
    data: {
      adminPlan: args.plan,
      proUntil: args.proUntil,
      ...(args.proSince !== undefined ? { proSince: args.proSince } : {}),
    },
    select: {
      id: true,
      adminPlan: true,
      proSince: true,
      proUntil: true,
    },
  });
}

/** Lectura del estado Pro de un admin. */
export function getProStatus(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { adminPlan: true, proSince: true, proUntil: true },
  });
}

export function getUserRole(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
}
