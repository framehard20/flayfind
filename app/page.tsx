import { StickyHeader } from "@/components/StickyHeader";
import { Catalog } from "@/components/Catalog";
import { hasDb, listPublic, toOutfit } from "@/lib/db";
import { OUTFITS, type Outfit } from "@/lib/outfits";
import { SEGUIDORES, type Seguidor } from "@/lib/seguidores";

// Outfits come from the database (managed in /admin). While it isn't
// configured — or if it can't be reached — the site falls back to the outfits
// written in lib/outfits.ts, so the page always renders.
export const revalidate = 60;

async function load(): Promise<{ outfits: Outfit[]; seguidores: Seguidor[] }> {
  if (!hasDb) return { outfits: OUTFITS, seguidores: SEGUIDORES };
  try {
    const [rows, segRows] = await Promise.all([listPublic("outfits"), listPublic("seguidores")]);
    return {
      outfits: rows.length ? rows.map(toOutfit) : OUTFITS,
      seguidores: segRows.map((r, i) => ({
        posicion: r.posicion ?? i + 1,
        autor: r.autor ?? "",
        instagram: r.instagram ? `@${r.instagram}` : "",
        nombre: r.nombre,
        foto: r.foto,
        prendas: toOutfit(r).prendas,
      })),
    };
  } catch (error) {
    console.error("No se pudieron leer los outfits de la base de datos:", error);
    return { outfits: OUTFITS, seguidores: SEGUIDORES };
  }
}

export default async function Home() {
  const { outfits, seguidores } = await load();
  return (
    <>
      <StickyHeader />
      <Catalog outfits={outfits} seguidores={seguidores} />
    </>
  );
}
