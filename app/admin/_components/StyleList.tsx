"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LANGS } from "@/lib/i18n";
import type { ExtraStyle } from "@/lib/styles";

type Builtin = { slug: string; nombre: string };
type Extra = ExtraStyle & { id: string };

/** The six languages the name can be translated into (Spanish is the name). */
const OTHER_LANGS = LANGS.filter((l) => l.code !== "es");

const SECCIONES = [
  { v: "hombre", l: "Hombre" },
  { v: "mujer", l: "Mujer" },
] as const;

type Draft = { nombre: string; generos: string[]; traducciones: Record<string, string> };

const emptyDraft = (): Draft => ({ nombre: "", generos: ["hombre", "mujer"], traducciones: {} });

const seccionesLabel = (generos: string[]) =>
  generos.includes("ambos") || (generos.includes("hombre") && generos.includes("mujer"))
    ? "Hombre y Mujer"
    : generos.includes("mujer")
      ? "solo Mujer"
      : "solo Hombre";

/** Name / sections / translations — shared by the "add" form and editing. */
function StyleFields({
  draft,
  onChange,
  idPrefix,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  idPrefix: string;
}) {
  const [showLangs, setShowLangs] = useState(false);
  const translated = OTHER_LANGS.filter((l) => draft.traducciones[l.code]?.trim()).length;

  function toggleGenero(v: string) {
    const next = draft.generos.includes(v) ? draft.generos.filter((g) => g !== v) : [...draft.generos, v];
    onChange({ generos: next.length ? next : [v === "hombre" ? "mujer" : "hombre"] });
  }

  return (
    <>
      <label className="ad-field">
        <span>Nombre (español)</span>
        <input
          type="text"
          value={draft.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Y2K"
          maxLength={40}
          required
        />
      </label>

      <div className="ad-field">
        <span>¿En qué secciones aparece?</span>
        <div className="ad-checks">
          {SECCIONES.map((s) => (
            <label key={s.v} className="ad-check">
              <input
                type="checkbox"
                checked={draft.generos.includes(s.v) || draft.generos.includes("ambos")}
                onChange={() => toggleGenero(s.v)}
              />
              <span>{s.l}</span>
            </label>
          ))}
        </div>
        <span className="ad-hint">Marca las dos para que salga en Hombre y en Mujer.</span>
      </div>

      <div className="ad-field">
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setShowLangs((v) => !v)}>
          {showLangs ? "Ocultar traducciones" : `Traducciones${translated ? ` (${translated} de 6)` : " (opcional)"}`}
        </button>
        {showLangs && (
          <>
            <div className="ad-grid" id={`${idPrefix}-langs`}>
              {OTHER_LANGS.map((l) => (
                <label className="ad-field" key={l.code}>
                  <span>{l.label}</span>
                  <input
                    type="text"
                    value={draft.traducciones[l.code] ?? ""}
                    onChange={(e) => onChange({ traducciones: { ...draft.traducciones, [l.code]: e.target.value } })}
                    placeholder={draft.nombre || "—"}
                    maxLength={40}
                  />
                </label>
              ))}
            </div>
            <span className="ad-hint">Lo que dejes en blanco se verá con el nombre en español.</span>
          </>
        )}
      </div>
    </>
  );
}

export function StyleList({
  builtin,
  extra,
  counts,
}: {
  builtin: Builtin[];
  extra: Extra[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft);
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
      if (data.aviso) setError(data.aviso);
      router.refresh();
      return true;
    }
    setError(data.error ?? "No se pudo completar.");
    return false;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const nombre = draft.nombre.trim();
    if (await send("POST", { ...draft, nombre })) {
      setOk(`Estilo «${nombre}» creado.`);
      setDraft(emptyDraft());
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (await send("PATCH", { id: editing, ...editDraft, nombre: editDraft.nombre.trim() })) {
      setOk("Cambios guardados.");
      setEditing(null);
    }
  }

  const used = (slug: string) => counts[slug] ?? 0;

  return (
    <>
      <div className="ad-card">
        <h2>Añadir un estilo</h2>
        <form onSubmit={add}>
          <StyleFields draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} idPrefix="new" />
          <button className="ad-btn" type="submit" disabled={busy || !draft.nombre.trim()}>
            Crear estilo
          </button>
        </form>
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
                {used(s.slug)} outfit{used(s.slug) === 1 ? "" : "s"} · Hombre y Mujer · traducido a los 7 idiomas
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
          {extra.map((s) => {
            const idiomas = OTHER_LANGS.filter((l) => s.traducciones[l.code]?.trim()).length;
            return (
              <li className="ad-item" key={s.id}>
                {editing === s.id ? (
                  <form className="ad-item-main" onSubmit={saveEdit}>
                    <StyleFields
                      draft={editDraft}
                      onChange={(patch) => setEditDraft((d) => ({ ...d, ...patch }))}
                      idPrefix={s.id}
                    />
                    <div className="ad-item-actions">
                      <button className="ad-btn ad-btn-sm" type="submit" disabled={busy || !editDraft.nombre.trim()}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        onClick={() => setEditing(null)}
                        disabled={busy}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="ad-item-main">
                      <b>{s.nombre}</b>
                      <small>
                        {used(s.slug)} outfit{used(s.slug) === 1 ? "" : "s"} · {seccionesLabel(s.generos)} ·{" "}
                        {idiomas ? `traducido a ${idiomas} idioma${idiomas === 1 ? "" : "s"}` : "sin traducir"}
                      </small>
                    </div>
                    <div className="ad-item-actions">
                      <button
                        type="button"
                        className="ad-btn ad-btn-ghost ad-btn-sm"
                        disabled={busy}
                        onClick={() => {
                          setEditing(s.id);
                          setEditDraft({ nombre: s.nombre, generos: s.generos, traducciones: { ...s.traducciones } });
                          setError("");
                          setOk("");
                        }}
                      >
                        Editar
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
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
