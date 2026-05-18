import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
  const user = await getCurrentUser();

  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Header user={user} />
        <main className="pt-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
