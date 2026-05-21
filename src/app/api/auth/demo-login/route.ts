import { NextResponse } from "next/server";
import { findUserByEmail } from "@/modules/users/repo";
import { createSession } from "@/modules/auth/session";

// Whitelist of seeded demo accounts. Hard-coded so production data can't be touched.
const DEMO_EMAILS = new Set([
  "superadmin@patagonialakeview.demo",
  "user@patagonialakeview.demo",
  "admin1@patagonialakeview.demo",
  "admin2@patagonialakeview.demo",
  "admin3@patagonialakeview.demo",
]);

function demoEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

export async function POST(req: Request) {
  if (!demoEnabled()) {
    return NextResponse.json({ error: "Demo mode disabled" }, { status: 403 });
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.toLowerCase() : "";
  if (!DEMO_EMAILS.has(email)) {
    return NextResponse.json({ error: "Cuenta demo desconocida." }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "La cuenta demo no existe. Corré `npm run db:seed`." },
        { status: 404 }
      );
    }
    if (user.isBanned) {
      return NextResponse.json(
        { error: "Esta cuenta demo está baneada (a propósito o por accidente)." },
        { status: 403 }
      );
    }

    await createSession(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error("[POST /api/auth/demo-login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
