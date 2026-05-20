"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { format } from "date-fns";
import { MapPin, CalendarDays, Users, CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  paymentProviderLabel,
  paymentStatusLabel,
  paymentStatusTone,
  type PaymentProvider,
  type PaymentStatus,
} from "@/lib/payments";

type Status = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";

const statusTone: Record<Status, "warning" | "success" | "error" | "stone"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "error",
  CANCELLED: "error",
  COMPLETED: "stone",
};

const statusLabel: Record<Status, string> = {
  PENDING: "Pendiente de aprobación",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

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
};

export function ReservationCard({
  reservation,
  canCancel = true,
}: {
  reservation: ReservationCardData;
  canCancel?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const ci = new Date(reservation.checkIn);
  const co = new Date(reservation.checkOut);
  const isFinal =
    reservation.status === "CANCELLED" ||
    reservation.status === "REJECTED" ||
    reservation.status === "COMPLETED";

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
            <Badge tone={statusTone[reservation.status]}>
              {statusLabel[reservation.status]}
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
          {canCancel && !isFinal && reservation.status === "CONFIRMED" && (
            <button
              type="button"
              onClick={cancel}
              disabled={pending}
              className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-error)] underline-offset-4 hover:underline disabled:opacity-50"
            >
              {pending ? "Cancelando…" : "Cancelar reserva"}
            </button>
          )}
        </div>
      </div>

      {/* Payment block */}
      {reservation.payment && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-4 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[color:var(--color-text-secondary)]">
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
        </div>
      )}

      {reservation.status === "REJECTED" && reservation.payment?.status === "SIMULATED_REFUNDED" && (
        <div className="rounded-xl border border-[color:var(--color-error)]/20 bg-[color:var(--color-error)]/8 p-3 text-xs text-[color:var(--color-error)]">
          La reserva fue rechazada por el anfitrión y el pago fue devuelto de
          forma simulada. No se procesó dinero real.
        </div>
      )}
    </article>
  );
}
