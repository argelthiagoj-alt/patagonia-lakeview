"use client";

import { useMemo, useState } from "react";
import { BedDouble, Users } from "lucide-react";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import type { ImageAsset } from "@/lib/images";
import { formatCurrency, cn } from "@/lib/utils";

type Room = {
  id: string;
  name: string;
  description: string | null;
  pricePerNight: number;
  maxGuests: number;
  totalUnits: number;
  amenities: string[];
  beds: { type: string; quantity: number }[];
  images: ImageAsset[];
};

/**
 * Listado público de habitaciones de un hotel. Tabs en mobile + lista en
 * desktop. La habitación seleccionada muestra su carousel propio; si no
 * tiene imágenes cargadas, cae al carousel del hotel padre.
 */
export function HotelRooms({
  rooms,
  fallbackImages,
}: {
  rooms: Room[];
  fallbackImages: ImageAsset[];
}) {
  const [activeId, setActiveId] = useState<string>(rooms[0]?.id ?? "");
  const active = useMemo(
    () => rooms.find((r) => r.id === activeId) ?? rooms[0],
    [rooms, activeId]
  );
  if (!active) return null;

  const carouselImages =
    active.images.length > 0 ? active.images : fallbackImages;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-medium tracking-tight">Habitaciones</h2>

      {/* Pills selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {rooms.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActiveId(r.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition",
              r.id === active.id
                ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
                : "border-[color:var(--color-border)] bg-white/60 text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)]"
            )}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-start">
        <ImageCarousel images={carouselImages} aspectClassName="aspect-[16/10]" />

        <div className="surface-paper space-y-3 p-5 sm:p-6">
          <header className="space-y-1">
            <p className="text-base font-medium tracking-tight">
              {active.name}
            </p>
            {active.description && (
              <p className="text-sm/relaxed text-[color:var(--color-text-secondary)]">
                {active.description}
              </p>
            )}
          </header>

          <div className="grid grid-cols-2 gap-3 text-xs text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} strokeWidth={1.5} />
              Hasta {active.maxGuests} huéspedes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={12} strokeWidth={1.5} />
              {active.beds.reduce((s, b) => s + b.quantity, 0) || "—"} camas
            </span>
          </div>

          {active.amenities.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {active.amenities.slice(0, 8).map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)]"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-end justify-between border-t border-[color:var(--color-border)] pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                Desde
              </p>
              <p className="text-2xl font-medium">
                {formatCurrency(active.pricePerNight)}
                <span className="ml-1 text-xs font-normal text-[color:var(--color-text-secondary)]">
                  / noche
                </span>
              </p>
            </div>
            <p className="text-xs text-[color:var(--color-text-secondary)]">
              {active.totalUnits} unidades disponibles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
