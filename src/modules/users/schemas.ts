import { z } from "zod";

/**
 * User-management Zod schemas. Client-safe.
 */

export const profileSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  documentId: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(180).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  state: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  billingName: z.string().max(120).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().max(280).optional().or(z.literal("")),
});

export const adminPlanSchema = z.object({
  plan: z.enum(["FREE", "PRO"]),
  durationDays: z.coerce.number().int().min(1).max(3650).optional(),
});
