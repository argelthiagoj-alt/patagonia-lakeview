import "server-only";

import { detectCardBrand, lastFour } from "@/modules/payments/helpers";
import type { PaymentInput } from "@/modules/payments/schemas";

/**
 * Build the nested `Payment.create` payload from a validated `PaymentInput`.
 *
 * Always strips the card number — only `last4` + `cardBrand` are persisted,
 * along with the billing snapshot. Initial status is `SIMULATED_APPROVED`
 * because the host has to manually accept the reservation before money is
 * "captured" (still simulated).
 */
export function buildSimulatedPaymentData(
  payment: PaymentInput,
  total: number,
  fallbackName: string
) {
  const billing = {
    documentId: payment.documentId,
    phone: payment.phone,
    billingAddress: payment.billingAddress,
    city: payment.city,
    state: payment.state,
    country: payment.country,
  };

  if (payment.provider === "CARD") {
    return {
      provider: "CARD" as const,
      status: "SIMULATED_APPROVED" as const,
      amount: total,
      cardBrand: detectCardBrand(payment.number),
      last4: lastFour(payment.number),
      payerEmail: payment.email,
      billingName: payment.cardholder,
      ...billing,
      simulated: true,
    };
  }

  return {
    provider: "MERCADO_PAGO" as const,
    status: "SIMULATED_APPROVED" as const,
    amount: total,
    payerEmail: payment.email,
    billingName: fallbackName,
    ...billing,
    simulated: true,
  };
}
