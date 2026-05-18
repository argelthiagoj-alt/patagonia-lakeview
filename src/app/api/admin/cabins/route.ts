import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cabinSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cabinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const cabin = await prisma.cabin.create({ data: parsed.data });
    return NextResponse.json({ cabin }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/cabins]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
