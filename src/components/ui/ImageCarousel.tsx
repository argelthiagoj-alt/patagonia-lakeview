"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import { blurDataURL, type ImageAsset } from "@/lib/images";
import { cn } from "@/lib/utils";

/**
 * Carousel premium reutilizable.
 *
 * - Mobile: swipe nativo vía `scroll-snap` (sin librerías ni JS de touch).
 * - Desktop: flechas izquierda/derecha que avanzan 1 slide.
 * - Dots clickeables debajo (ocultos si hay una sola imagen).
 * - Lazy loading: Next/Image con `loading="lazy"` salvo la primera
 *   (`priority` opcional).
 * - Aspecto configurable (`aspect-[16/10]` por default — premium pero
 *   no demasiado alto).
 * - Si hay una sola imagen, se renderiza un único frame sin controles.
 */
export function ImageCarousel({
  images,
  aspectClassName = "aspect-[16/10]",
  rounded = "rounded-3xl",
  priority = false,
  sizes = "(min-width: 1024px) 60vw, 100vw",
}: {
  images: ImageAsset[];
  aspectClassName?: string;
  rounded?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Sync active dot cuando el usuario hace swipe.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || images.length <= 1) return;
    const onScroll = () => {
      const w = el.clientWidth;
      if (w === 0) return;
      const i = Math.round(el.scrollLeft / w);
      setActive(Math.max(0, Math.min(images.length - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [images.length]);

  function go(delta: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.max(
      0,
      Math.min(images.length - 1, active + delta)
    );
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  function jumpTo(i: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  if (images.length === 0) return null;

  // Fallback: una sola imagen, sin controles.
  if (images.length === 1) {
    const img = images[0];
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-[color:var(--color-surface-muted)]",
          aspectClassName,
          rounded
        )}
      >
        <SafeImage
          src={img.url}
          alt={img.alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative group", rounded, "overflow-hidden")}>
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          aspectClassName
        )}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="relative h-full w-full shrink-0 snap-center snap-always"
          >
            <SafeImage
              src={img.url}
              alt={img.alt}
              fill
              sizes={sizes}
              priority={priority && i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={blurDataURL}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Flechas (sólo desktop con hover; en mobile se usa swipe). */}
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => go(-1)}
        disabled={active === 0}
        className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] transition group-hover:flex disabled:opacity-40 md:flex md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => go(1)}
        disabled={active === images.length - 1}
        className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[color:var(--color-text-primary)] shadow-[var(--shadow-soft)] transition group-hover:flex disabled:opacity-40 md:flex md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a imagen ${i + 1}`}
            onClick={() => jumpTo(i)}
            className={cn(
              "pointer-events-auto h-1.5 rounded-full transition-all",
              i === active
                ? "w-6 bg-white"
                : "w-1.5 bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}
