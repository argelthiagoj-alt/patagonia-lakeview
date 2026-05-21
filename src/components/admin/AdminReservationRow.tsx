"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { format } from "date-fns";
import { CreditCard, Wallet, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  paymentProviderLabel,
  paymentStatusLabel,
  paymentStatusTone,
  type PaymentProvider,
  type PaymentStatus,
} from "@/modules/payments/labels";

type Status =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

const statusTone: Record<Status, "warning" | "success" | "error" | "stone"> = {
  PENDING: "warning",
  APPROVED: "warning",
  CONFIRMED: "success",
  REJECTED: "error",
  CANCELLED: "error",
  COMPLETED: "stone",
};

const statusLabel: Record<Status, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobada · sin pago",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export type AdminReservationRowData = {
  id: string;
  cabinTitle: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: Status;
  totalPrice: number;
  payment: {
    provider: PaymentProvider;
    status: PaymentStatus;
    cardBrand: string | null;
    last4: string | null;
  } | null;
};

export function AdminReservationRow({
  reservation,
}: {
  reservation: AdminReservationRowData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function action(act: "approve" | "confirm" | "reject" | "cancel") {
    if (act === "reject" && !confirm("¿Rechazar la reserva?")) return;
    if (act === "cancel" && !confirm("¿Cancelar la reserva? Si tenía pago simulado se marca como devuelto.")) return;
    startTransition(async () => {
      await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: act }),
      });
      router.refresh();
    });
  }

  const isFinal =
    reservation.status === "CANCELLED" ||
    reservation.status === "REJECTED" ||
    reservation.status === "COMPLETED";

  return (
    <tr>
      <td className="px-5 py-3 font-medium">
        <a
          href={`/admin/reservations/${reservation.id}`}
          className="hover:underline"
        >
          {reservation.cabinTitle}
        </a>
      </td>
      <td className="px-5 py-3">
        <p className="whitespace-nowrap text-[color:var(--color-text-primary)]">
          {reservation.guestName}
        </p>
        <p className="whitespace-nowrap text-xs text-[color:var(--color-text-secondary)]">
          {reservation.guestEmail}
        </p>
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-[color:var(--color-text-secondary)]">
        {format(new Date(reservation.checkIn), "dd MMM")} →{" "}
        {format(new Date(reservation.checkOut), "dd MMM yyyy")}
      </td>
      <td className="px-5 py-3">{reservation.guests}</td>
      <td className="px-5 py-3">
        <Badge tone={statusTone[reservation.status]}>
          {statusLabel[reservation.status]}
        </Badge>
      </td>
      <td className="px-5 py-3">
        {reservation.payment ? (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-text-primary)]">
              {reservation.payment.provider === "CARD" ? (
                <CreditCard size={12} strokeWidth={1.75} />
              ) : (
                <Wallet size={12} strokeWidth={1.75} />
              )}
              {paymentProviderLabel[reservation.payment.provider]}
              {reservation.payment.last4 && (
                <span className="text-[color:var(--color-text-muted)]">
                  · ••{reservation.payment.last4}
                </span>
              )}
            </span>
            <Badge tone={paymentStatusTone[reservation.payment.status]} className="self-start text-[10px]">
              {paymentStatusLabel[reservation.payment.status]}
            </Badge>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-text-muted)]">
            <ShieldOff size={12} strokeWidth={1.75} />
            Sin pago
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
        {formatCurrency(reservation.totalPrice)}
      </td>
      <td className="px-5 py-3 text-right">
        <div className="inline-flex flex-wrap items-center justify-end gap-2 text-xs">
          {reservation.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={() => action("approve")}
                disabled={pending}
                className="rounded-full bg-[color:var(--color-success)]/15 px-3 py-1 font-medium text-[color:var(--color-success)] transition hover:bg-[color:var(--color-success)]/25 disabled:opacity-50"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => action("reject")}
                disabled={pending}
                className="rounded-full bg-[color:var(--color-error)]/12 px-3 py-1 font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error)]/20 disabled:opacity-50"
              >
                Rechazar
              </button>
            </>
          )}
          {reservation.status === "APPROVED" && (
            <button
              type="button"
              onClick={() => action("cancel")}
              disabled={pending}
              className="rounded-full bg-[color:var(--color-error)]/12 px-3 py-1 font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error)]/20 disabled:opacity-50"
              title="Cancelar si el huésped no pagó"
            >
              Cancelar (sin pago)
            </button>
          )}
          {!isFinal &&
            reservation.status !== "PENDING" &&
            reservation.status !== "APPROVED" && (
            <button
              type="button"
              onClick={() => action("cancel")}
              disabled={pending}
              className="rounded-full bg-[color:var(--color-error)]/12 px-3 py-1 font-medium text-[color:var(--color-error)] transition hover:bg-[color:var(--color-error)]/20 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
          {isFinal && (
            <span className="text-[color:var(--color-text-muted)]">—</span>
          )}
        </div>
      </td>
    </tr>
  );
}
