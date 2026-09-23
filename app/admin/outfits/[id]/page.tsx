import { notFound, redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getOutfit, hasDb, listCategorias } from "@/lib/db";
import { allStyles } from "@/lib/styles";
import { Nav } from "../../_components/Nav";
import { OutfitForm } from "../../_components/OutfitForm";

export const dynamic = "force-dynamic";

export default async function EditarOutfit({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isLoggedIn())) redirect("/admin");
  const { id } = await params;
  const outfit = hasDb ? await getOutfit(id) : null;
  if (!outfit) notFound();
  const estilos = allStyles(hasDb ? await listCategorias() : []);

  return (
    <>
      <Nav />
      <h1>Editar outfit</h1>
      <p className="ad-lead">{outfit.nombre}</p>
      <OutfitForm seccion="outfits" outfit={outfit} estilos={estilos} />
    </>
  );
}
