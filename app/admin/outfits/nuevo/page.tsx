import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { listStyles } from "@/lib/db";
import { Nav } from "../../_components/Nav";
import { OutfitForm } from "../../_components/OutfitForm";

export const dynamic = "force-dynamic";

export default async function NuevoOutfit() {
  if (!(await isLoggedIn())) redirect("/admin");
  const estilos = await listStyles();
  return (
    <>
      <Nav />
      <h1>Nuevo outfit</h1>
      <p className="ad-lead">Sube la foto, elige dónde va y añade las prendas con su link. Sale en la web al guardar.</p>
      <OutfitForm seccion="outfits" estilos={estilos} />
    </>
  );
}
