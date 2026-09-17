import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// HTTPS-only headers go out only on Vercel. Sent from localhost they make
// Safari remember "localhost is HTTPS-only" (it applies HSTS to localhost,
// unlike Chrome), after which http://localhost:3000 won't open at all.
const isHttpsDeploy = !!process.env.VERCEL;

// The page has no server code, so 'unsafe-inline' for scripts (needed by
// Next's hydration payload on a statically rendered page) is an acceptable
// trade-off; everything else is locked to this origin + Umami.
// The 3D garments (three.js, lib/garment3d.ts) need 'wasm-unsafe-eval' for
// the inline meshopt decoder and blob: in connect-src because GLTFLoader
// fetches embedded textures through blob URLs.
// NOTE: if you wire up an external contest-form endpoint (Formspree, Getform,
// a Vercel API route on another domain, etc.), add that origin to connect-src
// below or the browser will silently block the submit request.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://cloud.umami.is 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' blob: https://cloud.umami.is https://gateway.umami.is${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttpsDeploy ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(isHttpsDeploy
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
