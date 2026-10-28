import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb, type OutfitRow } from "@/lib/db";
import { cambiosDe, conLinksNuevos } from "@/lib/cambios-tienda";

export const runtime = "nodejs";

// POST /api/admin/links-tienda  { aplicar?: boolean }
// Without aplicar: lists the garments whose link points to a Weidian shop that
// moved (lib/cambios-tienda.ts). With aplicar: swaps those links for the new
// shop's, in every outfit (catalogue and followers'), and nothing else.

async function guard() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  return null;
}

export async function POST(req: Request) {
  const stop = await guard();
  if (stop) return stop;
  const aplicar = ((await req.json().catch(() => ({}))) as { aplicar?: boolean }).aplicar === true;

  const { data, error } = await db().from("outfits").select("id, nombre, seccion, prendas");
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  const rows = (data ?? []) as Pick<OutfitRow, "id" | "nombre" | "seccion" | "prendas">[];

  const pendientes = rows
    .map((r) => ({ id: r.id, nombre: r.nombre, seccion: r.seccion, cambios: cambiosDe(r.prendas ?? []) }))
    .filter((r) => r.cambios.length);

  if (!aplicar) return Response.json({ outfits: pendientes });

  let hechos = 0, prendas = 0;
  const fallos: string[] = [];
  for (const r of pendientes) {
    const row = rows.find((x) => x.id === r.id)!;
    const { error: e } = await db().from("outfits").update({ prendas: conLinksNuevos(row.prendas) }).eq("id", r.id);
    if (e) fallos.push(`${r.nombre}: ${explain(e.message)}`);
    else (hechos++, (prendas += r.cambios.length));
  }
  revalidatePath("/");
  return Response.json({ ok: !fallos.length, outfits: hechos, prendas, fallos });
}
