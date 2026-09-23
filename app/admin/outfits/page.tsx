import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll, listStyles } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { OutfitList } from "../_components/OutfitList";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  const [rows, estilos] = await Promise.all([hasDb ? listAll("outfits") : [], listStyles()]);

  return (
    <>
      <Nav />
      <div className="ad-top">
        <h1>Outfits</h1>
        <Link className="ad-btn" href="/admin/outfits/nuevo">
          + Añadir outfit
        </Link>
      </div>
      <p className="ad-lead">Los que se ven en la pestaña «Outfits» de la web, con sus filtros de sección, estilo y época.</p>
      <OutfitList rows={rows} seccion="outfits" estilos={estilos} />
    </>
  );
}
