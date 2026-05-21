import "server-only";

import { Resend } from "resend";

/**
 * Low-level email transport. Wraps the Resend SDK so the senders module
 * doesn't have to know how delivery works.
 *
 * Provider strategy:
 *   1. RESEND_API_KEY set → send via official Resend SDK.
 *   2. Not configured → in development, log the email (and any code) to the
 *      server console; in production, log a warning and report `ok: false`.
 *
 * The transport **never throws**: every caller path returns a typed result.
 */

const FROM_DEFAULT = "Patagonia Lakeview <onboarding@resend.dev>";

export type SendOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailDeliveryResult = {
  ok: boolean;
  provider: "resend" | "console" | "none";
  id?: string;
  reason?: string;
};

let cachedClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cachedClient) cachedClient = new Resend(process.env.RESEND_API_KEY);
  return cachedClient;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || FROM_DEFAULT;
}

/** Extract `foo@bar.com` from either a plain address or `"Name <foo@bar.com>"`. */
export function extractAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

async function sendViaResend(opts: SendOptions): Promise<EmailDeliveryResult> {
  const client = getResend()!;
  try {
    const { data, error } = await client.emails.send({
      from: fromAddress(),
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text,
    });
    if (error) {
      console.error("[email] Resend error:", error.name, error.message);
      return { ok: false, provider: "resend", reason: error.message };
    }
    return { ok: true, provider: "resend", id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[email] Resend network error:", message);
    return { ok: false, provider: "resend", reason: message };
  }
}

export function logToConsole(opts: SendOptions): EmailDeliveryResult {
  if (process.env.NODE_ENV !== "production") {
    /* eslint-disable no-console */
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧  [dev email] Sin provider configurado");
    console.log("    Setear RESEND_API_KEY para envío real.");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("From:    ", fromAddress());
    console.log("To:      ", opts.to);
    console.log("Subject: ", opts.subject);
    console.log("");
    console.log(opts.text);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    /* eslint-enable no-console */
    return { ok: true, provider: "console" };
  }
  console.warn(
    "[email] Provider not configured in production; email NOT sent to",
    opts.to
  );
  return { ok: false, provider: "none", reason: "no-provider" };
}

/** Low-level send. Senders module wraps this. */
export async function sendEmail(opts: SendOptions): Promise<EmailDeliveryResult> {
  if (emailConfigured()) return sendViaResend(opts);
  return logToConsole(opts);
}
