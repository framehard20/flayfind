import { OUTFITS } from "@/lib/outfits";
import { totalDe } from "@/lib/utils";
import { OutfitCard } from "./OutfitCard";
import type { Filtro } from "./FilterZone";

type Props = {
  filtro: Filtro;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function OutfitGrid({ filtro, onBuyClick }: Props) {
  const esTech = filtro.genero === "tech";
  const list = OUTFITS.filter(
    (o) =>
      o.genero === filtro.genero &&
      (esTech || filtro.estilo === "todos" || o.categoria === filtro.estilo) &&
      (esTech || filtro.temporada === "todo" || o.temporada === filtro.temporada),
  ).sort((a, b) => (filtro.precio === "caro" ? totalDe(b.prendas) - totalDe(a.prendas) : totalDe(a.prendas) - totalDe(b.prendas)));

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
        <OutfitCard key={o.nombre} outfit={o} onBuyClick={onBuyClick} />
      ))}
    </main>
  );
}
