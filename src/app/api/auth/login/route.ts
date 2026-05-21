import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { loginSchema } from "@/modules/auth/schemas";
import { authenticate } from "@/modules/auth/service";
import { createSession } from "@/modules/auth/session";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/auth/login
 *
 * Thin route — body parsing, coarse IP throttle, delegate auth domain to
 * `authenticate()`, create session, serialize. Per-email lockout and
 * credential checks live in the service.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);

  // Coarse per-IP throttle so password spraying is unviable
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

  try {
    const result = await authenticate(email, password, ip);
    if (!result.ok) {
      if (result.reason === "LOCKED_OUT") {
        return NextResponse.json(
          {
            error:
              "Demasiados intentos fallidos para este email. Esperá unos minutos o usá 'Olvidé mi contraseña'.",
          },
          {
            status: 429,
            headers: { "Retry-After": String(result.retryAfterSeconds ?? 60) },
          }
        );
      }
      return NextResponse.json(
        { error: "Credenciales inválidas." },
        { status: 401 }
      );
    }

    await createSession(result.user.id);
    return NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        emailVerified: result.user.emailVerified,
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
