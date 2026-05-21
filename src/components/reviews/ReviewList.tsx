import { format } from "date-fns";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AdminAppealButton } from "@/components/reviews/AdminAppealButton";

/**
 * ReviewList — diseño inspirado en el desglose de Airbnb pero con la
 * paleta natural/editorial de Patagonia Lakeview.
 *
 * Layout:
 *   - Bloque header: score grande (n.NN ★) + N reseñas, alineado a la
 *     izquierda. Sobrio, sin gradientes ni iconos extra.
 *   - Bloque desglose: lista de 6 categorías con barra horizontal de
 *     progreso (5 = completa). Apilado vertical en mobile, 2 col en sm+.
 *   - Tarjetas individuales: autor + fecha + estrellas chicas +
 *     comentario. Padding cómodo, separadas con borde fino.
 *
 * Responsivo: el header score se apila sobre el desglose en mobile;
 * en md+ ocupan dos columnas (40/60).
 */

export type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: string;
  hasPendingAppeal: boolean;
  canAppeal: boolean;
  canDelete: boolean;
  breakdown?: {
    cleanliness: number;
    accuracy: number;
    checkin: number;
    communication: number;
    location: number;
    value: number;
  };
};

const BREAKDOWN_LABELS: Array<{
  key: keyof NonNullable<ReviewItem["breakdown"]>;
  label: string;
}> = [
  { key: "cleanliness", label: "Limpieza" },
  { key: "accuracy", label: "Veracidad" },
  { key: "checkin", label: "Check-in" },
  { key: "communication", label: "Comunicación" },
  { key: "location", label: "Ubicación" },
  { key: "value", label: "Precio / calidad" },
];

export function ReviewList({
  reviews,
  cabinTitle,
}: {
  reviews: ReviewItem[];
  cabinTitle: string;
}) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
        Aún no hay reseñas para {cabinTitle}.
      </div>
    );
  }

  const overall =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const withBreakdown = reviews.filter((r) => r.breakdown);
  const averages = withBreakdown.length
    ? BREAKDOWN_LABELS.map(({ key, label }) => ({
        key,
        label,
        avg:
          withBreakdown.reduce((s, r) => s + (r.breakdown![key] ?? 0), 0) /
          withBreakdown.length,
      }))
    : null;

  return (
    <div className="space-y-8">
      {/* ── Header score + desglose ── */}
      <section className="surface-paper grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,260px)_1fr] md:gap-12">
        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2">
            <Star
              size={28}
              strokeWidth={1.25}
              className="fill-[color:var(--color-accent)] text-[color:var(--color-accent)]"
            />
            <span className="text-4xl font-medium tracking-tight md:text-5xl">
              {overall.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"} de
            huéspedes verificados
          </p>
        </div>

        {averages && (
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
            {averages.map((a) => (
              <li
                key={a.key}
                className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[1fr_120px_auto]"
              >
                <span className="text-sm text-[color:var(--color-text-primary)]">
                  {a.label}
                </span>
                <span
                  className="hidden h-1.5 overflow-hidden rounded-full bg-[color:var(--color-border)]/45 sm:block"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-[color:var(--color-primary)]"
                    style={{
                      width: `${Math.min(100, (a.avg / 5) * 100)}%`,
                      transition: "width 600ms var(--ease-out-soft)",
                    }}
                  />
                </span>
                <span className="text-right text-xs font-medium tabular-nums text-[color:var(--color-text-secondary)]">
                  {a.avg.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Tarjetas de comentarios ── */}
      <ul className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="surface-paper flex flex-col gap-3 p-5 text-sm sm:p-6"
          >
            <header className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-base font-medium tracking-tight text-[color:var(--color-text-primary)]">
                  {r.author}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                  {format(new Date(r.createdAt), "MMM yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-0.5 text-[color:var(--color-accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    strokeWidth={1.25}
                    className={
                      i < r.rating
                        ? "fill-current"
                        : "fill-transparent text-[color:var(--color-border)]"
                    }
                  />
                ))}
              </div>
            </header>

            <p className="text-[15px]/relaxed text-[color:var(--color-text-primary)]/90">
              {r.comment ?? (
                <span className="text-[color:var(--color-text-muted)]">
                  Sin comentario adicional.
                </span>
              )}
            </p>

            {(r.hasPendingAppeal || r.canAppeal || r.canDelete) && (
              <footer className="flex items-center justify-end gap-2 border-t border-[color:var(--color-border)]/60 pt-3 text-xs">
                {r.hasPendingAppeal && (
                  <Badge tone="warning" className="text-[10px]">
                    Apelada
                  </Badge>
                )}
                <AdminAppealButton
                  reviewId={r.id}
                  canAppeal={r.canAppeal && !r.hasPendingAppeal}
                  canDelete={r.canDelete}
                />
              </footer>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
