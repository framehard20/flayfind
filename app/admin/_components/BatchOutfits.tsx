"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Genero } from "@/lib/outfits";
import type { Emparejado, Opcion } from "@/lib/emparejar";
import { subsections, type ExtraStyle } from "@/lib/styles";
import { marcasEn } from "@/lib/marcas";
import { BrandWarning } from "./BrandWarning";
import { PhotoFramer } from "./PhotoFramer";

// /admin/outfits/lote: drop several outfit photos at once. Each one is cropped
// to 9:16 and uploaded, then sent to /api/admin/emparejar, which finds every
// garment on Masterspread's list. What comes back is an editable outfit per
// photo; garments with no match are flagged "Link no encontrado" so they can
// be looked up elsewhere. "Guardar todos" saves them — hidden until the launch.
// The batch lives in this browser (localStorage) until it's saved, so a reload
// doesn't throw away work that cost a call to Claude.

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

type Item = {
  id: string;
  archivo: string;
  estado: "subiendo" | "analizando" | "listo" | "error";
  error: string;
  foto: string;
  /** The shrunk photo sent to Claude, kept for "Volver a analizar". Not stored. */
  analisis?: string;
  nombre: string;
  genero: Genero;
  temporada: "invierno" | "verano";
  categoria: string;
  prendas: Fila[];
};

const STORE = "ff_lote_v1";
const GENEROS: { v: Genero; l: string }[] = [
  { v: "hombre", l: "Hombre" },
  { v: "mujer", l: "Mujer" },
  { v: "ambos", l: "Hombre y Mujer" },
];

const precioTxt = (n: number | null) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const eur = (s: string) => parseFloat(s.replace(",", ".")) || 0;
const vacia = (): Fila => ({ tipo: "", link: "", precio: "", producto: "", productoFoto: "", confianza: null, motivo: "", alternativas: [] });

/** Loads a picked file as an <img>. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo abrir la foto."));
    img.src = url;
  });
}

const toBlob = (canvas: HTMLCanvasElement, q = 0.86) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo preparar la foto."))), "image/jpeg", q));

/** The photo for Claude: whole picture, longest side 1568px (more adds cost, not detail). */
function forAnalysis(img: HTMLImageElement): string {
  const scale = Math.min(1, 1568 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85).split(",")[1];
}

/** The photo for the site: centred 9:16 crop, like the framer's starting position. */
async function forSite(img: HTMLImageElement): Promise<Blob> {
  const W = 1080, H = 1920;
  const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  c.getContext("2d")!.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  return toBlob(c);
}

async function upload(file: Blob, nombre: string): Promise<string> {
  const body = new FormData();
  body.append("file", new File([file], "outfit.jpg", { type: "image/jpeg" }));
  body.append("nombre", nombre);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No se pudo subir la foto.");
  return data.url as string;
}

const reframeSrc = (url: string) => `/_next/image?url=${encodeURIComponent(url)}&w=1920&q=75`;

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

export function BatchOutfits({ estilos, prelanzamiento }: { estilos: ExtraStyle[]; prelanzamiento: boolean }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [framing, setFraming] = useState<{ id: string; src: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; saved?: boolean } | null>(null);
  const queue = useRef(Promise.resolve());

  // the batch survives a reload (without the in-memory analysis photos)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "[]") as Item[];
      setItems(saved.map((i) => (i.estado === "listo" || i.estado === "error" ? i : { ...i, estado: "error", error: "Se cortó al recargar la página. Vuelve a subir esta foto." })));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(items.map(({ analisis: _drop, ...rest }) => rest)));
    } catch {}
  }, [items, loaded]);

  const patch = (id: string, p: Partial<Item>) => setItems((l) => l.map((i) => (i.id === id ? { ...i, ...p } : i)));
  const patchFila = (id: string, k: number, p: Partial<Fila>) =>
    setItems((l) => l.map((i) => (i.id === id ? { ...i, prendas: i.prendas.map((f, j) => (j === k ? { ...f, ...p } : f)) } : i)));

  async function analizar(id: string, foto64: string) {
    patch(id, { estado: "analizando", error: "" });
    const res = await fetch("/api/admin/emparejar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foto: foto64 }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res?.ok) {
      patch(id, { estado: "error", error: data.error ?? "No se pudo analizar la foto (sin conexión o tardó demasiado)." });
      return;
    }
    const o = data.outfit as Emparejado;
    patch(id, {
      estado: "listo",
      nombre: o.nombre,
      genero: o.genero,
      temporada: o.temporada,
      categoria: o.estilo,
      prendas: o.prendas.length ? o.prendas.map(filaDe) : [vacia()],
    });
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])];
    e.target.value = "";
    setMsg(null);
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const nombre = file.name.replace(/\.[^.]+$/, "");
      setItems((l) => [
        ...l,
        { id, archivo: file.name, estado: "subiendo", error: "", foto: "", nombre: "", genero: "hombre", temporada: "invierno", categoria: "streetwear", prendas: [] },
      ]);
      // one photo at a time: steady for Claude's rate limits and easy to follow
      queue.current = queue.current.then(async () => {
        try {
          const img = await loadImage(file);
          const analisis = forAnalysis(img);
          const foto = await upload(await forSite(img), nombre);
          URL.revokeObjectURL(img.src);
          patch(id, { foto, analisis });
          await analizar(id, analisis);
        } catch (err) {
          patch(id, { estado: "error", error: err instanceof Error ? err.message : "Algo falló con esta foto." });
        }
      });
    }
  }

  function reanalizar(item: Item) {
    if (!item.analisis) {
      patch(item.id, { estado: "error", error: "Para volver a analizarla, quítala y súbela otra vez (la foto original ya no está en memoria)." });
      return;
    }
    queue.current = queue.current.then(() => analizar(item.id, item.analisis!));
  }

  async function reencuadrar(file: File) {
    if (!framing) return;
    try {
      const url = await upload(file, items.find((i) => i.id === framing.id)?.nombre ?? "outfit");
      patch(framing.id, { foto: url });
      setFraming(null);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "No se pudo subir la foto." });
    }
  }

  const listos = items.filter((i) => i.estado === "listo");
  const sinLink = listos.filter((i) => i.prendas.some((f) => !/^https?:\/\//i.test(f.link.trim())));
  const conMarca = listos.filter((i) => marcasEn(i.nombre).length || i.prendas.some((f) => marcasEn(f.tipo).length));
  const trabajando = items.some((i) => i.estado === "subiendo" || i.estado === "analizando");

  function texto(): string {
    return listos
      .map((i) => [i.nombre, ...i.prendas.map((f) => `${f.tipo || "Prenda"} – ${f.link.trim() || "Link no encontrado"} – ${f.precio ? f.precio + " €" : "sin precio"}`)].join("\n"))
      .join("\n\n");
  }

  async function guardarTodos() {
    setMsg(null);
    if (conMarca.length) {
      setMsg({ ok: false, text: `Quita las marcas de los nombres (se ven en rojo) en: ${conMarca.map((i) => i.nombre || i.archivo).join(", ")}.` });
      return;
    }
    if (sinLink.length) {
      setMsg({ ok: false, text: `Antes de guardar, pon el link que falta (o quita esa prenda) en: ${sinLink.map((i) => i.nombre || i.archivo).join(", ")}.` });
      return;
    }
    setSaving(true);
    const guardados: string[] = [];
    for (const i of listos) {
      const res = await fetch("/api/admin/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seccion: "outfits",
          nombre: i.nombre,
          genero: i.genero,
          temporada: i.temporada,
          categoria: i.categoria,
          foto: i.foto,
          precioMarca: "",
          // before the launch the countdown hides everything and they appear
          // on 1 November; after it, they are saved unpublished
          visible: prelanzamiento,
          prendas: i.prendas.map((f) => ({ tipo: f.tipo, precio: f.precio, link: f.link.trim() })),
        }),
      }).catch(() => null);
      const data = res ? await res.json().catch(() => ({})) : {};
      if (!res?.ok) {
        setSaving(false);
        setItems((l) => l.filter((x) => !guardados.includes(x.id)));
        setMsg({ ok: false, text: `Se guardaron ${guardados.length}. «${i.nombre}» falló: ${data.error ?? "sin conexión"}` });
        return;
      }
      guardados.push(i.id);
    }
    // make sure "Ocultar todos" is on, so nothing shows before the launch
    if (prelanzamiento) {
      await fetch("/api/admin/ajustes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ocultos: true }) }).catch(() => null);
    }
    setSaving(false);
    setItems((l) => l.filter((x) => !guardados.includes(x.id)));
    setMsg({
      ok: true,
      saved: true,
      text: prelanzamiento
        ? `${guardados.length} outfits guardados. Están ocultos y saldrán solos el 1 de noviembre a las 00:00.`
        : `${guardados.length} outfits guardados como ocultos. Publícalos desde la lista de Outfits.`,
    });
  }

  return (
    <>
      <div className="ad-card">
        <label className="ad-field">
          <span>Fotos de outfits (puedes elegir varias)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={onPick} />
        </label>
        <span className="ad-hint">
          Cada foto se recorta en vertical 9:16 y Claude busca sus prendas en la lista de Masterspread (mismo modelo; el color da igual, el link
          enseña todos). Tarda alrededor de un minuto por foto.
        </span>
      </div>

      {framing && (
        <div className="ad-card">
          <h2>Reencuadrar</h2>
          <PhotoFramer src={framing.src} onDone={reencuadrar} onCancel={() => setFraming(null)} />
        </div>
      )}

      {items.map((item) => {
        const disponibles = subsections(item.genero, estilos);
        return (
          <div className="ad-card ad-lote" key={item.id}>
            <div className="ad-lote-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ad-preview" src={item.foto || "data:image/gif;base64,R0lGODlhAQABAAAAACw="} alt="" />
              {item.foto && (
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setFraming({ id: item.id, src: reframeSrc(item.foto) })}>
                  Reencuadrar
                </button>
              )}
            </div>
            <div className="ad-lote-main">
              {item.estado !== "listo" ? (
                <>
                  <p className="ad-lote-file">{item.archivo}</p>
                  {item.estado === "subiendo" && <p className="ad-hint">En cola / subiendo la foto…</p>}
                  {item.estado === "analizando" && <p className="ad-hint">Buscando las prendas en Masterspread… (≈1 min)</p>}
                  {item.estado === "error" && <p className="ad-msg ad-msg-err">{item.error}</p>}
                  <div className="ad-row">
                    {item.estado === "error" && item.analisis && (
                      <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => reanalizar(item)}>
                        Reintentar
                      </button>
                    )}
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setItems((l) => l.filter((x) => x.id !== item.id))}>
                      Quitar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="ad-grid">
                    <label className="ad-field">
                      <span>Nombre del outfit</span>
                      <input type="text" value={item.nombre} onChange={(e) => patch(item.id, { nombre: e.target.value })} />
                      <BrandWarning text={item.nombre} />
                    </label>
                    <label className="ad-field">
                      <span>Sección</span>
                      <select value={item.genero} onChange={(e) => patch(item.id, { genero: e.target.value as Genero })}>
                        {GENEROS.map((o) => (
                          <option key={o.v} value={o.v}>{o.l}</option>
                        ))}
                      </select>
                    </label>
                    <label className="ad-field">
                      <span>Estilo</span>
                      <select value={item.categoria} onChange={(e) => patch(item.id, { categoria: e.target.value })}>
                        {!disponibles.some((s) => s.slug === item.categoria) && <option value={item.categoria}>{item.categoria}</option>}
                        {disponibles.map((o) => (
                          <option key={o.slug} value={o.slug}>{o.nombre}</option>
                        ))}
                      </select>
                    </label>
                    <label className="ad-field">
                      <span>Época</span>
                      <select value={item.temporada} onChange={(e) => patch(item.id, { temporada: e.target.value as Item["temporada"] })}>
                        <option value="invierno">Invierno</option>
                        <option value="verano">Verano</option>
                      </select>
                    </label>
                  </div>

                  <ul className="ad-pieces">
                    {item.prendas.map((f, k) => {
                      const falta = !/^https?:\/\//i.test(f.link.trim());
                      return (
                        <li className={`ad-piece ad-lote-piece${falta ? " is-missing" : ""}`} key={k}>
                          <label className="ad-field">
                            <span>Prenda</span>
                            <input type="text" value={f.tipo} onChange={(e) => patchFila(item.id, k, { tipo: e.target.value })} />
                            <BrandWarning text={f.tipo} />
                          </label>
                          <label className="ad-field">
                            <span>Precio €</span>
                            <input type="text" inputMode="decimal" value={f.precio} onChange={(e) => patchFila(item.id, k, { precio: e.target.value })} />
                          </label>
                          <button
                            type="button"
                            className="ad-btn ad-btn-ghost ad-btn-sm ad-piece-x"
                            onClick={() => patch(item.id, { prendas: item.prendas.length > 1 ? item.prendas.filter((_, j) => j !== k) : [vacia()] })}
                          >
                            Quitar
                          </button>
                          <label className="ad-field ad-piece-link">
                            <span>Link de compra</span>
                            <input
                              type="url"
                              value={f.link}
                              placeholder="https://www.uidbuy.com/..."
                              onChange={(e) => patchFila(item.id, k, { link: e.target.value, producto: "", productoFoto: "", confianza: null })}
                            />
                          </label>
                          <div className="ad-lote-match">
                            {f.productoFoto && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={f.productoFoto} alt="" loading="lazy" />
                            )}
                            <div>
                              {falta ? (
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
                                    patchFila(item.id, k, {
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
                                      {a.nombre}{a.eur != null ? ` · ${precioTxt(a.eur)} €` : ""}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="ad-row">
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => patch(item.id, { prendas: [...item.prendas, vacia()] })}>
                      + Añadir prenda
                    </button>
                    {item.analisis && (
                      <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => reanalizar(item)}>
                        Volver a analizar
                      </button>
                    )}
                    <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setItems((l) => l.filter((x) => x.id !== item.id))}>
                      Quitar outfit
                    </button>
                    <span className="ad-hint">
                      Total: <b>{precioTxt(item.prendas.reduce((s, f) => s + eur(f.precio), 0))} €</b>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {items.length > 0 && (
        <div className="ad-card">
          <p className="ad-hint">
            {listos.length} de {items.length} listos{sinLink.length ? ` · ${sinLink.length} con algún «Link no encontrado»` : ""}
            {trabajando ? " · analizando…" : ""}
          </p>
          <div className="ad-row">
            <button type="button" className="ad-btn" disabled={saving || trabajando || !listos.length} onClick={guardarTodos}>
              {saving ? "Guardando…" : prelanzamiento ? `Guardar todos · ocultos hasta el 1 de noviembre` : "Guardar todos como ocultos"}
            </button>
            <button
              type="button"
              className="ad-btn ad-btn-ghost"
              disabled={!listos.length}
              onClick={() => navigator.clipboard?.writeText(texto()).then(() => setMsg({ ok: true, text: "Copiado como texto." }))}
            >
              Copiar como texto
            </button>
          </div>
          {msg && (
            <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>
              {msg.text} {msg.saved && guardadoLink}
            </p>
          )}
        </div>
      )}
      {!items.length && msg && <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{msg.text} {msg.saved && guardadoLink}</p>}
    </>
  );
}

const guardadoLink = <Link href="/admin/outfits">Ver la lista de Outfits →</Link>;
