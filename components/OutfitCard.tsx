import Image from "next/image";
import type { Outfit } from "@/lib/outfits";
import { CAT_LABEL, eur, rankClass, slug, totalDe } from "@/lib/utils";

type Props = {
  outfit: Outfit;
  /** Keeps the two grids' cards apart for the modal's zoom animation. */
  scope?: string;
  /** Followers' grid: show the place and who sent it. */
  rank?: boolean;
  onOpen: () => void;
};

// Whole card opens the outfit modal (OutfitModal), where each piece's
// "Comprar" link lives. The stretched <button> keeps it one accessible
// control; nothing else in the card is interactive. data-outfit is how the
// modal finds this card's photo for its zoom in/out animation.
export function OutfitCard({ outfit: o, scope = "of", rank = false, onOpen }: Props) {
  const total = totalDe(o.prendas);
  const totalLbl = o.genero === "tech" ? "Precio" : "Total del look";
  const medal = rankClass(o.posicion);

  return (
    <article className={`look${rank && medal ? ` look-top look-${medal}` : ""}`} data-outfit={`${scope}-${slug(o.nombre)}`}>
      <div className="look-shot shot">
        <span className="look-tag">{CAT_LABEL[o.categoria] || o.categoria}</span>
        {rank && o.posicion ? (
          <span className={`look-rank${medal ? ` look-rank-${medal}` : ""}`}>#{o.posicion}</span>
        ) : null}
        {o.foto ? (
          <Image src={o.foto} alt={o.nombre} fill sizes="(min-width: 720px) 290px, 50vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="placeholder">
            Pon tu foto 9:16
            <br />
            {o.genero === "tech" ? "del producto aquí" : "del look aquí"}
          </span>
        )}
        <span className="look-peek" aria-hidden="true">
          Ver outfit
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="look-body">
        <h2 className="look-name">{o.nombre}</h2>
        {rank && o.instagram && <span className="look-author">por @{o.instagram.replace(/^@/, "")}</span>}
        <ul className="look-pieces">
          {o.prendas.map((p, i) => (
            <li key={i}>
              <span className="look-piece">{p.tipo}</span>
              <span className="look-price">{eur(+p.precio || 0)}</span>
            </li>
          ))}
        </ul>
        <div className="look-foot">
          <span className="look-total">
            <span className="look-total-lbl">{totalLbl}</span>
            {o.precioMarca > 0 && <s className="look-marca">{eur(o.precioMarca)}</s>}
            <span className="look-total-num">{eur(total)}</span>
          </span>
          <span className="look-go" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <button type="button" className="look-hit" onClick={onOpen} aria-label={`Ver outfit ${o.nombre} y comprar sus prendas`} />
    </article>
  );
}
