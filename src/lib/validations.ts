import { z } from "zod";

/* ─────────── Payment (simulated) ─────────── */

// Common billing fields that ride with every simulated payment.
const billingSchema = z.object({
  documentId: z.string().min(4, "Documento requerido").max(40),
  phone: z.string().min(6, "Teléfono requerido").max(40),
  billingAddress: z.string().min(4, "Dirección requerida").max(180),
  city: z.string().min(2, "Ciudad requerida").max(80),
  state: z.string().min(2, "Provincia / estado requerido").max(80),
  country: z.string().min(2, "País requerido").max(80),
});

const cardPaymentSchema = z
  .object({
    provider: z.literal("CARD"),
    cardholder: z.string().min(2, "Ingresá el titular").max(80),
    // Strip spaces client-side, then 13–19 digits. We never store the full number.
    number: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .pipe(
        z
          .string()
          .regex(/^\d{13,19}$/, "El número debe tener entre 13 y 19 dígitos")
      ),
    expiry: z
      .string()
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/YY"),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
    email: z.string().email("Email inválido"),
  })
  .merge(billingSchema);

const mpPaymentSchema = z
  .object({
    provider: z.literal("MERCADO_PAGO"),
    email: z.string().email("Email inválido"),
  })
  .merge(billingSchema);

export const paymentInputSchema = z.discriminatedUnion("provider", [
  cardPaymentSchema,
  mpPaymentSchema,
]);

export type PaymentInput = z.infer<typeof paymentInputSchema>;

/* ─────────── Reservation ─────────── */

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
    payment: paymentInputSchema,
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

/* ─────────── Admin reservation actions ─────────── */

export const reservationActionSchema = z.object({
  action: z.enum(["confirm", "reject", "cancel"]),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ingresá tu nombre").max(80),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Email inválido"),
    code: z
      .string()
      .regex(/^\d{6}$/, "El código tiene 6 dígitos"),
    password: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Mínimo 8 caracteres"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().regex(/^\d{6}$/, "El código tiene 6 dígitos"),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]),
});

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

export const banUserSchema = z.object({
  isBanned: z.boolean(),
  reason: z.string().max(280).optional().or(z.literal("")),
});

export const adminPlanSchema = z.object({
  plan: z.enum(["FREE", "PRO"]),
  durationDays: z.coerce.number().int().min(1).max(3650).optional(),
});

export const jobApplicationSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(120),
  email: z.string().email("Email inválido"),
  phone: z.string().max(30).optional().or(z.literal("")),
  location: z.string().min(2, "Mínimo 2 caracteres").max(120),
  role: z
    .enum([
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
  // Honeypot: silently rejects when filled
  website: z.string().max(0).optional().or(z.literal("")),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export const bedTypeEnum = z.enum([
  "TWIN",
  "DOUBLE",
  "QUEEN",
  "KING",
  "SOFA_BED",
  "BUNK",
]);

export type BedType = z.infer<typeof bedTypeEnum>;

export const cabinSchema = z.object({
  title: z.string().min(2, "Mínimo 2 caracteres").max(120),
  slug: z
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  location: z.string().min(2).max(120),
  shortDescription: z.string().min(10, "Mínimo 10 caracteres").max(180),
  description: z.string().min(20, "Mínimo 20 caracteres"),
  bedrooms: z.coerce.number().int().min(0).max(20),
  bathrooms: z.coerce.number().int().min(0).max(20),
  maxGuests: z.coerce.number().int().min(1).max(30),
  pricePerNight: z.coerce.number().int().min(1).max(100000),
  cleaningFee: z.coerce.number().int().min(0).max(10000).default(0),
  totalUnits: z.coerce.number().int().min(1).max(50).default(1),
  lakeView: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  highlights: z
    .array(z.string().min(1).max(120))
    .max(10)
    .default([]),
  amenityKeys: z.array(z.string().min(1)).default([]),
  beds: z
    .array(
      z.object({
        type: bedTypeEnum,
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .max(12)
    .default([]),
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
