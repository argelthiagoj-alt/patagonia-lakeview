import { NextResponse } from "next/server";
import { requireAdmin } from "@/modules/auth/session";
import { cabinSchema } from "@/modules/cabins/schemas";
import { createCabin } from "@/modules/cabins/service";

/**
 * POST /api/admin/cabins — admin creates a new cabin.
 * Ownership is taken from the session, never from the payload.
 */
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

  const result = await createCabin(user.id, parsed.data);
  if (!result.ok) {
    if (result.reason === "SLUG_TAKEN") {
      return NextResponse.json(
        { error: "Ya existe una cabaña con ese slug." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "No pudimos crear la cabaña." },
      { status: 500 }
    );
  }

  return NextResponse.json({ cabin: result.cabin }, { status: 201 });
}
