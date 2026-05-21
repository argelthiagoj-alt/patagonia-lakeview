"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { CheckoutDefaults } from "@/components/booking/SimulatedPaymentForm";
import type { PaymentInput } from "@/modules/payments/schemas";

// El SimulatedPaymentForm es ~580 LOC (cards, billing, Mercado Pago).
// Sólo se necesita cuando la reserva está APPROVED y el huésped abre la
// sección de pago. Lazy-load mantiene el bundle del dashboard liviano.
const SimulatedPaymentForm = dynamic(
  () =>
    import("@/components/booking/SimulatedPaymentForm").then(
      (m) => m.SimulatedPaymentForm
    ),
  {
    ssr: false,
    loading: () => (
      <div className="surface-paper space-y-3 p-6">
        <span className="shimmer block h-6 w-40 rounded-md" />
        <span className="shimmer block h-12 w-full rounded-xl" />
        <span className="shimmer block h-12 w-full rounded-xl" />
        <span className="shimmer block h-12 w-2/3 rounded-xl" />
      </div>
    ),
  }
);

/**
 * Panel del huésped para pagar una reserva ya APPROVED.
 *
 * Postea a `POST /api/reservations/:id/pay`. Si todo va bien, la página
 * recarga y la reserva pasa a CONFIRMED.
 */
export function PayReservationPanel({
  reservationId,
  amount,
  guestName,
  guestEmail,
  defaults,
}: {
  reservationId: string;
  amount: number;
  guestName: string;
  guestEmail: string;
  defaults?: Omit<CheckoutDefaults, "email" | "name">;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  function onSubmit(payment: PaymentInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/reservations/${reservationId}/pay`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payment),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setServerError(
            data?.error ??
              "No pudimos procesar el pago. Probá nuevamente en un momento."
          );
          return;
        }
        router.refresh();
      } catch {
        setServerError("Sin conexión. Verificá tu red e intentá de nuevo.");
      }
    });
  }

  return (
    <SimulatedPaymentForm
      amount={amount}
      defaults={{
        email: guestEmail,
        name: guestName,
        ...defaults,
      }}
      pending={pending}
      serverError={serverError}
      onSubmit={onSubmit}
    />
  );
}
