import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteShell } from "@/components/SiteShell";
import { isLoggedIn } from "@/lib/auth";
import { listStyles } from "@/lib/db";
import { cargarPortada } from "@/lib/portada";
import { lanzamiento } from "@/lib/site";

// Private preview of the home page as it will look at the launch (1 November,
// 00:00 Madrid). Only with the admin session; anyone else is sent to the login.
// It runs the same code as the home page, asked about a moment just after the
// launch, so what you see is what the site will show then (with what's saved
// right now). The public page is not touched.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vista previa del lanzamiento · Flayfind",
  robots: { index: false, follow: false },
};

// the owner's own visits shouldn't count in Umami: its script skips tracking
// while this flag is set, and it's taken away again when leaving the page
const SIN_ANALITICA = `try{localStorage.setItem("umami.disabled","1");addEventListener("pagehide",function(){try{localStorage.removeItem("umami.disabled")}catch(e){}})}catch(e){}`;

export default async function VistaPrevia() {
  if (!(await isLoggedIn())) redirect("/admin");

  const l = lanzamiento();
  const momento = l === null ? Date.now() : Math.max(Date.now(), l + 1000);
  const [{ outfits, seguidores, enPreparacion, prelanzamiento }, estilos] = await Promise.all([cargarPortada(momento), listStyles()]);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SIN_ANALITICA }} />
      <div
        role="note"
        style={{
          position: "sticky", top: 0, zIndex: 1000, display: "flex", gap: 12, alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", padding: "9px 14px", background: "#111", color: "#fff", fontSize: 13, fontWeight: 600, textAlign: "center",
        }}
      >
        <span>
          👁 Vista previa privada: así se verá la web el 1 de noviembre a las 00:00 · {outfits.length} outfits
          {enPreparacion ? " · ⚠ «Ocultar todos» seguirá activo" : ""}. Nadie más la ve.
        </span>
        <Link href="/admin/outfits" style={{ color: "#fff", textDecoration: "underline" }}>
          Volver al panel
        </Link>
      </div>
      <SiteShell outfits={outfits} seguidores={seguidores} estilos={estilos} enPreparacion={enPreparacion} prelanzamiento={prelanzamiento} />
    </>
  );
}
