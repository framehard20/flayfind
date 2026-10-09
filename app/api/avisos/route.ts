import { db, hasDb, isMissingTable } from "@/lib/db";
import { isLang } from "@/lib/i18n";

export const runtime = "nodejs";

// Public endpoint: "notify me when the outfits are back" (components/OutfitsSoon).
// Answers with a code so the browser can show the message in the visitor's language.

const str = (v: FormDataEntryValue | null, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const on = (v: FormDataEntryValue | null) => v === "on" || v === "true" || v === "1";

// one try per IP every 20 seconds is plenty for a single email field
const recent = new Map<string, number>();

export async function POST(req: Request) {
  if (!hasDb) return Response.json({ code: "off" }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (Date.now() - (recent.get(ip) ?? 0) < 20_000) return Response.json({ code: "rate" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ code: "save" }, { status: 400 });

  // honeypot: real people leave this hidden field empty
  if (str(form.get("web"))) return Response.json({ ok: true });

  const email = str(form.get("email"), 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return Response.json({ code: "mail" }, { status: 400 });
  // consent is the legal basis for keeping the address, so no tick, no row
  if (!on(form.get("acepta"))) return Response.json({ code: "consent" }, { status: 400 });

  const idioma = str(form.get("idioma"), 5);
  const { error } = await db()
    .from("avisos")
    .upsert({ email, idioma: isLang(idioma) ? idioma : "es" }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    if (isMissingTable(error.message)) {
      // Until supabase/schema.sql is run there's no "avisos" table: keep the
      // request in Solicitudes instead of losing it.
      console.error("Falta la tabla «avisos» (ejecuta supabase/schema.sql); se guarda en Solicitudes.");
      const { error: fallback } = await db().from("submissions").insert({
        nombre: "Aviso de nuevos outfits",
        instagram: "",
        email,
        idea: `Quiere que le avisen por email cuando vuelvan los outfits (idioma: ${isLang(idioma) ? idioma : "es"}). Ha aceptado la política de privacidad.`,
        novedades: true,
        hipobuy_usuario: "",
        registrado: false,
      });
      if (!fallback) {
        recent.set(ip, Date.now());
        return Response.json({ ok: true });
      }
      return Response.json({ code: "off" }, { status: 503 });
    }
    console.error("No se pudo guardar un aviso:", error.message);
    return Response.json({ code: "save" }, { status: 500 });
  }

  recent.set(ip, Date.now());
  return Response.json({ ok: true });
}
