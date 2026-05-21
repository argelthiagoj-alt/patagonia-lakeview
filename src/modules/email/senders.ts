import "server-only";

import {
  sendEmail,
  logToConsole,
  extractAddress,
  type EmailDeliveryResult,
} from "./client";
import type { EmailContent } from "./templates/_shared";
import { passwordResetEmail } from "./templates/password-reset";
import { emailVerificationEmail } from "./templates/verify-email";
import {
  reservationReceivedEmail,
  type ReservationEmailPayload,
} from "./templates/reservation-received";
import { reservationConfirmedEmail } from "./templates/reservation-confirmed";
import {
  reservationRejectedEmail,
  type ReservationRejectedPayload,
} from "./templates/reservation-rejected";
import {
  jobApplicationEmail,
  type JobApplicationPayload,
} from "./templates/job-application";

/**
 * High-level email senders. One function per business event so the rest of
 * the app can call `sendPasswordResetCode(email, code)` without juggling
 * subjects, HTML, or the transport.
 */

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

/* ─────────── Auth ─────────── */

export function sendPasswordResetCode(
  email: string,
  code: string
): Promise<EmailDeliveryResult> {
  return sendTemplated(email, passwordResetEmail(code));
}

export function sendEmailVerificationCode(
  email: string,
  code: string
): Promise<EmailDeliveryResult> {
  return sendTemplated(email, emailVerificationEmail(code));
}

/* ─────────── Reservation lifecycle ─────────── */

export function sendReservationReceivedEmail(
  payload: ReservationEmailPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationReceivedEmail(d));
}

export function sendReservationConfirmedEmail(
  payload: ReservationEmailPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationConfirmedEmail(d));
}

export function sendReservationRejectedEmail(
  payload: ReservationRejectedPayload & { to: string }
): Promise<EmailDeliveryResult> {
  const { to, ...d } = payload;
  return sendTemplated(to, reservationRejectedEmail(d));
}

/* ─────────── Jobs ─────────── */

/**
 * Send a "Trabajá con nosotros" application to the company inbox.
 * Recipient resolution:
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
