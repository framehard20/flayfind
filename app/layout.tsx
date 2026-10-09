import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { CopyGuard } from "@/components/CopyGuard";
import { SITE_URL, UMAMI } from "@/lib/site";
import "./globals.css";

const title = "Flayfind · Encuentra tu outfit ya montado";
const description =
  "Outfits del mercado chino ya montados: talla, precio y link de cada prenda. Parece de 300€, lo tienes por menos de 50.";

export const metadata: Metadata = {
  // the www address: flayfind.com redirects there, so links and previews point straight at it
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "es_ES", siteName: "Flayfind" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* the two files every page needs first; the rest load as text asks for them */}
        <link rel="preload" href="/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <CopyGuard />
        {children}
        {process.env.NODE_ENV === "production" && UMAMI.websiteId && (
          <Script src={UMAMI.src} data-website-id={UMAMI.websiteId} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
