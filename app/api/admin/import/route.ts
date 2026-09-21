import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb } from "@/lib/db";
import { OUTFITS } from "@/lib/outfits";
import { SEGUIDORES } from "@/lib/seguidores";

export const runtime = "nodejs";

// One-off: copies the outfits that live in the code into the database so they
// can be edited from the panel. Skips anything already imported (by name), so
// pressing it twice is harmless.

export async function POST() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });

  const { data: existing, error: readError } = await db().from("outfits").select("nombre, seccion");
  if (readError) return Response.json({ error: explain(readError.message) }, { status: 500 });
  const seen = new Set((existing ?? []).map((r) => `${r.seccion}|${r.nombre}`));

  const rows = [
    ...OUTFITS.map((o, i) => ({
      seccion: "outfits" as const,
      nombre: o.nombre,
      genero: o.genero,
      temporada: o.temporada,
      categoria: o.categoria,
      foto: o.foto,
      precio_marca: o.precioMarca,
      prendas: o.prendas,
      visible: true,
      orden: i,
    })),
    ...SEGUIDORES.map((s, i) => ({
      seccion: "seguidores" as const,
      nombre: s.nombre,
      genero: "hombre" as const,
      temporada: "invierno" as const,
      categoria: "streetwear" as const,
      foto: s.foto,
      precio_marca: 0,
      prendas: s.prendas,
      autor: s.autor,
      instagram: s.instagram.replace(/^@/, ""),
      posicion: s.posicion,
      visible: true,
      orden: i,
    })),
  ].filter((r) => !seen.has(`${r.seccion}|${r.nombre}`));

  if (!rows.length) return Response.json({ ok: true, importados: 0 });

  const { error } = await db().from("outfits").insert(rows);
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  revalidatePath("/");
  return Response.json({ ok: true, importados: rows.length });
}
