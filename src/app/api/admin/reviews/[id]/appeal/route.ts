import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { isAdmin } from "@/shared/auth-roles";
import { reviewAppealSchema } from "@/modules/reviews/schemas";
import { fileAppeal } from "@/modules/reviews/service";

/**
 * Admins (owners of the reviewed cabin) can appeal a review.
 * The review stays public; a SUPER_ADMIN resolves the appeal.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me || !isAdmin(me)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reviewAppealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const result = await fileAppeal(me, id, parsed.data.reason);
  if (!result.ok) {
    switch (result.reason) {
      case "NOT_FOUND":
        return NextResponse.json({ error: "Review no encontrada" }, { status: 404 });
      case "FORBIDDEN":
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      case "ALREADY_PENDING":
        return NextResponse.json(
          { error: "Ya hay una apelación en curso para esta review." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ appeal: result.appeal }, { status: 201 });
}
