import { COLORS, escapeHtml, layout, pill, type EmailContent } from "./_shared";
import { fmtMoney, fmtRange } from "./_helpers";

export type ReservationEmailPayload = {
  guestName: string;
  cabinTitle: string;
  checkIn: Date;
  checkOut: Date;
  total: number;
};

const { INK, INK_2, BORDER } = COLORS;

export function reservationReceivedEmail(
  d: ReservationEmailPayload
): EmailContent {
  const subject = `Recibimos tu solicitud para ${d.cabinTitle}`;
  const preheader = `El anfitrión va a aprobar o rechazar tu solicitud pronto.`;

  const text = [
    `Hola ${d.guestName},`,
    "",
    `Recibimos tu solicitud de reserva para ${d.cabinTitle}.`,
    `Fechas: ${fmtRange(d.checkIn, d.checkOut)}`,
    `Total estimado: ${fmtMoney(d.total)} (todavía no se cobra nada).`,
    "",
    "El anfitrión va a aprobar o rechazar la solicitud en las próximas horas.",
    "Si la aprueba, te avisamos para que completes el pago simulado y la reserva quede confirmada.",
  ].join("\n");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("Solicitud recibida")}</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        Estamos revisando tu reserva
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        Hola ${escapeHtml(d.guestName)}, recibimos tu solicitud para
        <strong>${escapeHtml(d.cabinTitle)}</strong>.
      </p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 18px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
        <tr><td style="padding:8px 0;font-size:12px;color:${INK_2};width:38%;">Fechas</td><td style="padding:8px 0;font-size:14px;color:${INK};">${escapeHtml(
          fmtRange(d.checkIn, d.checkOut)
        )}</td></tr>
        <tr><td style="padding:8px 0;font-size:12px;color:${INK_2};">Total estimado</td><td style="padding:8px 0;font-size:14px;color:${INK};">${escapeHtml(
          fmtMoney(d.total)
        )} · sin cobro todavía</td></tr>
      </table>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        El anfitrión va a aprobar o rechazar tu solicitud en las próximas
        horas. Si la aprueba, te avisamos para que completes el pago
        simulado y la reserva quede confirmada.
      </p>
    `,
  });

  return { subject, text, html };
}
