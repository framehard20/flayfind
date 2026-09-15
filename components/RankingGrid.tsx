import { SEGUIDORES } from "@/lib/seguidores";
import { RankingCard } from "./RankingCard";

type Props = {
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function RankingGrid({ onBuyClick }: Props) {
  if (!SEGUIDORES.length) {
    return (
      <p className="seg-empty">Aún no hay outfits publicados esta semana. ¡Sé el primero en mandar el tuyo!</p>
    );
  }

  const orden = [...SEGUIDORES].sort((a, b) => (a.posicion || 99) - (b.posicion || 99));

  return (
    <>
      <div className="seg-head">
        <h3>Ranking de la semana</h3>
        <span className="sub">Top elegidos</span>
      </div>
      <main className="grid grid-seg">
        {orden.map((o) => (
          <RankingCard key={o.posicion} seguidor={o} onBuyClick={onBuyClick} />
        ))}
      </main>
    </>
  );
}
