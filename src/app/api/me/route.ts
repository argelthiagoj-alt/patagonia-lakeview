import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { profileSchema } from "@/modules/users/schemas";
import { findProfile } from "@/modules/users/repo";
import { updateProfile } from "@/modules/users/service";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  try {
    const user = await findProfile(me.id);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await updateProfile(me.id, me.isBanned, parsed.data);
  if (!result.ok) {
    if (result.reason === "BANNED") {
      return NextResponse.json(
        { error: "Tu cuenta está suspendida. Contactá a un administrador." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ user: result.user });
}
