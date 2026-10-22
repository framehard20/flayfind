"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Genero } from "@/lib/outfits";
import type { Pieza, Sugerido } from "@/lib/crear";
import { marcasEn } from "@/lib/marcas";
import { ACCESSORIES, subsections, type ExtraStyle } from "@/lib/styles";
import { BrandWarning } from "./BrandWarning";

// /admin/outfits/crear: build one or several outfits from Masterspread's list
// (Claude puts the looks together, or you pick the pieces), have Gemini make
// each flat-lay photo on the blue carpet, then save them all with their links.
// Names stay generic: no brand may appear in an outfit's name or a garment's
// label. Everything stays in this browser until it's saved, so a reload
// doesn't lose photos that were paid for.

type Fila = Pieza & { precio: string };
type Borrador = {
  id: string;
  nombre: string;
  piezas: Fila[];
  notas: string;
  fotos: string[];
  elegida: string;
  estado: "listo" | "cola" | "foto";
  error: string;
};
type Ajustes = {
  genero: Genero;
  categoria: string;
  temporada: "invierno" | "verano";
  idea: string;
  presupuesto: string;
  cantidad: number;
};

const STORE = "ff_crear_v2";
const MAX = 8;
const AJUSTES: Ajustes = { genero: "hombre", categoria: "streetwear", temporada: "invierno", idea: "", presupuesto: "", cantidad: 3 };
const GENEROS: { v: Genero; l: string }[] = [
  { v: "hombre", l: "Hombre" },
  { v: "mujer", l: "Mujer" },
  { v: "ambos", l: "Hombre y Mujer" },
];
const precioTxt = (n: number | null) => (n == null ? "" : n.toFixed(2).replace(".", ","));
const eur = (s: string) => parseFloat(s.replace(",", ".")) || 0;
/** Photos from the bucket go through Next's image route (same origin, resized). */
const ver = (url: string, w = 640) => `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;
const fila = (p: Pieza): Fila => ({ ...p, precio: precioTxt(p.eur) });
const nuevoId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const borrador = (nombre = "", piezas: Fila[] = []): Borrador => ({ id: nuevoId(), nombre, piezas, notas: "", fotos: [], elegida: "", estado: "listo", error: "" });
const tieneMarca = (b: Borrador) => !!marcasEn(b.nombre).length || b.piezas.some((p) => marcasEn(p.tipo).length);

async function call<T>(body: object): Promise<T> {
  const res = await fetch("/api/admin/crear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  if (!res?.ok) throw new Error(data.error ?? "Sin conexión o tardó demasiado; vuelve a intentarlo.");
  return data as T;
}

/** Search box for one outfit: add pieces from Masterspread's list. */
function Buscador({ onAdd, ya, lleno }: { onAdd: (p: Pieza) => void; ya: (p: Pieza) => boolean; lleno: boolean }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<Pieza[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="ad-create-finder">
      <form
        className="ad-row ad-create-search"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          try {
            setRes((await call<{ piezas: Pieza[] }>({ accion: "buscar", q })).piezas);
          } catch (error) {
            setErr(error instanceof Error ? error.message : "No se pudo buscar.");
          }
          setBusy(false);
        }}
      >
        <label className="ad-field">
          <span>Buscar en la lista de Masterspread</span>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="hoodie, cargo, b22…" />
        </label>
        <button type="submit" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={busy || !q.trim()}>
          {busy ? "Buscando…" : "Buscar"}
        </button>
      </form>
      {err && <p className="ad-msg ad-msg-err">{err}</p>}
      {res &&
        (res.length ? (
          <ul className="ad-create-results">
            {res.map((p) => (
              <li key={p.link}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.foto} alt="" loading="lazy" />
                <span className="ad-create-name">{p.nombre}</span>
                <span className="ad-hint">{precioTxt(p.eur) ? `${precioTxt(p.eur)} €` : "sin precio"}</span>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={ya(p) || lleno} onClick={() => onAdd(p)}>
                  {ya(p) ? "Añadida" : "Añadir"}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ad-hint">Nada con esas palabras. Prueba con menos o en inglés («hoodie», «sneakers»…).</p>
        ))}
    </div>
  );
}

export function CreateOutfit({ estilos, prelanzamiento }: { estilos: ExtraStyle[]; prelanzamiento: boolean }) {
  const [a, setA] = useState<Ajustes>(AJUSTES);
  const [lista, setLista] = useState<Borrador[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [buscando, setBuscando] = useState<string | null>(null);
  const [busy, setBusy] = useState<"" | "sugerir" | "guardar">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string; saved?: boolean } | null>(null);
  const cola = useRef(Promise.resolve());
  const listaRef = useRef(lista);
  useEffect(() => {
    listaRef.current = lista;
  }, [lista]);

  // the work survives a reload; a photo that was being made is simply not there
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as { a: Ajustes; lista: Borrador[] } | null;
      if (saved) {
        setA({ ...AJUSTES, ...saved.a });
        setLista((saved.lista ?? []).map((b) => (b.estado === "listo" ? b : { ...b, estado: "listo", error: b.fotos.length ? "" : "La foto se cortó al recargar: pulsa «Crear la foto»." })));
      }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ a, lista }));
    } catch {}
  }, [a, lista, loaded]);

  const setAj = (p: Partial<Ajustes>) => setA((x) => ({ ...x, ...p }));
  const patch = (id: string, p: Partial<Borrador> | ((b: Borrador) => Partial<Borrador>)) =>
    setLista((l) => l.map((b) => (b.id === id ? { ...b, ...(typeof p === "function" ? p(b) : p) } : b)));
  const setPieza = (id: string, i: number, p: Partial<Fila>) => patch(id, (b) => ({ piezas: b.piezas.map((f, j) => (j === i ? { ...f, ...p } : f)) }));
  // accessories have no looks (that section links to Masterspread)
  const disponibles = subsections(a.genero, estilos).filter((x) => x.slug !== ACCESSORIES);

  /** Photos are made one at a time, in order. */
  function pedirFoto(b: Borrador) {
    patch(b.id, { estado: "cola", error: "" });
    cola.current = cola.current.then(async () => {
      // the pieces as they are now (they may have been edited while waiting)
      await new Promise((r) => setTimeout(r, 50));
      const actual = listaRef.current.find((x) => x.id === b.id) ?? b;
      if (!actual.piezas.length) return patch(b.id, { estado: "listo" });
      patch(b.id, { estado: "foto" });
      try {
        const r = await call<{ url: string }>({
          accion: "foto",
          notas: actual.notas,
          piezas: actual.piezas.map(({ nombre, tipo, foto }) => ({ nombre, tipo, foto })),
        });
        patch(b.id, (x) => ({ estado: "listo", fotos: [r.url, ...x.fotos].slice(0, 6), elegida: r.url }));
      } catch (err) {
        patch(b.id, { estado: "listo", error: err instanceof Error ? err.message : "No se pudo crear la foto." });
      }
    });
  }

  async function sugerir() {
    setBusy("sugerir");
    setMsg(null);
    try {
      const r = await call<{ outfits: Sugerido[] }>({
        accion: "sugerir", genero: a.genero, estilo: a.categoria, temporada: a.temporada, idea: a.idea, presupuesto: a.presupuesto, cantidad: a.cantidad,
      });
      if (!r.outfits.length) throw new Error("Claude no encontró prendas para esa idea; cámbiala o monta el outfit a mano.");
      const nuevos = r.outfits.map((o) => borrador(o.nombre, o.piezas.map(fila)));
      setLista((l) => [...l, ...nuevos]);
      nuevos.forEach(pedirFoto);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Algo falló." });
    }
    setBusy("");
  }

  const listos = lista.filter((b) => b.elegida && b.piezas.length && b.estado === "listo");
  const trabajando = lista.some((b) => b.estado !== "listo");

  async function guardarTodos() {
    setMsg(null);
    const sinNombre = listos.filter((b) => !b.nombre.trim());
    const conMarca = listos.filter(tieneMarca);
    if (sinNombre.length) return setMsg({ ok: false, text: "Pon un nombre a todos los outfits antes de guardar." });
    if (conMarca.length) return setMsg({ ok: false, text: `Quita las marcas de los nombres (se ven en rojo) en: ${conMarca.map((b) => b.nombre).join(", ")}.` });
    setBusy("guardar");
    const guardados: string[] = [];
    for (const b of listos) {
      const res = await fetch("/api/admin/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seccion: "outfits",
          nombre: b.nombre,
          genero: a.genero,
          temporada: a.temporada,
          categoria: a.categoria,
          foto: b.elegida,
          precioMarca: "",
          // before the launch the countdown hides everything and they appear on 1 November
          visible: prelanzamiento,
          prendas: b.piezas.map((p) => ({ tipo: p.tipo, precio: p.precio, link: p.link })),
        }),
      }).catch(() => null);
      const data = res ? await res.json().catch(() => ({})) : {};
      if (!res?.ok) {
        setLista((l) => l.filter((x) => !guardados.includes(x.id)));
        setBusy("");
        return setMsg({ ok: false, text: `Se guardaron ${guardados.length}. «${b.nombre}» falló: ${data.error ?? "sin conexión"}` });
      }
      guardados.push(b.id);
    }
    if (prelanzamiento) {
      await fetch("/api/admin/ajustes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ocultos: true }) }).catch(() => null);
    }
    setLista((l) => l.filter((x) => !guardados.includes(x.id)));
    setBusy("");
    setMsg({
      ok: true,
      saved: true,
      text: prelanzamiento
        ? `${guardados.length} outfits guardados. Están ocultos y saldrán solos el 1 de noviembre a las 00:00.`
        : `${guardados.length} outfits guardados sin publicar. Publícalos desde la lista de Outfits.`,
    });
  }

  return (
    <>
      <div className="ad-card">
        <h2>1 · Qué outfits quieres</h2>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Sección</span>
            <select value={a.genero} onChange={(e) => setAj({ genero: e.target.value as Genero })}>
              {GENEROS.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Estilo</span>
            <select value={a.categoria} onChange={(e) => setAj({ categoria: e.target.value })}>
              {!disponibles.some((x) => x.slug === a.categoria) && <option value={a.categoria}>{a.categoria}</option>}
              {disponibles.map((o) => (
                <option key={o.slug} value={o.slug}>{o.nombre}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Época</span>
            <select value={a.temporada} onChange={(e) => setAj({ temporada: e.target.value as Ajustes["temporada"] })}>
              <option value="invierno">Invierno</option>
              <option value="verano">Verano</option>
            </select>
          </label>
          <label className="ad-field">
            <span>Cuántos outfits</span>
            <select value={a.cantidad} onChange={(e) => setAj({ cantidad: Number(e.target.value) })}>
              {Array.from({ length: MAX }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Presupuesto por outfit € (opcional)</span>
            <input type="text" inputMode="decimal" value={a.presupuesto} onChange={(e) => setAj({ presupuesto: e.target.value })} placeholder="80" />
          </label>
        </div>
        <label className="ad-field">
          <span>Idea (opcional)</span>
          <input type="text" value={a.idea} onChange={(e) => setAj({ idea: e.target.value })} placeholder="Looks total black con sudadera y zapatillas gruesas" />
        </label>
        <div className="ad-row">
          <button type="button" className="ad-btn" disabled={!!busy} onClick={sugerir}>
            {busy === "sugerir" ? "Claude está montando los outfits…" : `Crear ${a.cantidad} ${a.cantidad === 1 ? "outfit" : "outfits"}`}
          </button>
          <button type="button" className="ad-btn ad-btn-ghost" disabled={!!busy || lista.length >= 20} onClick={() => setLista((l) => [...l, borrador()])}>
            + Outfit a mano
          </button>
        </div>
        <span className="ad-hint">
          Claude elige las prendas de la lista y Google crea cada foto sobre la alfombra azul, una tras otra (1–2 min por foto, unos 5 céntimos
          cada una). Los nombres salen sin marcas. La ropa de la foto sale muy parecida a la del producto, pero no idéntica: revísala antes de
          guardar.
        </span>
      </div>

      {lista.map((b, idx) => (
        <div className="ad-card ad-lote" key={b.id}>
          <div className="ad-lote-photo">
            {b.elegida ? (
              <a href={b.elegida} target="_blank" rel="noopener" title="Ver grande">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="ad-preview" src={ver(b.elegida)} alt={`Foto del outfit ${idx + 1}`} />
              </a>
            ) : (
              <div className="ad-preview ad-create-wait">
                {b.estado === "foto" ? "Creando la foto…" : b.estado === "cola" ? "En cola…" : "Sin foto"}
              </div>
            )}
            {b.fotos.length > 1 && (
              <div className="ad-create-versions">
                {b.fotos.map((url, k) => (
                  <button key={url} type="button" aria-pressed={b.elegida === url} aria-label={`Versión ${k + 1}`} onClick={() => patch(b.id, { elegida: url })}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ver(url, 96)} alt="" />
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={b.estado !== "listo" || !b.piezas.length} onClick={() => pedirFoto(b)}>
              {b.estado === "foto" ? "Creando…" : b.fotos.length ? "Otra versión" : "Crear la foto"}
            </button>
          </div>

          <div className="ad-lote-main">
            <label className="ad-field">
              <span>Nombre del outfit</span>
              <input type="text" value={b.nombre} onChange={(e) => patch(b.id, { nombre: e.target.value })} placeholder="Total black hoodie" />
              <BrandWarning text={b.nombre} />
            </label>
            {b.error && <p className="ad-msg ad-msg-err">{b.error}</p>}

            <ul className="ad-pieces">
              {b.piezas.map((p, i) => (
                <li className="ad-piece ad-lote-piece" key={p.link}>
                  <label className="ad-field">
                    <span>Prenda</span>
                    <input type="text" value={p.tipo} onChange={(e) => setPieza(b.id, i, { tipo: e.target.value })} />
                    <BrandWarning text={p.tipo} />
                  </label>
                  <label className="ad-field">
                    <span>Precio €</span>
                    <input type="text" inputMode="decimal" value={p.precio} onChange={(e) => setPieza(b.id, i, { precio: e.target.value })} />
                  </label>
                  <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm ad-piece-x" onClick={() => patch(b.id, { piezas: b.piezas.filter((_, j) => j !== i) })}>
                    Quitar
                  </button>
                  <div className="ad-lote-match">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.foto} alt="" loading="lazy" />
                    <div>
                      <span className="ad-hint">{p.nombre}</span>
                      <a className="ad-hint" href={p.link} target="_blank" rel="noopener">Ver en Uidbuy ↗</a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {buscando === b.id && (
              <Buscador
                ya={(p) => b.piezas.some((x) => x.link === p.link)}
                lleno={b.piezas.length >= 6}
                onAdd={(p) => patch(b.id, (x) => ({ piezas: [...x.piezas, fila(p)] }))}
              />
            )}

            <label className="ad-field">
              <span>Notas para la foto (opcional)</span>
              <input type="text" value={b.notas} onChange={(e) => patch(b.id, { notas: e.target.value })} placeholder="La sudadera en negro, las zapatillas en blanco" />
            </label>

            <div className="ad-row">
              <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setBuscando(buscando === b.id ? null : b.id)}>
                {buscando === b.id ? "Cerrar búsqueda" : "+ Añadir prenda"}
              </button>
              <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" disabled={b.estado !== "listo"} onClick={() => setLista((l) => l.filter((x) => x.id !== b.id))}>
                Quitar outfit
              </button>
              <span className="ad-hint">
                Total: <b>{precioTxt(b.piezas.reduce((t, p) => t + eur(p.precio), 0))} €</b>
              </span>
            </div>
          </div>
        </div>
      ))}

      {lista.length > 0 && (
        <div className="ad-card">
          <p className="ad-hint">
            {listos.length} de {lista.length} con foto{trabajando ? " · creando fotos…" : ""}
          </p>
          <div className="ad-row">
            <button type="button" className="ad-btn" disabled={!!busy || trabajando || !listos.length} onClick={guardarTodos}>
              {busy === "guardar"
                ? "Guardando…"
                : prelanzamiento
                  ? `Guardar ${listos.length} · ocultos hasta el 1 de noviembre`
                  : `Guardar ${listos.length} sin publicar`}
            </button>
          </div>
        </div>
      )}
      {msg && (
        <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>
          {msg.text} {msg.saved && <Link href="/admin/outfits">Ver la lista de Outfits →</Link>}
        </p>
      )}
    </>
  );
}
