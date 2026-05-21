import { COLORS, escapeHtml, layout, pill, type EmailContent } from "./_shared";
import { fmtMoney } from "./_helpers";

export type ReservationRejectedPayload = {
  guestName: string;
  cabinTitle: string;
  total: number;
};

const { INK, INK_2 } = COLORS;

export function reservationRejectedEmail(
  d: ReservationRejectedPayload
): EmailContent {
  const subject = `Tu reserva en ${d.cabinTitle} no pudo confirmarse`;
  const preheader = `El pago simulado fue devuelto.`;

  const text = [
    `Hola ${d.guestName},`,
    "",
    `El anfitrión no pudo confirmar tu reserva en ${d.cabinTitle}.`,
    `El pago simulado de ${fmtMoney(d.total)} fue devuelto de forma simulada.`,
    "",
    "Podés intentar con otras fechas o con otra cabaña.",
  ].join("\n");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("No confirmada")}</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        Tu reserva no pudo confirmarse
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        ${escapeHtml(d.guestName)}, el anfitrión no pudo aceptar tu reserva
        en <strong>${escapeHtml(d.cabinTitle)}</strong>.
      </p>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        El pago simulado de <strong>${escapeHtml(
          fmtMoney(d.total)
        )}</strong> fue devuelto de forma simulada (no se procesó dinero real).
      </p>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        Podés probar con otras fechas o con otra cabaña disponible.
      </p>
    `,
  });

  return { subject, text, html };
}
