"use client";

import type { Genero } from "@/lib/outfits";
import { useSettings } from "./Settings";
import { ACCESSORIES, subsections } from "@/lib/styles";
import { EVENTS, track } from "@/lib/track";

/** The two sections. Accessories is a subsection inside each of them. */
export type Seccion = Exclude<Genero, "ambos">;

export type Filtro = {
  genero: Seccion;
  estilo: string;
  temporada: string;
  precio: "barato" | "caro";
};

type Props = {
  filtro: Filtro;
  onChange: (patch: Partial<Filtro>) => void;
};

const SECCIONES = [
  { v: "hombre", k: "f.men" },
  { v: "mujer", k: "f.women" },
] as const;

const TEMPORADAS = [
  { v: "todo", k: "f.seasonAll" },
  { v: "invierno", k: "f.winter" },
  { v: "verano", k: "f.summer" },
] as const;

export function FilterZone({ filtro, onChange }: Props) {
  const { t, estilos, styleLabel } = useSettings();
  const chips = ["todos", ...subsections(filtro.genero, estilos).map((s) => s.slug)];
  const esTech = filtro.estilo === ACCESSORIES;

  function pickSeccion(genero: Seccion) {
    track(EVENTS.section[genero]);
    // a subsection created for only one section doesn't exist in the other
    const keeps = filtro.estilo === "todos" || subsections(genero, estilos).some((s) => s.slug === filtro.estilo);
    onChange({ genero, estilo: keeps ? filtro.estilo : "todos" });
  }

  function pickEstilo(slug: string) {
    if (slug === ACCESSORIES) track(EVENTS.accessories[filtro.genero]);
    onChange({ estilo: slug });
  }

  return (
    <div className="filter-zone">
      <div className="genero" role="group" aria-label={t("filter.section")}>
        {SECCIONES.map((s) => (
          <button key={s.v} type="button" aria-pressed={filtro.genero === s.v} onClick={() => pickSeccion(s.v)}>
            {t(s.k)}
          </button>
        ))}
      </div>

      <div className="fgroup" aria-label={t("filter.style")}>
        <span className="glabel">{t("filter.style")}</span>
        {chips.map((slug) => (
          <button
            key={slug}
            type="button"
            className="chip"
            aria-pressed={filtro.estilo === slug}
            onClick={() => pickEstilo(slug)}
          >
            {slug === "todos" ? t("f.all") : styleLabel(slug)}
          </button>
        ))}
      </div>

      {!esTech && (
        <div className="fgroup" aria-label={t("filter.season")}>
          <span className="glabel">{t("filter.season")}</span>
          {TEMPORADAS.map((o) => (
            <button
              key={o.v}
              type="button"
              className="chip"
              aria-pressed={filtro.temporada === o.v}
              onClick={() => onChange({ temporada: o.v })}
            >
              {t(o.k)}
            </button>
          ))}
        </div>
      )}

      <div className="fgroup" aria-label={t("filter.price")}>
        <span className="glabel">{t("filter.price")}</span>
        <button type="button" className="chip" aria-pressed={filtro.precio === "barato"} onClick={() => onChange({ precio: "barato" })}>
          {t("f.cheap")}
        </button>
        <button type="button" className="chip" aria-pressed={filtro.precio === "caro"} onClick={() => onChange({ precio: "caro" })}>
          {t("f.expensive")}
        </button>
      </div>
    </div>
  );
}
