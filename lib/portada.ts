import { countAll, hasDb, listPublic, outfitsOcultos, toOutfit } from "./db";
import { OUTFITS, type Outfit } from "./outfits";
import { SEGUIDORES } from "./seguidores";
import { antesDelLanzamiento } from "./site";

// What the home page shows at a given moment. Outfits come from the database
// (managed in /admin). While it isn't configured — or if it can't be reached —
// the site falls back to the outfits written in lib/outfits.ts, so the page
// always renders.
//
// The Outfits tab shows a "being prepared" notice instead of the catalog when
// the panel's "Ocultar todos" is on, or when every outfit has been hidden one
// by one — never the code's old outfits in their place.
//
// Before LANZAMIENTO (lib/site.ts) everything is hidden, followers' outfits
// included, and the notice carries a countdown. The private preview
// (/vista-previa) asks for a moment just after the launch, so it shows exactly
// what this same code will show then.

/** The followers' entries are outfits too, with a place and an author. */
const fromStatic = (): Outfit[] =>
  SEGUIDORES.map((s) => ({
    nombre: s.nombre,
    genero: "hombre" as const,
    temporada: "invierno" as const,
    categoria: "streetwear" as const,
    foto: s.foto,
    precioMarca: 0,
    prendas: s.prendas,
    posicion: s.posicion,
    autor: s.autor,
    instagram: s.instagram,
  }));

export type Portada = { outfits: Outfit[]; seguidores: Outfit[]; enPreparacion: boolean; prelanzamiento: boolean };

export async function cargarPortada(ahora = Date.now()): Promise<Portada> {
  // before the launch nothing is sent to the browser at all: hidden outfits
  // would still be readable in the page source
  if (antesDelLanzamiento(ahora)) return { outfits: [], seguidores: [], enPreparacion: true, prelanzamiento: true };

  const { ocultos } = await outfitsOcultos(ahora);
  if (!hasDb) return { outfits: ocultos ? [] : OUTFITS, seguidores: fromStatic(), enPreparacion: ocultos, prelanzamiento: false };
  try {
    const [rows, segRows] = await Promise.all([listPublic("outfits"), listPublic("seguidores")]);
    // nothing visible: either it was all hidden (show the notice) or the table
    // is genuinely empty (the code's outfits fill in, as before)
    const todoOculto = !rows.length && (await countAll("outfits")) > 0;
    return {
      outfits: ocultos || todoOculto ? [] : rows.length ? rows.map(toOutfit) : OUTFITS,
      enPreparacion: ocultos || todoOculto,
      prelanzamiento: false,
      seguidores: segRows.map((r, i) => ({
        ...toOutfit(r),
        posicion: r.posicion ?? i + 1,
        autor: r.autor ?? "",
        instagram: r.instagram ?? "",
      })),
    };
  } catch (error) {
    console.error("No se pudieron leer los outfits de la base de datos:", error);
    return { outfits: ocultos ? [] : OUTFITS, seguidores: fromStatic(), enPreparacion: ocultos, prelanzamiento: false };
  }
}
