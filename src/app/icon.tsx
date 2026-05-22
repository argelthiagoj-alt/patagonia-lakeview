import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Favicon dinámico para el tab de Chrome / browsers.
 *
 * Genera un PNG 64×64 con el logo de marca centrado sobre un fondo beige
 * cálido (`--color-background`) con esquinas redondeadas. Resalta mejor
 * que el PNG original (que tiene fondo oscuro / transparente y se pierde
 * en pestañas claras).
 *
 * Next/og lee este archivo y lo expone como `/icon` con caché Edge. El
 * usuario no necesita configurar nada en layout.tsx.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  // Inline el logo como data URL — `<img>` dentro de ImageResponse sólo
  // admite URLs accesibles públicamente o data URLs.
  const logoPath = join(
    process.cwd(),
    "public",
    "assets",
    "branding",
    "logo.png"
  );
  const logoBase64 = readFileSync(logoPath).toString("base64");
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5efe6", // mismo --color-background del theme
          borderRadius: "14px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width="62"
          height="62"
          style={{ objectFit: "contain" }}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
