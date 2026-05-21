import "server-only";

import { setAdminPlan, getProStatus } from "@/modules/users/repo";

/**
 * Pro membership simulada. NO se procesan pagos reales — sólo cambia
 * el campo `adminPlan` del usuario con su `proSince` y `proUntil`.
 *
 * Precio nominal (sólo para mostrarlo en UI):
 */
export const PRO_PRICE_USD = 39;
/** Duración por suscripción simulada. */
export const PRO_PERIOD_DAYS = 30;

export type ProSubscribeResult =
  | {
      ok: true;
      plan: { adminPlan: "PRO"; proSince: Date; proUntil: Date };
    }
  | { ok: false; reason: "ALREADY_ACTIVE" | "SERVER" };

export async function subscribeAdminToPro(
  userId: string
): Promise<ProSubscribeResult> {
  try {
    const current = await getProStatus(userId);
    if (
      current?.adminPlan === "PRO" &&
      current.proUntil &&
      current.proUntil > new Date()
    ) {
      return { ok: false, reason: "ALREADY_ACTIVE" };
    }

    const now = new Date();
    const until = new Date(now);
    until.setDate(until.getDate() + PRO_PERIOD_DAYS);
    const updated = await setAdminPlan({
      userId,
      plan: "PRO",
      // Si nunca fue Pro, esta es su fecha de inicio. Si renueva luego de
      // expirar, también reseteamos proSince para que el "miembro desde"
      // refleje el ciclo activo.
      proSince: current?.proSince ?? now,
      proUntil: until,
    });

    return {
      ok: true,
      plan: {
        adminPlan: "PRO",
        proSince: updated.proSince ?? now,
        proUntil: updated.proUntil!,
      },
    };
  } catch (err) {
    console.error("[admin.pro.subscribe]", err);
    return { ok: false, reason: "SERVER" };
  }
}

export type ProCancelResult =
  | { ok: true }
  | { ok: false; reason: "NOT_ACTIVE" | "SERVER" };

export async function cancelAdminPro(userId: string): Promise<ProCancelResult> {
  try {
    const current = await getProStatus(userId);
    if (current?.adminPlan !== "PRO") {
      return { ok: false, reason: "NOT_ACTIVE" };
    }
    await setAdminPlan({
      userId,
      plan: "FREE",
      proSince: null,
      proUntil: null,
    });
    return { ok: true };
  } catch (err) {
    console.error("[admin.pro.cancel]", err);
    return { ok: false, reason: "SERVER" };
  }
}
