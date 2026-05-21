import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import { subscribeAdminToPro } from "@/modules/admin/pro";

/**
 * POST /api/admin/pro/subscribe — el admin se suscribe a la membresía
 * Pro simulada. Sólo cambia el campo adminPlan; no se procesa pago real.
 */
export async function POST() {
  const me = await getCurrentUser();
  if (!me || !isAdmin(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (me.isBanned) {
    return NextResponse.json({ error: "Cuenta suspendida." }, { status: 403 });
  }

  const result = await subscribeAdminToPro(me.id);
  if (!result.ok) {
    switch (result.reason) {
      case "ALREADY_ACTIVE":
        return NextResponse.json(
          { error: "Ya tenés Pro activo." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({ plan: result.plan });
}
