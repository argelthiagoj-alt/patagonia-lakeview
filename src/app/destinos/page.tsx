import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { listPublishedDestinations } from "@/modules/city-guide/repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinos · Guía Patagonia",
  description:
    "Hub turístico por ciudad: senderos, restaurantes, alquiler de ski, aventuras, bienestar y tiendas.",
};

/**
 * /destinos — hub de ciudades.
 *
 * Placeholder funcional contra el nuevo repo Prisma. Fase 4 va a
 * reemplazar este archivo por la versión editorial completa.
 */
export default async function DestinosPage() {
  const cities = await listPublishedDestinations().catch(() => []);

  return (
    <div className="container-page space-y-12 pt-28 pb-24">
      <header className="space-y-3">
        <p className="text-eyebrow flex items-center gap-1.5">
          <Compass size={12} strokeWidth={2} />
          Patagonia · Guía
        </p>
        <h1 className="heading-section">Destinos</h1>
        <p className="max-w-2xl text-base text-[color:var(--color-text-secondary)]">
          Senderos, mesas, agencias y rincones para descubrir cada ciudad.
        </p>
      </header>

      {cities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[color:var(--color-border)] bg-white/40 p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
          La guía se está armando. Volvé pronto.
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c) => (
            <li key={c.id}>
              <Link
                href={`/destinos/${c.slug}`}
                className="surface-paper block space-y-3 p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
              >
                <p className="text-eyebrow">{c.tagline ?? "Destino"}</p>
                <h2 className="text-2xl font-medium tracking-tight">
                  {c.name}
                </h2>
                <p className="line-clamp-3 text-sm text-[color:var(--color-text-secondary)]">
                  {c.shortDescription ?? c.longDescription}
                </p>
                <p className="text-xs text-[color:var(--color-text-muted)]">
                  {c._count.items}{" "}
                  {c._count.items === 1 ? "lugar" : "lugares"} en la guía
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
