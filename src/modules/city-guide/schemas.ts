import { z } from "zod";

/**
 * City-guide schemas. Validan la data estática de `data.ts`. No hay DB
 * todavía; si en el futuro se migra a CRUD se reaprovechan estos schemas.
 */

export const citySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(20),
  heroImage: z.string().url().or(z.string().startsWith("/")),
});

export type CityRecord = z.infer<typeof citySchema>;

export const experienceSchema = z.object({
  slug: z.string().min(1),
  citySlug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  duration: z.string().min(1),
  category: z.enum([
    "outdoor",
    "gastronomy",
    "wellness",
    "culture",
    "adventure",
  ]),
});

export type ExperienceRecord = z.infer<typeof experienceSchema>;
