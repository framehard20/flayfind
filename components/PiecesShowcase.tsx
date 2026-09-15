"use client";

import { createElement, type CSSProperties } from "react";
import Script from "next/script";

// Each piece is its own <model-viewer>, loading the original full-quality,
// full-texture files untouched (no decimation, no color-transfer risk — see
// the git history for why that pipeline was abandoned). The two shoe tiles
// both load the same sneaker.glb; the right one is CSS-mirrored rather than
// re-exporting a second mesh, which is visually a pair without doubling the
// download.
//
// camera-orbit/field-of-view are set explicitly per piece instead of relying
// on model-viewer's auto-framing: a wide flat shoe and a tall shirt don't
// naturally fill a square frame the same amount. radius = each model's real
// bounding-box diagonal * 0.62 (measured from the source files directly), so
// every piece reads as roughly the same on-screen size despite very
// different physical proportions.
//
// These files require KHR_draco_mesh_compression, so model-viewer fetches
// Google's Draco decoder from gstatic.com at runtime (allowed in the CSP).
const PIECES = [
  { id: "shirt", label: "Camiseta", src: "/models/shirt.glb", radius: "0.80m", rpm: "13deg", boingDelay: "0s", bobDur: "3.2s", bobDelay: ".7s" },
  { id: "pants", label: "Pantalón", src: "/models/pants.glb", radius: "0.72m", rpm: "10deg", boingDelay: ".12s", bobDur: "3.7s", bobDelay: ".82s" },
  { id: "shoe-l", label: "Zapatilla", src: "/models/sneaker.glb", radius: "0.72m", rpm: "16deg", boingDelay: ".24s", bobDur: "3.0s", bobDelay: ".94s" },
  {
    id: "shoe-r",
    label: "Zapatilla",
    src: "/models/sneaker.glb",
    radius: "0.72m",
    rpm: "16deg",
    boingDelay: ".36s",
    bobDur: "3.9s",
    bobDelay: "1.06s",
    mirror: true,
  },
] as const;

export function PiecesShowcase() {
  return (
    <div className="pieces3d">
      <div className="pieces3d-grid">
        {PIECES.map((p) => (
          <div key={p.id} className="pieces3d-tile" style={{ animationDelay: p.boingDelay }}>
            <div className="pieces3d-stage" style={{ "--bob-dur": p.bobDur, "--bob-delay": p.bobDelay } as CSSProperties}>
              {createElement("model-viewer", {
                src: p.src,
                alt: p.label,
                "camera-controls": true,
                "auto-rotate": true,
                "rotation-per-second": p.rpm,
                "camera-orbit": `0deg 78deg ${p.radius}`,
                "field-of-view": "30deg",
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
          </div>
        ))}
      </div>

      <Script
        type="module"
        src="https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
