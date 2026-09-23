import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb } from "@/lib/db";
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

async function guard() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  return null;
}

const refresh = () => revalidatePath("/");

export async function POST(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as { nombre?: unknown };
  const nombre = str(body.nombre);
  if (!nombre) return Response.json({ error: "Ponle un nombre al estilo." }, { status: 400 });

  const slug = slugify(nombre);
  if (!slug) return Response.json({ error: "Ese nombre no vale, usa letras o números." }, { status: 400 });
  if (BUILTIN_STYLES.some((s) => s.slug === slug))
    return Response.json({ error: `«${nombre}» ya existe como estilo fijo.` }, { status: 400 });

  const { error } = await db().from("categorias").insert({ slug, nombre });
  if (error) {
    const msg = /duplicate|unique/i.test(error.message) ? `«${nombre}» ya está creado.` : explain(error.message);
    return Response.json({ error: msg }, { status: 400 });
  }
  refresh();
  return Response.json({ ok: true, slug });
}

export async function PATCH(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as { id?: unknown; nombre?: unknown };
  const id = str(body.id, 60);
  const nombre = str(body.nombre);
  if (!id || !nombre) return Response.json({ error: "Faltan datos." }, { status: 400 });

  // only the visible name changes: the slug stays, so outfits keep their style
  const { error } = await db().from("categorias").update({ nombre }).eq("id", id);
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  refresh();
  return Response.json({ ok: true });
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
