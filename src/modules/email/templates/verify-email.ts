import { COLORS, codeBlock, layout, pill, type EmailContent } from "./_shared";

const { INK, INK_2 } = COLORS;

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
