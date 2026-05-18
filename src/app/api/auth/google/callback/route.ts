import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
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

  if (errParam) {
    return errorRedirect(req, `Google: ${errParam}`);
  }
  if (!code || !stateParam) {
    return errorRedirect(req, "Falta code/state en el callback.");
  }

  const jar = await cookies();
  const raw = jar.get(OAUTH_STATE_COOKIE)?.value;
  jar.delete(OAUTH_STATE_COOKIE);

  if (!raw) {
    return errorRedirect(req, "Sesión OAuth expirada. Reintentá.");
  }

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

    const email = profile.email.toLowerCase();

    // Upsert flow:
    // 1. Try to find existing Account (provider+providerAccountId).
    // 2. If not found, try by email and link as a new Account.
    // 3. If neither, create a new User + Account.
    const accountExisting = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.sub,
        },
      },
      include: { user: true },
    });

    let userId: string;

    if (accountExisting) {
      userId = accountExisting.userId;
      // Refresh name/image if they were missing
      if (!accountExisting.user.name && profile.name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name: profile.name, image: profile.picture ?? null },
        });
      }
    } else {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        await prisma.account.create({
          data: {
            userId: existingByEmail.id,
            provider: "google",
            providerAccountId: profile.sub,
            email,
          },
        });
        // Trust Google's verification → mark email verified if not yet
        if (!existingByEmail.emailVerified) {
          await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              emailVerified: new Date(),
              image: existingByEmail.image ?? profile.picture ?? null,
              name: existingByEmail.name ?? profile.name ?? null,
            },
          });
        }
        userId = existingByEmail.id;
      } else {
        const created = await prisma.user.create({
          data: {
            email,
            name: profile.name ?? null,
            image: profile.picture ?? null,
            emailVerified: new Date(), // Google verifies email
            accounts: {
              create: {
                provider: "google",
                providerAccountId: profile.sub,
                email,
              },
            },
          },
        });
        userId = created.id;
      }
    }

    await createSession(userId);

    const next = stored.next && stored.next.startsWith("/") ? stored.next : "/dashboard";
    return NextResponse.redirect(new URL(next, req.url));
  } catch (err) {
    console.error("[google callback]", err);
    return errorRedirect(req, "No pudimos completar el login con Google.");
  }
}
