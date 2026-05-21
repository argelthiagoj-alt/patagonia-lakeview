import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Users, CreditCard, Wallet } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import { findReservationForAdmin } from "@/modules/reservations/repo";
import { Badge } from "@/components/ui/Badge";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { formatCurrency } from "@/lib/utils";
import {
  paymentProviderLabel,
  paymentStatusLabel,
  paymentStatusTone,
} from "@/modules/payments/labels";

export const dynamic = "force-dynamic";

export default async function AdminReservationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = (await getCurrentUser())!;
  const { id } = await params;

  let r;
  try {
    r = await findReservationForAdmin(id);
  } catch {
    notFound();
  }
  if (!r) notFound();

  if (!isSuperAdmin(me) && r.cabin.ownerId !== me.id) {
    redirect("/admin/reservations");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Volver a reservas
      </Link>

      <header className="surface-paper space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">{r.status}</Badge>
          <span className="text-xs text-[color:var(--color-text-secondary)]">
            {r.cabin.location}
          </span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight">{r.cabin.title}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[color:var(--color-text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} strokeWidth={1.5} />
            {format(r.checkIn, "dd MMM")} → {format(r.checkOut, "dd MMM yyyy")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.5} />
            {r.guests} {r.guests === 1 ? "huésped" : "huéspedes"}
          </span>
          <span className="font-medium text-[color:var(--color-text-primary)]">
            {formatCurrency(r.totalPrice)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-4 text-sm">
            <p className="text-eyebrow mb-2">Huésped</p>
            <p className="font-medium">{r.guestName}</p>
            <p className="text-[color:var(--color-text-secondary)]">{r.guestEmail}</p>
            {r.user?.phone && (
              <p className="text-[color:var(--color-text-secondary)]">{r.user.phone}</p>
            )}
          </div>

          {r.payment && (
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-4 text-sm">
              <p className="text-eyebrow mb-2">Pago simulado</p>
              <div className="flex items-center gap-2">
                {r.payment.provider === "CARD" ? (
                  <CreditCard size={14} strokeWidth={1.75} />
                ) : (
                  <Wallet size={14} strokeWidth={1.75} />
                )}
                {paymentProviderLabel[r.payment.provider]}
                {r.payment.last4 && (
                  <span className="text-[color:var(--color-text-muted)]">
                    · ••{r.payment.last4}
                  </span>
                )}
              </div>
              <Badge
                tone={paymentStatusTone[r.payment.status]}
                className="mt-2 text-[10px]"
              >
                {paymentStatusLabel[r.payment.status]}
              </Badge>
              {r.payment.billingName && (
                <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
                  Facturación: {r.payment.billingName} · {r.payment.documentId ?? "—"}
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Mensajes</h2>
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          Coordiná la llegada con el huésped sin salir de la plataforma.
        </p>
        <ChatPanel reservationId={r.id} />
      </section>
    </div>
  );
}
