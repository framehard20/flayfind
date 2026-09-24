import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Categoria, Genero, Outfit, Prenda, Temporada } from "./outfits";
import type { ExtraStyle } from "./styles";

// Supabase holds the outfits shown on the site, the followers' entries and the
// submissions from the public form. Photos live in the "outfits" storage
// bucket. Everything here runs on the server with the service-role key.
//
// Without the env vars the site still builds and runs: the public pages fall
// back to the outfits in lib/outfits.ts and the admin panel says it isn't
// configured yet. See ADMIN.md.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
export const BUCKET = "outfits";

export const hasDb = !!(SUPABASE_URL && SERVICE_KEY);

let client: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (!hasDb) throw new Error("Supabase no está configurado (faltan variables de entorno)");
  client ??= createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  return client;
}

/** The secret key is what lets the server bypass row level security. Pasting
 *  the public (publishable / anon) key by mistake fails with a confusing
 *  "row-level security" error, so it's named explicitly. */
export function serviceKeyProblem(): string | null {
  if (!SERVICE_KEY) return null;
  if (SERVICE_KEY.startsWith("sb_publishable_")) return "publishable";
  if (SERVICE_KEY.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(Buffer.from(SERVICE_KEY.split(".")[1], "base64").toString());
      if (payload.role && payload.role !== "service_role") return String(payload.role);
    } catch {}
  }
  return null;
}

export const KEY_HELP =
  "La clave de Supabase que hay en SUPABASE_SERVICE_ROLE_KEY es la pública. Copia la secreta (Project Settings → API Keys → «Secret keys», empieza por sb_secret_, o «service_role» en las Legacy API keys), cámbiala en Vercel y vuelve a desplegar.";

/** Accessories moved inside Hombre and Mujer, so an outfit's section can be
 *  "ambos" — which the old rule in the database refuses until the migration
 *  runs. Raw Postgres says "violates check constraint", which helps nobody. */
export const GENERO_HELP = `La base de datos todavía no acepta la sección «Hombre y Mujer». Abre Supabase → SQL Editor → New query, pega esto y pulsa Run:

alter table public.outfits drop constraint if exists outfits_genero_check;
update public.outfits set genero = 'ambos' where genero = 'tech';
alter table public.outfits add constraint outfits_genero_check check (genero in ('hombre', 'mujer', 'ambos'));

Después vuelve a guardar el outfit. No hace falta desplegar nada.`;

/** Turns Supabase's raw message into something actionable. */
export function explain(message: string): string {
  if (/row-level security/i.test(message)) return `${message}. ${KEY_HELP}`;
  if (/outfits_genero_check/i.test(message)) return GENERO_HELP;
  return message;
}

export type Seccion = "outfits" | "seguidores";

/** A row of the `outfits` table. */
export type OutfitRow = {
  id: string;
  seccion: Seccion;
  nombre: string;
  genero: Genero;
  temporada: Temporada;
  categoria: Categoria;
  foto: string;
  precio_marca: number;
  prendas: Prenda[];
  autor: string | null;
  instagram: string | null;
  posicion: number | null;
  visible: boolean;
  orden: number;
  created_at: string;
};

/** A subsection created from the panel (the built-in ones live in the code).
 *  `generos` and `traducciones` only exist once the newer columns are added
 *  (see supabase/schema.sql), so both are optional here. */
export type CategoriaRow = {
  id: string;
  slug: string;
  nombre: string;
  generos?: string[] | null;
  traducciones?: Record<string, string> | null;
  orden: number;
  created_at: string;
};

export type SubmissionRow = {
  id: string;
  nombre: string;
  /** Empty until the outfit_nombre column exists (see supabase/schema.sql). */
  outfit_nombre?: string;
  instagram: string;
  email: string;
  idea: string;
  novedades: boolean;
  hipobuy_usuario: string;
  registrado: boolean;
  estado: "nuevo" | "leido" | "aprobado" | "descartado";
  created_at: string;
};

/** next/image only accepts the hosts listed in next.config.ts; anything else
 *  would throw and take the whole page down, so unknown URLs become "no photo"
 *  (the card then shows its placeholder). */
function safeFoto(foto: string): string {
  const value = (foto ?? "").trim();
  if (!value || value.startsWith("/")) return value;
  try {
    const { protocol, hostname } = new URL(value);
    const local = hostname === "127.0.0.1" || hostname === "localhost";
    if (hostname.endsWith(".supabase.co") && protocol === "https:") return value;
    if (local && process.env.NODE_ENV !== "production") return value;
  } catch {}
  console.warn("Foto con dominio no permitido, se ignora:", value);
  return "";
}

export const toOutfit = (r: OutfitRow): Outfit => ({
  nombre: r.nombre,
  // accessories used to be a section of their own; until the migration in
  // supabase/schema.sql runs, those rows still say "tech"
  genero: (r.genero as string) === "tech" ? "ambos" : r.genero,
  temporada: r.temporada,
  categoria: r.categoria,
  foto: safeFoto(r.foto),
  precioMarca: Number(r.precio_marca) || 0,
  prendas: (r.prendas ?? []).map((p) => ({ ...p, precio: Number(p.precio) || 0 })),
});

/** Visible rows of a section, ordered as they should appear. */
export async function listPublic(seccion: Seccion): Promise<OutfitRow[]> {
  const { data, error } = await db()
    .from("outfits")
    .select("*")
    .eq("seccion", seccion)
    .eq("visible", true)
    .order("posicion", { ascending: true, nullsFirst: false })
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as OutfitRow[];
}

/** Every row of a section, visible or not (admin lists). */
export async function listAll(seccion: Seccion): Promise<OutfitRow[]> {
  const { data, error } = await db()
    .from("outfits")
    .select("*")
    .eq("seccion", seccion)
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as OutfitRow[];
}

export async function getOutfit(id: string): Promise<OutfitRow | null> {
  const { data, error } = await db().from("outfits").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as OutfitRow) ?? null;
}

/** A `categorias` row as the site uses it, with sensible values for the two
 *  columns that may not exist yet. Blank `generos` means both sections. */
export const toStyle = (c: CategoriaRow): ExtraStyle => {
  const generos = (c.generos ?? []).filter((g): g is Genero => g === "hombre" || g === "mujer" || g === "ambos");
  return {
    slug: c.slug,
    nombre: c.nombre,
    generos: generos.length ? generos : ["hombre", "mujer"],
    traducciones: (c.traducciones ?? {}) as ExtraStyle["traducciones"],
  };
};

/** Extra subsections, in the order they should appear after the built-in ones. */
export async function listCategorias(): Promise<CategoriaRow[]> {
  const { data, error } = await db()
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as CategoriaRow[];
}

/** Subsections from the panel, or none while the table isn't there yet. */
export async function listStyles(): Promise<ExtraStyle[]> {
  if (!hasDb) return [];
  try {
    return (await listCategorias()).map(toStyle);
  } catch (error) {
    console.error("No se pudieron leer los estilos:", error);
    return [];
  }
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const { data, error } = await db().from("submissions").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SubmissionRow[];
}

/** Public URL of a file in the photos bucket. */
export const publicUrl = (path: string) => db().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
