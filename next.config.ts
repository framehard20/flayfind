import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The page has no server code, so 'unsafe-inline' for scripts (needed by
// Next's hydration payload on a statically rendered page) is an acceptable
// trade-off; everything else is locked to this origin + Umami + the one
// Google CDN the 3D viewer needs (see below).
// NOTE: if you wire up an external contest-form endpoint (Formspree, Getform,
// a Vercel API route on another domain, etc.), add that origin to connect-src
// below or the browser will silently block the submit request.
// The .glb models under public/models require KHR_draco_mesh_compression,
// so <model-viewer> fetches Google's Draco decoder (JS + WASM) from
// gstatic.com at runtime — allowed explicitly below instead of self-hosting
// it, since there's no safe way to extract/verify that binary in this setup.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cloud.umami.is https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' https://cloud.umami.is https://gateway.umami.is https://www.gstatic.com${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
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
