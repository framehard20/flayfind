"use client";

import { useState } from "react";
import type { Outfit } from "@/lib/outfits";
import { totalDe } from "@/lib/utils";
import { OutfitCard } from "./OutfitCard";
import { OutfitModal } from "./OutfitModal";
import type { Filtro } from "./FilterZone";
import { useSettings } from "./Settings";
import { ACCESSORIES } from "@/lib/styles";
import { EVENTS, track } from "@/lib/track";

type Props = {
  outfits: Outfit[];
  /** Outfits view: filters + price sorting. The followers' view has none. */
  filtro?: Filtro;
  /** Followers' view: medals for the first three and the author's @. */
  rank?: boolean;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function OutfitGrid({ outfits, filtro, rank = false, onBuyClick }: Props) {
  const { t } = useSettings();
  const [openName, setOpenName] = useState<string | null>(null);
  const scope = rank ? "seg" : "of";

  // accessories have no season of their own, so that filter doesn't apply
  const esTech = filtro?.estilo === ACCESSORIES;
  const list = filtro
    ? outfits
        .filter(
          (o) =>
            (o.genero === filtro.genero || o.genero === "ambos") &&
            // "Todos" means every look: accessories are single products, so
            // they only show under their own chip
            (filtro.estilo === "todos" ? o.categoria !== ACCESSORIES : o.categoria === filtro.estilo) &&
            (esTech || filtro.temporada === "todo" || o.temporada === filtro.temporada),
        )
        .sort((a, b) =>
          filtro.precio === "caro" ? totalDe(b.prendas) - totalDe(a.prendas) : totalDe(a.prendas) - totalDe(b.prendas),
        )
    : [...outfits].sort((a, b) => (a.posicion ?? 99) - (b.posicion ?? 99));

  const openIndex = openName ? list.findIndex((o) => o.nombre === openName) : -1;

  if (!list.length) {
    return (
      <main className="grid">
        <p className="empty">{t(rank ? "grid.emptyFollowers" : "grid.empty")}</p>
      </main>
    );
  }

  return (
    <main className="grid">
      {list.map((o) => (
        <OutfitCard
          key={o.nombre}
          outfit={o}
          scope={scope}
          rank={rank}
          onOpen={() => {
            track(EVENTS.outfitOpened);
            setOpenName(o.nombre);
          }}
        />
      ))}
      {openIndex >= 0 && (
        <OutfitModal
          list={list}
          index={openIndex}
          scope={scope}
          rank={rank}
          onIndex={(i) => setOpenName(list[i].nombre)}
          onClose={() => setOpenName(null)}
          onBuyClick={onBuyClick}
        />
      )}
    </main>
  );
}
