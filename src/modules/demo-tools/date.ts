/**
 * Demo date — fecha interna que la app puede usar en lugar de `new Date()`.
 *
 * Reglas:
 *   - Sólo se activa si `demoEnabled()` (NODE_ENV !== production o
 *     NEXT_PUBLIC_DEMO_MODE === "true").
 *   - Se guarda en una cookie `demo-date` (ISO `YYYY-MM-DD`). Si no hay
 *     cookie o el valor no parsea, devolvemos `new Date()` real.
 *   - Es client-safe. La función server-side lee de `next/headers`; la
 *     client-side lee de `document.cookie`.
 *   - Nunca tira excepciones — siempre devuelve un Date válido.
 */

import { demoEnabled } from "./config";

export const DEMO_DATE_COOKIE = "demo-date";

function parseIso(value: string | undefined): Date | null {
  if (!value) return null;
  // Acepta "YYYY-MM-DD" o ISO completo. Tira null si no es válido.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Versión server-side (server components, route handlers, middleware).
 * Usa una import dinámica para que el archivo siga siendo client-safe
 * cuando se importa desde un component cliente que no llame a esta
 * función.
 */
export async function getAppDateServer(): Promise<Date> {
  if (!demoEnabled()) return new Date();
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    const raw = jar.get(DEMO_DATE_COOKIE)?.value;
    return parseIso(raw) ?? new Date();
  } catch {
    return new Date();
  }
}

/**
 * Versión client-side. Lee `document.cookie` directo. Si no hay window
 * (SSR), devuelve `new Date()` real.
 */
export function getAppDateClient(): Date {
  if (typeof document === "undefined") return new Date();
  if (!demoEnabled()) return new Date();
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${DEMO_DATE_COOKIE}=([^;]+)`)
  );
  const raw = match ? decodeURIComponent(match[1]) : undefined;
  return parseIso(raw) ?? new Date();
}

/**
 * Helper para el panel demo: setea la cookie de fecha y recarga.
 * No-op si demo no está habilitado.
 */
export function setAppDateClient(date: Date | null): void {
  if (typeof document === "undefined" || !demoEnabled()) return;
  if (!date) {
    document.cookie = `${DEMO_DATE_COOKIE}=; path=/; max-age=0`;
    return;
  }
  const iso = date.toISOString();
  // Cookie no-httpOnly a propósito: la lee tanto client como server.
  document.cookie = `${DEMO_DATE_COOKIE}=${encodeURIComponent(
    iso
  )}; path=/; max-age=${60 * 60 * 24 * 90}`;
}
