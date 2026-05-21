/**
 * Display labels + Badge tones for payment provider / status.
 * Client-safe (no Prisma, no Node-only APIs) — used by ReservationCard,
 * AdminReservationRow, admin reservation detail.
 */

export type PaymentStatus =
  | "SIMULATED_PENDING"
  | "SIMULATED_APPROVED"
  | "SIMULATED_CAPTURED"
  | "SIMULATED_REFUNDED"
  | "SIMULATED_FAILED";

export type PaymentProvider = "CARD" | "MERCADO_PAGO";

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  SIMULATED_PENDING: "Pendiente",
  SIMULATED_APPROVED: "Autorizado",
  SIMULATED_CAPTURED: "Cobrado",
  SIMULATED_REFUNDED: "Devuelto",
  SIMULATED_FAILED: "Fallido",
};

export const paymentProviderLabel: Record<PaymentProvider, string> = {
  CARD: "Tarjeta",
  MERCADO_PAGO: "Mercado Pago",
};

export const paymentStatusTone: Record<
  PaymentStatus,
  "warning" | "moss" | "success" | "stone" | "error"
> = {
  SIMULATED_PENDING: "warning",
  SIMULATED_APPROVED: "moss",
  SIMULATED_CAPTURED: "success",
  SIMULATED_REFUNDED: "stone",
  SIMULATED_FAILED: "error",
};
