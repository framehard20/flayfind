import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { comprimir, ANCHO_MAX } from "@/lib/comprimir";
import { BUCKET, db, explain, hasDb, publicUrl } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/admin/comprimir-fotos  { procesar?: boolean }
// Outfit photos stored before 28 Oct 2026 weigh ~3 MB each. Without procesar:
// how many are still full-size. With procesar: makes web-sized copies of the
// next few (a handful per call, so each call stays short; the panel repeats)
// and points every outfit that used them to the copy. The originals stay in
// the bucket, untouched.

const POR_LLAMADA = 4;
const prefijo = () => publicUrl("").replace(/\/$/, "") + "/";

/** A stored photo that isn't a web-sized copy yet ("c-" files are). */
const pendiente = (foto: string) => {
  if (!foto?.startsWith(prefijo())) return false;
  const nombre = foto.slice(prefijo().length).split("/").pop() ?? "";
  return !nombre.startsWith("c-");
};

/** The photo already resized by Vercel's optimizer (often cached, so Supabase
 *  isn't asked again), else the original from storage. */
async function bajar(origin: string, foto: string): Promise<{ bytes: ArrayBuffer; tipo: string }> {
  try {
    const r = await fetch(`${origin}/_next/image?url=${encodeURIComponent(foto)}&w=${ANCHO_MAX}&q=75`, { headers: { Accept: "image/jpeg" } });
    if (r.ok) return { bytes: await r.arrayBuffer(), tipo: r.headers.get("content-type") ?? "" };
  } catch {}
  const r = await fetch(foto);
  if (!r.ok) throw new Error(`no se pudo descargar (${r.status})`);
  return { bytes: await r.arrayBuffer(), tipo: r.headers.get("content-type") ?? "" };
}

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  const procesar = ((await req.json().catch(() => ({}))) as { procesar?: boolean }).procesar === true;

  const { data, error } = await db().from("outfits").select("foto");
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  const fotos = [...new Set((data ?? []).map((r) => String(r.foto ?? "")).filter(pendiente))];
  if (!procesar) return Response.json({ quedan: fotos.length });

  const origin = new URL(req.url).origin;
  const fallos: string[] = [];
  let hechas = 0;
  for (const foto of fotos.slice(0, POR_LLAMADA)) {
    try {
      const { bytes, tipo } = await bajar(origin, foto);
      // the optimizer's JPEG is already web-sized; anything else is made so here
      const web = tipo.startsWith("image/jpeg") && bytes.byteLength < 600_000 ? { bytes: Buffer.from(bytes), mime: "image/jpeg" } : await comprimir(bytes);
      const path = `${new Date().getFullYear()}/c-${Date.now()}-${hechas}.jpg`;
      const { error: up } = await db()
        .storage.from(BUCKET)
        .upload(path, web.bytes, { contentType: web.mime, cacheControl: "31536000", upsert: false });
      if (up) throw new Error(explain(up.message));
      const { error: e } = await db().from("outfits").update({ foto: publicUrl(path) }).eq("foto", foto);
      if (e) throw new Error(explain(e.message));
      hechas++;
    } catch (err) {
      fallos.push(`${foto.split("/").pop()}: ${err instanceof Error ? err.message : "error"}`);
    }
  }
  if (hechas) revalidatePath("/");
  return Response.json({ hechas, quedan: fotos.length - hechas, fallos });
}
