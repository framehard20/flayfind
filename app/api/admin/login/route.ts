import { adminConfigured, checkPassword, checkTotp, clearAttempts, noteFailure, startSession, tooManyAttempts } from "@/lib/auth";

export const runtime = "nodejs";

const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
const fail = (msg: string, status = 401) => Response.json({ error: msg }, { status });

export async function POST(req: Request) {
  if (!adminConfigured) return fail("El panel aún no está configurado (faltan variables de entorno).", 503);

  const who = ip(req);
  if (tooManyAttempts(who)) return fail("Demasiados intentos. Espera 10 minutos.", 429);

  let body: { password?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("Petición inválida.", 400);
  }
  const password = typeof body.password === "string" ? body.password : "";
  const code = typeof body.code === "string" ? body.code : "";

  // check both factors before answering, and give one generic message, so the
  // response doesn't reveal which half was wrong
  const ok = checkPassword(password);
  const okCode = checkTotp(code);
  if (!ok || !okCode) {
    noteFailure(who);
    await new Promise((r) => setTimeout(r, 600));
    return fail("Contraseña o código incorrectos.");
  }

  clearAttempts(who);
  await startSession();
  return Response.json({ ok: true });
}
