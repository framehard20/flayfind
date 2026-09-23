import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listCategorias } from "@/lib/db";
import { allStyles } from "@/lib/styles";
import { Nav } from "../../_components/Nav";
import { OutfitForm } from "../../_components/OutfitForm";

export const dynamic = "force-dynamic";

export default async function NuevoSeguidor() {
  if (!(await isLoggedIn())) redirect("/admin");
  const estilos = allStyles(hasDb ? await listCategorias() : []);
  return (
    <>
      <Nav />
      <h1>Nuevo outfit de seguidor</h1>
      <p className="ad-lead">Igual que un outfit normal, más el autor, su Instagram y el puesto que ocupa esta semana.</p>
      <OutfitForm seccion="seguidores" estilos={estilos} />
    </>
  );
}
