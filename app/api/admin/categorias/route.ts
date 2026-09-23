import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb } from "@/lib/db";
import { LANGS } from "@/lib/i18n";
import { BUILTIN_STYLES } from "@/lib/styles";

export const runtime = "nodejs";

const str = (v: unknown, max = 40) => (typeof v === "string" ? v.trim().slice(0, max) : "");

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

/** Which sections offer this subsection. Nothing ticked means both. */
function parseGeneros(v: unknown): string[] {
  const list = Array.isArray(v) ? v.map((g) => str(g, 10)) : [];
  const valid = list.filter((g) => g === "hombre" || g === "mujer");
  return valid.length ? [...new Set(valid)] : ["hombre", "mujer"];
}

/** One optional name per language; Spanish is the `nombre` field itself. */
function parseTraducciones(v: unknown): Record<string, string> {
  const input = (v ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const { code } of LANGS) {
    if (code === "es") continue;
    const text = str(input[code]);
    if (text) out[code] = text;
  }
  return out;
}

/** The two newer columns don't exist until the SQL in supabase/schema.sql is
 *  run, so a write that mentions them is retried without them. */
async function writeRow(
  run: (row: Record<string, unknown>) => PromiseLike<{ error: { message: string } | null }>,
  full: Record<string, unknown>,
  basic: Record<string, unknown>,
): Promise<{ error: string | null; degraded: boolean }> {
  const first = await run(full);
  if (!first.error) return { error: null, degraded: false };
  if (!/column .*(generos|traducciones)|does not exist|schema cache/i.test(first.error.message))
    return { error: first.error.message, degraded: false };
  const second = await run(basic);
  return { error: second.error?.message ?? null, degraded: !second.error };
}

const MIGRATION_HINT =
  "Guardado, pero las secciones y las traducciones no se han podido registrar: falta ejecutar el SQL de supabase/schema.sql. Hasta entonces el estilo sale en Hombre y Mujer con el mismo nombre en todos los idiomas.";

async function guard() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  return null;
}

const refresh = () => revalidatePath("/");

export async function POST(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const nombre = str(body.nombre);
  if (!nombre) return Response.json({ error: "Ponle un nombre al estilo." }, { status: 400 });

  const slug = slugify(nombre);
  if (!slug) return Response.json({ error: "Ese nombre no vale, usa letras o números." }, { status: 400 });
  if (BUILTIN_STYLES.some((s) => s.slug === slug))
    return Response.json({ error: `«${nombre}» ya existe como estilo fijo.` }, { status: 400 });

  const basic = { slug, nombre };
  const full = { ...basic, generos: parseGeneros(body.generos), traducciones: parseTraducciones(body.traducciones) };
  const { error, degraded } = await writeRow((row) => db().from("categorias").insert(row), full, basic);
  if (error) {
    const msg = /duplicate|unique/i.test(error) ? `«${nombre}» ya está creado.` : explain(error);
    return Response.json({ error: msg }, { status: 400 });
  }
  refresh();
  return Response.json({ ok: true, slug, aviso: degraded ? MIGRATION_HINT : undefined });
}

export async function PATCH(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(body.id, 60);
  const nombre = str(body.nombre);
  if (!id || !nombre) return Response.json({ error: "Faltan datos." }, { status: 400 });

  // only what's visible changes: the slug stays, so outfits keep their style
  const basic = { nombre };
  const full = { ...basic, generos: parseGeneros(body.generos), traducciones: parseTraducciones(body.traducciones) };
  const { error, degraded } = await writeRow((row) => db().from("categorias").update(row).eq("id", id), full, basic);
  if (error) return Response.json({ error: explain(error) }, { status: 500 });
  refresh();
  return Response.json({ ok: true, aviso: degraded ? MIGRATION_HINT : undefined });
}

export async function DELETE(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as { id?: unknown; slug?: unknown };
  const id = str(body.id, 60);
  const slug = str(body.slug);
  if (!id || !slug) return Response.json({ error: "Faltan datos." }, { status: 400 });

  // refuse while outfits still use it, so nothing ends up with a dead style
  const { count, error: countError } = await db()
    .from("outfits")
    .select("id", { count: "exact", head: true })
    .eq("categoria", slug);
  if (countError) return Response.json({ error: explain(countError.message) }, { status: 500 });
  if (count)
    return Response.json(
      { error: `No se puede borrar: ${count} outfit${count === 1 ? "" : "s"} usa${count === 1 ? "" : "n"} este estilo. Cámbiales el estilo primero.` },
      { status: 400 },
    );

  const { error } = await db().from("categorias").delete().eq("id", id);
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  refresh();
  return Response.json({ ok: true });
}
