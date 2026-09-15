import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, Archivo_Expanded, Inter } from "next/font/google";
import { UMAMI } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const archivoExpanded = Archivo_Expanded({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--font-archivo-expanded",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Flayfind · Encuentra tu outfit ya montado";
const description =
  "Outfits del mercado chino ya montados: talla, precio y link de cada prenda. Parece de 300€, lo tienes por menos de 50.";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "es_ES" },
  twitter: { card: "summary", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${archivoExpanded.variable} ${inter.variable}`}>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && UMAMI.websiteId && (
          <Script src={UMAMI.src} data-website-id={UMAMI.websiteId} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
