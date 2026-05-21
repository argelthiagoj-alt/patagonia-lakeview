import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { banUserSchema } from "@/modules/users/schemas";
import { banUser, unbanUser } from "@/modules/users/service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = banUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = parsed.data.isBanned
    ? await banUser(me.id, id, parsed.data.reason || null)
    : await unbanUser(me.id, id);

  if (!result.ok) {
    if (result.reason === "SELF_NOT_ALLOWED") {
      return NextResponse.json(
        { error: "No podés banearte a vos mismo." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ user: result.user });
}
