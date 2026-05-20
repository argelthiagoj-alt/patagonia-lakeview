/**
 * Email service for Patagonia Lakeview.
 *
 * Provider strategy:
 *   1. If RESEND_API_KEY is set → send via official Resend SDK.
 *   2. If not configured → in development, log the email (and the code) to
 *      the server console so devs see exactly what would have been sent.
 *      In production, log a warning and report `ok: false`.
 *
 * The service **never throws**: every caller path returns a typed result.
 * That keeps API routes resilient (a Resend outage won't crash a register).
 */

import { Resend } from "resend";
import {
  emailVerificationEmail,
  jobApplicationEmail,
  passwordResetEmail,
  reservationConfirmedEmail,
  reservationReceivedEmail,
  reservationRejectedEmail,
  type EmailContent,
  type JobApplicationPayload,
  type ReservationEmailPayload,
  type ReservationRejectedPayload,
} from "@/lib/email-templates";

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

/* ─────────── Provider plumbing ─────────── */

let cachedClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cachedClient) cachedClient = new Resend(process.env.RESEND_API_KEY);
  return cachedClient;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || FROM_DEFAULT;
}

/* ─────────── Send paths ─────────── */

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

function logToConsole(opts: SendOptions): EmailDeliveryResult {
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

/** Low-level send. Use the higher-level helpers below when possible. */
export async function sendEmail(
  opts: SendOptions
): Promise<EmailDeliveryResult> {
  if (emailConfigured()) return sendViaResend(opts);
  return logToConsole(opts);
}

/* ─────────── High-level helpers ─────────── */

async function sendTemplated(
  to: string,
  template: EmailContent
): Promise<EmailDeliveryResult> {
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

/**
 * Send the password-reset code email. Used by `/api/auth/forgot-password`.
 * The code is the **plaintext** 6-digit string the user must enter — never
 * pass the bcrypt hash here.
 */
export async function sendPasswordResetCode(
  email: string,
  code: string
): Promise<EmailDeliveryResult> {
  return sendTemplated(email, passwordResetEmail(code));
}

/**
 * Send the email-verification code. Used on registration and on
 * `GET /api/auth/verify-email` (resend).
 */
export async function sendEmailVerificationCode(
  email: string,
  code: string
): Promise<EmailDeliveryResult> {
  return sendTemplated(email, emailVerificationEmail(code));
}

/* ─────────── Reservation lifecycle ─────────── */

export async function sendReservationReceivedEmail(
  payload: ReservationEmailPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationReceivedEmail(d));
}

export async function sendReservationConfirmedEmail(
  payload: ReservationEmailPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationConfirmedEmail(d));
}

export async function sendReservationRejectedEmail(
  payload: ReservationRejectedPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationRejectedEmail(d));
}

/**
 * Send a "Trabajá con nosotros" application to the company inbox.
 * The recipient comes from COMPANY_CONTACT_EMAIL, with fallbacks:
 *   1. COMPANY_CONTACT_EMAIL (env)
 *   2. parse address out of EMAIL_FROM
 *   3. last resort, log only.
 */
export async function sendJobApplicationEmail(
  data: JobApplicationPayload
): Promise<EmailDeliveryResult> {
  const to =
    process.env.COMPANY_CONTACT_EMAIL?.trim() ||
    extractAddress(process.env.EMAIL_FROM ?? "") ||
    "";

  if (!to) {
    console.warn(
      "[email] No COMPANY_CONTACT_EMAIL — application from",
      data.email,
      "will only be logged."
    );
    return logToConsole({
      to: "<no-recipient>",
      ...jobApplicationEmail(data),
    });
  }

  const template = jobApplicationEmail(data);
  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

/** Extract `foo@bar.com` from either a plain address or `"Name <foo@bar.com>"`. */
function extractAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}
