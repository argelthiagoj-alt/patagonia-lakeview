import { nightsBetween, rangesOverlap } from "@/lib/utils";

export type BookingPriceInput = {
  pricePerNight: number;
  cleaningFee: number;
  checkIn: Date;
  checkOut: Date;
};

export type BookingPriceBreakdown = {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
};

/** Service fee — 8% of subtotal, capped to nice numbers. */
export function computeBookingPrice(
  input: BookingPriceInput
): BookingPriceBreakdown {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const subtotal = nights * input.pricePerNight;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + input.cleaningFee + serviceFee;
  return {
    nights,
    subtotal,
    cleaningFee: input.cleaningFee,
    serviceFee,
    total,
  };
}

export type ExistingReservation = {
  checkIn: Date;
  checkOut: Date;
  status?: string;
};

/**
 * Returns true if a new range overlaps with any active (non-cancelled) reservation.
 * Active = status is missing OR not CANCELLED.
 */
export function hasOverlap(
  existing: ExistingReservation[],
  newCheckIn: Date,
  newCheckOut: Date
) {
  return existing.some((r) => {
    if (r.status === "CANCELLED") return false;
    return rangesOverlap(r.checkIn, r.checkOut, newCheckIn, newCheckOut);
  });
}
