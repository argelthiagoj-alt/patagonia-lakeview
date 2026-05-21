import type { Metadata } from "next";
import { Inter, Fraunces, Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/modules/auth/session";
import { getAppDateServer } from "@/modules/demo-tools/date";
import { demoEnabled } from "@/modules/demo-tools/config";
import { currentSeason } from "@/modules/seasonal-theme/helpers";
import { DemoDatePanel } from "@/components/demo/DemoDatePanel";
import { AppDateProvider } from "@/components/demo/AppDateProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Editorial serif used in the brand manifesto / "Experiencia" page.
// Variable axes let us bend it toward optical-large for cinematic headlines.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

// Tipografía editorial AMAN-like para el wordmark "Patagonia Lakeview".
// Cormorant Garamond es serif refinada, gratuita en Google Fonts y la
// estética se acerca a la prensa luxury hospitality (AMAN, Aman Venice,
// Six Senses) sin requerir licencia propietaria.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-wordmark",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Patagonia Lakeview · Cabañas boutique frente al lago",
    template: "%s · Patagonia Lakeview",
  },
  description:
    "Cabañas boutique en la Patagonia. Lagos, bosque, montañas y diseño cálido para descansar, explorar y reconectar.",
  keywords: [
    "cabañas",
    "Patagonia",
    "lago",
    "Bariloche",
    "Villa La Angostura",
    "boutique",
    "reservas",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    title: "Patagonia Lakeview",
    description:
      "Cabañas boutique frente a los lagos de la Patagonia. Diseño cálido, naturaleza nativa, experiencia premium.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, appDate] = await Promise.all([
    getCurrentUser(),
    getAppDateServer(),
  ]);
  const season = currentSeason(appDate);
  const isDemo = demoEnabled();

  return (
    <html
      lang="es"
      data-season={season}
      className={`${inter.variable} ${fraunces.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AppDateProvider initial={appDate.toISOString()}>
          <Header user={user} />
          <main className="pt-0">{children}</main>
          <Footer />
          {isDemo && <DemoDatePanel />}
        </AppDateProvider>
      </body>
    </html>
  );
}
