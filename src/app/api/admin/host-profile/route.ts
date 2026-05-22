import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import {
  hostProfileSchema,
  getHostProfile,
  updateHostProfile,
} from "@/modules/users/host-profile";

/** GET → trae el perfil del owner logueado. */
export async function GET() {
  const me = await getCurrentUser();
  if (!me || !isAdmin(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await getHostProfile(me.id);
  return NextResponse.json({ profile });
}

/** PUT → guarda los cambios. */
export async function PUT(req: Request) {
  const me = await getCurrentUser();
  if (!me || !isAdmin(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = hostProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    await updateHostProfile(me.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin.host-profile.PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
