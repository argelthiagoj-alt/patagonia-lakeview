import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/modules/auth/schemas";
import { requestPasswordReset } from "@/modules/auth/service";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  message:
    "Si el email está registrado, te enviamos un código de 6 dígitos. Revisá tu casilla.",
};

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `forgot:${ip}`,
    max: 5,
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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  try {
    await requestPasswordReset(parsed.data.email);
    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    // Still return generic message to avoid leaking server errors per-email
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
