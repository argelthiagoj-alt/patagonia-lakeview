"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const statusTone: Record<Status, "warning" | "success" | "error" | "stone"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
  COMPLETED: "stone",
};

const statusLabel: Record<Status, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

export function AdminReservationRow({
  reservation,
}: {
  reservation: {
    id: string;
    cabinTitle: string;
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    status: Status;
    totalPrice: number;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function action(action: "confirm" | "cancel") {
    startTransition(async () => {
      await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    });
  }

  return (
    <tr>
      <td className="px-5 py-3 font-medium">{reservation.cabinTitle}</td>
      <td className="px-5 py-3">
        <p className="text-[color:var(--color-text-primary)]">
          {reservation.guestName}
        </p>
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          {reservation.guestEmail}
        </p>
      </td>
      <td className="px-5 py-3 text-[color:var(--color-text-secondary)]">
        {format(new Date(reservation.checkIn), "dd MMM")} →{" "}
        {format(new Date(reservation.checkOut), "dd MMM yyyy")}
      </td>
      <td className="px-5 py-3">{reservation.guests}</td>
      <td className="px-5 py-3">
        <Badge tone={statusTone[reservation.status]}>
          {statusLabel[reservation.status]}
        </Badge>
      </td>
      <td className="px-5 py-3 text-right font-medium">
        {formatCurrency(reservation.totalPrice)}
      </td>
      <td className="px-5 py-3 text-right">
        <div className="inline-flex flex-wrap items-center justify-end gap-2 text-xs">
          {reservation.status === "PENDING" && (
            <button
              type="button"
              onClick={() => action("confirm")}
              disabled={pending}
              className="rounded-full bg-[color:var(--color-success)]/15 px-3 py-1 font-medium text-[color:var(--color-success)] disabled:opacity-50"
            >
              Confirmar
            </button>
          )}
          {reservation.status !== "CANCELLED" &&
            reservation.status !== "COMPLETED" && (
              <button
                type="button"
                onClick={() => action("cancel")}
                disabled={pending}
                className="rounded-full bg-[color:var(--color-error)]/12 px-3 py-1 font-medium text-[color:var(--color-error)] disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
        </div>
      </td>
    </tr>
  );
}
