import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { siteImages, blurDataURL } from "@/lib/images";

export const metadata: Metadata = {
  title: "Experiencia",
  description:
    "Patagonia Lakeview nace para descubrir refugios, paisajes y experiencias que transforman un viaje en un recuerdo personal.",
};

/**
 * /about — the emotional, editorial heart of the brand.
 * Built as a slow, cinematic page: full-bleed imagery, generous whitespace,
 * editorial serif for headlines, no marketplace vibes.
 */
export default function ExperiencePage() {
  return (
    <article className="overflow-hidden">
      {/* ───────────── 1. Hero ───────────── */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0 -z-10">
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
          {/* Cinematic warm vignette: dark at the foot for legibility, soft at the top */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/70" />
        </div>

        <div className="container-page pb-16 pt-32 md:pb-24 md:pt-40">
          <ScrollReveal>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/85 backdrop-blur">
              <Compass size={12} strokeWidth={1.5} />
              Patagonia · Experiencia
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <h1 className="editorial-display max-w-3xl text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.35)]">
              Lugares a los que querés{" "}
              <em className="font-serif italic font-normal">volver</em>.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-8 max-w-xl text-base/relaxed text-white/85 md:text-lg/relaxed">
              Patagonia Lakeview nace para descubrir refugios, paisajes y
              experiencias que transforman un viaje en un recuerdo personal.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <LinkButton href="/cabins" variant="accent" size="lg">
                Explorar cabañas
                <ArrowRight size={16} strokeWidth={1.5} />
              </LinkButton>
              <LinkButton
                href="/availability"
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:border-white"
              >
                Descubrir destinos
              </LinkButton>
            </div>
          </ScrollReveal>
        </div>

        {/* Subtle scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="h-10 w-px animate-pulse bg-white/40" />
        </div>
      </section>

      {/* ───────────── 2. Manifiesto ───────────── */}
      <section className="container-page py-32 md:py-48">
        <div className="mx-auto max-w-3xl space-y-12">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
              Manifiesto
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <p className="editorial-quote">
              No creemos que viajar sea solo reservar un lugar.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="editorial-body">
              Creemos en esos paisajes que cambian el ritmo de las cosas. En el
              silencio después del ruido. En las vistas que te obligan a frenar.
              En los refugios que, por unos días, se sienten propios.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="editorial-body">
              Patagonia Lakeview nace para presentar la Patagonia desde una
              mirada más calma, cuidada y personal.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="editorial-quote text-[color:var(--color-text-primary)]">
              No se trata solo de hospedarse.
              <br />
              <em className="font-serif italic">
                Se trata de encontrar un lugar al que quieras volver.
              </em>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ───────────── 3. Más que cabañas ───────────── */}
      <section className="container-page pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <ScrollReveal>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                Más que cabañas
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="editorial-headline">
                Cada destino tiene su propio ritmo.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="editorial-body">
                Un lago en invierno no se siente igual que en verano. Un bosque
                con nieve no cuenta la misma historia que un atardecer de
                primavera.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="editorial-body">
                Por eso Patagonia Lakeview no presenta solo cabañas: presenta
                contextos, momentos y formas de vivir la Patagonia.
              </p>
            </ScrollReveal>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              {
                eyebrow: "01",
                title: "Refugios",
                body: "Cabañas pensadas como espacios para bajar el ritmo. Madera, piedra, fuego.",
                image: siteImages.experienceInterior,
              },
              {
                eyebrow: "02",
                title: "Destinos",
                body: "Bariloche, Villa La Angostura, El Bolsón, San Martín. Cada uno con su carácter.",
                image: siteImages.aboutLake,
              },
              {
                eyebrow: "03",
                title: "Temporadas",
                body: "Otoño en silencio. Invierno con nieve. Verano de lagos. Primavera lenta.",
                image: siteImages.experienceMountain,
              },
              {
                eyebrow: "04",
                title: "Experiencias",
                body: "Senderos, comidas locales, fuego al atardecer. Recomendaciones humanas.",
                image: siteImages.aboutForest,
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.08} className="h-full">
                <article className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                  <div className="relative aspect-[5/6] overflow-hidden">
                    <SafeImage
                      src={card.image.url}
                      alt={card.image.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      placeholder="blur"
                      blurDataURL={blurDataURL}
                      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 text-[10px] uppercase tracking-[0.24em] text-white/80">
                      {card.eyebrow}
                    </span>
                  </div>
                  <div className="px-6 pb-6 pt-1">
                    <h3 className="editorial-headline !text-2xl !leading-tight md:!text-[1.75rem]">
                      {card.title}
                    </h3>
                    <p className="mt-2 max-w-xs text-sm/relaxed text-[color:var(--color-text-secondary)]">
                      {card.body}
                    </p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────── 4. Lujo silencioso ───────────── */}
      <section className="surface-dark relative overflow-hidden py-32 md:py-48">
        <div className="absolute inset-0 -z-0 opacity-30">
          <SafeImage
            src={siteImages.aboutFire.url}
            alt={siteImages.aboutFire.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-background-deep)] via-[color:var(--color-background-deep)]/85 to-[color:var(--color-background-deep)]" />
        </div>

        <div className="container-page relative">
          <div className="mx-auto max-w-3xl space-y-10 text-center">
            <ScrollReveal>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">
                Lujo silencioso
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="editorial-headline text-white">
                No buscamos un lujo distante ni ostentoso.
                <br />
                <em className="font-serif italic">
                  Buscamos una sensación más simple y más difícil.
                </em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="editorial-body mx-auto !max-w-2xl text-white/75">
                Comodidad, calma, buen diseño y confianza. Un lujo cálido. Humano.
                Sin ruido.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ───────────── 5. Tecnología invisible ───────────── */}
      <section className="container-page py-32 md:py-48">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div className="space-y-6">
            <ScrollReveal>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                Tecnología invisible
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.05}>
              <h2 className="editorial-headline">
                La plataforma desaparece para que aparezca el lugar.
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="editorial-body">
                La tecnología está para hacer el camino más simple: encontrar,
                comparar, guardar, reservar y confiar.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <p className="editorial-quote !text-2xl md:!text-[1.75rem]">
                Pero el centro nunca es la plataforma.
                <br />
                <em className="font-serif italic">
                  El centro es el lugar al que vas.
                </em>
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.1}>
            <figure className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)]">
              <SafeImage
                src={siteImages.experienceInterior.url}
                alt={siteImages.experienceInterior.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-cover"
              />
            </figure>
          </ScrollReveal>
        </div>
      </section>

      {/* ───────────── 6. Confianza / verificación ───────────── */}
      <section className="relative overflow-hidden bg-[color:var(--color-surface)] py-32 md:py-48">
        <div className="container-page">
          <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-24">
            <ScrollReveal>
              <figure className="relative aspect-[16/11] overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)]">
                <SafeImage
                  src={siteImages.testimonialBackdrop.url}
                  alt={siteImages.testimonialBackdrop.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  placeholder="blur"
                  blurDataURL={blurDataURL}
                  className="object-cover"
                />
              </figure>
            </ScrollReveal>

            <div className="space-y-6">
              <ScrollReveal>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--color-text-secondary)]">
                  Confianza
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.05}>
                <h2 className="editorial-headline">
                  Cada lugar, presentado como merece ser visto.
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="editorial-body">
                  Queremos que cada alojamiento se vea con claridad: información
                  precisa, imágenes cuidadas, anfitriones verificados cuando
                  corresponde.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="editorial-body">
                  Y que cada viajero pueda elegir con tres cosas a la vez:
                  claridad, confianza y deseo.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 7. Cierre emocional ───────────── */}
      <section className="relative isolate flex min-h-[80svh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <SafeImage
            src={siteImages.aboutLake.url}
            alt={siteImages.aboutLake.alt}
            fill
            sizes="100vw"
            placeholder="blur"
            blurDataURL={blurDataURL}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/65" />
        </div>

        <div className="container-page py-24 text-center">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
              Cierre
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 className="editorial-display mx-auto mt-6 max-w-3xl text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.45)]">
              La Patagonia no se visita solamente.
              <br />
              <em className="font-serif italic">Se recuerda.</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/cabins" variant="accent" size="lg">
                Explorar cabañas
                <ArrowRight size={16} strokeWidth={1.5} />
              </LinkButton>
              <LinkButton
                href="/availability"
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:border-white"
              >
                Encontrar mi lugar
              </LinkButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </article>
  );
}
