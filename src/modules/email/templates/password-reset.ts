import { COLORS, codeBlock, layout, pill, type EmailContent } from "./_shared";

const { INK, INK_2 } = COLORS;

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
