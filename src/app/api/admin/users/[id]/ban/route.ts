import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { banUserSchema } from "@/lib/validations";

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

  if (id === me.id) {
    return NextResponse.json(
      { error: "No podés banearte a vos mismo." },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isBanned: parsed.data.isBanned,
        bannedAt: parsed.data.isBanned ? new Date() : null,
        banReason: parsed.data.isBanned ? parsed.data.reason || null : null,
        bannedById: parsed.data.isBanned ? me.id : null,
      },
      select: { id: true, isBanned: true, banReason: true, bannedAt: true },
    });

    // If banning: revoke active sessions so the user is logged out immediately
    if (parsed.data.isBanned) {
      await prisma.session.deleteMany({ where: { userId: id } }).catch(() => undefined);
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/ban]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
