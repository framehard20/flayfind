import Anthropic from "@anthropic-ai/sdk";
import { isLoggedIn } from "@/lib/auth";
import { listStyles, SUPABASE_URL } from "@/lib/db";
import { apiKeyConfigured, emparejar, MatchError, type Foto } from "@/lib/emparejar";
import { ACCESSORIES, BUILTIN_STYLES } from "@/lib/styles";

export const runtime = "nodejs";
// two calls to Claude with pictures: give them time
export const maxDuration = 300;

// POST { foto: "<JPEG as base64>" }    a new photo (the batch page shrinks it first)
// POST { fotoUrl: "<saved photo>" }    the photo of an outfit already on the site
//   -> the outfit's garments matched against Masterspread's list (see
//   lib/emparejar.ts). One photo per request; the pages send them one by one.

const KEY_HELP =
  "Falta la clave de Claude. Crea una en console.anthropic.com → API Keys, ponla en Vercel como ANTHROPIC_API_KEY y vuelve a desplegar (ver ADMIN.md).";
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX = 4.5 * 1024 * 1024;

/** A saved outfit photo: only from the site's own bucket or its /img folder. */
async function savedPhoto(url: string, origin: string): Promise<Foto | null> {
  const own = url.startsWith("/img/") ? origin + url : url;
  const allowed = own.startsWith(origin + "/img/") || (!!SUPABASE_URL && own.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`));
  if (!allowed) return null;
  const res = await fetch(own, { signal: AbortSignal.timeout(15000) }).catch(() => null);
  const type = (res?.headers.get("content-type") ?? "").split(";")[0].trim() as Foto["type"];
  if (!res?.ok || !TYPES.includes(type)) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > MAX ? null : { data: buf.toString("base64"), type };
}

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!apiKeyConfigured()) return Response.json({ error: KEY_HELP }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { foto?: unknown; fotoUrl?: unknown };
  let foto: Foto | null = null;
  if (typeof body.fotoUrl === "string" && body.fotoUrl) {
    foto = await savedPhoto(body.fotoUrl, new URL(req.url).origin);
    if (!foto) return Response.json({ error: "No se pudo leer la foto de este outfit." }, { status: 400 });
  } else if (typeof body.foto === "string") {
    const data = body.foto.replace(/^data:image\/jpeg;base64,/, "");
    if (data && data.length <= MAX * 1.37) foto = { data, type: "image/jpeg" };
  }
  if (!foto) return Response.json({ error: "Falta la foto o pesa demasiado." }, { status: 400 });

  // accessories have no looks of their own (they're on Masterspread)
  const estilos = [...BUILTIN_STYLES.map((s) => s.slug as string), ...(await listStyles()).map((s) => s.slug)].filter((s) => s !== ACCESSORIES);

  try {
    return Response.json({ ok: true, outfit: await emparejar(foto, estilos) });
  } catch (error) {
    if (error instanceof MatchError) return Response.json({ error: error.message }, { status: 502 });
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: `La clave de Claude no es válida. ${KEY_HELP}` }, { status: 502 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: "Claude va saturado ahora mismo; espera un minuto y reintenta." }, { status: 429 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: `Claude respondió con un error (${error.status}): ${error.message}` }, { status: 502 });
    console.error("emparejar:", error);
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo analizar la foto." }, { status: 500 });
  }
}
