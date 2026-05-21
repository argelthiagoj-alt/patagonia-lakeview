import "server-only";

import type { CurrentUser } from "@/shared/auth-roles";
import { isAdmin, isSuperAdmin } from "@/shared/auth-roles";

/**
 * Policies compartidas para las rutas /admin/* y /api/admin/*.
 *
 * Hoy son thin wrappers sobre `@/shared/auth-roles` para evitar que
 * páginas dispersas reimporten las mismas reglas. Si emergen guards más
 * complejas (ej. canEditCabin condicionado por ownership + Pro plan),
 * acá es donde viven.
 */

export function canAccessAdminArea(user: CurrentUser | null): boolean {
  return Boolean(user && isAdmin(user));
}

export function canAccessSuperAdminArea(user: CurrentUser | null): boolean {
  return Boolean(user && isSuperAdmin(user));
}
