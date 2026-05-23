"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL } from "@/lib/images";
import {
  TOURISM_TYPE_LABELS,
  type TourismTypeKey,
} from "@/modules/city-guide/schemas";
import { cn } from "@/lib/utils";

export type FeaturedItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: TourismTypeKey;
  image: string | null;
};

/**
 * Carrusel premium de destacados de una ciudad. Mezcla categorías de
 * UNA sola ciudad (el server filtra por destinationSlug antes de pasar
 * los items). Scroll-snap nativo + flechas en desktop + dots.
 *
 * Mobile: swipe; cada card ocupa ~85vw. Desktop: 3 cards visibles.
 */
export function FeaturedCarousel({
  items,
  citySlug,
}: {
  items: FeaturedItem[];
  citySlug: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length <= 1) return;
    const onScroll = () => {
      const cardWidth = el.firstElementChild?.clientWidth ?? el.clientWidth;
      if (cardWidth === 0) return;
      const i = Math.round(el.scrollLeft / cardWidth);
      setActive(Math.max(0, Math.min(items.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  function go(delta: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? el.clientWidth;
    el.scrollBy({ left: cardWidth * delta, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <header className="container-page mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-eyebrow flex items-center gap-1.5">
            <Star size={11} strokeWidth={1.75} className="fill-current" />
            Destacados
          </p>
          <h2 className="heading-section !text-3xl md:!text-4xl">
            Lo imperdible
          </h2>
        </div>
        {items.length > 1 && (
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Anterior"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
            >
              <ChevronLeft size={16} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Siguiente"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/70 text-[color:var(--color-text-primary)] transition hover:border-[color:var(--color-primary)]"
            >
              <ChevronRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </header>

      <div
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[5vw] pb-2 md:gap-6 md:px-[max(2rem,calc((100vw-72rem)/2))]",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((it) => (
          <Link
            key={it.id}
            href={`/destinos/${citySlug}/lugar/${it.slug}`}
            className="group relative aspect-[4/5] w-[85vw] shrink-0 snap-center overflow-hidden rounded-[2rem] sm:w-[55vw] md:aspect-[3/4] md:w-[28vw]"
          >
            {it.image && (
              <SafeImage
                src={it.image}
                alt={it.title}
                fill
                sizes="(min-width: 768px) 28vw, 85vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-5 text-white">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/80">
                {TOURISM_TYPE_LABELS[it.type]}
              </p>
              <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                {it.title}
              </h3>
              <p className="line-clamp-2 max-w-md text-xs/relaxed text-white/85 md:text-sm/relaxed">
                {it.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 && (
        <div className="container-page mt-4 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active
                  ? "w-6 bg-[color:var(--color-text-primary)]"
                  : "w-1.5 bg-[color:var(--color-border)]"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
