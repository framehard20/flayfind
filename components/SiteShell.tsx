"use client";

import type { Outfit } from "@/lib/outfits";
import type { ExtraStyle } from "@/lib/styles";
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
  estilos: ExtraStyle[];
}) {
  return (
    <SettingsProvider estilos={estilos}>
      <StickyHeader />
      <Catalog outfits={outfits} seguidores={seguidores} />
    </SettingsProvider>
  );
}
