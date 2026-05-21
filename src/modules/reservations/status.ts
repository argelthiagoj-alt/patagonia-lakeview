/**
 * Helpers de estado *visible* de una reserva.
 *
 * Decisión de diseño: los enum de Prisma (`ReservationStatus`) reflejan
 * lo que la DB sabe del row (PENDING/APPROVED/CONFIRMED/REJECTED/
 * CANCELLED/COMPLETED). Pero la UI necesita además distinguir reservas
 * "finalizadas por tiempo" (la fecha ya pasó) de las que siguen activas,
 * y eso depende de la **fecha actual de la app** — que en demo mode
 * puede ser diferente al reloj del sistema.
 *
 * Estos helpers viven en un archivo client-safe (sin server-only) porque
 * los usan tanto server components como client components.
 */

export type DbReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type DisplayStatus =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"      // confirmada, todavía no empezó
  | "ONGOING"        // check-in ya pasó, check-out todavía no
  | "FINISHED"       // estadía ya terminó (vino de CONFIRMED + checkOut < now)
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Reservationish = {
  status: DbReservationStatus;
  checkIn: Date | string;
  checkOut: Date | string;
};

function toDate(d: Date | string): Date {
  return typeof d === "string" ? new Date(d) : d;
}

/**
 * Devuelve el estado "visible" considerando la fecha de app.
 *
 * - Un CONFIRMED cuyo checkOut ya pasó → FINISHED (es decir, "estadía
 *   terminada"). La DB sigue diciendo CONFIRMED hasta que algún proceso
 *   lo marque COMPLETED, pero la UI no debe ofrecer cancelar.
 * - REJECTED/CANCELLED/COMPLETED son siempre finales — la fecha no
 *   cambia el display.
 */
export function getReservationDisplayStatus(
  reservation: Reservationish,
  appDate: Date
): DisplayStatus {
  const status = reservation.status;
  if (
    status === "REJECTED" ||
    status === "CANCELLED" ||
    status === "COMPLETED"
  ) {
    return status;
  }
  const ci = toDate(reservation.checkIn);
  const co = toDate(reservation.checkOut);

  if (status === "CONFIRMED") {
    if (co < appDate) return "FINISHED";
    if (ci <= appDate && appDate <= co) return "ONGOING";
    return "CONFIRMED";
  }

  // PENDING / APPROVED: si la fecha ya pasó, también se trata como finalizada
  // (el guest perdió la ventana sin pagar/aprobar). La DB conservará el
  // estado original; sólo cambia el display.
  if (co < appDate) return "FINISHED";
  return status;
}

const FINAL_DISPLAY: ReadonlyArray<DisplayStatus> = [
  "FINISHED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

export function isFinalDisplay(s: DisplayStatus): boolean {
  return FINAL_DISPLAY.includes(s);
}

/**
 * ¿El huésped puede cancelar la reserva visualmente?
 *
 * Reglas:
 *   - Sólo CONFIRMED y que no haya terminado todavía (checkOut futuro).
 *   - PENDING/APPROVED no se "cancelan" desde el guest: se ignoran.
 *   - Cualquier estado FINAL nunca permite cancelar.
 */
export function canGuestCancelReservation(
  reservation: Reservationish,
  appDate: Date
): boolean {
  const display = getReservationDisplayStatus(reservation, appDate);
  if (isFinalDisplay(display)) return false;
  return display === "CONFIRMED" || display === "ONGOING";
}

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  PENDING: "Esperando al anfitrión",
  APPROVED: "Aprobada — pagá para confirmar",
  CONFIRMED: "Confirmada",
  ONGOING: "Estadía en curso",
  FINISHED: "Estadía finalizada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export const DISPLAY_STATUS_TONE: Record<
  DisplayStatus,
  "warning" | "success" | "error" | "stone"
> = {
  PENDING: "warning",
  APPROVED: "warning",
  CONFIRMED: "success",
  ONGOING: "success",
  FINISHED: "stone",
  REJECTED: "error",
  CANCELLED: "error",
  COMPLETED: "stone",
};
