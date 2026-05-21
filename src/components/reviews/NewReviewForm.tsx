"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { REVIEW_CATEGORIES, type ReviewCategoryKey } from "@/modules/reviews/schemas";

type Ratings = Record<ReviewCategoryKey, number>;

const initial: Ratings = {
  cleanliness: 0,
  accuracy: 0,
  checkin: 0,
  communication: 0,
  location: 0,
  value: 0,
};

/**
 * Review form con desglose: 6 categorías 1-5 + comentario.
 * El rating general se calcula en el server como promedio.
 */
export function NewReviewForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>(initial);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function setCategory(key: ReviewCategoryKey, value: number) {
    setRatings((r) => ({ ...r, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const allRated = REVIEW_CATEGORIES.every((c) => ratings[c.key] >= 1);
    if (!allRated) {
      setError("Calificá las 6 categorías antes de publicar.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reservationId, ...ratings, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "No pudimos publicar tu reseña.");
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  if (success) {
    return (
      <div className="surface-paper p-5 text-sm">
        <p className="font-medium">Gracias por tu reseña.</p>
        <p className="text-[color:var(--color-text-secondary)]">
          Ya aparece en la página de la cabaña.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface-paper space-y-5 p-5">
      <header className="space-y-1">
        <h3 className="text-base font-medium">Dejá tu reseña</h3>
        <p className="text-xs text-[color:var(--color-text-secondary)]">
          Calificá cada categoría del 1 al 5. El promedio se calcula
          automáticamente.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {REVIEW_CATEGORIES.map((cat) => (
          <CategoryRow
            key={cat.key}
            label={cat.label}
            value={ratings[cat.key]}
            onChange={(v) => setCategory(cat.key, v)}
          />
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="¿Qué te llevás de la estadía?"
        className="flex w-full rounded-xl border border-[color:var(--color-border)] bg-white/60 px-4 py-3 text-sm focus:border-[color:var(--color-primary)] focus:bg-white focus:outline-none"
      />

      {error && <p className="text-xs text-[color:var(--color-error)]">{error}</p>}

      <div className="flex items-center justify-end">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Publicando…" : "Publicar reseña"}
        </Button>
      </div>
    </form>
  );
}

function CategoryRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--color-border)] bg-white/40 px-3 py-2 text-sm">
      <span className="text-[color:var(--color-text-primary)]">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = (hover || value) >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className={cn(
                "transition-colors",
                filled
                  ? "text-[color:var(--color-accent)]"
                  : "text-[color:var(--color-text-muted)]"
              )}
              aria-label={`${label}: ${n}`}
            >
              <Star size={16} className={filled ? "fill-current" : ""} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
