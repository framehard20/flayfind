import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { hasDb, listAll, listCategorias, toStyle } from "@/lib/db";
import { BUILTIN_STYLES, type ExtraStyle } from "@/lib/styles";
import { Nav } from "../_components/Nav";
import { StyleList } from "../_components/StyleList";

export const dynamic = "force-dynamic";

export default async function EstilosPage() {
  if (!(await isLoggedIn())) redirect("/admin");

  let extra: (ExtraStyle & { id: string })[] = [];
  let counts: Record<string, number> = {};
  let error = "";
  if (hasDb) {
    try {
      const [cats, outfits, seguidores] = await Promise.all([listCategorias(), listAll("outfits"), listAll("seguidores")]);
      extra = cats.map((c) => ({ id: c.id, ...toStyle(c) }));
      counts = [...outfits, ...seguidores].reduce<Record<string, number>>((acc, o) => {
        acc[o.categoria] = (acc[o.categoria] ?? 0) + 1;
        return acc;
      }, {});
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <>
      <Nav />
      <h1>Estilos</h1>
      <p className="ad-lead">
        Los estilos son las subsecciones que se ven dentro de Hombre y de Mujer («Streetwear», «Plumíferos»,
        «Accesorios»…). Puedes añadir los tuyos, elegir en qué sección salen y escribir su nombre en cada idioma.
      </p>
      {error && <div className="ad-msg ad-msg-err">{error}</div>}
      <StyleList
        builtin={BUILTIN_STYLES.map((s) => ({ slug: s.slug, nombre: s.nombre }))}
        extra={extra}
        counts={counts}
      />
    </>
  );
}
