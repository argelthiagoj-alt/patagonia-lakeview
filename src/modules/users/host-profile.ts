import "server-only";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Host / Hotel profile a nivel cuenta del owner.
 *
 * Las cabañas heredan estos valores automáticamente (ver `mapCabin` en
 * `@/modules/cabins/repo`). Si una cabaña tiene columnas propias
 * cargadas, esas tienen prioridad — útil para overrides puntuales.
 */

export const hostProfileSchema = z.object({
  hostDisplayName: z.string().max(120).optional().nullable(),
  hostBio: z.string().max(1000).optional().nullable(),
  hostPhoto: z.string().max(2_000_000).optional().nullable(), // data URL ok
  hostCity: z.string().max(120).optional().nullable(),
  hostingSince: z.coerce.date().optional().nullable(),
  hostPhone: z.string().max(60).optional().nullable(),
  hostEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  hostLink: z.string().max(300).optional().nullable(),
  hostInstagram: z.string().max(160).optional().nullable(),

  hotelLegalName: z.string().max(160).optional().nullable(),
  hotelLogo: z.string().max(2_000_000).optional().nullable(),
  hotelDescription: z.string().max(2000).optional().nullable(),
  hotelAddress: z.string().max(240).optional().nullable(),
  hotelCity: z.string().max(120).optional().nullable(),
  hotelPhone: z.string().max(60).optional().nullable(),
  hotelEmail: z
    .string()
    .email("Email inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  hotelWebsite: z.string().max(300).optional().nullable(),
  hotelInstagram: z.string().max(160).optional().nullable(),
  hotelReceptionHours: z.string().max(160).optional().nullable(),
  hotelGeneralPolicies: z.string().max(2000).optional().nullable(),
});

export type HostProfileInput = z.infer<typeof hostProfileSchema>;

const FIELDS = [
  "hostDisplayName",
  "hostBio",
  "hostPhoto",
  "hostCity",
  "hostingSince",
  "hostPhone",
  "hostEmail",
  "hostLink",
  "hostInstagram",
  "hotelLegalName",
  "hotelLogo",
  "hotelDescription",
  "hotelAddress",
  "hotelCity",
  "hotelPhone",
  "hotelEmail",
  "hotelWebsite",
  "hotelInstagram",
  "hotelReceptionHours",
  "hotelGeneralPolicies",
] as const;

export function getHostProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: Object.fromEntries(FIELDS.map((f) => [f, true])) as Record<
      (typeof FIELDS)[number],
      true
    >,
  });
}

export function updateHostProfile(userId: string, data: HostProfileInput) {
  // Normalizamos "" → null en strings opcionales.
  const norm = <T,>(v: T | "" | null | undefined) =>
    v === "" || v === undefined ? null : v;

  return prisma.user.update({
    where: { id: userId },
    data: {
      hostDisplayName: norm(data.hostDisplayName),
      hostBio: norm(data.hostBio),
      hostPhoto: norm(data.hostPhoto),
      hostCity: norm(data.hostCity),
      hostingSince: data.hostingSince ?? null,
      hostPhone: norm(data.hostPhone),
      hostEmail: norm(data.hostEmail),
      hostLink: norm(data.hostLink),
      hostInstagram: norm(data.hostInstagram),
      hotelLegalName: norm(data.hotelLegalName),
      hotelLogo: norm(data.hotelLogo),
      hotelDescription: norm(data.hotelDescription),
      hotelAddress: norm(data.hotelAddress),
      hotelCity: norm(data.hotelCity),
      hotelPhone: norm(data.hotelPhone),
      hotelEmail: norm(data.hotelEmail),
      hotelWebsite: norm(data.hotelWebsite),
      hotelInstagram: norm(data.hotelInstagram),
      hotelReceptionHours: norm(data.hotelReceptionHours),
      hotelGeneralPolicies: norm(data.hotelGeneralPolicies),
    },
    select: { id: true },
  });
}
