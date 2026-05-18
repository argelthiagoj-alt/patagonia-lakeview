import { z } from "zod";

export const reservationSchema = z
  .object({
    cabinSlug: z.string().min(1, "Cabaña requerida"),
    checkIn: z.coerce.date({ invalid_type_error: "Fecha de check-in inválida" }),
    checkOut: z.coerce.date({
      invalid_type_error: "Fecha de check-out inválida",
    }),
    guests: z.coerce
      .number({ invalid_type_error: "Cantidad de huéspedes inválida" })
      .int()
      .min(1, "Mínimo 1 huésped")
      .max(16, "Máximo 16 huéspedes"),
    guestName: z.string().min(2, "Ingresá tu nombre").max(80),
    guestEmail: z.string().email("Email inválido"),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "El check-out debe ser posterior al check-in",
    path: ["checkOut"],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.checkIn >= today;
    },
    {
      message: "El check-in no puede ser en el pasado",
      path: ["checkIn"],
    }
  );

export type ReservationInput = z.infer<typeof reservationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const cabinSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  location: z.string().min(2),
  shortDescription: z.string().min(10).max(180),
  description: z.string().min(20),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  maxGuests: z.coerce.number().int().min(1),
  pricePerNight: z.coerce.number().int().min(1),
  cleaningFee: z.coerce.number().int().min(0).default(0),
  lakeView: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
});

export type CabinInput = z.infer<typeof cabinSchema>;
