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
import { getLandingConfig } from "@/modules/admin/landing-config";

/**
 * Hero principal de la landing.
 *
 * Resolución de contenido (con fallback elegante a cada nivel):
 *   1. `LandingConfig` (DB)        — si SUPER_ADMIN editó algo.
 *   2. `SEASON_*` + `imagesForSeason()` — defaults por temporada.
 *   3. Texto hardcodeado            — última red de seguridad.
 *
 * Si DB está caída o el modelo no fue pusheado todavía,
 * `getLandingConfig()` devuelve null y la landing sigue igual.
 */
export async function Hero() {
  const [appDate, landing] = await Promise.all([
    getAppDateServer(),
    getLandingConfig(),
  ]);
  const season = currentSeason(appDate);
  const seasonImages = imagesForSeason(season);
  const seasonConfig = SEASON_CONFIG[season];

  // Overrides editables
  const heroTitle = landing?.heroTitle ?? null;
  const heroSubtitle = landing?.heroSubtitle ?? null;
  const ctaLabel = landing?.heroCtaLabel ?? "Ver cabañas";
  const ctaHref = landing?.heroCtaHref ?? "/cabins";
  const highlight = landing?.highlightText ?? null;
  const customSeasonImage = landing?.seasonalHeroes?.[season];
  const heroUrl =
    customSeasonImage ?? landing?.fallbackImage ?? seasonImages.hero.url;
  const heroAlt = customSeasonImage
    ? `Hero ${seasonConfig.label}`
    : seasonImages.hero.alt;
  const atmosphereOn = landing?.atmosphereEnabled ?? true;

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 pb-12">
      <div className="absolute inset-0 -z-10 bg-[color:var(--color-background-deep)]">
        <SafeImage
          src={heroUrl}
          alt={heroAlt}
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

      {atmosphereOn &&
        (season === "summer" ? (
          <AtmosphereParticlesLoader />
        ) : (
          <SeasonalAtmosphere season={season} />
        ))}

      <div className="container-page flex flex-1 flex-col justify-end gap-10 pt-20">
        <div className="hero-fade-up max-w-3xl space-y-6">
          <Badge tone="dark" className="backdrop-blur">
            <Compass size={12} strokeWidth={1.5} />
            {highlight ?? `Patagonia · ${seasonConfig.label}`}
          </Badge>
          <h1 className="heading-display text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.25)]">
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Despertá frente al lago,
                <br />
                rodeado de bosque nativo.
              </>
            )}
          </h1>
          <p className="max-w-xl text-base/relaxed text-white/85 md:text-lg/relaxed">
            {heroSubtitle ??
              "Cabañas boutique diseñadas para descansar, explorar y reconectar. Naturaleza patagónica con comodidad premium."}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <LinkButton href={ctaHref} variant="accent" size="lg">
              {ctaLabel}
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[color:var(--color-background)]" />
    </section>
  );
}
