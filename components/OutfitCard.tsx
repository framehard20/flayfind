"use client";

import Image from "next/image";
import type { Outfit } from "@/lib/outfits";
import { CAT_KEY, rankClass, slug, totalDe } from "@/lib/utils";
import { useSettings } from "./Settings";

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
  const { t, money } = useSettings();
  const total = totalDe(o.prendas);
  const totalLbl = t(o.genero === "tech" ? "card.priceOnly" : "card.total");
  const medal = rankClass(o.posicion);

  return (
    <article className={`look${rank && medal ? ` look-top look-${medal}` : ""}`} data-outfit={`${scope}-${slug(o.nombre)}`}>
      <div className="look-shot shot">
        <span className="look-tag">{t(CAT_KEY[o.categoria] ?? "f.street")}</span>
        {rank && o.posicion ? (
          <span className={`look-rank${medal ? ` look-rank-${medal}` : ""}`}>#{o.posicion}</span>
        ) : null}
        {o.foto ? (
          <Image src={o.foto} alt={o.nombre} fill sizes="(min-width: 720px) 290px, 50vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="placeholder">
            {t("card.noPhoto1")}
            <br />
            {t(o.genero === "tech" ? "card.noPhotoProduct" : "card.noPhotoLook")}
          </span>
        )}
        <span className="look-peek" aria-hidden="true">
          {t("card.see")}
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <div className="look-body">
        <h2 className="look-name">{o.nombre}</h2>
        {rank && o.instagram && (
          <span className="look-author">
            {t("modal.by")} @{o.instagram.replace(/^@/, "")}
          </span>
        )}
        <ul className="look-pieces">
          {o.prendas.map((p, i) => (
            <li key={i}>
              <span className="look-piece">{p.tipo}</span>
              <span className="look-price">{money(+p.precio || 0)}</span>
            </li>
          ))}
        </ul>
        <div className="look-foot">
          <span className="look-total">
            <span className="look-total-lbl">{totalLbl}</span>
            {o.precioMarca > 0 && <s className="look-marca">{money(o.precioMarca)}</s>}
            <span className="look-total-num">{money(total)}</span>
          </span>
          <span className="look-go" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <button type="button" className="look-hit" onClick={onOpen} aria-label={t("card.openAria", { nombre: o.nombre })} />
    </article>
  );
}
