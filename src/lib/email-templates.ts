/**
 * Premium HTML email templates for Patagonia Lakeview.
 *
 * Design notes:
 *   - Table-based layout — required for Outlook/Gmail compatibility.
 *   - Inline styles only (most clients strip <style>).
 *   - Max width 560px so it reads cleanly in narrow Gmail panes.
 *   - No remote images: a CSS gradient stands in for the brand header so
 *     emails render the same with images disabled.
 *   - Color palette pulled from the app tokens (warm beige + dark moss +
 *     accent terracotta).
 */

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

/* ─────────────────────── shared layout ─────────────────────── */

const BG = "#f5efe6";
const PAPER = "#fbf6f0";
const INK = "#1f1b16";
const INK_2 = "#7e7365";
const INK_3 = "#9b8e7e";
const BORDER = "#d7cbbb";
const ACCENT = "#c9793d";
const DARK = "#2e3a2f";

function layout({
  preheader,
  title,
  body,
}: {
  preheader: string;
  title: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,'Helvetica Neue',Arial,sans-serif;color:${INK};">
    <!-- Hidden preheader (gmail/iOS preview) -->
    <div style="display:none;overflow:hidden;line-height:1px;max-height:0;max-width:0;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${PAPER};border:1px solid ${BORDER};border-radius:28px;overflow:hidden;">
            <!-- Brand band -->
            <tr>
              <td style="background:linear-gradient(135deg, ${DARK} 0%, #1f1b16 100%);padding:32px 32px 28px;color:#f8f4ed;">
                <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(248,244,237,0.7);">Patagonia · Lakeview</p>
                <p style="margin:0;font-size:18px;font-weight:500;letter-spacing:-0.01em;color:#f8f4ed;">Cabañas frente al lago</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px 32px;">
                ${body}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 32px 32px;">
                <hr style="border:none;border-top:1px solid ${BORDER};margin:0 0 16px;" />
                <p style="margin:0;font-size:11px;line-height:1.6;color:${INK_3};">
                  Si no esperabas este mail, ignoralo: tu cuenta queda como estaba.
                  Este código solo funciona una vez y desde la dirección a la que llegó.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:20px 0 0;font-size:11px;color:${INK_3};">
            © ${new Date().getFullYear()} Patagonia Lakeview · Bariloche, Patagonia
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function codeBlock(code: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0;">
      <tr>
        <td align="center" style="background:#ede3d5;border-radius:20px;padding:28px 24px;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${INK_2};">Tu código</p>
          <p style="margin:0;font-size:36px;line-height:1;letter-spacing:0.4em;font-weight:500;color:${INK};font-family:'SFMono-Regular',Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;">
            ${escapeHtml(code)}
          </p>
        </td>
      </tr>
    </table>`;
}

function pill(text: string): string {
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(201,121,61,0.12);color:${ACCENT};font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(text)}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─────────────────────── templates ─────────────────────── */

export function passwordResetEmail(code: string): EmailContent {
  const subject = "Tu código para restablecer la contraseña";
  const preheader = `Tu código: ${code}. Vence en 10 minutos.`;

  const text = [
    "Hola,",
    "",
    "Recibimos un pedido para restablecer la contraseña de tu cuenta en Patagonia Lakeview.",
    "",
    `Tu código de 6 dígitos: ${code}`,
    "",
    "Vence en 10 minutos y solo se puede usar una vez.",
    "Pegalo en la pantalla de recuperación para crear una nueva contraseña.",
    "",
    "Si no fuiste vos, podés ignorar este mensaje.",
    "",
    "— Patagonia Lakeview",
  ].join("\n");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("Recuperación")}</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        Restablecer tu contraseña
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        Recibimos un pedido para cambiar la contraseña de tu cuenta.
        Usá este código de 6 dígitos para confirmar:
      </p>

      ${codeBlock(code)}

      <p style="margin:0 0 8px;font-size:14px;line-height:1.65;color:${INK_2};">
        El código vence en <strong style="color:${INK};">10 minutos</strong> y solo
        se puede usar una vez. Ingresalo en la pantalla de recuperación de
        Patagonia Lakeview.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        Por seguridad, todas las sesiones activas se van a cerrar cuando
        actualices la contraseña.
      </p>
    `,
  });

  return { subject, text, html };
}

export type JobApplicationPayload = {
  name: string;
  email: string;
  phone?: string;
  location: string;
  role: string;
  experience: string;
  portfolio?: string;
  message: string;
  submittedAt: Date;
};

const roleNames: Record<string, string> = {
  anfitrion: "Anfitrión / host",
  limpieza: "Limpieza y mantenimiento",
  "atencion-huesped": "Atención al huésped",
  mantenimiento: "Mantenimiento técnico",
  marketing: "Marketing y contenido",
  operaciones: "Operaciones",
  otro: "Otro",
};

export function jobApplicationEmail(d: JobApplicationPayload): EmailContent {
  const roleLabel = roleNames[d.role] ?? d.role;
  const subject = `Nueva postulación · ${roleLabel} · ${d.name}`;
  const preheader = `${d.name} se postuló para ${roleLabel}.`;

  const rows: { label: string; value: string }[] = [
    { label: "Nombre", value: d.name },
    { label: "Email", value: d.email },
    ...(d.phone ? [{ label: "Teléfono", value: d.phone }] : []),
    { label: "Ubicación", value: d.location },
    { label: "Rol de interés", value: roleLabel },
    ...(d.portfolio ? [{ label: "Portfolio / LinkedIn", value: d.portfolio }] : []),
    {
      label: "Recibido",
      value: d.submittedAt.toLocaleString("es-AR"),
    },
  ];

  const text = [
    subject,
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
    "",
    "Experiencia previa:",
    d.experience,
    "",
    "Mensaje:",
    d.message,
  ].join("\n");

  const rowsHtml = rows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 0;font-size:12px;color:${INK_2};width:42%;vertical-align:top;">${escapeHtml(r.label)}</td>
        <td style="padding:8px 0;font-size:14px;color:${INK};word-break:break-word;">
          ${
            r.value.startsWith("http")
              ? `<a href="${escapeHtml(r.value)}" style="color:${ACCENT};text-decoration:none;">${escapeHtml(r.value)}</a>`
              : escapeHtml(r.value)
          }
        </td>
      </tr>`
    )
    .join("");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("Nueva postulación")}</p>
      <h1 style="margin:0 0 16px;font-size:24px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        ${escapeHtml(d.name)} quiere sumarse al equipo
      </h1>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 24px;border-top:1px solid ${BORDER};border-bottom:1px solid ${BORDER};">
        ${rowsHtml}
      </table>

      <h2 style="margin:0 0 8px;font-size:14px;font-weight:500;letter-spacing:0.02em;color:${INK_2};text-transform:uppercase;">Experiencia previa</h2>
      <p style="margin:0 0 20px;padding:14px 16px;background:#ede3d5;border-radius:14px;font-size:14px;line-height:1.6;color:${INK};white-space:pre-wrap;">${escapeHtml(d.experience)}</p>

      <h2 style="margin:0 0 8px;font-size:14px;font-weight:500;letter-spacing:0.02em;color:${INK_2};text-transform:uppercase;">Mensaje</h2>
      <p style="margin:0;padding:14px 16px;background:#ede3d5;border-radius:14px;font-size:14px;line-height:1.6;color:${INK};white-space:pre-wrap;">${escapeHtml(d.message)}</p>
    `,
  });

  return { subject, text, html };
}

/* ─────────── Reservation lifecycle ─────────── */

export type ReservationEmailPayload = {
  guestName: string;
  cabinTitle: string;
  checkIn: Date;
  checkOut: Date;
  total: number;
};

function fmtRange(from: Date, to: Date) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return `${from.toLocaleDateString("es-AR", opts)} → ${to.toLocaleDateString(
    "es-AR",
    { ...opts, year: "numeric" }
  )}`;
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function reservationReceivedEmail(
  d: ReservationEmailPayload
): EmailContent {
  const subject = `Recibimos tu solicitud para ${d.cabinTitle}`;
  const preheader = `Estamos revisando tu reserva. Pago simulado autorizado.`;

  const text = [
    `Hola ${d.guestName},`,
    "",
    `Recibimos tu solicitud de reserva para ${d.cabinTitle}.`,
    `Fechas: ${fmtRange(d.checkIn, d.checkOut)}`,
    `Pago simulado: autorizado por ${fmtMoney(d.total)}`,
    "",
    "El anfitrión va a aceptar o rechazar tu reserva en las próximas horas.",
    "Si la rechaza, el pago se devuelve de forma simulada.",
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
        <tr><td style="padding:8px 0;font-size:12px;color:${INK_2};">Pago simulado</td><td style="padding:8px 0;font-size:14px;color:${INK};">Autorizado por ${escapeHtml(
          fmtMoney(d.total)
        )}</td></tr>
      </table>
      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        El anfitrión va a aceptar o rechazar tu reserva en las próximas horas.
        Si la rechaza, el pago se devuelve de forma simulada.
      </p>
    `,
  });

  return { subject, text, html };
}

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

export type ReservationRejectedPayload = {
  guestName: string;
  cabinTitle: string;
  total: number;
};

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

export function emailVerificationEmail(code: string): EmailContent {
  const subject = "Verificá tu email";
  const preheader = `Tu código: ${code}. Vence en 30 minutos.`;

  const text = [
    "Bienvenida/o a Patagonia Lakeview.",
    "",
    `Tu código de verificación es: ${code}`,
    "",
    "Vence en 30 minutos. Ingresalo en la app para confirmar tu cuenta.",
    "",
    "— Patagonia Lakeview",
  ].join("\n");

  const html = layout({
    preheader,
    title: subject,
    body: `
      <p style="margin:0 0 8px;">${pill("Bienvenida")}</p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:500;letter-spacing:-0.02em;line-height:1.2;color:${INK};">
        Confirmá tu email
      </h1>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${INK};">
        Gracias por sumarte. Para terminar de activar tu cuenta, ingresá este
        código en la pantalla de verificación:
      </p>

      ${codeBlock(code)}

      <p style="margin:0;font-size:14px;line-height:1.65;color:${INK_2};">
        Vence en <strong style="color:${INK};">30 minutos</strong>. Si necesitás
        uno nuevo, pedilo desde la app con el botón "Reenviar código".
      </p>
    `,
  });

  return { subject, text, html };
}
