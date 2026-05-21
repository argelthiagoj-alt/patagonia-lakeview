import { COLORS, escapeHtml, layout, pill, type EmailContent } from "./_shared";

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

const { INK, INK_2, BORDER, ACCENT } = COLORS;

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
    { label: "Recibido", value: d.submittedAt.toLocaleString("es-AR") },
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
