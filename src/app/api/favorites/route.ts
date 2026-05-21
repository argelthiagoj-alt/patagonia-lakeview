import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { toggleFavoriteSchema } from "@/modules/favorites/schemas";
import {
  addFavorite,
  isFavorited,
  removeFavorite,
} from "@/modules/favorites/repo";

/**
 * POST /api/favorites — toggle favorito.
 *   body: { cabinId: string }
 *   responde: { favored: boolean }
 */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = toggleFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const existing = await isFavorited(me.id, parsed.data.cabinId);
    if (existing) {
      await removeFavorite(me.id, parsed.data.cabinId);
      return NextResponse.json({ favored: false });
    }
    await addFavorite(me.id, parsed.data.cabinId);
    return NextResponse.json({ favored: true });
  } catch (err) {
    console.error("[POST /api/favorites]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
