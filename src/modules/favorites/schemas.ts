import { z } from "zod";

/**
 * Favorites Zod schemas. Client-safe.
 *
 * El modelo Favorite (User ↔ Cabin) se introduce con prisma db push
 * en la fase de implementación. Hasta entonces este archivo sólo expone
 * el contract del payload del toggle.
 */

export const toggleFavoriteSchema = z.object({
  cabinId: z.string().min(1, "cabinId requerido"),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
