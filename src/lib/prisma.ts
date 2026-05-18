import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * True when DATABASE_URL is set to a real connection string,
 * not the example placeholder. We use this in API routes that
 * mutate state (login, register, reservations) to short-circuit
 * with a friendly "demo mode" message instead of crashing.
 */
export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.length < 20) return false;
  const placeholders = [
    "USER:PASSWORD@HOST",
    "user:password@host",
    "localhost:5432/none",
  ];
  return !placeholders.some((p) => url.includes(p));
}

export const DEMO_MODE_MESSAGE =
  "Modo demo: conectá una base de datos (Postgres / Supabase / Neon) en DATABASE_URL para usar reservas reales y login.";
