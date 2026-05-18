import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cabinSchema } from "@/lib/validations";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAdmin();
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

  const data = parsed.data;

  try {
    const amenities = data.amenityKeys.length
      ? await prisma.amenity.findMany({
          where: { key: { in: data.amenityKeys } },
          select: { id: true },
        })
      : [];

    const cabin = await prisma.cabin.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        location: data.location,
        lakeView: data.lakeView,
        maxGuests: data.maxGuests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        pricePerNight: data.pricePerNight,
        cleaningFee: data.cleaningFee,
        isActive: data.isActive,
        highlights: data.highlights,
        // Ownership: NEVER trust the client. Always set ownerId from the session.
        ownerId: user.id,
        images: {
          create: data.images.map((img, order) => ({
            url: img.url,
            alt: img.alt ?? null,
            order,
          })),
        },
        amenities: {
          create: amenities.map((a) => ({ amenityId: a.id })),
        },
      },
    });

    return NextResponse.json({ cabin }, { status: 201 });
  } catch (err) {
    const message =
      (err as { code?: string }).code === "P2002"
        ? "Ya existe una cabaña con ese slug."
        : "No pudimos crear la cabaña.";
    console.error("[POST /api/admin/cabins]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
