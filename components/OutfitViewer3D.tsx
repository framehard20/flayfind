"use client";

import "@google/model-viewer";
import { useState } from "react";

// Each piece was generated separately and auto-normalized to its own bounding
// box (not scaled/positioned relative to a shared body), so they're shown as
// individually-spinnable pieces rather than one merged "worn outfit" scene —
// merging them blind would very likely look broken.
const PIECES = [
  { id: "sneaker", label: "Zapatillas", src: "/models/sneaker.glb", alt: "Zapatillas en 3D, gira para verlas desde todos los ángulos" },
  { id: "shirt", label: "Camiseta", src: "/models/shirt.glb", alt: "Camiseta en 3D, gira para verla desde todos los ángulos" },
  { id: "pants", label: "Pantalón", src: "/models/pants.glb", alt: "Pantalón en 3D, gira para verlo desde todos los ángulos" },
] as const;

export default function OutfitViewer3D() {
  const [active, setActive] = useState<(typeof PIECES)[number]["id"]>("sneaker");
  const piece = PIECES.find((p) => p.id === active) ?? PIECES[0];

  return (
    <section className="viewer3d">
      <h2 className="viewer3d-title">Míralo en 3D</h2>
      <p className="viewer3d-sub">Arrastra con el dedo o el ratón para girarlo, como si lo tuvieras en la mano</p>

      <div className="viewer3d-tabs" role="tablist">
        {PIECES.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.id === active}
            className="viewer3d-tab"
            onClick={() => setActive(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="viewer3d-stage">
        {/* key forces a clean remount per piece: only one ~5MB model is ever loaded at a time */}
        <model-viewer
          key={piece.id}
          src={piece.src}
          alt={piece.alt}
          camera-controls
          auto-rotate
          rotation-per-second="16deg"
          interaction-prompt="none"
          shadow-intensity="1"
          exposure="1"
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </section>
  );
}
