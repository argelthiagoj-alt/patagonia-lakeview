import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { ReservationCard } from "@/components/booking/ReservationCard";
import { ChatPanel } from "@/components/chat/ChatPanel";

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
    r = await prisma.reservation.findUnique({
      where: { id },
      include: {
        cabin: {
          select: { slug: true, title: true, location: true, ownerId: true },
        },
        payment: {
          select: { provider: true, status: true, cardBrand: true, last4: true },
        },
      },
    });
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

      <section className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Mensajes</h2>
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          Coordiná tu llegada, dudas y servicios extra con el anfitrión sin
          salir de la plataforma.
        </p>
        <ChatPanel reservationId={r.id} />
      </section>
    </div>
  );
}
