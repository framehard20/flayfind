import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb, type Seccion } from "@/lib/db";
import { INVITE_CODE } from "@/lib/site";
import { BUILTIN_STYLES } from "@/lib/styles";

export const runtime = "nodejs";

// "ambos" shows the outfit in both sections — mostly used for accessories
const GENEROS = ["hombre", "mujer", "ambos"];
const TEMPORADAS = ["invierno", "verano"];


type Body = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Hipobuy links always carry the invite code, even if it was pasted without it. */
function withInviteCode(link: string): string {
  if (!/^https?:\/\/(www\.)?hipobuy\.com/i.test(link) || /[?&]inviteCode=/i.test(link)) return link;
  return link + (link.includes("?") ? "&" : "?") + `inviteCode=${INVITE_CODE}`;
}
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

async function knownStyles(): Promise<string[]> {
  const builtin = BUILTIN_STYLES.map((s) => s.slug);
  const { data } = await db().from("categorias").select("slug");
  return [...builtin, ...(data ?? []).map((c) => String(c.slug))];
}

function parse(body: Body, estilos: string[]): { row?: Record<string, unknown>; error?: string } {
  const seccion: Seccion = body.seccion === "seguidores" ? "seguidores" : "outfits";
  const nombre = str(body.nombre);
  const genero = str(body.genero);
  const temporada = str(body.temporada);
  const categoria = str(body.categoria);
  const foto = str(body.foto);

  if (!nombre) return { error: "Ponle un nombre al outfit." };
  if (!GENEROS.includes(genero)) return { error: "Elige una sección: hombre, mujer o ambos." };
  if (!TEMPORADAS.includes(temporada)) return { error: "Elige la época: invierno o verano." };
  if (!estilos.includes(categoria)) return { error: "Ese estilo ya no existe, elige otro." };
  if (!foto) return { error: "Falta la foto del outfit." };

  const prendas = Array.isArray(body.prendas)
    ? body.prendas
        .map((p) => {
          const q = (p ?? {}) as Body;
          return { tipo: str(q.tipo), precio: num(q.precio), link: withInviteCode(str(q.link)) };
        })
        .filter((p) => p.tipo || p.link)
    : [];
  if (!prendas.length) return { error: "Añade al menos una prenda." };
  const sinLink = prendas.find((p) => !/^https?:\/\//i.test(p.link));
  if (sinLink) return { error: `La prenda «${sinLink.tipo || "sin nombre"}» necesita un link que empiece por https://` };

  return {
    row: {
      seccion,
      nombre,
      genero,
      temporada,
      categoria,
      foto,
      precio_marca: num(body.precioMarca),
      prendas,
      autor: seccion === "seguidores" ? str(body.autor) || null : null,
      instagram: seccion === "seguidores" ? str(body.instagram).replace(/^@/, "") || null : null,
      posicion: seccion === "seguidores" && body.posicion != null && str(body.posicion) !== "" ? Math.round(num(body.posicion)) : null,
      visible: body.visible !== false,
      orden: Math.round(num(body.orden)),
    },
  };
}

async function guard() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  return null;
}

const refresh = () => revalidatePath("/");

export async function POST(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const { row, error } = parse((await req.json().catch(() => ({}))) as Body, await knownStyles());
  if (error || !row) return Response.json({ error }, { status: 400 });

  const { data, error: dbError } = await db().from("outfits").insert(row).select("id").single();
  if (dbError) return Response.json({ error: explain(dbError.message) }, { status: 500 });
  refresh();
  return Response.json({ ok: true, id: data.id });
}

export async function PATCH(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as Body;
  const id = str(body.id);
  if (!id) return Response.json({ error: "Falta el id." }, { status: 400 });

  // quick toggles (show / hide, reorder) don't send the whole outfit
  if (body.only === "visible" || body.only === "orden") {
    const patch = body.only === "visible" ? { visible: body.visible !== false } : { orden: Math.round(num(body.orden)) };
    const { error } = await db().from("outfits").update(patch).eq("id", id);
    if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
    refresh();
    return Response.json({ ok: true });
  }

  const { row, error } = parse(body, await knownStyles());
  if (error || !row) return Response.json({ error }, { status: 400 });
  const { error: dbError } = await db().from("outfits").update(row).eq("id", id);
  if (dbError) return Response.json({ error: explain(dbError.message) }, { status: 500 });
  refresh();
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const id = str(((await req.json().catch(() => ({}))) as Body).id);
  if (!id) return Response.json({ error: "Falta el id." }, { status: 400 });
  const { error } = await db().from("outfits").delete().eq("id", id);
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });
  refresh();
  return Response.json({ ok: true });
}
