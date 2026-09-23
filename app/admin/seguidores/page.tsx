import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll, listStyles } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { OutfitList } from "../_components/OutfitList";

export const dynamic = "force-dynamic";

export default async function SeguidoresPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  const [rows, estilos] = await Promise.all([hasDb ? listAll("seguidores") : [], listStyles()]);

  return (
    <>
      <Nav />
      <div className="ad-top">
        <h1>De seguidores</h1>
        <Link className="ad-btn" href="/admin/seguidores/nuevo">
          + Añadir outfit de seguidor
        </Link>
      </div>
      <p className="ad-lead">
        Los que se ven en la pestaña «De seguidores» de la web, con el autor, su Instagram y el puesto de la semana.
      </p>
      <OutfitList rows={rows} seccion="seguidores" estilos={estilos} />
    </>
  );
}
