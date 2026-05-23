import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { tourismItemSchema } from "@/modules/city-guide/schemas";
import { createTourismItem } from "@/modules/city-guide/service";
import { findDestinationById } from "@/modules/city-guide/repo";

/** POST — crear TourismItem dentro de una Destination. SUPER_ADMIN. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: destinationId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = tourismItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dest = await findDestinationById(destinationId);
  if (!dest) {
    return NextResponse.json(
      { error: "Destination not found" },
      { status: 404 }
    );
  }

  const result = await createTourismItem(destinationId, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "SLUG_TAKEN":
        return NextResponse.json(
          { error: "Ese slug ya está en uso para este destino." },
          { status: 409 }
        );
      case "DESTINATION_NOT_FOUND":
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404 }
        );
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  revalidatePath("/destinos");
  revalidatePath(`/destinos/${dest.slug}`);
  return NextResponse.json({ place: result.item }, { status: 201 });
}
