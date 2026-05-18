import crypto from "node:crypto";
import bcrypt from "bcryptjs";

/** Cryptographically random 6-digit code as a string with leading zeroes. */
export function generateNumericCode(digits = 6): string {
  const max = 10 ** digits;
  return String(crypto.randomInt(0, max)).padStart(digits, "0");
}

export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/** Expiration windows. */
export const PASSWORD_RESET_TTL_MS = 10 * 60 * 1000; // 10 min
export const EMAIL_VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 min
