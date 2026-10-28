import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { isLoggedIn } from "@/lib/auth";
import { buscar, FotoError, geminiConfigured, generarFoto, isProductPicture, sugerir, type Pieza } from "@/lib/crear";
import { BUCKET, db, explain, hasDb, publicUrl } from "@/lib/db";
import { comprimir } from "@/lib/comprimir";
import { apiKeyConfigured, MatchError } from "@/lib/emparejar";

export const runtime = "nodejs";
// making the photo can take a minute or two
export const maxDuration = 300;

// POST { accion: "buscar", q }                    -> { piezas }   search Masterspread's list
// POST { accion: "sugerir", genero, estilo, ..., cantidad } -> { outfits: [{ nombre, piezas }] }
//                                                 Claude puts that many different looks together
// POST { accion: "foto", piezas, notas }          -> { url }      Gemini makes the flat-lay photo,
//                                                                 saved in the photos bucket

const CLAUDE_HELP = "Falta la clave de Claude (ANTHROPIC_API_KEY en Vercel, ver ADMIN.md).";
const GEMINI_HELP =
  "Falta la clave de Google para las fotos. Crea una en aistudio.google.com → Get API key, ponla en Vercel como GEMINI_API_KEY y vuelve a desplegar (ver ADMIN.md).";

type Body = Record<string, unknown>;
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function piezasDe(v: unknown): Pieza[] | null {
  if (!Array.isArray(v) || !v.length || v.length > 6) return null;
  const out: Pieza[] = [];
  for (const raw of v) {
    const p = (raw ?? {}) as Body;
    const foto = str(p.foto, 600);
    if (!isProductPicture(foto)) return null;
    out.push({ n: 0, nombre: str(p.nombre, 160), tipo: str(p.tipo, 60) || "Prenda", foto, link: "", eur: null });
  }
  return out;
}

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return fail("No autorizado", 401);
  const body = (await req.json().catch(() => ({}))) as Body;

  try {
    if (body.accion === "buscar") return Response.json({ piezas: await buscar(str(body.q, 80)) });

    if (body.accion === "sugerir") {
      if (!apiKeyConfigured()) return fail(CLAUDE_HELP, 503);
      const outfits = await sugerir({
        genero: str(body.genero, 20),
        estilo: str(body.estilo, 40),
        temporada: str(body.temporada, 20),
        idea: str(body.idea),
        presupuesto: str(body.presupuesto, 10),
        cantidad: Number(body.cantidad) || 1,
      });
      return Response.json({ outfits });
    }

    if (body.accion === "foto") {
      const piezas = piezasDe(body.piezas);
      if (!piezas) return fail("Elige entre 1 y 6 prendas de la lista.", 400);
      if (!hasDb) return fail("La base de datos no está configurada.", 503);

      // local testing only: a fixed picture instead of calling Google
      const fake = process.env.NODE_ENV !== "production" ? process.env.GEMINI_FAKE_IMAGE : "";
      if (!fake && !geminiConfigured()) return fail(GEMINI_HELP, 503);
      const foto = fake
        ? { bytes: await readFile(fake), mime: "image/jpeg" }
        : await generarFoto(piezas, str(body.notas), new URL(req.url).origin);

      // stored web-sized (~300 KB instead of ~3 MB): every download counts in Supabase
      const web = await comprimir(foto.bytes);
      const path = `${new Date().getFullYear()}/c-ia-${Date.now()}.jpg`;
      const { error } = await db()
        .storage.from(BUCKET)
        .upload(path, web.bytes, { contentType: web.mime, cacheControl: "31536000", upsert: false });
      if (error) return fail(explain(error.message), 500);
      return Response.json({ url: publicUrl(path) });
    }

    return fail("Acción desconocida.", 400);
  } catch (error) {
    if (error instanceof MatchError || error instanceof FotoError) return fail(error.message, 502);
    if (error instanceof Anthropic.AuthenticationError) return fail(`La clave de Claude no es válida. ${CLAUDE_HELP}`, 502);
    if (error instanceof Anthropic.RateLimitError) return fail("Claude va saturado ahora mismo; espera un minuto y reintenta.", 429);
    if (error instanceof Anthropic.APIError) return fail(`Claude respondió con un error (${error.status}): ${error.message}`, 502);
    // Google's SDK has more than one error class; all carry an HTTP status
    const status = Number((error as { status?: unknown; statusCode?: unknown })?.status ?? (error as { statusCode?: unknown })?.statusCode);
    if (body.accion === "foto" && Number.isFinite(status) && status > 0) {
      if (status === 401 || status === 403) return fail(`Google rechazó la clave. ${GEMINI_HELP}`, 502);
      if (status === 429) return fail("Google va saturado o se acabó el saldo; espera un poco o revisa la facturación.", 429);
      return fail(`Google respondió con un error (${status}): ${error instanceof Error ? error.message : ""}`, 502);
    }
    console.error("crear:", error);
    return fail(error instanceof Error ? error.message : "Algo falló.", 500);
  }
}
