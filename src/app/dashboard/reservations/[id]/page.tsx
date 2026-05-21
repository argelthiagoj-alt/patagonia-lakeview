import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import { findReservationForGuest } from "@/modules/reservations/repo";
import { ReservationCard } from "@/components/booking/ReservationCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { NewReviewForm } from "@/components/reviews/NewReviewForm";
import { PayReservationPanel } from "@/components/booking/PayReservationPanel";
import { findProfile } from "@/modules/users/repo";

export const dynamic = "force-dynamic";

export default async function UserReservationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = (await getCurrentUser())!;
  const { id } = await params;

  let r;
  try {
    r = await findReservationForGuest(id);
  } catch {
    notFound();
  }
  if (!r) notFound();

  // Only the reservation owner (or super-admin debugging) can see this page
  if (r.userId !== me.id && !isSuperAdmin(me)) {
    redirect("/dashboard/reservations");
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/reservations"
        className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Volver a mis reservas
      </Link>

      <ReservationCard
        reservation={{
          id: r.id,
          status: r.status,
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
          guests: r.guests,
          totalPrice: r.totalPrice,
          cabin: r.cabin,
          payment: r.payment
            ? {
                provider: r.payment.provider,
                status: r.payment.status,
                cardBrand: r.payment.cardBrand,
                last4: r.payment.last4,
              }
            : null,
        }}
      />

      {r.status === "APPROVED" && (
        <section id="pay" className="space-y-3 scroll-mt-24">
          <h2 className="text-lg font-medium tracking-tight">Pagá tu reserva</h2>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            El anfitrión aprobó tu solicitud. Completá el pago simulado para
            dejar la reserva confirmada. No se procesa dinero real.
          </p>
          <PayReservationPanel
            reservationId={r.id}
            amount={r.totalPrice}
            guestName={me.name ?? ""}
            guestEmail={me.email}
            defaults={await (async () => {
              const p = await findProfile(me.id).catch(() => null);
              return p
                ? {
                    documentId: p.documentId ?? undefined,
                    phone: p.phone ?? undefined,
                    address: p.address ?? undefined,
                    city: p.city ?? undefined,
                    state: p.state ?? undefined,
                    country: p.country ?? undefined,
                  }
                : {};
            })()}
          />
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Mensajes</h2>
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          Coordiná tu llegada, dudas y servicios extra con el anfitrión sin
          salir de la plataforma.
        </p>
        <ChatPanel reservationId={r.id} />
      </section>

      {/* Review eligibility: stay finished (CONFIRMED past, or COMPLETED) and no review yet */}
      {!r.review &&
        ((r.status === "CONFIRMED" && r.checkOut < new Date()) ||
          r.status === "COMPLETED") && (
          <section className="space-y-3">
            <h2 className="text-lg font-medium tracking-tight">Tu reseña</h2>
            <NewReviewForm reservationId={r.id} />
          </section>
        )}
    </div>
  );
}
