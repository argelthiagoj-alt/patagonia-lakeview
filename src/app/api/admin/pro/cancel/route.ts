import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import { cancelAdminPro } from "@/modules/admin/pro";

/**
 * POST /api/admin/pro/cancel — el admin da de baja su membresía Pro.
 */
export async function POST() {
  const me = await getCurrentUser();
  if (!me || !isAdmin(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await cancelAdminPro(me.id);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_ACTIVE":
        return NextResponse.json(
          { error: "No tenés una membresía Pro activa." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
