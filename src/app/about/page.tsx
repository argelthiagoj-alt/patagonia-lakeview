import type { Metadata } from "next";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages, blurDataURL } from "@/lib/images";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "La experiencia",
  description:
    "Patagonia Lakeview es una colección de cabañas boutique frente al lago, pensadas para descansar bien.",
};

export default function AboutPage() {
  return (
    <article className="pt-28 md:pt-32">
      <section className="container-page space-y-8 pb-16">
        <p className="text-eyebrow">Nuestra historia</p>
        <h1 className="heading-display max-w-3xl text-balance">
          Cabañas pensadas alrededor del lago, del bosque y del silencio.
        </h1>
        <p className="max-w-2xl text-base/relaxed text-[color:var(--color-text-secondary)] md:text-lg/relaxed">
          Patagonia Lakeview empezó con una idea simple: hacer que descansar
          vuelva a ser un acto consciente. Elegimos terrenos con vista,
          construimos con materiales locales y diseñamos cada interior con
          calma. No tenemos prisa, y queremos que nuestros huéspedes tampoco la
          tengan.
        </p>
      </section>

      <section className="container-page">
        <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem]">
          <SafeImage
            src={siteImages.aboutLake.url}
            alt={siteImages.aboutLake.alt}
            fill
            placeholder="blur"
            blurDataURL={blurDataURL}
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="container-page grid gap-12 py-24 md:grid-cols-3">
        <div className="space-y-3">
          <h2 className="text-xl font-medium">Materiales</h2>
          <p className="text-sm/relaxed text-[color:var(--color-text-secondary)]">
            Madera nativa, piedra local, hierro forjado y textiles naturales.
            Cada elemento envejece bien.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-medium">Atención humana</h2>
          <p className="text-sm/relaxed text-[color:var(--color-text-secondary)]">
            Un anfitrión por estadía. Recomendaciones, transfers, reservas
            externas. Te acompañamos sin invadir.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-medium">Lugar</h2>
          <p className="text-sm/relaxed text-[color:var(--color-text-secondary)]">
            Trabajamos con productores y guías locales. Lo que ofrecemos viene
            del lugar al que llegás.
          </p>
        </div>
      </section>

      <section className="container-page pb-32">
        <div className="surface-paper flex flex-col items-start gap-6 p-10 md:flex-row md:items-center md:justify-between md:p-14">
          <div className="space-y-2">
            <h2 className="text-2xl font-medium md:text-3xl">¿Listo para venir?</h2>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Mirá la disponibilidad de la temporada o escribinos directamente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/cabins" variant="primary" size="lg">
              Ver cabañas
            </LinkButton>
            <LinkButton href="/contact" variant="outline" size="lg">
              Contacto
            </LinkButton>
          </div>
        </div>
      </section>
    </article>
  );
}
