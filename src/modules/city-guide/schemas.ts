import { z } from "zod";

/**
 * Destinations / TourismItem Zod schemas. Client-safe.
 */

export const TOURISM_TYPES = [
  "TRAIL",
  "RESTAURANT",
  "SKI_RENTAL",
  "ADVENTURE",
  "KEY_PLACE",
  "STORE",
] as const;

export type TourismTypeKey = (typeof TOURISM_TYPES)[number];

export const tourismTypeSchema = z.enum(TOURISM_TYPES);

export const TOURISM_TYPE_LABELS: Record<TourismTypeKey, string> = {
  TRAIL: "Senderos",
  RESTAURANT: "Restaurantes",
  SKI_RENTAL: "Ski rentals",
  ADVENTURE: "Aventuras",
  KEY_PLACE: "Lugares clave",
  STORE: "Tiendas",
};

export const TOURISM_TYPE_SLUGS: Record<TourismTypeKey, string> = {
  TRAIL: "senderos",
  RESTAURANT: "restaurantes",
  SKI_RENTAL: "ski",
  ADVENTURE: "aventuras",
  KEY_PLACE: "bienestar",
  STORE: "tiendas",
};

export function tourismTypeFromSlug(slug: string): TourismTypeKey | null {
  const entry = Object.entries(TOURISM_TYPE_SLUGS).find(([, v]) => v === slug);
  return (entry?.[0] as TourismTypeKey | undefined) ?? null;
}

/* ─────────── Destination ─────────── */

export const destinationSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Sólo minúsculas, números y guiones"),
  name: z.string().min(2).max(120),
  tagline: z.string().max(200).optional().nullable(),
  shortDescription: z.string().max(280).optional().nullable(),
  longDescription: z.string().min(20).max(4000),
  bannerImage: z.string().max(2_000_000).optional().nullable(),
  galleryImages: z.array(z.string().min(1)).max(20).default([]),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  isPublished: z.coerce.boolean().default(true),
  order: z.coerce.number().int().min(0).max(999).default(0),
});

export type DestinationInput = z.infer<typeof destinationSchema>;

/* ─────────── TourismItem ─────────── */

export const tourismItemImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().max(180).optional().nullable(),
});

export const tourismItemSchema = z.object({
  type: tourismTypeSchema,
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Sólo minúsculas, números y guiones"),
  title: z.string().min(2).max(160),
  description: z.string().min(10).max(4000),
  mainImage: z.string().max(2_000_000).optional().nullable(),
  images: z.array(tourismItemImageSchema).max(15).default([]),
  locationName: z.string().max(160).optional().nullable(),
  address: z.string().max(240).optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  featured: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
  order: z.coerce.number().int().min(0).max(999).default(0),

  // Contactos compartidos
  phone: z.string().max(60).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  instagram: z.string().max(160).optional().nullable(),
  contact: z.string().max(160).optional().nullable(),
  openingHours: z.string().max(160).optional().nullable(),

  // TRAIL / ADVENTURE
  lengthKm: z.coerce.number().min(0).max(1000).optional().nullable(),
  elevation: z.coerce.number().int().min(0).max(10000).optional().nullable(),
  difficulty: z.string().max(60).optional().nullable(),
  duration: z.string().max(80).optional().nullable(),
  idealSeason: z.string().max(120).optional().nullable(),

  // RESTAURANT
  specialty: z.string().max(120).optional().nullable(),
  priceRange: z.string().max(60).optional().nullable(),

  // RESTAURANT / SKI_RENTAL / STORE
  rating: z.coerce.number().min(0).max(5).optional().nullable(),

  // SKI_RENTAL
  equipmentTypes: z.array(z.string().min(1)).max(20).default([]),

  // ADVENTURE
  experienceType: z.string().max(120).optional().nullable(),
  meetingPoint: z.string().max(240).optional().nullable(),

  // Taxonomías
  keyPlaceCategoryId: z.string().optional().nullable(),
  storeTypeId: z.string().optional().nullable(),
});

export type TourismItemInput = z.infer<typeof tourismItemSchema>;

/* ─────────── Auxiliares editables ─────────── */

export const taxonomyEntrySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Sólo minúsculas, números y guiones"),
  name: z.string().min(2).max(120),
});

export type TaxonomyEntryInput = z.infer<typeof taxonomyEntrySchema>;
