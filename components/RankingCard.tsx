import Image from "next/image";
import type { Seguidor } from "@/lib/seguidores";
import { LINKS } from "@/lib/site";
import { eur, totalDe } from "@/lib/utils";

type Props = {
  seguidor: Seguidor;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

const RANK_CLASS: Record<number, string> = { 1: "r1", 2: "r2", 3: "r3" };
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function RankingCard({ seguidor: o, onBuyClick }: Props) {
  const total = totalDe(o.prendas);
  const handle = (o.instagram || o.autor || "").replace(/^@/, "").trim();

  return (
    <article className="outfit">
      <div className="shot">
        <span className={`rank ${RANK_CLASS[o.posicion] || ""}`}>
          {MEDAL[o.posicion] || ""} #{o.posicion}
        </span>
        {o.foto ? (
          <Image src={o.foto} alt={o.nombre} fill sizes="(min-width: 720px) 33vw, 50vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="placeholder">Foto del look de {o.autor}</span>
        )}
      </div>
      <div className="body">
        <h2 className="name">{o.nombre}</h2>
        {handle && (
          <a className="author" href={`https://instagram.com/${handle}`} target="_blank" rel="noopener" data-umami-event="seg_autor">
            por <b>@{handle}</b>
          </a>
        )}
        <ul className="pieces">
          {o.prendas.map((p, i) => (
            <li className="piece" key={i}>
              <span className="p-tipo">{p.tipo}</span>
              <span className="p-row">
                <span className="p-precio">{eur(+p.precio || 0)}</span>
                <a
                  className="p-buy"
                  href={p.link}
                  target="_blank"
                  rel="noopener"
                  data-umami-event="seg_prenda"
                  onClick={(e) => onBuyClick(e, p.link)}
                >
                  Comprar
                </a>
              </span>
            </li>
          ))}
        </ul>
        <div className="total">
          <span className="lbl">Total del look</span>
          <span className="nums">
            <span className="real">{eur(total)}</span>
          </span>
        </div>
        <a
          className="cta"
          href={LINKS.hipobuy}
          target="_blank"
          rel="noopener"
          data-umami-event="seg_registro"
          onClick={(e) => onBuyClick(e, LINKS.hipobuy)}
        >
          Regístrate para comprar →
        </a>
      </div>
    </article>
  );
}
