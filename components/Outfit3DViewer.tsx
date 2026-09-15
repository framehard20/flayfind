"use client";

import Script from "next/script";

// model-viewer loads from a CDN script (same pattern as the Umami analytics
// tag in layout.tsx) instead of the npm package — nothing new for Next's
// bundler to process, which is deliberate after the npm-based integration
// broke the Vercel build with no diagnosable error.
//
// The model itself (public/models/outfit-completo.glb) is a merge of three
// independently-generated garment models, welded, decimated (~1.9M tris each
// down to a few thousand) and baked to vertex colors instead of textures —
// their raw combined export was 87-144MB, unusable for the web. Positions
// were derived from real-world garment measurements (pants ~98cm, shirt
// ~74cm, shoe ~16cm) since the source files carried no shared scale, then
// verified by actually rendering and inspecting the result from the front,
// side, 45°, and back before shipping it.
export function Outfit3DViewer() {
  return (
    <section className="viewer3d">
      <h2 className="viewer3d-title">Míralo en 3D</h2>
      <p className="viewer3d-sub">Arrastra con el dedo o el ratón para girarlo, como si lo tuvieras en la mano</p>

      <div className="viewer3d-stage">
        <model-viewer
          src="/models/outfit-completo.glb"
          alt="Outfit completo en 3D: camiseta, pantalón cargo y zapatillas"
          camera-controls
          auto-rotate
          rotation-per-second="14deg"
          interaction-prompt="none"
          shadow-intensity="1"
          exposure="1"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
    </section>
  );
}
