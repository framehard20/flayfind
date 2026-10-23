import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll, listStyles, outfitsOcultos } from "@/lib/db";
import { Nav } from "../_components/Nav";
import { HideAllSwitch } from "../_components/HideAllSwitch";
import { antesDelLanzamiento } from "@/lib/site";
import { OutfitList } from "../_components/OutfitList";
import { DownloadPhotos } from "../_components/DownloadPhotos";
import { allStyles } from "@/lib/styles";

const SECCION: Record<string, string> = { hombre: "Hombre", mujer: "Mujer", ambos: "Hombre y Mujer" };

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  const [rows, estilos, ajuste] = await Promise.all([hasDb ? listAll("outfits") : [], listStyles(), outfitsOcultos()]);

  // the zip has one folder per section and style: Hombre/Streetwear/…
  const estilo = new Map(allStyles(estilos).map((s) => [s.slug, s.nombre]));
  const fotos = rows
    .filter((r) => r.foto)
    .map((r) => ({ foto: r.foto, nombre: r.nombre, carpeta: `${SECCION[r.genero] ?? r.genero}/${estilo.get(r.categoria) ?? r.categoria}` }));

  return (
    <>
      <Nav />
      <div className="ad-top">
        <h1>Outfits</h1>
        <div className="ad-row">
          <DownloadPhotos fotos={fotos} />
          <Link className="ad-btn ad-btn-ghost" href="/admin/outfits/actualizar">
            Actualizar todos
          </Link>
          <Link className="ad-btn ad-btn-ghost" href="/admin/outfits/crear">
            Crear con IA
          </Link>
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
