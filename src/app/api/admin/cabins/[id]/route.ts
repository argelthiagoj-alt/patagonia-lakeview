import { NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/session";
import { canManageCabin } from "@/shared/auth-roles";
import { cabinSchema } from "@/modules/cabins/schemas";
import { findCabinOwnership } from "@/modules/cabins/repo";
import { deactivateCabin, updateCabin } from "@/modules/cabins/service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const cabin = await findCabinOwnership(id);
  if (!cabin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canManageCabin(user, cabin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cabinSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await updateCabin(id, parsed.data);
  if (!result.ok) {
    if (result.reason === "NOT_FOUND")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (result.reason === "SLUG_TAKEN")
      return NextResponse.json(
        { error: "Ya existe una cabaña con ese slug." },
        { status: 409 }
      );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ cabin: result.cabin });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const cabin = await findCabinOwnership(id);
  if (!cabin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canManageCabin(user, cabin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await deactivateCabin(id);
  if (!result.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
