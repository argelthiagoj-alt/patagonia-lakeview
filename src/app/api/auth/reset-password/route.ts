import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { resetPasswordSchema } from "@/modules/auth/schemas";
import { applyPasswordReset } from "@/modules/auth/service";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `reset:${ip}`,
    max: 10,
    windowMs: 15 * 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  try {
    const result = await applyPasswordReset(
      parsed.data.email,
      parsed.data.code,
      parsed.data.password
    );
    if (!result.ok) {
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: "Contraseña actualizada. Ya podés iniciar sesión.",
    });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json(
      { error: "No pudimos restablecer la contraseña." },
      { status: 500 }
    );
  }
}
