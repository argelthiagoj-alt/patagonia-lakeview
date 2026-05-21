import { Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SearchBar } from "@/components/booking/SearchBar";
import { SafeImage } from "@/components/ui/SafeImage";
import { AtmosphereParticlesLoader } from "@/components/three/AtmosphereParticlesLoader";
import { SeasonalAtmosphere } from "@/components/three/SeasonalAtmosphere";
import { blurDataURL } from "@/lib/images";
import { getAppDateServer } from "@/modules/demo-tools/date";
import { currentSeason } from "@/modules/seasonal-theme/helpers";
import { imagesForSeason } from "@/modules/seasonal-theme/images";
import { SEASON_CONFIG } from "@/modules/seasonal-theme/config";

export async function Hero() {
  const season = currentSeason(await getAppDateServer());
  const images = imagesForSeason(season);
  const config = SEASON_CONFIG[season];
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 -z-10 bg-[color:var(--color-background-deep)]">
        <SafeImage
          src={images.hero.url}
          alt={images.hero.alt}
          fill
          priority
          placeholder="blur"
          blurDataURL={blurDataURL}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[color:var(--color-background)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-black/10" />
      </div>

      {/* Verano: partículas Three.js suaves; otoño/invierno/primavera:
          animaciones CSS livianas con prefers-reduced-motion gate. */}
      {season === "summer" ? (
        <AtmosphereParticlesLoader />
      ) : (
        <SeasonalAtmosphere season={season} />
      )}

      <div className="container-page flex flex-1 flex-col justify-end gap-10 pt-20">
        <div className="hero-fade-up max-w-3xl space-y-6">
          <Badge tone="dark" className="backdrop-blur">
            <Compass size={12} strokeWidth={1.5} />
            Patagonia · {config.label}
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

      {/* Fade inferior breve: lo justo para coser con la siguiente sección
          sin tapar el SearchBar. Antes era h-32 y velaba los inputs de
          fecha. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[color:var(--color-background)]" />
    </section>
  );
}
