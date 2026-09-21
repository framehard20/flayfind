import Link from "next/link";
import { adminConfigured, isLoggedIn } from "@/lib/auth";
import { db, hasDb, KEY_HELP, serviceKeyProblem } from "@/lib/db";
import { ImportButton } from "./_components/ImportButton";
import { LoginForm } from "./_components/LoginForm";
import { Nav } from "./_components/Nav";

export const dynamic = "force-dynamic";

async function counts() {
  if (!hasDb) return null;
  const [outfits, seguidores, nuevas] = await Promise.all([
    db().from("outfits").select("id", { count: "exact", head: true }).eq("seccion", "outfits"),
    db().from("outfits").select("id", { count: "exact", head: true }).eq("seccion", "seguidores"),
    db().from("submissions").select("id", { count: "exact", head: true }).eq("estado", "nuevo"),
  ]);
  return { outfits: outfits.count ?? 0, seguidores: seguidores.count ?? 0, nuevas: nuevas.count ?? 0 };
}

export default async function AdminHome() {
  if (!(await isLoggedIn())) return <LoginForm configured={adminConfigured} />;

  let data: Awaited<ReturnType<typeof counts>> = null;
  let dbError = "";
  try {
    data = await counts();
  } catch (e) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return (
    <>
      <Nav nuevas={data?.nuevas ?? 0} />
      <h1>Hola 👋</h1>
      <p className="ad-lead">Desde aquí publicas outfits en la web sin tocar código. Los cambios salen en la web en menos de un minuto.</p>

      {!hasDb && (
        <div className="ad-msg ad-msg-err">
          Falta conectar la base de datos (Supabase). Sigue los pasos de ADMIN.md: crear el proyecto, pegar el SQL y añadir las variables en Vercel.
        </div>
      )}
      {serviceKeyProblem() && <div className="ad-msg ad-msg-err">{KEY_HELP}</div>}
      {dbError && <div className="ad-msg ad-msg-err">Error hablando con la base de datos: {dbError}</div>}

      {data && (
        <div className="ad-grid">
          <Link className="ad-card" href="/admin/outfits">
            <b>{data.outfits}</b> outfits publicados
          </Link>
          <Link className="ad-card" href="/admin/seguidores">
            <b>{data.seguidores}</b> outfits de seguidores
          </Link>
          <Link className="ad-card" href="/admin/solicitudes">
            <b>{data.nuevas}</b> solicitudes nuevas
          </Link>
        </div>
      )}

      {data && data.outfits === 0 && (
        <div className="ad-card">
          <h2>Empieza importando lo que ya tienes</h2>
          <p className="ad-lead">
            Copia a la base de datos los outfits que ahora mismo están escritos en el código, para poder editarlos desde aquí. Puedes
            pulsarlo sin miedo: no duplica nada.
          </p>
          <ImportButton />
        </div>
      )}
    </>
  );
}
