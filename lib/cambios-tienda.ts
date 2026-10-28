import { uidbuyLink } from "./catalogo";
import type { Prenda } from "./outfits";
import shark from "./tienda-shark-little-penguin.json";

// When a Weidian shop in Mario's sheets moves its products to a new shop, the
// rows stay the same but every product gets a new number. Masterspread follows
// the sheet by itself; the outfits saved here keep the old links until they're
// swapped. Each change is an old number → new number list, made by comparing
// the sheet before and after.
//
// 28 Oct 2026: SHARK → Little Penguin, in the priority sheet (933 products).

export type CambioTienda = { desde: string; a: string; ids: Record<string, string> };

export const CAMBIOS: CambioTienda[] = [shark];

/** The Weidian product number inside a link (Uidbuy, Hipobuy or Weidian itself). */
export function weidianId(link: string): string | null {
  const m =
    link.match(/uidbuy\.com\/product\/3\/(\d{6,})/i) ??
    link.match(/\/product\/weidian\/(\d{6,})/i) ??
    (/weidian/i.test(link) ? link.match(/itemI[dD]=(\d{6,})/) : null);
  return m ? m[1] : null;
}

export type Cambio = { prenda: number; tipo: string; antes: string; despues: string; tienda: string };

/** The garments of one outfit whose link points to a shop that moved. */
export function cambiosDe(prendas: Prenda[]): Cambio[] {
  const out: Cambio[] = [];
  prendas.forEach((p, i) => {
    const id = weidianId(p.link ?? "");
    if (!id) return;
    for (const c of CAMBIOS) {
      const nuevo = c.ids[id];
      if (nuevo) {
        out.push({ prenda: i, tipo: p.tipo, antes: p.link, despues: uidbuyLink("weidian", nuevo), tienda: `${c.desde} → ${c.a}` });
        return;
      }
    }
  });
  return out;
}

/** The same garments with the new links (price and name untouched). */
export function conLinksNuevos(prendas: Prenda[]): Prenda[] {
  const cambios = new Map(cambiosDe(prendas).map((c) => [c.prenda, c.despues]));
  return prendas.map((p, i) => (cambios.has(i) ? { ...p, link: cambios.get(i)! } : p));
}
