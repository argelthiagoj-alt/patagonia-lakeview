import { CalendarCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReservationCard, type ReservationCardData } from "@/components/booking/ReservationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";

async function loadAll(userId: string): Promise<ReservationCardData[]> {
  try {
    const rows = await prisma.reservation.findMany({
      where: { userId },
      include: {
        cabin: { select: { slug: true, title: true, location: true } },
        payment: {
          select: {
            provider: true,
            status: true,
            cardBrand: true,
            last4: true,
          },
        },
      },
      orderBy: { checkIn: "desc" },
    });
    return rows.map((r) => ({
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
    }));
  } catch {
    return [];
  }
}

export default async function MyReservationsPage() {
  const user = (await getCurrentUser())!;
  const reservations = await loadAll(user.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Tu cuenta</p>
        <h1 className="heading-section">Tus reservas</h1>
        <p className="max-w-xl text-sm text-[color:var(--color-text-secondary)]">
          Acá ves el estado de cada reserva y el estado del pago simulado. Las
          reservas rechazadas muestran la devolución simulada.
        </p>
      </header>

      {reservations.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Todavía no reservaste nada"
          description="Cuando reserves una cabaña, las vas a ver acá."
          action={
            <LinkButton href="/cabins" variant="primary" size="md">
              Explorar cabañas
            </LinkButton>
          }
        />
      ) : (
        <div className="grid gap-4">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}
