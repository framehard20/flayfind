import { SiteShell } from "@/components/SiteShell";
import { hasDb, listPublic, listStyles, toOutfit } from "@/lib/db";
import { OUTFITS, type Outfit } from "@/lib/outfits";
import { SEGUIDORES } from "@/lib/seguidores";

// Outfits come from the database (managed in /admin). While it isn't
// configured — or if it can't be reached — the site falls back to the outfits
// written in lib/outfits.ts, so the page always renders.
export const revalidate = 60;

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

async function load(): Promise<{ outfits: Outfit[]; seguidores: Outfit[] }> {
  if (!hasDb) return { outfits: OUTFITS, seguidores: fromStatic() };
  try {
    const [rows, segRows] = await Promise.all([listPublic("outfits"), listPublic("seguidores")]);
    return {
      outfits: rows.length ? rows.map(toOutfit) : OUTFITS,
      seguidores: segRows.map((r, i) => ({
        ...toOutfit(r),
        posicion: r.posicion ?? i + 1,
        autor: r.autor ?? "",
        instagram: r.instagram ?? "",
      })),
    };
  } catch (error) {
    console.error("No se pudieron leer los outfits de la base de datos:", error);
    return { outfits: OUTFITS, seguidores: fromStatic() };
  }
}

export default async function Home() {
  const [{ outfits, seguidores }, estilos] = await Promise.all([load(), listStyles()]);
  return <SiteShell outfits={outfits} seguidores={seguidores} estilos={estilos} />;
}
