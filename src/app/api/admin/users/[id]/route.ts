import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { updateUserRoleSchema } from "@/modules/users/schemas";
import { updateRole } from "@/modules/users/service";

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

  const result = await updateRole(me.id, id, parsed.data.role);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      case "SELF_NOT_ALLOWED":
        return NextResponse.json(
          {
            error:
              "No podés cambiar tu propio rol. Pedile a otro super-admin que lo haga.",
          },
          { status: 400 }
        );
      case "LAST_SUPER_ADMIN":
        return NextResponse.json(
          {
            error:
              "No podés dejar la app sin super-admin. Asigná otro antes de bajar este.",
          },
          { status: 400 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ user: result.user });
}
