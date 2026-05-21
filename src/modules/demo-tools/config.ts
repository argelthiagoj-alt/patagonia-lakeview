/**
 * Demo-mode whitelist + flag.
 *
 * Vive en su propio módulo para que los routes/admin pages no tengan que
 * conocer los detalles. Hoy lo consume `/api/auth/demo-login`; en el
 * futuro acá llegan helpers tipo "Resetear demo" o "Limpiar pagos
 * simulados".
 *
 * Estos valores son client-safe: la whitelist puede leerse desde los
 * botones de login demo sin riesgo (sólo son emails seedeados).
 */

export const DEMO_EMAILS = new Set([
  "superadmin@patagonialakeview.demo",
  "user@patagonialakeview.demo",
  "admin1@patagonialakeview.demo",
  "admin2@patagonialakeview.demo",
  "admin3@patagonialakeview.demo",
]);

export function isDemoEmail(email: string): boolean {
  return DEMO_EMAILS.has(email.toLowerCase());
}

export function demoEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}
