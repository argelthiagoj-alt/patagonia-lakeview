import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { linkOrCreateGoogleAccount } from "@/modules/auth/service";
import { createSession } from "@/modules/auth/session";
import {
  OAUTH_STATE_COOKIE,
  exchangeCodeForToken,
  fetchGoogleUser,
  googleConfigured,
} from "@/lib/oauth";

function errorRedirect(req: Request, message: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, req.url)
  );
}

export async function GET(req: Request) {
  if (!googleConfigured()) {
    return errorRedirect(req, "Google OAuth no está configurado.");
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const errParam = url.searchParams.get("error");

  if (errParam) return errorRedirect(req, `Google: ${errParam}`);
  if (!code || !stateParam) {
    return errorRedirect(req, "Falta code/state en el callback.");
  }

  const jar = await cookies();
  const raw = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  if (!raw) return errorRedirect(req, "Sesión OAuth expirada. Reintentá.");

  let stored: { state: string; next?: string };
  try {
    stored = JSON.parse(raw);
  } catch {
    return errorRedirect(req, "OAuth state inválido.");
  }
  if (stored.state !== stateParam) {
    return errorRedirect(req, "OAuth state no coincide.");
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    const profile = await fetchGoogleUser(tokens.access_token);

    if (!profile.email) {
      return errorRedirect(req, "Google no devolvió un email.");
    }

    // Service does the upsert: existing account → link → new user
    const { user } = await linkOrCreateGoogleAccount({
      sub: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    if (user.isBanned) {
      return errorRedirect(req, "Tu cuenta está suspendida.");
    }

    await createSession(user.id);

    const next =
      stored.next && stored.next.startsWith("/") ? stored.next : "/dashboard";
    return NextResponse.redirect(new URL(next, req.url));
  } catch (err) {
    console.error("[google callback]", err);
    return errorRedirect(req, "No pudimos completar el login con Google.");
  }
}
