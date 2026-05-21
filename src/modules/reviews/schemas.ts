import { z } from "zod";

/**
 * Reviews + appeals Zod schemas. Client-safe.
 *
 * Reviews avanzadas: 6 categorías 1-5. El rating general que se persiste
 * en `Review.rating` es el promedio simple — se calcula en el service,
 * el cliente no lo manda.
 */

const ratingScalar = z.coerce.number().int().min(1).max(5);

export const REVIEW_CATEGORIES = [
  { key: "cleanliness", label: "Limpieza" },
  { key: "accuracy", label: "Veracidad" },
  { key: "checkin", label: "Check-in" },
  { key: "communication", label: "Comunicación" },
  { key: "location", label: "Ubicación" },
  { key: "value", label: "Relación precio/calidad" },
] as const;

export type ReviewCategoryKey = (typeof REVIEW_CATEGORIES)[number]["key"];

export const reviewSchema = z.object({
  reservationId: z.string().min(1),
  cleanliness: ratingScalar,
  accuracy: ratingScalar,
  checkin: ratingScalar,
  communication: ratingScalar,
  location: ratingScalar,
  value: ratingScalar,
  comment: z.string().min(10, "Contanos un poco más").max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewAppealSchema = z.object({
  reason: z.string().min(10, "Contanos por qué apelás").max(2000),
});

export type ReviewAppealInput = z.infer<typeof reviewAppealSchema>;

export const resolveAppealSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  resolution: z.string().max(2000).optional(),
});

export type ResolveAppealInput = z.infer<typeof resolveAppealSchema>;
