"use client";

import { useState } from "react";
import type { Outfit } from "@/lib/outfits";
import { totalDe } from "@/lib/utils";
import { OutfitCard } from "./OutfitCard";
import { OutfitModal } from "./OutfitModal";
import type { Filtro } from "./FilterZone";

type Props = {
  outfits: Outfit[];
  filtro: Filtro;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function OutfitGrid({ outfits, filtro, onBuyClick }: Props) {
  const [openName, setOpenName] = useState<string | null>(null);

  const esTech = filtro.genero === "tech";
  const list = outfits.filter(
    (o) =>
      o.genero === filtro.genero &&
      (esTech || filtro.estilo === "todos" || o.categoria === filtro.estilo) &&
      (esTech || filtro.temporada === "todo" || o.temporada === filtro.temporada),
  ).sort((a, b) => (filtro.precio === "caro" ? totalDe(b.prendas) - totalDe(a.prendas) : totalDe(a.prendas) - totalDe(b.prendas)));

  const openIndex = openName ? list.findIndex((o) => o.nombre === openName) : -1;

  if (!list.length) {
    return (
      <main className="grid">
        <p className="empty">Aún no hay looks con este filtro. Prueba otra combinación 👀</p>
      </main>
    );
  }

  return (
    <main className="grid">
      {list.map((o) => (
        <OutfitCard key={o.nombre} outfit={o} onOpen={() => setOpenName(o.nombre)} />
      ))}
      {openIndex >= 0 && (
        <OutfitModal
          list={list}
          index={openIndex}
          onIndex={(i) => setOpenName(list[i].nombre)}
          onClose={() => setOpenName(null)}
          onBuyClick={onBuyClick}
        />
      )}
    </main>
  );
}
