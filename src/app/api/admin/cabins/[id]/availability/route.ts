import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { canAccessAdminArea } from "@/modules/admin/policies";
import { isSuperAdmin } from "@/shared/auth-roles";
import { findCabinOwnership } from "@/modules/cabins/repo";
import { getCabinAvailability } from "@/modules/reservations/availability";

/**
 * GET /api/admin/cabins/:id/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Devuelve unidades disponibles vs reservadas en ese rango. ADMIN solo
 * puede consultar publicaciones propias; SUPER_ADMIN, cualquiera.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!canAccessAdminArea(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json(
      { error: "Faltan los parámetros from y to (YYYY-MM-DD)." },
      { status: 400 }
    );
  }
  const checkIn = new Date(from);
  const checkOut = new Date(to);
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
  }

  // Ownership: ADMIN sólo sus propias publicaciones.
  const cabin = await findCabinOwnership(id);
  if (!cabin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!isSuperAdmin(me!) && cabin.ownerId !== me!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const availability = await getCabinAvailability(id, { checkIn, checkOut });
  return NextResponse.json({ availability });
}
