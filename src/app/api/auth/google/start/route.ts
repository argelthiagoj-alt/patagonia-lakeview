import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_TTL_S,
  buildGoogleAuthUrl,
  googleConfigured,
  randomState,
} from "@/lib/oauth";

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          "Google OAuth no está configurado. Pedí al admin que configure GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET."
        )}`,
        req.url
      )
    );
  }

  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? undefined;

  const state = randomState();

  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OAUTH_STATE_TTL_S,
    path: "/",
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state, next));
}
