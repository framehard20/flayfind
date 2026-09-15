"use client";

import type { Genero } from "@/lib/outfits";

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

export function FilterZone({ filtro, onChange }: Props) {
  const esTech = filtro.genero === "tech";

  return (
    <div className="filter-zone">
      <div className="genero g3" role="group" aria-label="Sección">
        <button type="button" aria-pressed={filtro.genero === "hombre"} onClick={() => onChange({ genero: "hombre" })}>
          Hombre
        </button>
        <button type="button" aria-pressed={filtro.genero === "mujer"} onClick={() => onChange({ genero: "mujer" })}>
          Mujer
        </button>
        <button type="button" aria-pressed={filtro.genero === "tech"} onClick={() => onChange({ genero: "tech" })}>
          Accesorios
        </button>
      </div>

      {!esTech && (
        <div className="fgroup" aria-label="Estilo">
          <span className="glabel">Estilo</span>
          {(["todos", "gym", "elegante", "streetwear"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className="chip"
              aria-pressed={filtro.estilo === v}
              onClick={() => onChange({ estilo: v })}
            >
              {v === "todos" ? "Todos" : v === "gym" ? "Gym" : v === "elegante" ? "Elegante" : "Streetwear"}
            </button>
          ))}
        </div>
      )}

      {!esTech && (
        <div className="fgroup" aria-label="Temporada">
          <span className="glabel">Época</span>
          {(["todo", "invierno", "verano"] as const).map((v) => (
            <button
              key={v}
              type="button"
              className="chip"
              aria-pressed={filtro.temporada === v}
              onClick={() => onChange({ temporada: v })}
            >
              {v === "todo" ? "Todo" : v === "invierno" ? "Invierno" : "Verano"}
            </button>
          ))}
        </div>
      )}

      <div className="fgroup" aria-label="Precio">
        <span className="glabel">Precio</span>
        <button type="button" className="chip" aria-pressed={filtro.precio === "barato"} onClick={() => onChange({ precio: "barato" })}>
          Más baratos
        </button>
        <button type="button" className="chip" aria-pressed={filtro.precio === "caro"} onClick={() => onChange({ precio: "caro" })}>
          Más caros
        </button>
      </div>
    </div>
  );
}
