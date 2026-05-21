import { redirect } from "next/navigation";
import { Sparkles, BadgeCheck, TrendingUp, Crown } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import { getProStatus } from "@/modules/users/repo";
import { PRO_PRICE_USD, PRO_PERIOD_DAYS } from "@/modules/admin/pro";
import { ProMembershipActions } from "@/components/admin/ProMembershipActions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Ganar visibilidad · Pro" };

export default async function ProMembershipPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login?next=/admin/pro-membership");
  if (!isAdmin(me)) redirect("/dashboard");

  const status = await getProStatus(me.id);
  const isActive =
    status?.adminPlan === "PRO" &&
    (!status.proUntil || status.proUntil > new Date());

  return (
    <div className="space-y-10 pb-24">
      <header className="space-y-3">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Crown size={12} strokeWidth={2} />
          Membresía Pro
        </p>
        <h1 className="heading-section">Ganar visibilidad</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Subí tus publicaciones al frente del catálogo, sumá un badge Pro
          Host y entrá al ranking de la landing. La suscripción es
          simulada: no procesamos pagos reales.
        </p>
      </header>

      {/* Beneficios */}
      <ul className="grid gap-4 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <li
            key={b.title}
            className="surface-paper flex flex-col gap-2 p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-accent)]/12 text-[color:var(--color-accent)]">
              <b.Icon size={16} strokeWidth={1.75} />
            </span>
            <p className="text-base font-medium tracking-tight">{b.title}</p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              {b.body}
            </p>
          </li>
        ))}
      </ul>

      {/* Estado actual / acción */}
      <section className="surface-paper grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-2">
          {isActive ? (
            <>
              <p className="text-eyebrow text-[color:var(--color-accent)]">
                Pro activo
              </p>
              <h2 className="text-2xl font-medium tracking-tight">
                Tu plan está al frente del catálogo
              </h2>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                {status?.proSince && (
                  <>
                    Miembro desde{" "}
                    {status.proSince.toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    .{" "}
                  </>
                )}
                {status?.proUntil && (
                  <>
                    Próxima renovación{" "}
                    {status.proUntil.toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                    .
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-eyebrow">Plan FREE</p>
              <h2 className="text-2xl font-medium tracking-tight">
                Suscribirme a Pro
              </h2>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                {PRO_PERIOD_DAYS} días de visibilidad premium. Activación
                instantánea (simulada).
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          {!isActive && (
            <div className="text-right">
              <p className="text-3xl font-medium leading-none">
                US$ {PRO_PRICE_USD}
                <span className="ml-1 text-sm font-normal text-[color:var(--color-text-secondary)]">
                  / mes
                </span>
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                Pago simulado
              </p>
            </div>
          )}
          <ProMembershipActions isActive={isActive} />
        </div>
      </section>

      <p className="text-xs text-[color:var(--color-text-muted)]">
        Esta funcionalidad es una simulación pensada para fines de
        demostración. No se procesa dinero real y la suscripción puede
        cancelarse en cualquier momento.
      </p>
    </div>
  );
}

const BENEFITS = [
  {
    title: "Mejor posicionamiento",
    body: "Tus publicaciones aparecen primero en el catálogo y los resultados de búsqueda.",
    Icon: TrendingUp,
  },
  {
    title: "Badge Pro Host",
    body: "Un sello distintivo en tu ficha y en cada card del catálogo.",
    Icon: BadgeCheck,
  },
  {
    title: "Más visibilidad en la landing",
    body: "Prioridad en las secciones Featured y en los slots destacados.",
    Icon: Sparkles,
  },
];
