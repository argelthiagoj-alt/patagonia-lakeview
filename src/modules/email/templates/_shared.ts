/**
 * Shared layout primitives for HTML email templates.
 *
 * Design notes:
 *   - Table-based layout — required for Outlook/Gmail compatibility.
 *   - Inline styles only (most clients strip <style>).
 *   - Max width 560px so it reads cleanly in narrow Gmail panes.
 *   - No remote images: a CSS gradient stands in for the brand header.
 */

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

export const COLORS = {
  BG: "#f5efe6",
  PAPER: "#fbf6f0",
  INK: "#1f1b16",
  INK_2: "#7e7365",
  INK_3: "#9b8e7e",
  BORDER: "#d7cbbb",
  ACCENT: "#c9793d",
  DARK: "#2e3a2f",
} as const;

const { BG, PAPER, INK, INK_2, INK_3, BORDER, ACCENT, DARK } = COLORS;

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function layout({
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
    <div style="display:none;overflow:hidden;line-height:1px;max-height:0;max-width:0;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:${PAPER};border:1px solid ${BORDER};border-radius:28px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(135deg, ${DARK} 0%, #1f1b16 100%);padding:32px 32px 28px;color:#f8f4ed;">
                <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(248,244,237,0.7);">Patagonia · Lakeview</p>
                <p style="margin:0;font-size:18px;font-weight:500;letter-spacing:-0.01em;color:#f8f4ed;">Cabañas frente al lago</p>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px 32px;">
                ${body}
              </td>
            </tr>
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

export function codeBlock(code: string): string {
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

export function pill(text: string): string {
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(201,121,61,0.12);color:${ACCENT};font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(text)}</span>`;
}
