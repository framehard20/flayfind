import { isLoggedIn } from "@/lib/auth";
import { BUCKET, db, explain, hasDb, publicUrl } from "@/lib/db";
import { comprimirSiSePuede } from "@/lib/comprimir";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "outfit";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return Response.json({ error: "No autorizado" }, { status: 401 });
  if (!hasDb) return Response.json({ error: "La base de datos no está configurada." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No llegó ninguna foto." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "La foto pesa más de 8 MB." }, { status: 400 });

  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Formato no admitido: usa JPG, PNG, WEBP o AVIF." }, { status: 400 });

  const name = slug(String(form?.get("nombre") ?? "") || file.name.replace(/\.[^.]+$/, ""));
  // stored web-sized: the full photo would cost megabytes on every download
  const foto = await comprimirSiSePuede(await file.arrayBuffer(), file.type);
  const path = `${new Date().getFullYear()}/${foto.ext === "jpg" && foto.mime === "image/jpeg" && foto.bytes.length < 1_000_000 ? "c-" : ""}${Date.now()}-${name}.${foto.ext}`;

  const { error } = await db()
    .storage.from(BUCKET)
    .upload(path, foto.bytes, { contentType: foto.mime, cacheControl: "31536000", upsert: false });
  if (error) return Response.json({ error: explain(error.message) }, { status: 500 });

  return Response.json({ ok: true, url: publicUrl(path), path });
}
