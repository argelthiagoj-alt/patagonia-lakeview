/**
 * Pure helpers for SIMULATED payments. Client-safe — used by both the
 * checkout form (formatting input) and the reservation service (extracting
 * brand + last4 from a card number BEFORE it leaves the request handler).
 *
 * We never persist the full card number. Only `last4` + `cardBrand`.
 */

export type CardBrand =
  | "VISA"
  | "MASTERCARD"
  | "AMEX"
  | "DISCOVER"
  | "OTHER";

export function detectCardBrand(rawNumber: string): CardBrand {
  const n = rawNumber.replace(/\s+/g, "");
  if (/^4\d{12,18}$/.test(n)) return "VISA";
  if (/^(5[1-5]\d{14}|2[2-7]\d{14})$/.test(n)) return "MASTERCARD";
  if (/^3[47]\d{13}$/.test(n)) return "AMEX";
  if (/^6(?:011|5\d{2})\d{12}$/.test(n)) return "DISCOVER";
  return "OTHER";
}

/** Returns the last 4 digits or null if the number is too short. */
export function lastFour(rawNumber: string): string | null {
  const n = rawNumber.replace(/\D+/g, "");
  return n.length >= 4 ? n.slice(-4) : null;
}

/** Formats `4242424242424242` into groups of 4. */
export function formatCardNumber(value: string): string {
  return value.replace(/\D+/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

/** Formats `1225` into `12/25`. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D+/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
