/**
 * Locale-aware formatters shared by reservation templates.
 */

export function fmtRange(from: Date, to: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${from.toLocaleDateString("es-AR", opts)} → ${to.toLocaleDateString(
    "es-AR",
    { ...opts, year: "numeric" }
  )}`;
}

export function fmtMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
