import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Landing config — singleton (row con id = "default").
 *
 * Lectura: `getLandingConfig()` devuelve los overrides actuales o null
 * si no se cargó nunca. La landing es responsable de caer al hardcode
 * cuando el campo correspondiente es null.
 *
 * Escritura: `upsertLandingConfig(...)` reemplaza los campos enviados.
 * Para limpiar un campo, pasarlo como `null` explícito.
 */

export const LANDING_CONFIG_ID = "default";

export type AtmosphereIntensity = "LOW" | "MEDIUM" | "HIGH";

export type SeasonalHeroes = Partial<
  Record<"summer" | "autumn" | "winter" | "spring", string>
>;

export type LandingConfigRecord = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroCtaLabel: string | null;
  heroCtaHref: string | null;
  seasonalHeroes: SeasonalHeroes | null;
  highlightText: string | null;
  atmosphereEnabled: boolean;
  atmosphereIntensity: AtmosphereIntensity;
  fallbackImage: string | null;
};

export async function getLandingConfig(): Promise<LandingConfigRecord | null> {
  try {
    const row = await prisma.landingConfig.findUnique({
      where: { id: LANDING_CONFIG_ID },
    });
    if (!row) return null;
    return {
      heroTitle: row.heroTitle,
      heroSubtitle: row.heroSubtitle,
      heroCtaLabel: row.heroCtaLabel,
      heroCtaHref: row.heroCtaHref,
      seasonalHeroes: (row.seasonalHeroes as SeasonalHeroes | null) ?? null,
      highlightText: row.highlightText,
      atmosphereEnabled: row.atmosphereEnabled,
      atmosphereIntensity:
        (row.atmosphereIntensity as AtmosphereIntensity) ?? "MEDIUM",
      fallbackImage: row.fallbackImage,
    };
  } catch (err) {
    // Si el modelo no existe todavía (DB sin push), devolver null y la
    // landing usa los defaults hardcodeados. Robusto contra cold start.
    console.warn("[landing-config] read failed, falling back:", err);
    return null;
  }
}

export type UpsertLandingConfigInput = Partial<LandingConfigRecord> & {
  updatedById?: string;
};

export async function upsertLandingConfig(input: UpsertLandingConfigInput) {
  return prisma.landingConfig.upsert({
    where: { id: LANDING_CONFIG_ID },
    create: {
      id: LANDING_CONFIG_ID,
      heroTitle: input.heroTitle ?? null,
      heroSubtitle: input.heroSubtitle ?? null,
      heroCtaLabel: input.heroCtaLabel ?? null,
      heroCtaHref: input.heroCtaHref ?? null,
      seasonalHeroes: input.seasonalHeroes ?? undefined,
      highlightText: input.highlightText ?? null,
      atmosphereEnabled: input.atmosphereEnabled ?? true,
      atmosphereIntensity: input.atmosphereIntensity ?? "MEDIUM",
      fallbackImage: input.fallbackImage ?? null,
      updatedById: input.updatedById,
    },
    update: {
      ...(input.heroTitle !== undefined && { heroTitle: input.heroTitle }),
      ...(input.heroSubtitle !== undefined && {
        heroSubtitle: input.heroSubtitle,
      }),
      ...(input.heroCtaLabel !== undefined && {
        heroCtaLabel: input.heroCtaLabel,
      }),
      ...(input.heroCtaHref !== undefined && {
        heroCtaHref: input.heroCtaHref,
      }),
      ...(input.seasonalHeroes !== undefined && {
        seasonalHeroes: input.seasonalHeroes ?? undefined,
      }),
      ...(input.highlightText !== undefined && {
        highlightText: input.highlightText,
      }),
      ...(input.atmosphereEnabled !== undefined && {
        atmosphereEnabled: input.atmosphereEnabled,
      }),
      ...(input.atmosphereIntensity !== undefined && {
        atmosphereIntensity: input.atmosphereIntensity,
      }),
      ...(input.fallbackImage !== undefined && {
        fallbackImage: input.fallbackImage,
      }),
      ...(input.updatedById !== undefined && {
        updatedById: input.updatedById,
      }),
    },
  });
}
