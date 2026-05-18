import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import {
  generateNumericCode,
  hashCode,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/codes";
import { sendPasswordResetCode } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  message:
    "Si el email está registrado, te enviamos un código de 6 dígitos. Revisá tu casilla.",
};

export async function POST(req: Request) {
  // Rate limit per IP (3 every 15 min) — independent of email existence
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
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // If user exists and has a password (not OAuth-only), create + send code.
    // Otherwise we silently no-op so we never reveal whether the email exists.
    if (user && user.passwordHash) {
      const code = generateNumericCode(6);
      const codeHash = await hashCode(code);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      // Invalidate any prior unused codes
      await prisma.passwordResetCode.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await prisma.passwordResetCode.create({
        data: { userId: user.id, codeHash, expiresAt },
      });

      await sendPasswordResetCode(user.email, code);
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    // Still return generic message to avoid leaking server errors per-email
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
