"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botón coraz贸n para guardar/quitar publicaci贸n como favorito.
 * Optimistic toggle. Si el server rechaza (401, etc) revierte.
 */
export function FavoriteButton({
  cabinId,
  initialFavored,
  loggedIn,
  className,
}: {
  cabinId: string;
  initialFavored: boolean;
  loggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [favored, setFavored] = useState(initialFavored);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    const next = !favored;
    setFavored(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ cabinId }),
        });
        if (!res.ok) {
          setFavored(!next);
        }
      } catch {
        setFavored(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={favored ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={favored}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white/85 backdrop-blur transition hover:border-[color:var(--color-primary)]",
        favored && "border-[color:var(--color-accent)]",
        className
      )}
    >
      <Heart
        size={14}
        strokeWidth={1.75}
        className={cn(
          "transition-colors",
          favored
            ? "fill-[color:var(--color-accent)] text-[color:var(--color-accent)]"
            : "text-[color:var(--color-text-secondary)]"
        )}
      />
    </button>
  );
}
