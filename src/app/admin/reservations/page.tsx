import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import {
  AdminReservationRow,
  type AdminReservationRowData,
} from "@/components/admin/AdminReservationRow";
import { formatCurrency } from "@/lib/utils";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

async function load(userId: string, viewAll: boolean): Promise<AdminReservationRowData[]> {
  const where = viewAll ? undefined : { cabin: { ownerId: userId } };
  try {
    const rows = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cabin: { select: { title: true } },
        payment: {
          select: {
            provider: true,
            status: true,
            cardBrand: true,
            last4: true,
          },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      cabinTitle: r.cabin.title,
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      checkIn: r.checkIn.toISOString(),
      checkOut: r.checkOut.toISOString(),
      guests: r.guests,
      status: r.status,
      totalPrice: r.totalPrice,
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

export default async function AdminReservationsPage() {
  const user = (await getCurrentUser())!;
  const viewAll = isSuperAdmin(user);
  const rows = await load(user.id, viewAll);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Operación</p>
        <h1 className="heading-section">Reservas</h1>
        <p className="max-w-xl text-sm text-[color:var(--color-text-secondary)]">
          Aceptá o rechazá las reservas pendientes. El pago es simulado: al
          aceptar queda como "Cobrado", al rechazar como "Devuelto". No se mueve
          dinero real.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          Sin reservas todavía.
        </div>
      ) : (
        <div className="surface-paper p-0">
          <div className="-mx-px overflow-x-auto rounded-[inherit]">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-[color:var(--color-surface-muted)]/60 text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Cabaña</th>
                  <th className="px-5 py-3 font-medium">Huésped</th>
                  <th className="px-5 py-3 font-medium">Fechas</th>
                  <th className="px-5 py-3 font-medium">Pax</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Pago</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {rows.map((r) => (
                  <AdminReservationRow key={r.id} reservation={r} />
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[color:var(--color-border)] px-5 py-2 text-[11px] text-[color:var(--color-text-muted)] md:hidden">
            Desliz horizontal para ver todas las columnas →
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
        <span>Leyenda:</span>
        <Badge tone="warning">Pendiente</Badge>
        <Badge tone="success">Confirmada</Badge>
        <Badge tone="error">Rechazada / Cancelada</Badge>
        <Badge tone="stone">Completada</Badge>
        <span className="ml-auto text-[color:var(--color-text-muted)]">
          {rows.length} {rows.length === 1 ? "reserva" : "reservas"} · Total{" "}
          {formatCurrency(rows.reduce((a, r) => a + r.totalPrice, 0))}
        </span>
      </div>
    </div>
  );
}
