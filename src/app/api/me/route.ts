import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        documentId: true,
        address: true,
        city: true,
        state: true,
        country: true,
        billingName: true,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (me.isBanned) {
    return NextResponse.json(
      { error: "Tu cuenta está suspendida. Contactá a un administrador." },
      { status: 403 }
    );
  }

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

  const data = parsed.data;

  try {
    const user = await prisma.user.update({
      where: { id: me.id },
      data: {
        name: data.name,
        phone: data.phone || null,
        documentId: data.documentId || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        billingName: data.billingName || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        documentId: true,
        address: true,
        city: true,
        state: true,
        country: true,
        billingName: true,
      },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[PATCH /api/me]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
