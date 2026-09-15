import Image from "next/image";
import type { Outfit } from "@/lib/outfits";
import { LINKS } from "@/lib/site";
import { CAT_LABEL, eur, slug, totalDe } from "@/lib/utils";

type Props = {
  outfit: Outfit;
  onBuyClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
};

export function OutfitCard({ outfit: o, onBuyClick }: Props) {
  const total = totalDe(o.prendas);
  const ev = slug(o.nombre);
  const totalLbl = o.genero === "tech" ? "Precio" : "Total del look";

  return (
    <article className="outfit">
      <div className="shot">
        <span className="tag">{CAT_LABEL[o.categoria] || o.categoria}</span>
        {o.foto ? (
          <Image src={o.foto} alt={o.nombre} fill sizes="(min-width: 720px) 33vw, 50vw" style={{ objectFit: "cover" }} />
        ) : (
          <span className="placeholder">
            Pon tu foto 9:16
            <br />
            {o.genero === "tech" ? "del producto aquí" : "del look aquí"}
          </span>
        )}
      </div>
      <div className="body">
        <h2 className="name">{o.nombre}</h2>
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
                  data-umami-event={`prenda_${ev}`}
                  data-umami-event-prenda={p.tipo}
                  onClick={(e) => onBuyClick(e, p.link)}
                >
                  Comprar
                </a>
              </span>
            </li>
          ))}
        </ul>
        <div className="total">
          <span className="lbl">{totalLbl}</span>
          <span className="nums">
            <span className="real">{eur(total)}</span>
          </span>
        </div>
        <a
          className="cta"
          href={LINKS.hipobuy}
          target="_blank"
          rel="noopener"
          data-umami-event={`registro_look_${ev}`}
          onClick={(e) => onBuyClick(e, LINKS.hipobuy)}
        >
          Regístrate para comprar →
        </a>
      </div>
    </article>
  );
}
