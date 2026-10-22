import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll } from "@/lib/db";
import { apiKeyConfigured } from "@/lib/emparejar";
import { Nav } from "../../_components/Nav";
import { RefreshOutfits } from "../../_components/RefreshOutfits";

export const dynamic = "force-dynamic";

export default async function ActualizarOutfits() {
  if (!(await isLoggedIn())) redirect("/admin");
  const rows = hasDb ? [...(await listAll("outfits")), ...(await listAll("seguidores"))] : [];
  return (
    <>
      <Nav />
      <h1>Actualizar outfits</h1>
      <p className="ad-lead">
        Vuelve a buscar las prendas de cada outfit en la lista de Masterspread, con el link más barato del mismo modelo. No cambia nada hasta que
        pulses «Aplicar».
      </p>
      {!apiKeyConfigured() && <p className="ad-msg ad-msg-err">Falta la clave de Claude (ANTHROPIC_API_KEY en Vercel).</p>}
      {!hasDb && <p className="ad-msg ad-msg-err">La base de datos no está configurada.</p>}
      <RefreshOutfits rows={rows} />
    </>
  );
}
