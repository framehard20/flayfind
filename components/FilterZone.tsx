"use client";

import type { Genero } from "@/lib/outfits";
import { useSettings } from "./Settings";

export type Filtro = {
  genero: Genero;
  estilo: string;
  temporada: string;
  precio: "barato" | "caro";
};

type Props = {
  filtro: Filtro;
  onChange: (patch: Partial<Filtro>) => void;
};

const ESTILOS = [
  { v: "todos", k: "f.all" },
  { v: "gym", k: "f.gym" },
  { v: "elegante", k: "f.elegant" },
  { v: "streetwear", k: "f.street" },
] as const;

const TEMPORADAS = [
  { v: "todo", k: "f.seasonAll" },
  { v: "invierno", k: "f.winter" },
  { v: "verano", k: "f.summer" },
] as const;

export function FilterZone({ filtro, onChange }: Props) {
  const { t } = useSettings();
  const esTech = filtro.genero === "tech";

  return (
    <div className="filter-zone">
      <div className="genero g3" role="group" aria-label={t("filter.section")}>
        <button type="button" aria-pressed={filtro.genero === "hombre"} onClick={() => onChange({ genero: "hombre" })}>
          {t("f.men")}
        </button>
        <button type="button" aria-pressed={filtro.genero === "mujer"} onClick={() => onChange({ genero: "mujer" })}>
          {t("f.women")}
        </button>
        <button type="button" aria-pressed={filtro.genero === "tech"} onClick={() => onChange({ genero: "tech" })}>
          {t("f.accessories")}
        </button>
      </div>

      {!esTech && (
        <div className="fgroup" aria-label={t("filter.style")}>
          <span className="glabel">{t("filter.style")}</span>
          {ESTILOS.map((o) => (
            <button
              key={o.v}
              type="button"
              className="chip"
              aria-pressed={filtro.estilo === o.v}
              onClick={() => onChange({ estilo: o.v })}
            >
              {t(o.k)}
            </button>
          ))}
        </div>
      )}

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
