import { Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SearchBar } from "@/components/booking/SearchBar";
import { SafeImage } from "@/components/ui/SafeImage";
import { AtmosphereParticlesLoader } from "@/components/three/AtmosphereParticlesLoader";
import { siteImages, blurDataURL } from "@/lib/images";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 pb-12">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[color:var(--color-background)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
      </div>

      <AtmosphereParticlesLoader />

      <div className="container-page flex flex-1 flex-col justify-end gap-10 pt-20">
        <div className="hero-fade-up max-w-3xl space-y-6">
          <Badge tone="dark" className="backdrop-blur">
            <Compass size={12} strokeWidth={1.5} />
            Patagonia · Temporada 2026
          </Badge>
          <h1 className="heading-display text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]">
            Despertá frente al lago,
            <br />
            rodeado de bosque nativo.
          </h1>
          <p className="max-w-xl text-base/relaxed text-white/85 md:text-lg/relaxed">
            Cabañas boutique diseñadas para descansar, explorar y reconectar.
            Naturaleza patagónica con comodidad premium.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href="/cabins" variant="accent" size="lg">
              Ver cabañas
            </LinkButton>
            <LinkButton
              href="/about"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:border-white"
            >
              La experiencia
            </LinkButton>
          </div>
        </div>

        <div className="hero-fade-up-delay w-full max-w-5xl">
          <SearchBar />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[color:var(--color-background)]" />
    </section>
  );
}
