"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OutfitRow, Seccion } from "@/lib/db";
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

export function OutfitList({ rows, seccion }: { rows: OutfitRow[]; seccion: Seccion }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

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

  return (
    <>
      {error && <p className="ad-msg ad-msg-err">{error}</p>}
      <ul className="ad-list">
        {rows.map((r) => (
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
                <span className="ad-tag">{LABEL[r.genero] ?? r.genero}</span>
                <span className="ad-tag">{LABEL[r.categoria] ?? r.categoria}</span>
                <span className="ad-tag">{LABEL[r.temporada] ?? r.temporada}</span>
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
    </>
  );
}
