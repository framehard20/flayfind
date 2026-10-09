import { isLoggedIn } from "@/lib/auth";
import { db, explain, hasDb } from "@/lib/db";

export const runtime = "nodejs";

// /admin/avisos: removing someone from the notify-me list (they asked to be
// forgotten, or they've already been emailed).

export async function DELETE(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { id?: unknown; todos?: unknown };
  const query = db().from("avisos").delete();
  const { error } =
    body.todos === true
      ? await query.not("id", "is", null)
      : typeof body.id === "string" && body.id
        ? await query.eq("id", body.id)
        : { error: { message: "Falta el id." } };
  if (error) return Response.json({ error: explain(error.message) }, { status: 400 });
  return Response.json({ ok: true });
}
