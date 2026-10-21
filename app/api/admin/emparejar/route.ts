import Anthropic from "@anthropic-ai/sdk";
import { isLoggedIn } from "@/lib/auth";
import { listStyles } from "@/lib/db";
import { apiKeyConfigured, emparejar, MatchError } from "@/lib/emparejar";
import { BUILTIN_STYLES } from "@/lib/styles";

export const runtime = "nodejs";
// two calls to Claude with pictures: give them time
export const maxDuration = 300;

// POST { foto: "<JPEG as base64>" } -> the outfit's garments matched against
// Masterspread's list (see lib/emparejar.ts). One photo per request; the
// batch page sends them one after another.

const KEY_HELP =
  "Falta la clave de Claude. Crea una en console.anthropic.com → API Keys, ponla en Vercel como ANTHROPIC_API_KEY y vuelve a desplegar (ver ADMIN.md).";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!apiKeyConfigured()) return Response.json({ error: KEY_HELP }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { foto?: unknown };
  const foto = typeof body.foto === "string" ? body.foto.replace(/^data:image\/jpeg;base64,/, "") : "";
  if (!foto || foto.length > 4_500_000) return Response.json({ error: "Falta la foto o pesa demasiado." }, { status: 400 });

  const estilos = [...BUILTIN_STYLES.map((s) => s.slug as string), ...(await listStyles()).map((s) => s.slug)];

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
