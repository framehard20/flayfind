import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { explain, hasDb, setOutfitsOcultos } from "@/lib/db";

export const runtime = "nodejs";

// The "Ocultar todos / Mostrar todos" switch in /admin/outfits.

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { ocultos?: unknown };
  if (typeof body.ocultos !== "boolean") return Response.json({ error: "Falta el valor." }, { status: 400 });

  try {
    await setOutfitsOcultos(body.ocultos);
  } catch (error) {
    return Response.json({ error: explain(error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
  revalidatePath("/");
  return Response.json({ ok: true });
}
