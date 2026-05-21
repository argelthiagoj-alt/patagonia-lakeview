import { z } from "zod";

/**
 * Chat (per-reservation conversation) Zod schemas. Client-safe.
 */

export const sendMessageSchema = z.object({
  body: z.string().min(1, "Escribí algo").max(2000),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
