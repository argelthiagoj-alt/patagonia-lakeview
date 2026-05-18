import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { verifyCode } from "@/lib/codes";
import { hashPassword } from "@/lib/auth";
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

  const { email, code, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Generic error — don't reveal whether email exists
      return NextResponse.json(
        { error: "Código inválido o vencido." },
        { status: 400 }
      );
    }

    // Find the most recent unused, unexpired code for this user
    const candidate = await prisma.passwordResetCode.findFirst({
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

    // Update password + mark code used + invalidate all current sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(password) },
      }),
      prisma.passwordResetCode.update({
        where: { id: candidate.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: user.id } }),
    ]);

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
