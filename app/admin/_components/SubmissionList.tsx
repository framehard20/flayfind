"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmissionRow } from "@/lib/db";

const ESTADOS: { v: SubmissionRow["estado"]; l: string }[] = [
  { v: "nuevo", l: "Nuevo" },
  { v: "leido", l: "Leído" },
  { v: "aprobado", l: "Aprobado" },
  { v: "descartado", l: "Descartado" },
];

export function SubmissionList({ rows }: { rows: SubmissionRow[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function send(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    setError("");
    const res = await fetch("/api/admin/submissions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error ?? "No se pudo completar.");
  }

  if (!rows.length) return <p className="ad-empty">Todavía no ha llegado ninguna solicitud.</p>;

  return (
    <>
      {error && <p className="ad-msg ad-msg-err">{error}</p>}
      <ul className="ad-list">
        {rows.map((s) => (
          <li className="ad-item" key={s.id}>
            <div className="ad-item-main ad-sub">
              <b>
                {s.nombre}{" "}
                {s.estado === "nuevo" && <span className="ad-tag ad-tag-new">nuevo</span>}
              </b>
              <small>
                <a href={`https://instagram.com/${s.instagram}`} target="_blank" rel="noopener">
                  @{s.instagram}
                </a>{" "}
                · <a href={`mailto:${s.email}`}>{s.email}</a> ·{" "}
                {new Date(s.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </small>
              <p className="ad-sub-idea">{s.idea}</p>
              <div className="ad-tags">
                <span className="ad-tag">{s.registrado ? "Dice estar registrado" : "Sin registrar"}</span>
                {s.hipobuy_usuario && <span className="ad-tag">Hipobuy: {s.hipobuy_usuario}</span>}
                <span className="ad-tag">{s.novedades ? "Quiere novedades" : "Sin novedades"}</span>
              </div>
            </div>
            <div className="ad-item-actions">
              <select
                className="ad-btn ad-btn-ghost ad-btn-sm"
                value={s.estado}
                onChange={(e) => send("PATCH", { id: s.id, estado: e.target.value })}
              >
                {ESTADOS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.l}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="ad-btn ad-btn-danger ad-btn-sm"
                onClick={() => {
                  if (confirm(`¿Borrar la solicitud de ${s.nombre}?`)) send("DELETE", { id: s.id });
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
