import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { destinationSchema } from "@/modules/city-guide/schemas";
import { createDestination } from "@/modules/city-guide/service";

/** POST /api/admin/city-guide/cities — crear Destination. SUPER_ADMIN only. */
export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = destinationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await createDestination(parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "SLUG_TAKEN":
        return NextResponse.json(
          { error: "Ese slug ya está tomado." },
          { status: 409 }
        );
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  revalidatePath("/destinos");
  return NextResponse.json({ city: result.destination }, { status: 201 });
}
