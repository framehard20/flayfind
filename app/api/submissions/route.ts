import { db, hasDb } from "@/lib/db";

export const runtime = "nodejs";

// Public endpoint: the form in the "De seguidores" section.

const str = (v: FormDataEntryValue | null, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const on = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

// one submission per IP per minute is plenty for a form like this
const recent = new Map<string, number>();

export async function POST(req: Request) {
  if (!hasDb) return Response.json({ error: "El formulario aún no está conectado." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const last = recent.get(ip) ?? 0;
  if (Date.now() - last < 60_000) return Response.json({ error: "Espera un momento antes de enviar otro." }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "Petición inválida." }, { status: 400 });

  // honeypot: real people leave this hidden field empty
  if (str(form.get("web"))) return Response.json({ ok: true });

  const nombre = str(form.get("nombre"), 80);
  const outfit = str(form.get("outfit"), 80);
  const instagram = str(form.get("instagram"), 80).replace(/^@/, "");
  const email = str(form.get("email"), 120);
  const idea = str(form.get("idea"), 1000);
  const registrado = on(form.get("registrado"));

  if (!nombre) return Response.json({ error: "Falta tu nombre." }, { status: 400 });
  if (!outfit) return Response.json({ error: "Ponle un nombre al outfit." }, { status: 400 });
  if (!instagram) return Response.json({ error: "Falta tu Instagram." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return Response.json({ error: "Ese email de Hipobuy no parece válido." }, { status: 400 });
  if (!idea) return Response.json({ error: "Cuéntanos qué outfit quieres que salga." }, { status: 400 });
  if (!registrado) return Response.json({ error: "Tienes que registrarte en Hipobuy con el link para participar." }, { status: 400 });

  const row = {
    nombre,
    instagram,
    email,
    idea,
    novedades: on(form.get("novedades")),
    // the email above is the Hipobuy one, so there's nothing else to store
    hipobuy_usuario: "",
    registrado,
  };

  let { error } = await db().from("submissions").insert({ ...row, outfit_nombre: outfit });
  // the outfit_nombre column was added later: if this database predates it,
  // keep the name with the description instead of losing the submission
  if (error && /outfit_nombre/.test(error.message)) {
    console.warn("Falta la columna outfit_nombre en submissions; ejecuta supabase/schema.sql.");
    ({ error } = await db()
      .from("submissions")
      .insert({ ...row, idea: `Outfit: ${outfit}\n\n${idea}` }));
  }
  if (error) return Response.json({ error: "No se pudo guardar, inténtalo otra vez." }, { status: 500 });

  recent.set(ip, Date.now());
  return Response.json({ ok: true });
}
