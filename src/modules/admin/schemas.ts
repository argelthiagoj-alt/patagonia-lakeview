import { z } from "zod";

/**
 * Schemas Zod del módulo admin. Client-safe.
 */

const seasonImageUrl = z
  .string()
  .max(500)
  .refine(
    (v) =>
      v === "" ||
      /^https?:\/\//i.test(v) ||
      v.startsWith("/") ||
      v.startsWith("data:image/"),
    "Debe ser una URL https://, una ruta /local o vacío"
  )
  .optional()
  .or(z.literal(""));

export const landingConfigSchema = z.object({
  heroTitle: z.string().max(160).optional().or(z.literal("")),
  heroSubtitle: z.string().max(280).optional().or(z.literal("")),
  heroCtaLabel: z.string().max(40).optional().or(z.literal("")),
  heroCtaHref: z.string().max(200).optional().or(z.literal("")),
  highlightText: z.string().max(280).optional().or(z.literal("")),
  atmosphereEnabled: z.coerce.boolean().default(true),
  atmosphereIntensity: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  fallbackImage: seasonImageUrl,
  seasonalHeroes: z
    .object({
      summer: seasonImageUrl,
      autumn: seasonImageUrl,
      winter: seasonImageUrl,
      spring: seasonImageUrl,
    })
    .partial()
    .optional(),
});

export type LandingConfigInput = z.infer<typeof landingConfigSchema>;
