import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { listStyles } from "@/lib/db";
import { Nav } from "../../_components/Nav";
import { OutfitForm } from "../../_components/OutfitForm";

export const dynamic = "force-dynamic";

export default async function NuevoSeguidor() {
  if (!(await isLoggedIn())) redirect("/admin");
  const estilos = await listStyles();
  return (
    <>
      <Nav />
      <h1>Nuevo outfit de seguidor</h1>
      <p className="ad-lead">Igual que un outfit normal, más el autor, su Instagram y el puesto que ocupa esta semana.</p>
      <OutfitForm seccion="seguidores" estilos={estilos} />
    </>
  );
}
