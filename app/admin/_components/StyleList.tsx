"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Style = { slug: string; nombre: string };
type Extra = Style & { id: string };

export function StyleList({
  builtin,
  extra,
  counts,
}: {
  builtin: Style[];
  extra: Extra[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function send(method: "POST" | "PATCH" | "DELETE", body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    setOk("");
    const res = await fetch("/api/admin/categorias", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.refresh();
      return true;
    }
    setError(data.error ?? "No se pudo completar.");
    return false;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (await send("POST", { nombre })) {
      setOk(`Estilo «${nombre}» creado.`);
      setNombre("");
    }
  }

  const used = (slug: string) => counts[slug] ?? 0;

  return (
    <>
      <div className="ad-card">
        <h2>Añadir un estilo</h2>
        <form className="ad-row" onSubmit={add}>
          <label className="ad-field" style={{ flex: 1, minWidth: 180, marginBottom: 0 }}>
            <span>Nombre</span>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Y2K" maxLength={40} required />
          </label>
          <button className="ad-btn" type="submit" disabled={busy || !nombre.trim()}>
            Crear estilo
          </button>
        </form>
        <span className="ad-hint">
          El nombre se ve igual en todos los idiomas (los cuatro estilos de fábrica sí están traducidos).
        </span>
        {ok && <p className="ad-msg ad-msg-ok">{ok}</p>}
        {error && <p className="ad-msg ad-msg-err">{error}</p>}
      </div>

      <h2>De fábrica</h2>
      <ul className="ad-list">
        {builtin.map((s) => (
          <li className="ad-item" key={s.slug}>
            <div className="ad-item-main">
              <b>{s.nombre}</b>
              <small>
                {used(s.slug)} outfit{used(s.slug) === 1 ? "" : "s"} · traducido a los 7 idiomas
              </small>
            </div>
          </li>
        ))}
      </ul>

      <h2>Tuyos</h2>
      {!extra.length ? (
        <p className="ad-empty">Todavía no has creado ningún estilo.</p>
      ) : (
        <ul className="ad-list">
          {extra.map((s) => (
            <li className="ad-item" key={s.id}>
              <div className="ad-item-main">
                <b>{s.nombre}</b>
                <small>
                  {used(s.slug)} outfit{used(s.slug) === 1 ? "" : "s"} · se muestra igual en todos los idiomas
                </small>
              </div>
              <div className="ad-item-actions">
                <button
                  type="button"
                  className="ad-btn ad-btn-ghost ad-btn-sm"
                  disabled={busy}
                  onClick={() => {
                    const nuevo = prompt("Nuevo nombre del estilo:", s.nombre);
                    if (nuevo && nuevo.trim() && nuevo !== s.nombre) send("PATCH", { id: s.id, nombre: nuevo.trim() });
                  }}
                >
                  Renombrar
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-danger ad-btn-sm"
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`¿Borrar el estilo «${s.nombre}»?`)) send("DELETE", { id: s.id, slug: s.slug });
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
