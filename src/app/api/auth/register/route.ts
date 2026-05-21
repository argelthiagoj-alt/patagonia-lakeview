import { NextResponse } from "next/server";
import { isDbConfigured, DEMO_MODE_MESSAGE } from "@/lib/prisma";
import { registerSchema } from "@/modules/auth/schemas";
import { register } from "@/modules/auth/service";
import { createSession } from "@/modules/auth/session";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `register:${ip}`,
    max: 5,
    windowMs: 60 * 60_000,
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
    const result = await register(name, email, password);
    if (!result.ok) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    await createSession(result.user.id);

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        verifyEmail: result.verificationSent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Server error" }, { status: 503 });
  }
}
