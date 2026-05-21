import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/modules/auth/session";
import { landingConfigSchema } from "@/modules/admin/schemas";
import {
  getLandingConfig,
  upsertLandingConfig,
} from "@/modules/admin/landing-config";

/**
 * GET /api/admin/landing-config — devuelve el row singleton.
 * PUT /api/admin/landing-config — sólo SUPER_ADMIN. Reemplaza los campos
 * enviados.
 */

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const config = await getLandingConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = landingConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  // Normalizamos "" → null para los strings opcionales: si el admin
  // limpia un campo, en DB queda como null y la landing cae al hardcode.
  const blank = (v: string | undefined) => (v && v.length > 0 ? v : null);

  const seasonalHeroes = d.seasonalHeroes
    ? Object.fromEntries(
        Object.entries(d.seasonalHeroes)
          .filter(([, v]) => v && v.length > 0)
          .map(([k, v]) => [k, v as string])
      )
    : null;

  try {
    await upsertLandingConfig({
      heroTitle: blank(d.heroTitle),
      heroSubtitle: blank(d.heroSubtitle),
      heroCtaLabel: blank(d.heroCtaLabel),
      heroCtaHref: blank(d.heroCtaHref),
      highlightText: blank(d.highlightText),
      atmosphereEnabled: d.atmosphereEnabled,
      atmosphereIntensity: d.atmosphereIntensity,
      fallbackImage: blank(d.fallbackImage),
      seasonalHeroes:
        seasonalHeroes && Object.keys(seasonalHeroes).length
          ? seasonalHeroes
          : null,
      updatedById: me.id,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin.landing-config.PUT]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
