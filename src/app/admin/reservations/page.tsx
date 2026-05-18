import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { AdminReservationRow } from "@/components/admin/AdminReservationRow";
import { formatCurrency } from "@/lib/utils";

async function load() {
  try {
    return await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: { cabin: { select: { title: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminReservationsPage() {
  const rows = await load();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow">Operación</p>
        <h1 className="heading-section">Reservas</h1>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          Sin reservas todavía.
        </div>
      ) : (
        <div className="surface-paper overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--color-surface-muted)]/60 text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
              <tr>
                <th className="px-5 py-3 font-medium">Cabaña</th>
                <th className="px-5 py-3 font-medium">Huésped</th>
                <th className="px-5 py-3 font-medium">Fechas</th>
                <th className="px-5 py-3 font-medium">Pax</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-border)]">
              {rows.map((r) => (
                <AdminReservationRow
                  key={r.id}
                  reservation={{
                    id: r.id,
                    cabinTitle: r.cabin.title,
                    guestName: r.guestName,
                    guestEmail: r.guestEmail,
                    checkIn: r.checkIn.toISOString(),
                    checkOut: r.checkOut.toISOString(),
                    guests: r.guests,
                    status: r.status,
                    totalPrice: r.totalPrice,
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
        <span>Leyenda:</span>
        <Badge tone="warning">Pendiente</Badge>
        <Badge tone="success">Confirmada</Badge>
        <Badge tone="error">Cancelada</Badge>
        <Badge tone="stone">Completada</Badge>
        <span className="ml-auto text-[color:var(--color-text-muted)]">
          {rows.length} {rows.length === 1 ? "reserva" : "reservas"} · Total{" "}
          {formatCurrency(rows.reduce((a, r) => a + r.totalPrice, 0))}
        </span>
      </div>
    </div>
  );
}
