import { z } from "zod";

/**
 * Zod schemas for the simulated checkout. Discriminated union by `provider`
 * so the route handler can switch without type narrowing gymnastics.
 *
 * Card number is stripped of whitespace before validation; the full number
 * NEVER leaves the request handler.
 */

// Common billing fields that ride with every simulated payment.
const billingSchema = z.object({
  documentId: z.string().min(4, "Documento requerido").max(40),
  phone: z.string().min(6, "Teléfono requerido").max(40),
  billingAddress: z.string().min(4, "Dirección requerida").max(180),
  city: z.string().min(2, "Ciudad requerida").max(80),
  state: z.string().min(2, "Provincia / estado requerido").max(80),
  country: z.string().min(2, "País requerido").max(80),
});

const cardPaymentSchema = z
  .object({
    provider: z.literal("CARD"),
    cardholder: z.string().min(2, "Ingresá el titular").max(80),
    number: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(
        z
          .string()
          .regex(/^\d{13,19}$/, "El número debe tener entre 13 y 19 dígitos")
      ),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/YY"),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
    email: z.string().email("Email inválido"),
  })
  .merge(billingSchema);

const mpPaymentSchema = z
  .object({
    provider: z.literal("MERCADO_PAGO"),
    email: z.string().email("Email inválido"),
  })
  .merge(billingSchema);

export const paymentInputSchema = z.discriminatedUnion("provider", [
  cardPaymentSchema,
  mpPaymentSchema,
]);

export type PaymentInput = z.infer<typeof paymentInputSchema>;
