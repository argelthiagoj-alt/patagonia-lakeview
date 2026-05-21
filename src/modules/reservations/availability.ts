import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Helpers de disponibilidad por unidades.
 *
 * Reglas:
 *   - Reservas en PENDING, APPROVED y CONFIRMED **consumen** inventario.
 *     REJECTED, CANCELLED y COMPLETED no.
 *   - Para una publicación CABIN: `totalUnits` vive en Cabin y el conteo
 *     es por publicación.
 *   - Para una publicación HOTEL: `totalUnits` vive en RoomType. El
 *     conteo es por roomTypeId.
 */

const ACTIVE_STATUSES = ["PENDING", "APPROVED", "CONFIRMED"] as const;

export type CabinAvailability = {
  propertyType: "CABIN" | "HOTEL";
  /** Lista de slots reservables para esa fecha. Para CABIN tiene un
   *  único item (la publicación). Para HOTEL, uno por roomType. */
  units: Array<{
    /** Identificador del slot. Para CABIN === cabinId, para HOTEL === roomTypeId. */
    id: string;
    /** Nombre humano. Para CABIN = title, para HOTEL = name del roomType. */
    label: string;
    total: number;
    booked: number;
    available: number;
  }>;
};

/**
 * Dada una publicación y un rango de fechas, devolvé cuántas unidades
 * están libres y cuántas reservadas — desglosado por roomType si es
 * HOTEL.
 */
export async function getCabinAvailability(
  cabinId: string,
  range: { checkIn: Date; checkOut: Date }
): Promise<CabinAvailability> {
  const cabin = await prisma.cabin.findUnique({
    where: { id: cabinId },
    select: {
      id: true,
      title: true,
      totalUnits: true,
      propertyType: true,
      roomTypes: {
        select: { id: true, name: true, totalUnits: true },
      },
    },
  });
  if (!cabin) {
    return { propertyType: "CABIN", units: [] };
  }

  const baseOverlapWhere = {
    cabinId,
    status: { in: [...ACTIVE_STATUSES] },
    checkOut: { gt: range.checkIn },
    checkIn: { lt: range.checkOut },
  };

  if (cabin.propertyType === "HOTEL") {
    // Para hoteles agrupamos reservas por roomTypeId.
    const groups = await prisma.reservation.groupBy({
      by: ["roomTypeId"],
      where: baseOverlapWhere,
      _count: { _all: true },
    });
    const bookedByRoom = new Map<string, number>();
    for (const g of groups) {
      if (g.roomTypeId) bookedByRoom.set(g.roomTypeId, g._count._all);
    }
    return {
      propertyType: "HOTEL",
      units: cabin.roomTypes.map((rt) => {
        const booked = bookedByRoom.get(rt.id) ?? 0;
        return {
          id: rt.id,
          label: rt.name,
          total: rt.totalUnits,
          booked,
          available: Math.max(0, rt.totalUnits - booked),
        };
      }),
    };
  }

  // CABIN: un solo slot.
  const booked = await prisma.reservation.count({ where: baseOverlapWhere });
  return {
    propertyType: "CABIN",
    units: [
      {
        id: cabin.id,
        label: cabin.title,
        total: cabin.totalUnits,
        booked,
        available: Math.max(0, cabin.totalUnits - booked),
      },
    ],
  };
}
