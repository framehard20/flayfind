"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { OutfitRow, Seccion } from "@/lib/db";
import type { Genero } from "@/lib/outfits";
import { ACCESSORIES, subsections, type ExtraStyle } from "@/lib/styles";
import { eur, totalDe } from "@/lib/utils";

const LABEL: Record<string, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  ambos: "Hombre y Mujer",
  tech: "Accesorios",
  streetwear: "Streetwear",
  gym: "Gym",
  elegante: "Elegante",
  plumiferos: "Plumíferos",
  invierno: "Invierno",
  verano: "Verano",
};

const SECCIONES = [
  { v: "todas", l: "Todas" },
  { v: "hombre", l: "Hombre" },
  { v: "mujer", l: "Mujer" },
] as const;

type SeccionFiltro = (typeof SECCIONES)[number]["v"];

/** Same choice as the web: the looks, or the accessories. */
const TIPOS = [
  { v: "outfits", l: "Outfits" },
  { v: "accesorios", l: "Accesorios" },
] as const;

type TipoFiltro = (typeof TIPOS)[number]["v"];

export function OutfitList({
  rows,
  seccion,
  estilos = [],
}: {
  rows: OutfitRow[];
  seccion: Seccion;
  /** Subsections from /admin/estilos, so the chips match the web. */
  estilos?: ExtraStyle[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [genero, setGenero] = useState<SeccionFiltro>("todas");
  const [tipo, setTipo] = useState<TipoFiltro>("outfits");
  const [estilo, setEstilo] = useState("todos");

  // same steps as the web: the section, then outfits or accessories, then style
  const chips = useMemo(() => {
    const all = genero === "todas" ? subsections("ambos", estilos) : subsections(genero as Genero, estilos);
    return ["todos", ...all.map((s) => s.slug).filter((s) => s !== ACCESSORIES)];
  }, [genero, estilos]);

  const lista = rows.filter((r) => {
    const enSeccion =
      genero === "todas" || r.genero === genero || r.genero === "ambos" || (r.genero as string) === "tech";
    if (!enSeccion) return false;
    if (tipo === "accesorios") return r.categoria === ACCESSORIES;
    if (r.categoria === ACCESSORIES) return false;
    return estilo === "todos" || r.categoria === estilo;
  });

  async function send(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(String(body.id));
    setError("");
    const res = await fetch("/api/admin/outfits", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy("");
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error ?? "No se pudo completar.");
  }

  if (!rows.length) {
    return (
      <p className="ad-empty">
        Todavía no hay nada aquí. Pulsa «Añadir» para crear el primero.
      </p>
    );
  }

  const label = (slug: string) =>
    LABEL[slug] ?? estilos.find((s) => s.slug === slug)?.nombre ?? slug;

  return (
    <>
      <div className="ad-filters">
        <div className="ad-frow">
          <span className="ad-flabel">Sección</span>
          {SECCIONES.map((s) => (
            <button
              key={s.v}
              type="button"
              className="ad-chip"
              aria-pressed={genero === s.v}
              onClick={() => {
                setGenero(s.v);
                // a subsection of the other section wouldn't exist here
                if (s.v !== "todas" && estilo !== "todos") {
                  const ok = subsections(s.v as Genero, estilos).some((x) => x.slug === estilo);
                  if (!ok) setEstilo("todos");
                }
              }}
            >
              {s.l}
            </button>
          ))}
        </div>
        <div className="ad-frow">
          <span className="ad-flabel">Tipo</span>
          {TIPOS.map((o) => (
            <button
              key={o.v}
              type="button"
              className="ad-chip"
              aria-pressed={tipo === o.v}
              onClick={() => setTipo(o.v)}
            >
              {o.l}
            </button>
          ))}
        </div>
        {tipo === "outfits" && (
        <div className="ad-frow">
          <span className="ad-flabel">Estilo</span>
          {chips.map((slug) => (
            <button
              key={slug}
              type="button"
              className="ad-chip"
              aria-pressed={estilo === slug}
              onClick={() => setEstilo(slug)}
            >
              {slug === "todos" ? "Todos" : label(slug)}
            </button>
          ))}
        </div>
        )}
        <span className="ad-count">
          {lista.length === rows.length
            ? `${rows.length} en total`
            : `${lista.length} de ${rows.length}`}
        </span>
      </div>

      {error && <p className="ad-msg ad-msg-err">{error}</p>}

      {!lista.length ? (
        <p className="ad-empty">Nada en esta sección todavía.</p>
      ) : (
        <ul className="ad-list">
          {lista.map((r) => (
            <li className="ad-item" key={r.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ad-thumb" src={r.foto} alt="" loading="lazy" />
              <div className="ad-item-main">
                <b>{r.nombre}</b>
                <small>
                  {eur(totalDe(r.prendas ?? []))} · {r.prendas?.length ?? 0} prendas
                  {seccion === "seguidores" && r.instagram ? ` · @${r.instagram}` : ""}
                  {seccion === "seguidores" && r.posicion ? ` · puesto ${r.posicion}` : ""}
                </small>
                <div className="ad-tags">
                  <span className="ad-tag">{label(r.genero)}</span>
                  <span className="ad-tag">{label(r.categoria)}</span>
                  <span className="ad-tag">{label(r.temporada)}</span>
                  {!r.visible && <span className="ad-tag ad-tag-off">Oculto</span>}
                </div>
              </div>
              <div className="ad-item-actions">
                <Link className="ad-btn ad-btn-ghost ad-btn-sm" href={`${seccion === "seguidores" ? "/admin/seguidores" : "/admin/outfits"}/${r.id}`}>
                  Editar
                </Link>
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost ad-btn-sm"
                  disabled={busy === r.id}
                  onClick={() => send("PATCH", { id: r.id, only: "visible", visible: !r.visible })}
                >
                  {r.visible ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-danger ad-btn-sm"
                  disabled={busy === r.id}
                  onClick={() => {
                    if (confirm(`¿Borrar «${r.nombre}»? No se puede deshacer.`)) send("DELETE", { id: r.id });
                  }}
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
