import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { listStyles } from "@/lib/db";
import { apiKeyConfigured } from "@/lib/emparejar";
import { antesDelLanzamiento } from "@/lib/site";
import { Nav } from "../../_components/Nav";
import { BatchOutfits } from "../../_components/BatchOutfits";

export const dynamic = "force-dynamic";

export default async function LoteOutfits() {
  if (!(await isLoggedIn())) redirect("/admin");
  const estilos = await listStyles();
  return (
    <>
      <Nav />
      <h1>Varios outfits con IA</h1>
      <p className="ad-lead">
        Sube varias fotos a la vez: Claude busca cada prenda en la lista de Masterspread y te deja el link y el precio en euros. Revisa lo
        marcado, completa los «Link no encontrado» y guárdalos todos de una vez.
      </p>
      {!apiKeyConfigured() && (
        <p className="ad-msg ad-msg-err">
          Falta la clave de Claude: crea una en console.anthropic.com → API Keys y ponla en Vercel como ANTHROPIC_API_KEY (ver ADMIN.md). Hasta
          entonces las fotos se suben pero no se pueden analizar.
        </p>
      )}
      <BatchOutfits estilos={estilos} prelanzamiento={antesDelLanzamiento()} />
    </>
  );
}
