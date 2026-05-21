import crypto from "node:crypto";

/**
 * Tiny Google OAuth 2.0 / OpenID Connect helpers.
 *
 * We use the authorization-code flow with an httpOnly state cookie so
 * we don't depend on NextAuth. Everything stays inside our session model.
 */

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_USERINFO_URL =
  "https://openidconnect.googleapis.com/v1/userinfo";

export const OAUTH_STATE_COOKIE = "pl_oauth_state";
export const OAUTH_STATE_TTL_S = 10 * 60; // 10 min

export function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
}

/**
 * Resuelve la base URL de la app para construir el redirect_uri.
 *
 * Prioridad:
 *   1. NEXT_PUBLIC_APP_URL  (lo que vos seteás explícitamente, ej. el
 *      dominio custom en Vercel o http://localhost:3000 en .env).
 *   2. VERCEL_URL           (Vercel lo inyecta automáticamente en cada
 *      preview/production deploy — útil si te olvidaste de configurar
 *      NEXT_PUBLIC_APP_URL en Vercel).
 *   3. http://localhost:3000 como último fallback (sólo dev).
 *
 * NOTA IMPORTANTE: la redirect_uri que se manda a Google **tiene que
 * coincidir EXACTAMENTE** con una de las "Authorized redirect URIs"
 * cargadas en la Google Cloud Console (incluyendo http vs https, con o
 * sin trailing slash, etc.). Si no coincide → `redirect_uri_mismatch`.
 *
 * El path es `/api/auth/google/callback` (NO `/api/auth/callback/google`,
 * que es la convención de NextAuth — esta app usa auth custom).
 */
export function googleRedirectUri(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/api/auth/google/callback`;

  // Vercel inyecta VERCEL_URL sin protocolo (ej. "patagonia-lakeview.vercel.app").
  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) return `https://${vercel}/api/auth/google/callback`;

  return "http://localhost:3000/api/auth/google/callback";
}

export function randomState(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function buildGoogleAuthUrl(state: string, next?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
    include_granted_scopes: "true",
  });
  if (next) params.set("login_hint_next", next);
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
};

export type GoogleUser = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function exchangeCodeForToken(
  code: string
): Promise<GoogleTokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${res.status} ${body}`);
  }
  return res.json();
}

export async function fetchGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google userinfo failed: ${res.status}`);
  }
  return res.json();
}
