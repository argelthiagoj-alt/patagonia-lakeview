import { CalendarCheck, CircleDollarSign, Home, Hourglass, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import {
  aggregateAdminMetrics,
  findRecentForAdmin,
} from "@/modules/reservations/repo";

async function loadMetrics(userId: string, viewAll: boolean) {
  try {
    return await aggregateAdminMetrics(viewAll ? null : userId);
  } catch {
    return { totalRes: 0, pending: 0, cabins: 0, revenue: 0 };
  }
}

async function loadRecent(userId: string, viewAll: boolean) {
  try {
    return await findRecentForAdmin(viewAll ? null : userId, 6);
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const user = (await getCurrentUser())!;
  const viewAll = isSuperAdmin(user);

  const metrics = await loadMetrics(user.id, viewAll);
  const recent = await loadRecent(user.id, viewAll);

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <p className="text-eyebrow flex items-center gap-1.5">
          {viewAll && <ShieldCheck size={12} strokeWidth={2} />}
          Panel
        </p>
        <h1 className="heading-section">
          {viewAll ? "Resumen global" : "Tu resumen"}
        </h1>
        <p className="max-w-xl text-sm text-[color:var(--color-text-secondary)]">
          {viewAll
            ? "Métricas de todas las cabañas del sistema."
            : "Métricas de las cabañas que vos administrás."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Reservas totales" value={metrics.totalRes.toString()} />
        <Stat icon={Hourglass} label="Pendientes" value={metrics.pending.toString()} />
        <Stat icon={Home} label="Cabañas activas" value={metrics.cabins.toString()} />
        <Stat icon={CircleDollarSign} label="Ingresos" value={formatCurrency(metrics.revenue)} />
      </div>

      <section className="space-y-5">
        <h2 className="text-xl font-medium tracking-tight">Actividad reciente</h2>

        {recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
            Aún no hay actividad. Cuando lleguen reservas, las vas a ver acá.
          </div>
        ) : (
          <div className="surface-paper p-0">
            <div className="-mx-px overflow-x-auto rounded-[inherit]">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[color:var(--color-surface-muted)]/60 text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Cabaña</th>
                    <th className="px-5 py-3 font-medium">Huésped</th>
                    <th className="px-5 py-3 font-medium">Check-in</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                    <th className="px-5 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-border)]">
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium whitespace-nowrap">
                        {r.cabin.title}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-text-secondary)] whitespace-nowrap">
                        {r.guestName}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-text-secondary)] whitespace-nowrap">
                        {r.checkIn.toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-5 py-3 text-[color:var(--color-text-secondary)] whitespace-nowrap">
                        {r.status}
                      </td>
                      <td className="px-5 py-3 text-right font-medium whitespace-nowrap">
                        {formatCurrency(r.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-[color:var(--color-border)] px-5 py-2 text-[11px] text-[color:var(--color-text-muted)] md:hidden">
              Desliz horizontal para ver todas las columnas →
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
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
