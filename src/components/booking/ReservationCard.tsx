"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { format } from "date-fns";
import { MapPin, CalendarDays, Users, CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { ReservationChatButton } from "@/components/chat/ReservationChatButton";
import {
  paymentProviderLabel,
  paymentStatusLabel,
  paymentStatusTone,
  type PaymentProvider,
  type PaymentStatus,
} from "@/modules/payments/labels";

import {
  canGuestCancelReservation,
  getReservationDisplayStatus,
  isFinalDisplay,
  DISPLAY_STATUS_LABEL,
  DISPLAY_STATUS_TONE,
  type DbReservationStatus,
} from "@/modules/reservations/status";
import { useAppDate } from "@/components/demo/AppDateProvider";

type Status = DbReservationStatus;

export type ReservationCardData = {
  id: string;
  status: Status;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  cabin: {
    slug: string;
    title: string;
    location: string;
  };
  payment?: {
    provider: PaymentProvider;
    status: PaymentStatus;
    cardBrand: string | null;
    last4: string | null;
  } | null;
  /** Inbound (host → guest) messages the user has not opened yet. */
  unreadMessages?: number;
};

export function ReservationCard({
  reservation,
  canCancel: canCancelProp = true,
}: {
  reservation: ReservationCardData;
  canCancel?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const ci = new Date(reservation.checkIn);
  const co = new Date(reservation.checkOut);
  const appDate = useAppDate();
  const display = getReservationDisplayStatus(
    {
      status: reservation.status,
      checkIn: ci,
      checkOut: co,
    },
    appDate
  );
  const isFinal = isFinalDisplay(display);
  const canCancel =
    canCancelProp === false
      ? false
      : canGuestCancelReservation(
          { status: reservation.status, checkIn: ci, checkOut: co },
          appDate
        );

  function cancel() {
    if (!confirm("¿Cancelar esta reserva?")) return;
    startTransition(async () => {
      await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      router.refresh();
    });
  }

  return (
    <article className="surface-paper space-y-5 p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={DISPLAY_STATUS_TONE[display]}>
              {DISPLAY_STATUS_LABEL[display]}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-text-secondary)]">
              <MapPin size={12} strokeWidth={1.5} />
              {reservation.cabin.location}
            </span>
          </div>

          <Link
            href={`/dashboard/reservations/${reservation.id}`}
            className="text-xl font-medium tracking-tight hover:text-[color:var(--color-accent-hover)]"
          >
            {reservation.cabin.title}
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} strokeWidth={1.5} />
              {format(ci, "dd MMM")} → {format(co, "dd MMM yyyy")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={14} strokeWidth={1.5} />
              {reservation.guests} {reservation.guests === 1 ? "huésped" : "huéspedes"}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 md:flex-col md:items-end md:gap-2">
          <span className="text-2xl font-medium">
            {formatCurrency(reservation.totalPrice)}
          </span>
        </div>
      </div>

      {/* Footer: payment info + inline actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-4">
        {reservation.payment ? (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5 text-[color:var(--color-text-primary)]">
              {reservation.payment.provider === "CARD" ? (
                <CreditCard size={13} strokeWidth={1.75} />
              ) : (
                <Wallet size={13} strokeWidth={1.75} />
              )}
              {paymentProviderLabel[reservation.payment.provider]}
              {reservation.payment.last4 && (
                <span className="text-[color:var(--color-text-muted)]">
                  · ••{reservation.payment.last4}
                </span>
              )}
            </span>
            <Badge tone={paymentStatusTone[reservation.payment.status]}>
              {paymentStatusLabel[reservation.payment.status]}
            </Badge>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-muted)]">
              Simulado
            </span>
          </div>
        ) : (
          <span />
        )}

        {/* Actions: chat (any non-rejected/cancelled state) + cancel (CONFIRMED only) */}
        <div className="flex flex-wrap items-center gap-2">
          {reservation.status !== "REJECTED" &&
            reservation.status !== "CANCELLED" && (
              <ReservationChatButton
                reservationId={reservation.id}
                cabinTitle={reservation.cabin.title}
                unreadCount={reservation.unreadMessages ?? 0}
                variant="solid"
              />
            )}
          {reservation.status === "APPROVED" && (
            <Link
              href={`/dashboard/reservations/${reservation.id}#pay`}
              className="rounded-full bg-[color:var(--color-primary)] px-4 py-1.5 text-xs font-medium text-[color:var(--color-primary-foreground)] transition hover:bg-[color:var(--color-accent-hover)]"
            >
              Pagar ahora
            </Link>
          )}
          {canCancel && (
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="rounded-full border border-[color:var(--color-border)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--color-error)] transition hover:border-[color:var(--color-error)] hover:bg-[color:var(--color-error)]/8 disabled:opacity-50"
            >
              {pending ? "Cancelando…" : "Cancelar reserva"}
            </button>
          )}
        </div>
      </div>

      {reservation.status === "REJECTED" && reservation.payment?.status === "SIMULATED_REFUNDED" && (
        <div className="rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-xs text-[color:var(--color-error)]">
          La reserva fue rechazada por el anfitrión y el pago fue devuelto de
          forma simulada. No se procesó dinero real.
        </div>
      )}
    </article>
  );
}
