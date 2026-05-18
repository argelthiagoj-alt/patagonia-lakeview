import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { createSession, hashPassword } from "@/lib/auth";
import {
  generateNumericCode,
  hashCode,
  EMAIL_VERIFICATION_TTL_MS,
} from "@/lib/codes";
import { sendEmailVerificationCode } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `register:${ip}`,
    max: 5,
    windowMs: 60 * 60_000, // 5 / hour / IP
  });
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          "Demasiados intentos de registro. Esperá unos minutos y probá de nuevo.",
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });

    // Fire-and-forget email verification code. We don't block registration if it fails.
    try {
      const code = generateNumericCode(6);
      const codeHash = await hashCode(code);
      await prisma.emailVerificationCode.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
        },
      });
      void sendEmailVerificationCode(user.email, code);
    } catch (err) {
      console.warn("[register] failed to send verification email", err);
    }

    await createSession(user.id);

    return NextResponse.json(
      {
        user: { id: user.id, email: user.email, name: user.name },
        verifyEmail: true,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Server error" }, { status: 503 });
  }
}
