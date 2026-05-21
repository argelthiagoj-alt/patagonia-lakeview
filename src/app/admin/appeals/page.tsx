import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Flag } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/session";
import { isSuperAdmin } from "@/shared/auth-roles";
import { listPendingAppeals } from "@/modules/reviews/repo";
import { AppealResolveActions } from "@/components/admin/AppealResolveActions";

export const dynamic = "force-dynamic";

export default async function AppealsPage() {
  const me = await getCurrentUser();
  if (!isSuperAdmin(me)) redirect("/admin");

  const appeals = await listPendingAppeals().catch(() => []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Flag size={12} strokeWidth={2} />
          Super-admin
        </p>
        <h1 className="heading-section">Apelaciones</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-secondary)]">
          Resolvé apelaciones que los anfitriones presentaron contra una reseña.
          Si aprobás, la review queda removida (no se borra el registro, solo
          deja de contar para el rating).
        </p>
      </header>

      {appeals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
          Sin apelaciones pendientes.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {appeals.map((a) => (
            <li key={a.id} className="surface-paper space-y-4 p-5 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-[color:var(--color-text-secondary)]">
                  {format(a.createdAt, "dd MMM yyyy · HH:mm")}
                </p>
                <p className="font-medium">{a.review.cabin.title}</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  Apelada por {a.admin.name ?? a.admin.email}
                </p>
              </div>

              <div className="rounded-2xl bg-[color:var(--color-surface-muted)] p-3 text-xs">
                <p className="font-medium text-[color:var(--color-text-primary)]">
                  Reseña original ({a.review.rating} ★) —{" "}
                  {a.review.user.name ?? a.review.user.email}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[color:var(--color-text-secondary)]">
                  {a.review.comment ?? "Sin comentario"}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-secondary)]">
                  Motivo de la apelación
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[color:var(--color-text-primary)]">
                  {a.reason}
                </p>
              </div>

              <AppealResolveActions appealId={a.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
