import { NextResponse } from "next/server";
import { demoEnabled } from "@/modules/demo-tools/config";
import { DEMO_DATE_COOKIE } from "@/modules/demo-tools/date";

/**
 * POST /api/demo/date — setea la fecha demo en una cookie. Acepta:
 *   { "date": "2026-07-15" }   ← fija la fecha
 *   { "date": null }            ← limpia (vuelve a fecha real)
 *
 * 404 cuando demo mode no está habilitado: nadie en prod tiene que
 * descubrir este endpoint.
 */
export async function POST(req: Request) {
  if (!demoEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { date?: string | null };
  try {
    body = (await req.json()) as { date?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, date: body.date ?? null });

  if (body.date === null || body.date === undefined || body.date === "") {
    res.cookies.set(DEMO_DATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  // Validar parseable
  const parsed = new Date(body.date);
  if (Number.isNaN(parsed.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  res.cookies.set(DEMO_DATE_COOKIE, parsed.toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90, // 90 días
    sameSite: "lax",
  });
  return res;
}
