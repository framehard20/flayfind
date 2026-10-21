import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { listStyles } from "@/lib/db";
import { cargarPortada } from "@/lib/portada";

// What's shown (and when) is decided in lib/portada.ts. Regenerating every
// minute is what makes the site open on its own at the launch.
export const revalidate = 60;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [{ outfits, seguidores, enPreparacion, prelanzamiento }, estilos] = await Promise.all([cargarPortada(), listStyles()]);
  return (
    <SiteShell
      outfits={outfits}
      seguidores={seguidores}
      estilos={estilos}
      enPreparacion={enPreparacion}
      prelanzamiento={prelanzamiento}
    />
  );
}
