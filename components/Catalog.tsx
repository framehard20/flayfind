"use client";

import { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { TrustBar } from "./TrustBar";
import { SegIntro } from "./SegIntro";
import { ViewNav, type View } from "./ViewNav";
import { FilterZone, type Filtro } from "./FilterZone";
import { OutfitGrid } from "./OutfitGrid";
import { RepeatCta } from "./RepeatCta";
import { DiscordPerks } from "./DiscordPerks";
import { SeguidoresComingSoon } from "./SeguidoresComingSoon";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { PopupModal } from "./PopupModal";
import { GateModal } from "./GateModal";
import { LINKS } from "@/lib/site";

// Reqs / ContestForm / RankingGrid power the weekly followers' contest — fully
// built, just not launched yet (see SeguidoresComingSoon). Swap the "seg" view
// below back to those three once the contest actually opens.

const REG_KEY = "flayfind_reg";

export function Catalog() {
  const [view, setView] = useState<View>("outfits");
  const [filtro, setFiltro] = useState<Filtro>({ genero: "hombre", estilo: "todos", temporada: "todo", precio: "barato" });
  const [gateOpen, setGateOpen] = useState(false);
  const [destino, setDestino] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  // Read once on mount: server-rendered markup can't know sessionStorage, so
  // this only matters for the client-side interception below, not paint.
  useEffect(() => {
    try {
      setRegistered(sessionStorage.getItem(REG_KEY) === "1");
    } catch {}
  }, []);

  function markRegistered() {
    setRegistered(true);
    try {
      sessionStorage.setItem(REG_KEY, "1");
    } catch {}
  }

  /** Shared by every "Comprar" (piece) and "Regístrate para comprar" (look) link,
   *  in both the outfits grid and the followers' ranking grid. */
  function handleBuyClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (registered) return; // already confirmed once this session, let it navigate
    e.preventDefault();
    setDestino(href);
    setGateOpen(true);
  }

  return (
    <>
      <div hidden={view !== "outfits"}>
        <Hero />
        <TrustBar />
      </div>
      <div hidden={view !== "seg"}>
        <SegIntro />
      </div>

      <ViewNav view={view} onChange={setView} />

      <div hidden={view !== "outfits"}>
        <FilterZone filtro={filtro} onChange={(patch) => setFiltro((f) => ({ ...f, ...patch }))} />
        <DiscordPerks />
        <OutfitGrid filtro={filtro} onBuyClick={handleBuyClick} />
        <RepeatCta />
      </div>

      <div hidden={view !== "seg"}>
        <SeguidoresComingSoon />
      </div>

      <div hidden={view !== "outfits"}>
        <Faq />
      </div>

      <Footer />

      <PopupModal registered={registered} onRegister={markRegistered} />
      <GateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onGoRegister={markRegistered}
        toProduct={!!destino && destino !== LINKS.hipobuy}
        onContinue={() => {
          markRegistered();
          setGateOpen(false);
          if (destino) window.open(destino, "_blank", "noopener");
        }}
      />
    </>
  );
}
