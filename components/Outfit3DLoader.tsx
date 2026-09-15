"use client";

import dynamic from "next/dynamic";

// model-viewer registers a browser custom element — it can't run during
// Next's server render, so this whole piece is client-only.
const OutfitViewer3D = dynamic(() => import("./OutfitViewer3D"), {
  ssr: false,
  loading: () => (
    <section className="viewer3d">
      <h2 className="viewer3d-title">Míralo en 3D</h2>
      <p className="viewer3d-sub">Arrastra con el dedo o el ratón para girarlo, como si lo tuvieras en la mano</p>
      <div className="viewer3d-stage viewer3d-skeleton" aria-hidden="true" />
    </section>
  ),
});

export function Outfit3DLoader() {
  return <OutfitViewer3D />;
}
