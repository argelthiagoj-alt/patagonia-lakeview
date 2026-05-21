import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { adminPlanSchema } from "@/modules/users/schemas";
import { setPlan } from "@/modules/users/service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
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

  const parsed = adminPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await setPlan(
    id,
    parsed.data.plan,
    parsed.data.durationDays
  );
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "ONLY_ADMINS":
        return NextResponse.json(
          { error: "Solo los ADMIN pueden tener plan Pro." },
          { status: 400 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ user: result.user });
}
