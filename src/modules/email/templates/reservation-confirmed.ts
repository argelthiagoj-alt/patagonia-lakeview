import { COLORS, escapeHtml, layout, pill, type EmailContent } from "./_shared";
import { fmtMoney, fmtRange } from "./_helpers";
import type { ReservationEmailPayload } from "./reservation-received";

const { INK, INK_2, BORDER } = COLORS;

export function reservationConfirmedEmail(
  d: ReservationEmailPayload
): EmailContent {
  const subject = `Tu reserva en ${d.cabinTitle} fue confirmada`;
  const preheader = `Pago simulado cobrado. Te esperamos.`;

  const text = [
    `¡${d.guestName}, te esperamos!`,
    "",
    `${d.cabinTitle} está confirmada.`,
    `Fechas: ${fmtRange(d.checkIn, d.checkOut)}`,
    `Pago simulado cobrado: ${fmtMoney(d.total)}`,
  ].join("\n");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("Confirmada")}</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        ¡Listo! Tu reserva está confirmada
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        ${escapeHtml(d.guestName)}, el anfitrión confirmó tu estadía en
        <strong>${escapeHtml(d.cabinTitle)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 18px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
        <tr><td style="padding:8px 0;font-size:12px;color:${INK_2};width:38%;">Fechas</td><td style="padding:8px 0;font-size:14px;color:${INK};">${escapeHtml(
          fmtRange(d.checkIn, d.checkOut)
        )}</td></tr>
        <tr><td style="padding:8px 0;font-size:12px;color:${INK_2};">Pago simulado</td><td style="padding:8px 0;font-size:14px;color:${INK};">Cobrado · ${escapeHtml(
          fmtMoney(d.total)
        )}</td></tr>
      </table>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        Vas a recibir indicaciones de llegada cerca de la fecha de check-in.
      </p>
    `,
  });

  return { subject, text, html };
}
