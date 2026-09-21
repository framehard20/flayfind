import type { Seguidor } from "@/lib/seguidores";
import { RankingCard } from "./RankingCard";

type Props = {
  seguidores: Seguidor[];
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function RankingGrid({ seguidores, onBuyClick }: Props) {
  if (!seguidores.length) {
    return (
      <p className="seg-empty">Aún no hay outfits publicados esta semana. ¡Sé el primero en mandar el tuyo!</p>
    );
  }

  const orden = [...seguidores].sort((a, b) => (a.posicion || 99) - (b.posicion || 99));

  return (
    <>
      <div className="seg-head">
        <h3>Ranking de la semana</h3>
        <span className="sub">Top elegidos</span>
      </div>
      <main className="grid grid-seg">
        {orden.map((o) => (
          <RankingCard key={`${o.posicion}-${o.nombre}`} seguidor={o} onBuyClick={onBuyClick} />
        ))}
      </main>
    </>
  );
}
