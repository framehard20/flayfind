// Umami counts clicks on elements carrying data-umami-event by itself. This is
// the same thing for clicks handled in JavaScript (buttons, links that open a
// dialog first). Every event is a plain total — no per-outfit breakdown.

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export function track(event: string, data?: Record<string, unknown>): void {
  try {
    window.umami?.track(event, data);
  } catch {}
}

export const EVENTS = {
  /** Any outfit card opened, in either grid. */
  outfitOpened: "outfit_abierto",
  /** Any "Comprar" button of any garment. */
  buy: "comprar",
  /** The Hombre / Mujer buttons. */
  section: { hombre: "seccion_hombre", mujer: "seccion_mujer" },
  /** The Accesorios subsection button, per section. */
  accessories: { hombre: "accesorios_hombre", mujer: "accesorios_mujer" },
} as const;
