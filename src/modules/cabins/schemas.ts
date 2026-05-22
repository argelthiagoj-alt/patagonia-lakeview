import { z } from "zod";

/**
 * Zod schemas for the cabin domain. Pure module — safe to import from
 * client components (no Prisma, no Node-only APIs).
 */

export const bedTypeEnum = z.enum([
  "TWIN",
  "DOUBLE",
  "QUEEN",
  "KING",
  "SOFA_BED",
  "BUNK",
]);

export type BedType = z.infer<typeof bedTypeEnum>;

export const propertyTypeEnum = z.enum(["CABIN", "HOTEL"]);
export type PropertyType = z.infer<typeof propertyTypeEnum>;

/**
 * Lista canónica de features booleanas que viven directo en Cabin.
 * Sirve a la vez como source-of-truth de columnas DB, claves del form
 * admin y opciones del panel de filtros públicos.
 */
export const FEATURE_KEYS = [
  "hasTv",
  "hasWifi",
  "hasHeating",
  "hasAirConditioning",
  "hasPhoneSignal",
  "hasRestaurant",
  "hasElevator",
  "has24hReception",
  "hasRoomService",
  "hasBreakfast",
  "hasSpa",
  "hasGym",
  "hasPool",
  "hasParking",
  "hasAccessibility",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  hasTv: "TV",
  hasWifi: "Wi-Fi",
  hasHeating: "Calefacción",
  hasAirConditioning: "Aire acondicionado",
  hasPhoneSignal: "Cobertura telefónica",
  hasRestaurant: "Restaurant",
  hasElevator: "Ascensor",
  has24hReception: "Recepción 24h",
  hasRoomService: "Room service",
  hasBreakfast: "Desayuno",
  hasSpa: "Spa",
  hasGym: "Gimnasio",
  hasPool: "Piscina",
  hasParking: "Estacionamiento",
  hasAccessibility: "Accesibilidad",
};

/** Features típicamente hoteleras — el form sólo las muestra si propertyType=HOTEL. */
export const HOTEL_ONLY_FEATURES: ReadonlyArray<FeatureKey> = [
  "hasRestaurant",
  "hasElevator",
  "has24hReception",
  "hasRoomService",
  "hasBreakfast",
  "hasSpa",
  "hasGym",
  "hasPool",
  "hasParking",
  "hasAccessibility",
];

const featuresShape = Object.fromEntries(
  FEATURE_KEYS.map((k) => [k, z.coerce.boolean().default(false)])
) as Record<FeatureKey, z.ZodDefault<z.ZodBoolean>>;

export const featuresSchema = z.object(featuresShape);
export type FeaturesInput = z.infer<typeof featuresSchema>;

export const roomImageSchema = z.object({
  url: z
    .string()
    .min(1, "URL requerida")
    .refine(
      (v) =>
        v.startsWith("data:image/") ||
        /^https?:\/\//i.test(v) ||
        v.startsWith("/"),
      "Debe ser una URL https://, una ruta /local o una imagen subida"
    ),
  alt: z.string().max(180).optional().nullable(),
});
export type RoomImageInput = z.infer<typeof roomImageSchema>;

export const roomTypeSchema = z.object({
  id: z.string().optional(), // present cuando se edita un room existente
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  pricePerNight: z.coerce.number().int().min(1).max(100000),
  maxGuests: z.coerce.number().int().min(1).max(30),
  totalUnits: z.coerce.number().int().min(1).max(50),
  amenities: z.array(z.string().min(1)).max(20).default([]),
  beds: z
    .array(
      z.object({
        type: bedTypeEnum,
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .max(8)
    .default([]),
  images: z.array(roomImageSchema).max(15).default([]),
});
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;

export const cabinSchema = z.object({
  // identidad
  title: z.string().min(2, "Mínimo 2 caracteres").max(120),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  location: z.string().min(2).max(120),
  shortDescription: z.string().min(10, "Mínimo 10 caracteres").max(180),
  description: z.string().min(20, "Mínimo 20 caracteres"),

  // tipo de publicación
  propertyType: propertyTypeEnum.default("CABIN"),

  // ficha técnica
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  maxGuests: z.coerce.number().int().min(1).max(30),
  pricePerNight: z.coerce.number().int().min(1).max(100000),
  cleaningFee: z.coerce.number().int().min(0).max(10000).default(0),
  totalUnits: z.coerce.number().int().min(1).max(50).default(1),
  lakeView: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  highlights: z.array(z.string().min(1).max(120)).max(10).default([]),
  amenityKeys: z.array(z.string().min(1)).default([]),

  // geo (opcional)
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),

  // reglas / horarios / política
  cancellationPolicy: z.string().max(2000).optional().nullable(),
  houseRules: z.string().max(2000).optional().nullable(),
  checkInTime: z.string().max(10).optional().nullable(),
  checkOutTime: z.string().max(10).optional().nullable(),

  // host (sólo se muestra en CABIN; admin puede igual cargarlo)
  hostDisplayName: z.string().max(120).optional().nullable(),
  hostBio: z.string().max(1000).optional().nullable(),
  hostPhoto: z.string().max(500).optional().nullable(),
  hostCity: z.string().max(120).optional().nullable(),
  hostingSince: z.coerce.date().optional().nullable(),
  hostPhone: z.string().max(60).optional().nullable(),
  hostEmail: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  hostLink: z.string().max(300).optional().nullable(),

  // datos institucionales del hotel (sólo se muestra/usa en HOTEL)
  hotelLegalName: z.string().max(160).optional().nullable(),
  hotelLogo: z.string().max(500).optional().nullable(),
  hotelDescription: z.string().max(2000).optional().nullable(),
  hotelAddress: z.string().max(240).optional().nullable(),
  hotelCity: z.string().max(120).optional().nullable(),
  hotelPhone: z.string().max(60).optional().nullable(),
  hotelEmail: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  hotelWebsite: z.string().max(300).optional().nullable(),
  hotelReceptionHours: z.string().max(160).optional().nullable(),
  hotelGeneralPolicies: z.string().max(2000).optional().nullable(),

  // features booleanas (default false todas)
  features: featuresSchema.default({} as FeaturesInput),

  // camas (para CABIN); para HOTEL se cargan a nivel roomType
  beds: z
    .array(
      z.object({
        type: bedTypeEnum,
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .max(12)
    .default([]),

  // tipos de habitación (sólo HOTEL)
  roomTypes: z.array(roomTypeSchema).max(20).default([]),

  images: z
    .array(
      z.object({
        url: z
          .string()
          .min(1, "URL requerida")
          .refine(
            (v) =>
              v.startsWith("data:image/") ||
              /^https?:\/\//i.test(v) ||
              v.startsWith("/"),
            "Debe ser una URL https://, una ruta /local o una imagen subida"
          ),
        alt: z.string().max(180).optional().nullable(),
      })
    )
    .max(20)
    .default([]),
});

export type CabinInput = z.infer<typeof cabinSchema>;
