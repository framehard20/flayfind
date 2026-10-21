import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { geminiConfigured } from "@/lib/crear";
import { listStyles } from "@/lib/db";
import { apiKeyConfigured } from "@/lib/emparejar";
import { antesDelLanzamiento } from "@/lib/site";
import { Nav } from "../../_components/Nav";
import { CreateOutfit } from "../../_components/CreateOutfit";

export const dynamic = "force-dynamic";

export default async function CrearOutfit() {
  if (!(await isLoggedIn())) redirect("/admin");
  const estilos = await listStyles();
  const falta = [
    !apiKeyConfigured() && "ANTHROPIC_API_KEY (para que Claude elija prendas)",
    !geminiConfigured() && "GEMINI_API_KEY (para crear la foto; aistudio.google.com → Get API key)",
  ].filter(Boolean);
  return (
    <>
      <Nav />
      <h1>Crear outfit con IA</h1>
      <p className="ad-lead">
        Elige las prendas de la lista de Masterspread (o deja que Claude monte el look), crea la foto sobre la alfombra azul y guárdalo con sus
        links y precios.
      </p>
      {falta.length > 0 && <p className="ad-msg ad-msg-err">Falta en Vercel: {falta.join(" · ")}. Ver ADMIN.md.</p>}
      <CreateOutfit estilos={estilos} prelanzamiento={antesDelLanzamiento()} />
    </>
  );
}
