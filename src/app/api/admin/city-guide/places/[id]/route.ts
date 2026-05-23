import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { tourismItemSchema } from "@/modules/city-guide/schemas";
import {
  updateTourismItem,
  deleteTourismItem,
} from "@/modules/city-guide/service";
import { findItemForEdit } from "@/modules/city-guide/repo";
import { prisma } from "@/lib/prisma";

/** GET — devuelve el item completo (con imágenes) para hidratar el form
 *  de edición. SUPER_ADMIN only. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const item = await findItemForEdit(id);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

async function destinationSlugForItem(itemId: string): Promise<string | null> {
  const row = await prisma.tourismItem
    .findUnique({
      where: { id: itemId },
      select: { destination: { select: { slug: true } } },
    })
    .catch(() => null);
  return row?.destination.slug ?? null;
}

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
  const parsed = tourismItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await findItemForEdit(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await updateTourismItem(id, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "SLUG_TAKEN":
        return NextResponse.json({ error: "Slug en uso" }, { status: 409 });
      case "DESTINATION_NOT_FOUND":
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  const slug = await destinationSlugForItem(id);
  revalidatePath("/destinos");
  if (slug) revalidatePath(`/destinos/${slug}`);
  return NextResponse.json({ place: result.item });
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
  const slug = await destinationSlugForItem(id);
  const result = await deleteTourismItem(id);
  if (!result.ok) {
    if (result.reason === "NOT_FOUND")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  revalidatePath("/destinos");
  if (slug) revalidatePath(`/destinos/${slug}`);
  return NextResponse.json({ ok: true });
}
