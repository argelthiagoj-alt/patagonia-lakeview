import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Plus } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import { listAllDestinations } from "@/modules/city-guide/repo";
import { CityGuideIndexActions } from "@/components/admin/city-guide/CityGuideIndexActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Guía de destinos · Admin" };

export default async function CityGuideAdminPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/city-guide");
  if (!isSuperAdmin(me)) redirect("/admin");

  const cities = await listAllDestinations();

  return (
    <div className="space-y-8 pb-24">
      <header className="space-y-3">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Compass size={12} strokeWidth={2} />
          Super-admin
        </p>
        <h1 className="heading-section">Guía de destinos</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Ciudades y lugares que aparecen en /destinos. Sumá una nueva
          ciudad, editá las existentes o agregá lugares por categoría
          (senderos, restaurantes, ski, aventuras, bienestar, tiendas).
        </p>
      </header>

      <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-medium tracking-tight">Ciudades</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/city-guide/taxonomies"
              className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-3 py-1 text-[11px] font-medium text-[color:var(--color-text-secondary)] transition hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-text-primary)]"
            >
              Gestionar taxonomías
            </Link>
            <CityGuideIndexActions />
          </div>
        </div>
        {cities.length === 0 ? (
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Todavía no hay ciudades. Creá la primera con el botón de arriba.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border)]">
            {cities.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="space-y-0.5">
                  <p className="font-medium tracking-tight">
                    {c.name}
                    {!c.isPublished && (
                      <span className="ml-2 rounded-full bg-[color:var(--color-warning)]/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-warning)]">
                        oculta
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">
                    /{c.slug} · {c._count.items} lugares
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Link
                    href={`/admin/city-guide/${c.slug}`}
                    className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-3 py-1 font-medium text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
                  >
                    Gestionar
                  </Link>
                  <Link
                    href={`/destinos/${c.slug}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-full px-3 py-1 font-medium text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)]"
                  >
                    Ver pública ↗
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
