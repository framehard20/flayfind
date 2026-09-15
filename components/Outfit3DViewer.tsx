"use client";

import { createElement } from "react";
import Script from "next/script";

// model-viewer loads from a CDN script (same pattern as the Umami analytics
// tag in layout.tsx) instead of the npm package — nothing new for Next's
// bundler to process, which is deliberate after the npm-based integration
// broke the Vercel build with no diagnosable error.
//
// Rendered via createElement instead of JSX <model-viewer> so this needs no
// custom JSX.IntrinsicElements typing at all (that required a `declare
// global` augmentation this environment can't build-test locally).
//
// The model itself (public/models/outfit-completo.glb) is a merge of three
// independently-generated garment models: welded (fixes the source meshes
// being tens of thousands of disconnected islands), decimated (~1.9M tris
// each down to a few thousand), with real per-vertex colors transferred from
// the original high-res mesh via nearest-neighbor lookup (decimation drops
// color data outright, so this has to happen as a separate pass after), and
// a matte double-sided material (glTF's default is metallic + single-sided,
// which would look wrong on non-watertight garment shells). Positions were
// derived from real-world garment measurements (pants ~98cm, shirt ~74cm,
// shoe ~16cm) since the source files carried no shared scale, then verified
// by actually rendering and inspecting the result from the front, side, 45°,
// and back before shipping it.
//
// Sits inside Hero.tsx's side-by-side layout — this component only renders
// the interactive stage itself, no heading (the hero's own title covers that).
export function Outfit3DViewer() {
  return (
    <div className="hero-3d">
      {createElement("model-viewer", {
        src: "/models/outfit-completo.glb",
        alt: "Outfit completo en 3D: camiseta, pantalón cargo y zapatillas",
        "camera-controls": true,
        "auto-rotate": true,
        "rotation-per-second": "14deg",
        "interaction-prompt": "none",
        "shadow-intensity": "1",
        exposure: "1",
        style: { width: "100%", height: "100%", display: "block" },
      })}
      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
