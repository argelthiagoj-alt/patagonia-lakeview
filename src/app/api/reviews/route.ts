import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { reviewSchema } from "@/modules/reviews/schemas";
import { submitReview } from "@/modules/reviews/service";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const result = await submitReview(me, parsed.data);
  if (!result.ok) {
    switch (result.reason) {
      case "BANNED":
        return NextResponse.json({ error: "Cuenta suspendida." }, { status: 403 });
      case "NOT_FOUND":
      case "FORBIDDEN":
        return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
      case "NOT_ELIGIBLE":
        return NextResponse.json(
          {
            error:
              "Solo podés reseñar reservas confirmadas cuya estadía ya haya terminado.",
          },
          { status: 400 }
        );
      case "ALREADY_REVIEWED":
        return NextResponse.json(
          { error: "Ya hiciste una reseña para esta reserva." },
          { status: 409 }
        );
      case "SERVER":
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }

  return NextResponse.json({ review: result.review }, { status: 201 });
}
