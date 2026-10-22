"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { OutfitRow } from "@/lib/db";
import type { Emparejado, Opcion } from "@/lib/emparejar";
import { generico, marcasEn } from "@/lib/marcas";
import { ACCESSORIES } from "@/lib/styles";
import { BrandWarning } from "./BrandWarning";

// /admin/outfits/actualizar: look again at every saved outfit's photo, find
// each garment on Masterspread's list (the cheapest link of the same model)
// and propose the new garments next to the current ones. Nothing changes until
// "Aplicar". The analysis stays in this browser, so a reload doesn't pay again.

type Fila = {
  tipo: string;
  link: string;
  precio: string;
  producto: string;
  productoFoto: string;
  confianza: "alta" | "media" | "baja" | null;
  motivo: string;
  alternativas: Opcion[];
};
type Estado = "pendiente" | "cola" | "analizando" | "listo" | "error" | "aplicado";
type Item = { id: string; estado: Estado; error: string; nombre: string; prendas: Fila[] };

const STORE = "ff_refresh_v1";
const precioTxt = (n: number | null) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const eur = (s: string) => parseFloat(String(s).replace(",", ".")) || 0;
const ver = (url: string, w = 256) => (url.startsWith("/") ? url : `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=70`);
const tieneLink = (f: Fila) => /^https?:\/\//i.test(f.link.trim());

function filaDe(p: Emparejado["prendas"][number]): Fila {
  return {
    tipo: p.tipo,
    link: p.elegido?.link ?? "",
    precio: precioTxt(p.elegido?.eur ?? null),
    producto: p.elegido?.nombre ?? "",
    productoFoto: p.elegido?.foto ?? "",
    confianza: p.confianza,
    motivo: p.motivo,
    alternativas: p.alternativas,
  };
}

export function RefreshOutfits({ rows }: { rows: OutfitRow[] }) {
  const looks = rows.filter((r) => r.categoria !== ACCESSORIES);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [marcados, setMarcados] = useState<Set<string>>(() => new Set(looks.map((r) => r.id)));
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const cola = useRef(Promise.resolve());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "{}") as Record<string, Item>;
      for (const k of Object.keys(saved)) if (["cola", "analizando"].includes(saved[k].estado)) saved[k] = { ...saved[k], estado: "pendiente" };
      setItems(saved);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const patch = (id: string, p: Partial<Item>) =>
    setItems((m) => ({ ...m, [id]: { ...(m[id] ?? { id, estado: "pendiente", error: "", nombre: "", prendas: [] }), ...p } }));
  const patchFila = (id: string, k: number, p: Partial<Fila>) =>
    setItems((m) => ({ ...m, [id]: { ...m[id], prendas: m[id].prendas.map((f, j) => (j === k ? { ...f, ...p } : f)) } }));

  function analizar(row: OutfitRow) {
    patch(row.id, { estado: "cola", error: "" });
    cola.current = cola.current.then(async () => {
      patch(row.id, { estado: "analizando" });
      const res = await fetch("/api/admin/emparejar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoUrl: row.foto }),
      }).catch(() => null);
      const data = res ? await res.json().catch(() => ({})) : {};
      if (!res?.ok) return patch(row.id, { estado: "error", error: data.error ?? "No se pudo analizar (sin conexión o tardó demasiado)." });
      const o = data.outfit as Emparejado;
      patch(row.id, {
        estado: "listo",
        // the outfit keeps its name; only a brand in it is taken out
        nombre: marcasEn(row.nombre).length ? generico(row.nombre, o.nombre) : row.nombre,
        prendas: o.prendas.map(filaDe),
      });
    });
  }

  async function aplicar(row: OutfitRow): Promise<boolean> {
    const it = items[row.id];
    // a garment that is in the photo needs its link: fill it in or remove it by hand
    if (it.prendas.some((f) => !tieneLink(f))) {
      setMsg({ ok: false, text: `«${it.nombre || row.nombre}» tiene alguna prenda sin link: pon el link o pulsa «Quitar» en esa prenda.` });
      return false;
    }
    const prendas = it.prendas;
    if (!prendas.length) {
      setMsg({ ok: false, text: `«${it.nombre || row.nombre}» se ha quedado sin prendas.` });
      return false;
    }
    const res = await fetch("/api/admin/outfits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        seccion: row.seccion,
        nombre: it.nombre || row.nombre,
        genero: row.genero,
        temporada: row.temporada,
        categoria: row.categoria,
        foto: row.foto,
        precioMarca: row.precio_marca ? String(row.precio_marca) : "",
        prendas: prendas.map((f) => ({ tipo: f.tipo, precio: f.precio, link: f.link.trim() })),
        autor: row.autor ?? "",
        instagram: row.instagram ?? "",
        posicion: row.posicion ?? "",
        visible: row.visible,
        orden: row.orden,
      }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      patch(row.id, { estado: "error", error: data.error ?? "No se pudo guardar." });
      return false;
    }
    patch(row.id, { estado: "aplicado" });
    return true;
  }

  const elegidos = looks.filter((r) => marcados.has(r.id));
  const listos = elegidos.filter((r) => items[r.id]?.estado === "listo");
  const trabajando = Object.values(items).some((i) => i.estado === "cola" || i.estado === "analizando");
  const conHueco = listos.filter((r) => items[r.id].prendas.some((f) => !tieneLink(f)));
  const conMarca = listos.filter((r) => marcasEn(items[r.id].nombre).length || items[r.id].prendas.some((f) => marcasEn(f.tipo).length));

  async function aplicarTodos() {
    setMsg(null);
    if (conMarca.length) return setMsg({ ok: false, text: `Quita las marcas (en rojo) de: ${conMarca.map((r) => items[r.id].nombre).join(", ")}.` });
    setGuardando(true);
    let ok = 0;
    for (const r of listos) if (!items[r.id].prendas.some((f) => !tieneLink(f)) && (await aplicar(r))) ok++;
    setGuardando(false);
    setMsg({
      ok: true,
      text: `${ok} outfits actualizados.${conHueco.length ? ` Faltan ${conHueco.length} con alguna prenda sin link (en rojo): pon el link o quita esa prenda y aplícalos.` : ""}`,
    });
  }

  return (
    <>
      <div className="ad-card">
        <p className="ad-hint">
          {looks.length} outfits ({rows.length - looks.length} accesorios no entran: esa sección ahora lleva a Masterspread). Claude mira la foto
          de cada uno, busca cada prenda en la lista de Masterspread y elige el link más barato del mismo modelo. Tú revisas y pulsas «Aplicar».
          Tarda alrededor de un minuto y cuesta unos céntimos por outfit.
        </p>
        <div className="ad-row">
          <button
            type="button"
            className="ad-btn"
            disabled={trabajando || !elegidos.length}
            onClick={() => elegidos.filter((r) => items[r.id]?.estado !== "aplicado").forEach(analizar)}
          >
            {trabajando ? "Analizando…" : `Analizar ${elegidos.length} outfits`}
          </button>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setMarcados(new Set(looks.map((r) => r.id)))}>
            Marcar todos
          </button>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setMarcados(new Set())}>
            Desmarcar todos
          </button>
        </div>
      </div>

      {looks.map((row) => {
        const it = items[row.id];
        return (
          <div className="ad-card ad-lote" key={row.id}>
            <div className="ad-lote-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ad-preview" src={ver(row.foto)} alt="" loading="lazy" />
              <label className="ad-check">
                <input
                  type="checkbox"
                  checked={marcados.has(row.id)}
                  onChange={(e) =>
                    setMarcados((s) => {
                      const n = new Set(s);
                      if (e.target.checked) n.add(row.id);
                      else n.delete(row.id);
                      return n;
                    })
                  }
                />
                <span>Incluir</span>
              </label>
            </div>
            <div className="ad-lote-main">
              <p className="ad-lote-file">
                {row.nombre} <span className="ad-hint">· {row.seccion === "seguidores" ? "De seguidores" : row.genero} · {row.visible ? "visible" : "oculto"}</span>
              </p>

              <div className="ad-refresh-cols">
                <div>
                  <span className="ad-flabel">Ahora</span>
                  <ul className="ad-refresh-old">
                    {(row.prendas ?? []).map((p, k) => (
                      <li key={k}>
                        {p.tipo} · {precioTxt(Number(p.precio) || 0)} € ·{" "}
                        <a href={p.link} target="_blank" rel="noopener">
                          {/uidbuy\.com/i.test(p.link) ? "link" : "link antiguo (no es de Uidbuy)"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {!it || it.estado === "pendiente" ? (
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={trabajando} onClick={() => analizar(row)}>
                  Analizar solo este
                </button>
              ) : it.estado === "cola" || it.estado === "analizando" ? (
                <p className="ad-hint">{it.estado === "cola" ? "En cola…" : "Buscando las prendas en Masterspread… (≈1 min)"}</p>
              ) : it.estado === "aplicado" ? (
                <p className="ad-msg ad-msg-ok">Actualizado ✓</p>
              ) : (
                <>
                  {it.error && <p className="ad-msg ad-msg-err">{it.error}</p>}
                  {it.estado === "listo" && (
                    <>
                      <label className="ad-field">
                        <span>Nombre</span>
                        <input type="text" value={it.nombre} onChange={(e) => patch(row.id, { nombre: e.target.value })} />
                        <BrandWarning text={it.nombre} />
                      </label>
                      <span className="ad-flabel">Propuesta</span>
                      <ul className="ad-pieces">
                        {it.prendas.map((f, k) => (
                          <li className={`ad-piece ad-lote-piece${tieneLink(f) ? "" : " is-missing"}`} key={k}>
                            <label className="ad-field">
                              <span>Prenda</span>
                              <input type="text" value={f.tipo} onChange={(e) => patchFila(row.id, k, { tipo: e.target.value })} />
                              <BrandWarning text={f.tipo} />
                            </label>
                            <label className="ad-field">
                              <span>Precio €</span>
                              <input type="text" inputMode="decimal" value={f.precio} onChange={(e) => patchFila(row.id, k, { precio: e.target.value })} />
                            </label>
                            <button
                              type="button"
                              className="ad-btn ad-btn-ghost ad-btn-sm ad-piece-x"
                              onClick={() => patch(row.id, { prendas: it.prendas.filter((_, j) => j !== k) })}
                            >
                              Quitar
                            </button>
                            <label className="ad-field ad-piece-link">
                              <span>Link de compra</span>
                              <input
                                type="url"
                                value={f.link}
                                placeholder="https://www.uidbuy.com/..."
                                onChange={(e) => patchFila(row.id, k, { link: e.target.value, producto: "", productoFoto: "", confianza: null })}
                              />
                            </label>
                            <div className="ad-lote-match">
                              {f.productoFoto && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.productoFoto} alt="" loading="lazy" />
                              )}
                              <div>
                                {!tieneLink(f) ? (
                                  <span className="ad-flag ad-flag-miss">Link no encontrado</span>
                                ) : f.confianza === "alta" ? (
                                  <span className="ad-flag ad-flag-ok">Coincide</span>
                                ) : f.confianza ? (
                                  <span className="ad-flag ad-flag-check">Revísalo · confianza {f.confianza}</span>
                                ) : null}
                                {f.producto && <span className="ad-hint">{f.producto}</span>}
                                {f.motivo && <span className="ad-hint">{f.motivo}</span>}
                                {f.alternativas.length > 0 && (
                                  <select
                                    className="ad-lote-alt"
                                    value=""
                                    onChange={(e) => {
                                      const alt = f.alternativas.find((a) => String(a.n) === e.target.value);
                                      if (!alt) return;
                                      const antes = f.link && f.producto ? { n: -1, nombre: f.producto, link: f.link, foto: f.productoFoto, eur: eur(f.precio) || null } : null;
                                      patchFila(row.id, k, {
                                        link: alt.link,
                                        precio: precioTxt(alt.eur),
                                        producto: alt.nombre,
                                        productoFoto: alt.foto,
                                        confianza: "media",
                                        motivo: "Elegido a mano entre las otras opciones.",
                                        alternativas: [...f.alternativas.filter((a) => a.n !== alt.n), ...(antes ? [antes] : [])],
                                      });
                                    }}
                                  >
                                    <option value="">Otras opciones de la lista ({f.alternativas.length})…</option>
                                    {f.alternativas.map((a) => (
                                      <option key={a.n} value={a.n}>
                                        {a.nombre}
                                        {a.eur != null ? ` · ${precioTxt(a.eur)} €` : ""}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="ad-row">
                        <button type="button" className="ad-btn ad-btn-sm" disabled={guardando} onClick={() => aplicar(row)}>
                          Aplicar a este outfit
                        </button>
                        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={trabajando} onClick={() => analizar(row)}>
                          Volver a analizar
                        </button>
                        <span className="ad-hint">
                          Total: <b>{precioTxt(it.prendas.filter(tieneLink).reduce((s, f) => s + eur(f.precio), 0))} €</b> (antes{" "}
                          {precioTxt((row.prendas ?? []).reduce((s, p) => s + (Number(p.precio) || 0), 0))} €)
                        </span>
                      </div>
                    </>
                  )}
                  {it.estado === "error" && (
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={trabajando} onClick={() => analizar(row)}>
                      Reintentar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      <div className="ad-card">
        <p className="ad-hint">
          {listos.length - conHueco.length} listos para aplicar{conHueco.length ? ` · ${conHueco.length} con alguna prenda sin link (complétala o quítala)` : ""}
          {trabajando ? " · analizando…" : ""}
        </p>
        <div className="ad-row">
          <button type="button" className="ad-btn" disabled={guardando || trabajando || listos.length === conHueco.length} onClick={aplicarTodos}>
            {guardando ? "Aplicando…" : `Aplicar los ${listos.length - conHueco.length} revisados`}
          </button>
        </div>
        {msg && (
          <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>
            {msg.text} {msg.ok && <Link href="/admin/outfits">Ver la lista de Outfits →</Link>}
          </p>
        )}
      </div>
    </>
  );
}
