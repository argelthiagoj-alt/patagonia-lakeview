import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cabinSchema } from "@/lib/validations";
import { requireAdmin, canManageCabin } from "@/lib/auth";

async function loadCabin(id: string) {
  return prisma.cabin.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });
}

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

  const cabin = await loadCabin(id);
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

  const data = parsed.data;

  try {
    const amenities = data.amenityKeys
      ? await prisma.amenity.findMany({
          where: { key: { in: data.amenityKeys } },
          select: { id: true },
        })
      : null;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.cabin.update({
        where: { id },
        data: {
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.shortDescription !== undefined && {
            shortDescription: data.shortDescription,
          }),
          ...(data.location !== undefined && { location: data.location }),
          ...(data.lakeView !== undefined && { lakeView: data.lakeView }),
          ...(data.maxGuests !== undefined && { maxGuests: data.maxGuests }),
          ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
          ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
          ...(data.pricePerNight !== undefined && {
            pricePerNight: data.pricePerNight,
          }),
          ...(data.cleaningFee !== undefined && {
            cleaningFee: data.cleaningFee,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.highlights !== undefined && { highlights: data.highlights }),
        },
      });

      if (data.images !== undefined) {
        await tx.cabinImage.deleteMany({ where: { cabinId: id } });
        if (data.images.length > 0) {
          await tx.cabinImage.createMany({
            data: data.images.map((img, order) => ({
              cabinId: id,
              url: img.url,
              alt: img.alt ?? null,
              order,
            })),
          });
        }
      }

      if (amenities !== null) {
        await tx.cabinAmenity.deleteMany({ where: { cabinId: id } });
        if (amenities.length > 0) {
          await tx.cabinAmenity.createMany({
            data: amenities.map((a) => ({ cabinId: id, amenityId: a.id })),
          });
        }
      }

      return u;
    });

    return NextResponse.json({ cabin: updated });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una cabaña con ese slug." },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/admin/cabins/:id]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
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
  const cabin = await loadCabin(id);
  if (!cabin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canManageCabin(user, cabin)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.cabin.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
