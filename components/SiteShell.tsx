"use client";

import type { Outfit } from "@/lib/outfits";
import { Catalog } from "./Catalog";
import { SettingsProvider } from "./Settings";
import { StickyHeader } from "./StickyHeader";

/** Everything the language / currency picker reaches lives inside the provider. */
export function SiteShell({
  outfits,
  seguidores,
  estilos,
}: {
  outfits: Outfit[];
  seguidores: Outfit[];
  estilos: { slug: string; nombre: string }[];
}) {
  return (
    <SettingsProvider estilos={estilos}>
      <StickyHeader />
      <Catalog outfits={outfits} seguidores={seguidores} />
    </SettingsProvider>
  );
}
