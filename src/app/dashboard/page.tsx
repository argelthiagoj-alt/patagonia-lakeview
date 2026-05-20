import Link from "next/link";
import { CalendarCheck, Sparkles, Mountain } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { LinkButton } from "@/components/ui/Button";
import { ReservationCard, type ReservationCardData } from "@/components/booking/ReservationCard";
import { EmptyState } from "@/components/ui/EmptyState";

async function loadUpcoming(userId: string): Promise<ReservationCardData[]> {
  try {
    const rows = await prisma.reservation.findMany({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkOut: { gte: new Date() },
      },
      include: {
        cabin: { select: { slug: true, title: true, location: true } },
        payment: {
          select: { provider: true, status: true, cardBrand: true, last4: true },
        },
      },
      orderBy: { checkIn: "asc" },
      take: 3,
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

export default async function DashboardPage() {
  const user = (await getCurrentUser())!;
  const upcoming = await loadUpcoming(user.id);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-eyebrow">Tu cuenta</p>
        <h1 className="heading-section">
          Hola, {user.name?.split(" ")[0] ?? "viajero"} 👋
        </h1>
        <p className="max-w-2xl text-base text-[color:var(--color-text-secondary)]">
          Acá vas a encontrar tus próximas estadías, tu historial y tu perfil.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarCheck}
          label="Reservas activas"
          value={upcoming.length.toString()}
        />
        <StatCard icon={Sparkles} label="Estado" value="Activo" />
        <StatCard icon={Mountain} label="Próximo viaje" value={
          upcoming[0]
            ? new Date(upcoming[0].checkIn).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
              })
            : "—"
        } />
      </div>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight">Próximas reservas</h2>
          <Link
            href="/dashboard/reservations"
            className="text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
          >
            Ver todas
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Aún no tenés reservas próximas"
            description="Cuando reserves una cabaña, va a aparecer acá."
            action={
              <LinkButton href="/cabins" variant="primary" size="md">
                Explorar cabañas
              </LinkButton>
            }
          />
        ) : (
          <div className="grid gap-4">
            {upcoming.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-paper space-y-4 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface-muted)] text-[color:var(--color-text-secondary)]">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">
          {label}
        </p>
        <p className="text-2xl font-medium">{value}</p>
      </div>
    </div>
  );
}
