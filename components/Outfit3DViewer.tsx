"use client";

import { useEffect, useRef, useState } from "react";

// The outfit scattered around the hero title: shirt left of "EL LOOK", cargo
// pants leaning on "COMPLETO,", and a sneaker sitting on "YA PENSADO.".
// Rendered inside the title so every position is in em and scales with the
// heading (see .fit3d-* in globals.css). Pieces float gently, lean towards the
// mouse and bounce on hover/tap. three.js is imported lazily (see lib/garment3d.ts).
type Piece = {
  key: string;
  url: string;
  /** resting yaw / pitch, radians */
  yaw: number;
  pitch?: number;
  /** must match the slot's CSS rotate, for the hover hit test */
  tilt: number;
  mirror?: boolean;
  /** idle float offset (radians) so the pieces don't bob in unison */
  phase: number;
};

const PIECES: Piece[] = [
  { key: "shirt", url: "/models/shirt.glb", yaw: -0.35, tilt: -11, phase: 0 },
  { key: "pants", url: "/models/pants.glb", yaw: 0.3, tilt: 13, phase: 2.1 },
  { key: "sneaker", url: "/models/sneaker.glb", yaw: -0.35, pitch: 0.12, tilt: -8, phase: 4.2 },
];

function Garment({ piece }: { piece: Piece }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    import("@/lib/garment3d")
      .then(({ mountGarment }) => {
        if (cancelled) return;
        dispose = mountGarment(canvas, {
          url: piece.url,
          yaw: piece.yaw,
          pitch: piece.pitch,
          tilt: piece.tilt,
          mirror: piece.mirror,
          phase: piece.phase,
          onLoad: () => !cancelled && setReady(true),
        }).dispose;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [piece]);

  return (
    <span
      className={`fit3d-slot fit3d-${piece.key}`}
      data-ready={ready || undefined}
      style={{ rotate: `${piece.tilt}deg` }}
    >
      <canvas ref={canvasRef} className="fit3d-canvas" />
    </span>
  );
}

// Decorative (the heading text already says it all), so hidden from
// assistive tech; spans because it lives inside the <h1>.
export function Outfit3DViewer() {
  return (
    <span className="fit3d" aria-hidden="true">
      {PIECES.map((p) => (
        <Garment key={p.key} piece={p} />
      ))}
    </span>
  );
}
