import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { verifyEmailSchema } from "@/modules/auth/schemas";
import {
  confirmEmail,
  issueEmailVerificationCode,
} from "@/modules/auth/service";
import { getCurrentUser } from "@/modules/auth/session";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/** GET → issue a fresh code to the currently logged-in user. */
export async function GET(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `verify-send:${ip}`,
    max: 5,
    windowMs: 15 * 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá en unos minutos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const result = await issueEmailVerificationCode(me.id);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: result.alreadyVerified
        ? "Tu email ya está verificado."
        : "Te enviamos un código a tu email.",
    });
  } catch (err) {
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.json(
      { error: "No pudimos enviar el código." },
      { status: 500 }
    );
  }
}

/** POST → consume a code. */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `verify-check:${ip}`,
    max: 10,
    windowMs: 15 * 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  try {
    const result = await confirmEmail(parsed.data.email, parsed.data.code);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: result.alreadyVerified ? "Email ya verificado." : "Email verificado.",
    });
  } catch (err) {
    console.error("[POST /api/auth/verify-email]", err);
    return NextResponse.json(
      { error: "No pudimos verificar el código." },
      { status: 500 }
    );
  }
}
