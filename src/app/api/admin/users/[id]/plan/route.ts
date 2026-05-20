import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { adminPlanSchema } from "@/lib/validations";

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

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Only admins can have a plan — users/super-admins don't need it
    if (target.role !== "ADMIN" && parsed.data.plan === "PRO") {
      return NextResponse.json(
        { error: "Solo los ADMIN pueden tener plan Pro." },
        { status: 400 }
      );
    }

    const proUntil =
      parsed.data.plan === "PRO"
        ? new Date(
            Date.now() +
              (parsed.data.durationDays ?? 365) * 24 * 60 * 60 * 1000
          )
        : null;

    const updated = await prisma.user.update({
      where: { id },
      data: { adminPlan: parsed.data.plan, proUntil },
      select: { id: true, adminPlan: true, proUntil: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/plan]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
