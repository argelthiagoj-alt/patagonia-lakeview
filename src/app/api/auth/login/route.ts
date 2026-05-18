import { NextResponse } from "next/server";
import { prisma, isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createSession, verifyPassword } from "@/lib/auth";
import { checkRateLimit, clientIp, resetRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);

  // Coarse per-IP throttle to deter password spraying
  const ipRl = checkRateLimit({
    key: `login-ip:${ip}`,
    max: 20,
    windowMs: 15 * 60_000,
  });
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá en unos minutos." },
      { status: 429, headers: { "Retry-After": String(ipRl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
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

  const { email, password } = parsed.data;

  // Per (email + IP) failed-attempts lockout: 5 within 10 minutes
  const failKey = `login-fail:${ip}:${email.toLowerCase()}`;
  const failRl = checkRateLimit({
    key: failKey,
    max: 5,
    windowMs: 10 * 60_000,
  });
  if (!failRl.allowed) {
    return NextResponse.json(
      {
        error:
          "Demasiados intentos fallidos para este email. Esperá unos minutos o usá 'Olvidé mi contraseña'.",
      },
      { status: 429, headers: { "Retry-After": String(failRl.retryAfterSeconds) } }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    // Success — clear the failure counter for this (email+IP)
    resetRateLimit(failKey);

    await createSession(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json(
      { error: DEMO_MODE_MESSAGE, demoMode: true },
      { status: 503 }
    );
  }
}
