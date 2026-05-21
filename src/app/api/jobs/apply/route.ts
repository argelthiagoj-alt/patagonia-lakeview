import { NextResponse } from "next/server";
import { jobApplicationSchema } from "@/modules/jobs/schemas";
import { sendJobApplicationEmail } from "@/modules/email/senders";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Coarse abuse protection
  const ip = clientIp(req);
  const rl = checkRateLimit({
    key: `jobs:${ip}`,
    max: 4,
    windowMs: 60 * 60_000, // 4 / hour / IP
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados envíos. Probá más tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = jobApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisá los campos del formulario.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot: silently 200 if a bot filled the hidden field
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendJobApplicationEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    location: parsed.data.location,
    role: parsed.data.role,
    experience: parsed.data.experience,
    portfolio: parsed.data.portfolio || undefined,
    message: parsed.data.message,
    submittedAt: new Date(),
  });

  if (!result.ok && result.provider !== "console") {
    return NextResponse.json(
      {
        error:
          "No pudimos enviar tu postulación ahora mismo. Probá de nuevo en unos minutos.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Recibimos tu postulación. Te respondemos pronto.",
  });
}
