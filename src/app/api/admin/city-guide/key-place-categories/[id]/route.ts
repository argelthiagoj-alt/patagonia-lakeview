import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/modules/auth/session";
import { deleteKeyPlaceCategory } from "@/modules/city-guide/repo";

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
  try {
    await deleteKeyPlaceCategory(id);
    revalidatePath("/destinos");
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[key-place-categories.DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
