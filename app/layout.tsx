import type { Metadata } from "next";
import Script from "next/script";
import { UMAMI } from "@/lib/site";
import "./globals.css";

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
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&family=Archivo+Expanded:wght@800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Required for OutfitScene3D.tsx: three.js's addon files (OrbitControls,
            GLTFLoader, DRACOLoader) import the core library via the bare "three"
            specifier, which the browser can only resolve with an import map.
            Must be present before any module script runs, so it lives here in
            <head> (server-rendered, present from first paint) rather than being
            injected later from a client component. */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                three: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        {process.env.NODE_ENV === "production" && UMAMI.websiteId && (
          <Script src={UMAMI.src} data-website-id={UMAMI.websiteId} strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
