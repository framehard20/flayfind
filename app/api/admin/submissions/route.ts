import { revalidatePath } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { db, hasDb } from "@/lib/db";

export const runtime = "nodejs";

const ESTADOS = ["nuevo", "leido", "aprobado", "descartado"];

async function guard() {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });
  return null;
}

export async function PATCH(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as { id?: string; estado?: string };
  if (!body.id || !ESTADOS.includes(body.estado ?? "")) return Response.json({ error: "Datos inválidos." }, { status: 400 });

  const { error } = await db().from("submissions").update({ estado: body.estado }).eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  revalidatePath("/admin/solicitudes");
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const stop = await guard();
  if (stop) return stop;

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return Response.json({ error: "Falta el id." }, { status: 400 });
  const { error } = await db().from("submissions").delete().eq("id", body.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  revalidatePath("/admin/solicitudes");
  return Response.json({ ok: true });
}
