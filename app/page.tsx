import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { countAll, getOutfitsOcultos, hasDb, listPublic, listStyles, toOutfit } from "@/lib/db";
import { OUTFITS, type Outfit } from "@/lib/outfits";
import { SEGUIDORES } from "@/lib/seguidores";
import { OUTFITS_OCULTOS_POR_DEFECTO } from "@/lib/site";

// Outfits come from the database (managed in /admin). While it isn't
// configured — or if it can't be reached — the site falls back to the outfits
// written in lib/outfits.ts, so the page always renders.
//
// The Outfits tab shows a "being prepared" notice instead of the catalog when
// the panel's "Ocultar todos" is on, or when every outfit has been hidden one
// by one — never the code's old outfits in their place.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

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

type Loaded = { outfits: Outfit[]; seguidores: Outfit[]; enPreparacion: boolean };

async function load(): Promise<Loaded> {
  const ocultos = (await getOutfitsOcultos()) ?? OUTFITS_OCULTOS_POR_DEFECTO;
  // while hidden, the outfits aren't sent to the browser at all (they'd be
  // readable in the page source even though nothing shows them)
  if (!hasDb) return { outfits: ocultos ? [] : OUTFITS, seguidores: fromStatic(), enPreparacion: ocultos };
  try {
    const [rows, segRows] = await Promise.all([listPublic("outfits"), listPublic("seguidores")]);
    // nothing visible: either it was all hidden (show the notice) or the table
    // is genuinely empty (the code's outfits fill in, as before)
    const todoOculto = !rows.length && (await countAll("outfits")) > 0;
    return {
      outfits: ocultos || todoOculto ? [] : rows.length ? rows.map(toOutfit) : OUTFITS,
      enPreparacion: ocultos || todoOculto,
      seguidores: segRows.map((r, i) => ({
        ...toOutfit(r),
        posicion: r.posicion ?? i + 1,
        autor: r.autor ?? "",
        instagram: r.instagram ?? "",
      })),
    };
  } catch (error) {
    console.error("No se pudieron leer los outfits de la base de datos:", error);
    return { outfits: ocultos ? [] : OUTFITS, seguidores: fromStatic(), enPreparacion: ocultos };
  }
}

export default async function Home() {
  const [{ outfits, seguidores, enPreparacion }, estilos] = await Promise.all([load(), listStyles()]);
  return <SiteShell outfits={outfits} seguidores={seguidores} estilos={estilos} enPreparacion={enPreparacion} />;
}
