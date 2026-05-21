import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { removeReview } from "@/modules/reviews/service";

/**
 * Super-admin only. Marks the review as removed and recomputes the cabin
 * aggregate. We keep the row for audit but it stops counting for ratings.
 */
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
  const result = await removeReview(id);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
