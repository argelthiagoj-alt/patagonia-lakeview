import { z } from "zod";

/**
 * Zod schemas for the reservation domain.
 *
 * Flujo de pago (post major update):
 *
 *   POST /api/reservations              ← `reservationSchema` (sin payment)
 *     status: PENDING
 *   POST /api/reservations/[id]         ← `reservationActionSchema`
 *     action: approve | reject | cancel (admin/host)
 *   POST /api/reservations/[id]/pay     ← `payReservationSchema`
 *     status: APPROVED → CONFIRMED
 */
export const reservationSchema = z
  .object({
    cabinSlug: z.string().min(1, "Cabaña requerida"),
    checkIn: z.coerce.date({
      invalid_type_error: "Fecha de check-in inválida",
    }),
    checkOut: z.coerce.date({
      invalid_type_error: "Fecha de check-out inválida",
    }),
    guests: z.coerce
      .number({ invalid_type_error: "Cantidad de huéspedes inválida" })
      .int()
      .min(1, "Mínimo 1 huésped")
      .max(16, "Máximo 16 huéspedes"),
    guestName: z.string().min(2, "Ingresá tu nombre").max(80),
    guestEmail: z.string().email("Email inválido"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "El check-out debe ser posterior al check-in",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.checkIn >= today;
    },
    {
      message: "El check-in no puede ser en el pasado",
      path: ["checkIn"],
    }
  );

export type ReservationInput = z.infer<typeof reservationSchema>;

/**
 * Body de `POST /api/reservations/[id]/pay`. Reaprovecha el schema de
 * payment para que el SimulatedPaymentForm pueda apuntar al nuevo
 * endpoint sin cambios.
 */
export { paymentInputSchema as payReservationSchema } from "@/modules/payments/schemas";
export type { PaymentInput as PayReservationInput } from "@/modules/payments/schemas";

export const reservationActionSchema = z.object({
  action: z.enum(["approve", "confirm", "reject", "cancel"]),
});

export type ReservationAction = z.infer<typeof reservationActionSchema>["action"];
