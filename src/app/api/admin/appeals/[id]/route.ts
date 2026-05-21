import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { resolveAppealSchema } from "@/modules/reviews/schemas";
import { resolveAppeal } from "@/modules/reviews/service";

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

  const parsed = resolveAppealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await resolveAppeal(me, id, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      case "ALREADY_RESOLVED":
        return NextResponse.json(
          { error: "La apelación ya está resuelta." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
