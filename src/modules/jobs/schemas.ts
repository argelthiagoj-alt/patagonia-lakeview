import { z } from "zod";

/**
 * Job application Zod schema for the "Trabajá con nosotros" form. Client-safe.
 */

export const jobApplicationSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120),
  email: z.string().email("Email inválido"),
  phone: z.string().max(30).optional().or(z.literal("")),
  location: z.string().min(2, "Mínimo 2 caracteres").max(120),
  role: z.enum([
    "anfitrion",
    "limpieza",
    "atencion-huesped",
    "mantenimiento",
    "marketing",
    "operaciones",
    "otro",
  ]),
  experience: z.string().min(10, "Contanos un poco más").max(2000),
  portfolio: z.string().url("URL inválida").optional().or(z.literal("")),
  message: z.string().min(10, "Contanos un poco más").max(2000),
  acceptsPrivacy: z.literal(true, {
    errorMap: () => ({ message: "Tenés que aceptar la política de privacidad" }),
  }),
  /** Honeypot: silently rejects when filled. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
