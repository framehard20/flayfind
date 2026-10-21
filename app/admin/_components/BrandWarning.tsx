"use client";

import { marcasEn } from "@/lib/marcas";

/** Shown under a name field that mentions a brand: the site only uses generic names. */
export function BrandWarning({ text }: { text: string }) {
  const marcas = marcasEn(text);
  if (!marcas.length) return null;
  return (
    <span className="ad-hint ad-brand-warn">
      Lleva una marca ({marcas.join(", ")}). Usa un nombre genérico, como «Camiseta básica» o «Sudadera con diseño».
    </span>
  );
}
