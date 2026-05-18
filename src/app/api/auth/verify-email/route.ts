import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations";
import {
  generateNumericCode,
  hashCode,
  verifyCode,
  EMAIL_VERIFICATION_TTL_MS,
} from "@/lib/codes";
import { sendEmailVerificationCode } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/** GET → request a fresh code (for the currently logged-in user). */
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
  if (me.emailVerified) {
    return NextResponse.json({ message: "Tu email ya está verificado." });
  }

  try {
    const code = generateNumericCode(6);
    const codeHash = await hashCode(code);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

    await prisma.emailVerificationCode.updateMany({
      where: { userId: me.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await prisma.emailVerificationCode.create({
      data: { userId: me.id, codeHash, expiresAt },
    });

    await sendEmailVerificationCode(me.email, code);

    return NextResponse.json({
      message: "Te enviamos un código a tu email.",
    });
  } catch (err) {
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.json(
      { error: "No pudimos enviar el código." },
      { status: 500 }
    );
  }
}

/** POST → submit the code. */
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
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }

  const { email, code } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email ya verificado." });
    }

    const candidate = await prisma.emailVerificationCode.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }

    const matches = await verifyCode(code, candidate.codeHash);
    if (!matches) {
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationCode.update({
        where: { id: candidate.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Email verificado." });
  } catch (err) {
    console.error("[POST /api/auth/verify-email]", err);
    return NextResponse.json(
      { error: "No pudimos verificar el código." },
      { status: 500 }
    );
  }
}
