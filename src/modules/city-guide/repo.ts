/**
 * City-guide repo (read-only sobre data.ts).
 *
 * No es `server-only` porque los datos son estáticos client-safe. Si en
 * el futuro se mueve a Prisma este archivo pasa a ser `import "server-only"`
 * y mantiene la misma API.
 */

import { CITIES, EXPERIENCES } from "./data";
import type { CityRecord, ExperienceRecord } from "./schemas";

export function listCities(): ReadonlyArray<CityRecord> {
  return CITIES;
}

export function getCityBySlug(slug: string): CityRecord | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function listExperiences(): ReadonlyArray<ExperienceRecord> {
  return EXPERIENCES;
}

export function listExperiencesByCity(
  citySlug: string
): ReadonlyArray<ExperienceRecord> {
  return EXPERIENCES.filter((e) => e.citySlug === citySlug);
}
