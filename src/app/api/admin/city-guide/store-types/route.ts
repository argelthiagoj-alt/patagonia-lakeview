import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { taxonomyEntrySchema } from "@/modules/city-guide/schemas";
import { listStoreTypes, upsertStoreType } from "@/modules/city-guide/repo";

/** GET listar / POST upsert (por slug). SUPER_ADMIN. */
export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const types = await listStoreTypes();
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
    const type = await upsertStoreType(parsed.data);
    revalidatePath("/destinos");
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    console.error("[store-types.POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
