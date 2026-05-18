import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { updateUserRoleSchema } from "@/lib/validations";

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

  const parsed = updateUserRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Rol inválido", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const newRole = parsed.data.role;

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, email: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Safety 1: you cannot change your OWN role at all (avoids lockout)
    if (target.id === me.id) {
      return NextResponse.json(
        {
          error:
            "No podés cambiar tu propio rol. Pedile a otro super-admin que lo haga.",
        },
        { status: 400 }
      );
    }

    // Safety 2: don't leave the system without any SUPER_ADMIN
    if (target.role === "SUPER_ADMIN" && newRole !== "SUPER_ADMIN") {
      const remaining = await prisma.user.count({
        where: { role: "SUPER_ADMIN", id: { not: target.id } },
      });
      if (remaining === 0) {
        return NextResponse.json(
          {
            error:
              "No podés dejar la app sin super-admin. Asigná otro antes de bajar este.",
          },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { role: newRole },
      select: { id: true, role: true, email: true, name: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
