import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { taxonomyEntrySchema } from "@/modules/city-guide/schemas";
import {
  listKeyPlaceCategories,
  upsertKeyPlaceCategory,
} from "@/modules/city-guide/repo";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const types = await listKeyPlaceCategories();
  return NextResponse.json({ types });
}

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
  const parsed = taxonomyEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const type = await upsertKeyPlaceCategory(parsed.data);
    revalidatePath("/destinos");
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    console.error("[key-place-categories.POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
