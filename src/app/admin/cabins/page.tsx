import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

async function loadAll() {
  try {
    return await prisma.cabin.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { reservations: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminCabinsPage() {
  const cabins = await loadAll();

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-eyebrow">Inventario</p>
          <h1 className="heading-section">Cabañas</h1>
        </div>
        <LinkButton href="/admin/cabins/new" variant="primary" size="md">
          <Plus size={16} strokeWidth={1.5} />
          Nueva cabaña
        </LinkButton>
      </header>

      {cabins.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          Conectá la base de datos para empezar a administrar cabañas.
        </div>
      ) : (
        <div className="surface-paper overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--color-surface-muted)]/60 text-left text-xs uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
              <tr>
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Ubicación</th>
                <th className="px-5 py-3 font-medium">Huéspedes</th>
                <th className="px-5 py-3 font-medium">Precio</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Reservas</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--color-border)]">
              {cabins.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-medium">{c.title}</td>
                  <td className="px-5 py-3 text-[color:var(--color-text-secondary)]">
                    {c.location}
                  </td>
                  <td className="px-5 py-3">{c.maxGuests}</td>
                  <td className="px-5 py-3">{formatCurrency(c.pricePerNight)}</td>
                  <td className="px-5 py-3">
                    {c.isActive ? (
                      <Badge tone="success">Activa</Badge>
                    ) : (
                      <Badge tone="error">Inactiva</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3">{c._count.reservations}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/cabins/${c.id}/edit`}
                      className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-accent-hover)] hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
