import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { destinationSchema } from "@/modules/city-guide/schemas";
import {
  updateDestination,
  deleteDestination,
} from "@/modules/city-guide/service";

/** PUT — actualizar; DELETE — eliminar (cascade a items). SUPER_ADMIN. */
export async function PUT(
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
  const parsed = destinationSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await updateDestination(id, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "SLUG_TAKEN":
        return NextResponse.json({ error: "Slug en uso" }, { status: 409 });
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  revalidatePath("/destinos");
  revalidatePath(`/destinos/${result.destination.slug}`);
  return NextResponse.json({ city: result.destination });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const result = await deleteDestination(id);
  if (!result.ok) {
    if (result.reason === "NOT_FOUND")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  revalidatePath("/destinos");
  return NextResponse.json({ ok: true });
}
