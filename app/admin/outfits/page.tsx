import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll, listStyles, outfitsOcultos } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { HideAllSwitch } from "../_components/HideAllSwitch";
import { antesDelLanzamiento } from "@/lib/site";
import { OutfitList } from "../_components/OutfitList";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  const [rows, estilos, ajuste] = await Promise.all([hasDb ? listAll("outfits") : [], listStyles(), outfitsOcultos()]);

  return (
    <>
      <Nav />
      <div className="ad-top">
        <h1>Outfits</h1>
        <div className="ad-row">
          <Link className="ad-btn ad-btn-ghost" href="/admin/outfits/lote">
            Varios con IA
          </Link>
          <Link className="ad-btn" href="/admin/outfits/nuevo">
            + Añadir outfit
          </Link>
        </div>
      </div>
      <p className="ad-lead">Los que se ven en la pestaña «Outfits» de la web, con sus filtros de sección, estilo y época.</p>
      {hasDb && <HideAllSwitch ocultos={ajuste.ocultos} leido={ajuste.leido} prelanzamiento={antesDelLanzamiento()} />}
      <OutfitList rows={rows} seccion="outfits" estilos={estilos} />
    </>
  );
}
