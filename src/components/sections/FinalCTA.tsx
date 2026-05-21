import { LinkButton } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { siteImages, blurDataURL } from "@/lib/images";

export function FinalCTA() {
  return (
    <section className="container-page pb-24 md:pb-32">
      <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-[color:var(--color-border)]">
        <SafeImage
          src={siteImages.testimonialBackdrop.url}
          alt={siteImages.testimonialBackdrop.alt}
          fill
          sizes="100vw"
          placeholder="blur"
          blurDataURL={blurDataURL}
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />

        <div className="grid gap-8 px-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:px-14 md:py-24">
          <div className="space-y-5 text-white">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              Tu próxima estadía
            </p>
            <h2 className="heading-section text-balance text-white">
              Reservá una cabaña frente al lago.
              <br className="hidden md:block" /> Empezá a desconectar antes de
              llegar.
            </h2>
            <p className="max-w-lg text-base/relaxed text-white/80">
              Disponibilidad real, atención humana y una experiencia pensada
              de principio a fin.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <LinkButton href="/cabins" variant="accent" size="xl">
              Ver cabañas disponibles
            </LinkButton>
            <LinkButton
              href="/soporte"
              variant="ghost"
              size="md"
              className="text-white hover:bg-white/10"
            >
              Hablar con soporte
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
