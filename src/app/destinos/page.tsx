import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Mountain,
  Trees,
  UtensilsCrossed,
  Car,
  Sailboat,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import {
  listCities,
  listExperiencesByCity,
} from "@/modules/city-guide/repo";
import { siteImages, blurDataURL } from "@/lib/images";

export const metadata: Metadata = {
  title: "Destinos · Guía",
  description:
    "Guía editorial para conocer Bariloche y la Patagonia: senderos, gastronomía, lagos y experiencias seleccionadas.",
};

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Compass }> = {
  outdoor: { label: "Senderos & outdoor", icon: Mountain },
  gastronomy: { label: "Gastronomía", icon: UtensilsCrossed },
  wellness: { label: "Bienestar", icon: Trees },
  culture: { label: "Cultura", icon: Compass },
  adventure: { label: "Aventura", icon: Sailboat },
};

/**
 * Página /destinos — guía editorial premium.
 *
 * Versión inicial: una ciudad principal (Bariloche) con experiencias
 * curadas, categorías y CTA a hospedajes. La estructura está pensada
 * para escalar a múltiples ciudades sin refactor: los datos vienen de
 * `@/modules/city-guide/repo` y el render itera sobre cualquier set
 * que reciba.
 */
export default function DestinosPage() {
  const cities = listCities();
  const main = cities[0]; // por ahora exhibimos la principal
  const others = cities.slice(1);
  const experiences = listExperiencesByCity(main.slug);

  return (
    <>
      {/* ───────────── Hero editorial ───────────── */}
      <section className="relative isolate flex min-h-[60svh] flex-col overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 -z-10 bg-[color:var(--color-background-deep)]">
          <SafeImage
            src={siteImages.heroPrimary.url}
            alt={siteImages.heroPrimary.alt}
            fill
            priority
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-[color:var(--color-background)]" />
        </div>
        <div className="container-page space-y-5">
          <Badge tone="dark" className="backdrop-blur">
            <Compass size={12} strokeWidth={1.5} />
            Guía Lakeview
          </Badge>
          <h1 className="heading-display max-w-3xl text-balance text-white">
            La Patagonia, curada para quienes ya saben qué buscan.
          </h1>
          <p className="max-w-2xl text-base/relaxed text-white/85">
            Senderos, gastronomía local, lagos y experiencias seleccionadas.
            Una guía pensada para complementar tu hospedaje, no para
            distraerte de él.
          </p>
        </div>
      </section>

      {/* ───────────── Ciudad principal ───────────── */}
      <section className="container-page space-y-10 py-20">
        <ScrollReveal>
          <p className="text-eyebrow flex items-center gap-1.5">
            <MapPin size={12} strokeWidth={2} />
            Ciudad destacada
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="editorial-headline max-w-2xl">
              {main.name}: {main.tagline.toLowerCase()}
            </h2>
            <LinkButton
              href={`/cabins?q=${encodeURIComponent(main.name)}`}
              variant="primary"
              size="md"
            >
              Ver hospedajes en {main.name}
              <ArrowRight size={14} strokeWidth={1.5} />
            </LinkButton>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="editorial-body max-w-3xl">{main.description}</p>
        </ScrollReveal>

        {/* Cards de experiencias */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map((e, i) => {
            const cat = CATEGORY_LABELS[e.category];
            const Icon = cat?.icon ?? Compass;
            return (
              <ScrollReveal key={e.slug} delay={i * 0.06}>
                <article className="surface-paper group flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
                      <Icon size={15} strokeWidth={1.5} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      {e.duration}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium tracking-tight">
                    {e.title}
                  </h3>
                  <p className="text-sm/relaxed text-[color:var(--color-text-secondary)]">
                    {e.summary}
                  </p>
                  <p className="mt-auto text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    {cat?.label ?? e.category}
                  </p>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* ───────────── Categorías ───────────── */}
      <section className="container-page space-y-8 pb-20">
        <ScrollReveal>
          <h2 className="editorial-headline max-w-2xl">
            Buscás algo específico.
          </h2>
        </ScrollReveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(CATEGORY_LABELS).map(([key, c]) => (
            <ScrollReveal key={key} delay={0.04}>
              <article className="surface-paper flex flex-col items-start gap-2 p-4">
                <c.icon
                  size={18}
                  strokeWidth={1.5}
                  className="text-[color:var(--color-primary)]"
                />
                <p className="text-sm font-medium">{c.label}</p>
              </article>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.05}>
            <article className="surface-paper flex flex-col items-start gap-2 p-4">
              <Car size={18} strokeWidth={1.5} className="text-[color:var(--color-primary)]" />
              <p className="text-sm font-medium">Alquiler de autos</p>
              <p className="text-[11px] text-[color:var(--color-text-muted)]">
                Próximamente con agencias asociadas.
              </p>
            </article>
          </ScrollReveal>
        </div>
      </section>

      {/* ───────────── Más ciudades (placeholder cuando crezca) ───────────── */}
      {others.length > 0 && (
        <section className="container-page space-y-6 pb-32">
          <ScrollReveal>
            <p className="text-eyebrow">Más destinos</p>
          </ScrollReveal>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c, i) => (
              <ScrollReveal key={c.slug} delay={i * 0.05}>
                <li className="surface-paper flex flex-col gap-1 p-5">
                  <p className="text-base font-medium tracking-tight">
                    {c.name}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    {c.tagline}
                  </p>
                </li>
              </ScrollReveal>
            ))}
          </ul>
        </section>
      )}

      {/* ───────────── CTA final ───────────── */}
      <section className="container-page pb-32">
        <div className="surface-dark flex flex-col items-start gap-4 rounded-[2rem] p-10 text-[color:var(--color-primary-foreground)]">
          <p className="text-[10px] uppercase tracking-[0.28em] opacity-70">
            ¿Listo para reservar?
          </p>
          <h2 className="editorial-headline !text-white max-w-2xl">
            Elegí tu base. Después armamos los días.
          </h2>
          <LinkButton href="/cabins" variant="accent" size="lg">
            Ver todos los hospedajes
            <ArrowRight size={14} strokeWidth={1.5} />
          </LinkButton>
        </div>
      </section>
    </>
  );
}
