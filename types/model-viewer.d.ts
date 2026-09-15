import type { DetailedHTMLProps, HTMLAttributes } from "react";

// @google/model-viewer registers a <model-viewer> custom element; this just
// teaches JSX its attributes so TSX can use it like a normal tag.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        ar?: boolean;
        "camera-controls"?: boolean;
        "auto-rotate"?: boolean;
        "auto-rotate-delay"?: string | number;
        "rotation-per-second"?: string;
        "interaction-prompt"?: "auto" | "when-focused" | "none";
        "shadow-intensity"?: string | number;
        exposure?: string | number;
        loading?: "auto" | "lazy" | "eager";
        reveal?: "auto" | "interaction" | "manual";
        "disable-zoom"?: boolean;
        "camera-orbit"?: string;
        "field-of-view"?: string;
      };
    }
  }
}

export {};
