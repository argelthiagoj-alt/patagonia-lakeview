import Link from "next/link";
import { Plus, ImageOff, Users, BedDouble, CalendarCheck, Pencil, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { CabinActiveToggle } from "@/components/admin/CabinActiveToggle";
import { formatCurrency } from "@/lib/utils";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";

async function loadFor(userId: string, viewAll: boolean) {
  try {
    return await prisma.cabin.findMany({
      where: viewAll ? undefined : { ownerId: userId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { reservations: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function AdminCabinsPage() {
  const user = (await getCurrentUser())!;
  const viewAll = isSuperAdmin(user);
  const cabins = await loadFor(user.id, viewAll);

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <p className="text-eyebrow flex items-center gap-1.5">
            {viewAll && <ShieldCheck size={12} strokeWidth={2} />}
            Inventario
          </p>
          <h1 className="heading-section">Cabañas</h1>
          <p className="max-w-xl text-sm text-[color:var(--color-text-secondary)]">
            {viewAll
              ? "Como super-admin ves todas las cabañas, sin importar quién las haya creado."
              : "Estas son las cabañas que vos administrás. Solo podés editar las tuyas."}
          </p>
        </div>
        <LinkButton href="/admin/cabins/new" variant="primary" size="md">
          <Plus size={16} strokeWidth={1.5} />
          Nueva cabaña
        </LinkButton>
      </header>

      {cabins.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          {viewAll
            ? "Aún no hay cabañas en el sistema."
            : "Todavía no creaste ninguna cabaña. Empezá con la primera."}
        </div>
      ) : (
        <ul className="space-y-3">
          {cabins.map((c) => {
            const cover = c.images[0];
            return (
              <li
                key={c.id}
                className="surface-paper grid items-center gap-4 p-4 md:grid-cols-[64px_minmax(0,1.6fr)_minmax(0,1fr)_auto_auto_auto] md:gap-5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--color-surface-muted)]">
                  {cover ? (
                    <SafeImage
                      src={cover.url}
                      alt={cover.alt ?? c.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[color:var(--color-text-muted)]">
                      <ImageOff size={18} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-base font-medium tracking-tight">
                    {c.title}
                  </p>
                  <p className="truncate text-xs text-[color:var(--color-text-secondary)]">
                    {c.location}
                  </p>
                  {viewAll && (
                    <p className="truncate text-[11px] text-[color:var(--color-text-muted)]">
                      Owner: {c.owner.name ?? c.owner.email}
                    </p>
                  )}
                </div>

                <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--color-text-secondary)]">
                  <Stat icon={<Users size={13} strokeWidth={1.5} />}>{c.maxGuests}</Stat>
                  <Stat icon={<BedDouble size={13} strokeWidth={1.5} />}>{c.bedrooms}</Stat>
                  <Stat icon={<CalendarCheck size={13} strokeWidth={1.5} />}>
                    {c._count.reservations}
                  </Stat>
                </dl>

                <div className="text-sm font-medium md:text-right">
                  {formatCurrency(c.pricePerNight)}
                  <span className="ml-1 text-xs font-normal text-[color:var(--color-text-secondary)]">
                    / noche
                  </span>
                </div>

                <CabinActiveToggle id={c.id} active={c.isActive} />

                <Link
                  href={`/admin/cabins/${c.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-text-primary)] hover:bg-[color:var(--color-surface-muted)]"
                >
                  <Pencil size={12} strokeWidth={1.75} />
                  Editar
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[color:var(--color-text-primary)]">{icon}</span>
      <strong className="text-[color:var(--color-text-primary)] font-medium">
        {children}
      </strong>
    </span>
  );
}
