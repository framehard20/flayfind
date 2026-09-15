"use client";

import { createElement, type CSSProperties } from "react";
import Script from "next/script";

// Each piece is its own <model-viewer>, loading the original full-quality,
// full-texture files untouched (no decimation, no color-transfer risk —
// that pipeline was for a single merged "worn outfit" model, abandoned
// because it kept losing quality/color and wasn't what was actually wanted:
// independently-moving pieces, not one fused figure). The two shoe tiles
// both load the same sneaker.glb; the right one is CSS-mirrored rather than
// re-exporting a second mesh, which is visually a pair without doubling the
// download.
//
// These files require KHR_draco_mesh_compression, so model-viewer fetches
// Google's Draco decoder from gstatic.com at runtime (allowed in the CSP).
const PIECES = [
  { id: "shirt", label: "Camiseta", src: "/models/shirt.glb", rpm: "13deg", boingDelay: "0s", bobDur: "3.2s", bobDelay: ".7s" },
  { id: "pants", label: "Pantalón", src: "/models/pants.glb", rpm: "10deg", boingDelay: ".12s", bobDur: "3.7s", bobDelay: ".82s" },
  { id: "shoe-l", label: "Zapatilla", src: "/models/sneaker.glb", rpm: "16deg", boingDelay: ".24s", bobDur: "3.0s", bobDelay: ".94s" },
  {
    id: "shoe-r",
    label: "Zapatilla",
    src: "/models/sneaker.glb",
    rpm: "16deg",
    boingDelay: ".36s",
    bobDur: "3.9s",
    bobDelay: "1.06s",
    mirror: true,
  },
] as const;

export function PiecesShowcase() {
  return (
    <section className="pieces">
      <h2 className="pieces-title">Míralo en 3D</h2>
      <p className="pieces-sub">Cada prenda se mueve por su cuenta — arrástrala para girarla como quieras</p>

      <div className="pieces-grid">
        {PIECES.map((p) => (
          <div key={p.id} className="pieces-tile" style={{ animationDelay: p.boingDelay }}>
            <div className="pieces-stage" style={{ "--bob-dur": p.bobDur, "--bob-delay": p.bobDelay } as CSSProperties}>
              {createElement("model-viewer", {
                src: p.src,
                alt: p.label,
                "camera-controls": true,
                "auto-rotate": true,
                "rotation-per-second": p.rpm,
                "interaction-prompt": "none",
                "shadow-intensity": "1",
                exposure: "1",
                style: {
                  width: "100%",
                  height: "100%",
                  display: "block",
                  transform: "mirror" in p && p.mirror ? "scaleX(-1)" : undefined,
                },
              })}
            </div>
            <span className="pieces-label">{p.label}</span>
          </div>
        ))}
      </div>

      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
    </section>
  );
}
