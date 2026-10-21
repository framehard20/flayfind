"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Genero } from "@/lib/outfits";
import type { Pieza } from "@/lib/crear";
import { subsections, type ExtraStyle } from "@/lib/styles";

// /admin/outfits/crear: build an outfit from Masterspread's list (search, or
// let Claude suggest one), have Gemini make the flat-lay photo on the blue
// carpet, then save it with its links. Everything stays in this browser until
// it's saved, so a reload doesn't lose a photo that was paid for.

type Fila = Pieza & { precio: string };
type Estado = {
  genero: Genero;
  categoria: string;
  temporada: "invierno" | "verano";
  idea: string;
  presupuesto: string;
  nombre: string;
  piezas: Fila[];
  notas: string;
  fotos: string[];
  elegida: string;
};

const STORE = "ff_crear_v1";
const INICIAL: Estado = {
  genero: "hombre", categoria: "streetwear", temporada: "invierno", idea: "", presupuesto: "",
  nombre: "", piezas: [], notas: "", fotos: [], elegida: "",
};
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

async function call<T>(body: object): Promise<T> {
  const res = await fetch("/api/admin/crear", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = res ? await res.json().catch(() => ({})) : {};
  if (!res?.ok) throw new Error(data.error ?? "Sin conexión o tardó demasiado; vuelve a intentarlo.");
  return data as T;
}

export function CreateOutfit({ estilos, prelanzamiento }: { estilos: ExtraStyle[]; prelanzamiento: boolean }) {
  const [s, setS] = useState<Estado>(INICIAL);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<Pieza[] | null>(null);
  const [busy, setBusy] = useState<"" | "buscar" | "sugerir" | "foto" | "guardar">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string; saved?: boolean } | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
      if (saved) setS({ ...INICIAL, ...saved });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch {}
  }, [s, loaded]);

  const set = (p: Partial<Estado>) => setS((x) => ({ ...x, ...p }));
  const setPieza = (i: number, p: Partial<Fila>) => setS((x) => ({ ...x, piezas: x.piezas.map((f, j) => (j === i ? { ...f, ...p } : f)) }));
  const disponibles = subsections(s.genero, estilos);

  async function run(kind: typeof busy, fn: () => Promise<void>) {
    setBusy(kind);
    setMsg(null);
    try {
      await fn();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Algo falló." });
    }
    setBusy("");
  }

  const buscar = () =>
    run("buscar", async () => {
      const r = await call<{ piezas: Pieza[] }>({ accion: "buscar", q });
      setResultados(r.piezas);
    });

  const sugerir = () =>
    run("sugerir", async () => {
      const r = await call<{ nombre: string; piezas: Pieza[] }>({
        accion: "sugerir", genero: s.genero, estilo: s.categoria, temporada: s.temporada, idea: s.idea, presupuesto: s.presupuesto,
      });
      if (!r.piezas.length) throw new Error("Claude no encontró prendas para esa idea; cambia la idea o búscalas tú.");
      set({ nombre: r.nombre, piezas: r.piezas.map(fila) });
    });

  const crearFoto = () =>
    run("foto", async () => {
      const r = await call<{ url: string }>({ accion: "foto", notas: s.notas, piezas: s.piezas.map(({ nombre, tipo, foto }) => ({ nombre, tipo, foto })) });
      setS((x) => ({ ...x, fotos: [r.url, ...x.fotos].slice(0, 8), elegida: r.url }));
    });

  const guardar = () =>
    run("guardar", async () => {
      if (!s.elegida) throw new Error("Primero crea la foto y elige una.");
      if (!s.nombre.trim()) throw new Error("Ponle un nombre al outfit.");
      const res = await fetch("/api/admin/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seccion: "outfits",
          nombre: s.nombre,
          genero: s.genero,
          temporada: s.temporada,
          categoria: s.categoria,
          foto: s.elegida,
          precioMarca: "",
          // before the launch the countdown hides everything and it appears on 1 November
          visible: prelanzamiento,
          prendas: s.piezas.map((p) => ({ tipo: p.tipo, precio: p.precio, link: p.link })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo guardar.");
      if (prelanzamiento) {
        await fetch("/api/admin/ajustes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ocultos: true }) }).catch(() => null);
      }
      setS({ ...INICIAL, genero: s.genero, categoria: s.categoria, temporada: s.temporada });
      setResultados(null);
      setMsg({
        ok: true,
        saved: true,
        text: prelanzamiento ? "Outfit guardado. Está oculto y saldrá solo el 1 de noviembre a las 00:00." : "Outfit guardado sin publicar. Publícalo desde la lista de Outfits.",
      });
    });

  const total = s.piezas.reduce((t, p) => t + eur(p.precio), 0);
  const elegido = (p: Pieza) => s.piezas.some((x) => x.link === p.link);

  return (
    <>
      <div className="ad-card">
        <h2>1 · Las prendas</h2>
        <div className="ad-grid">
          <label className="ad-field">
            <span>Sección</span>
            <select value={s.genero} onChange={(e) => set({ genero: e.target.value as Genero })}>
              {GENEROS.map((o) => (
                <option key={o.v} value={o.v}>{o.l}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Estilo</span>
            <select value={s.categoria} onChange={(e) => set({ categoria: e.target.value })}>
              {!disponibles.some((x) => x.slug === s.categoria) && <option value={s.categoria}>{s.categoria}</option>}
              {disponibles.map((o) => (
                <option key={o.slug} value={o.slug}>{o.nombre}</option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Época</span>
            <select value={s.temporada} onChange={(e) => set({ temporada: e.target.value as Estado["temporada"] })}>
              <option value="invierno">Invierno</option>
              <option value="verano">Verano</option>
            </select>
          </label>
          <label className="ad-field">
            <span>Presupuesto € (opcional)</span>
            <input type="text" inputMode="decimal" value={s.presupuesto} onChange={(e) => set({ presupuesto: e.target.value })} placeholder="80" />
          </label>
        </div>
        <label className="ad-field">
          <span>Idea (opcional)</span>
          <input type="text" value={s.idea} onChange={(e) => set({ idea: e.target.value })} placeholder="Total black con sudadera Essentials y zapatillas Dior" />
        </label>
        <div className="ad-row">
          <button type="button" className="ad-btn" disabled={!!busy} onClick={sugerir}>
            {busy === "sugerir" ? "Claude está eligiendo…" : "Que Claude elija el outfit"}
          </button>
          <span className="ad-hint">O busca tú las prendas abajo y añádelas una a una.</span>
        </div>

        <form
          className="ad-row ad-create-search"
          onSubmit={(e) => {
            e.preventDefault();
            buscar();
          }}
        >
          <label className="ad-field">
            <span>Buscar en la lista de Masterspread</span>
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="essentials hoodie, dior b22, cargo…" />
          </label>
          <button type="submit" className="ad-btn ad-btn-ghost" disabled={!!busy || !q.trim()}>
            {busy === "buscar" ? "Buscando…" : "Buscar"}
          </button>
        </form>
        {resultados && (
          resultados.length ? (
            <ul className="ad-create-results">
              {resultados.map((p) => (
                <li key={p.link}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.foto} alt="" loading="lazy" />
                  <span className="ad-create-name">{p.nombre}</span>
                  <span className="ad-hint">{precioTxt(p.eur) ? `${precioTxt(p.eur)} €` : "sin precio"}</span>
                  <button
                    type="button"
                    className="ad-btn ad-btn-ghost ad-btn-sm"
                    disabled={elegido(p) || s.piezas.length >= 6}
                    onClick={() => set({ piezas: [...s.piezas, fila(p)] })}
                  >
                    {elegido(p) ? "Añadida" : "Añadir"}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ad-hint">Nada con esas palabras. Prueba con menos o en inglés («hoodie», «sneakers»…).</p>
          )
        )}

        {s.piezas.length > 0 && (
          <ul className="ad-pieces ad-create-picked">
            {s.piezas.map((p, i) => (
              <li className="ad-piece ad-lote-piece" key={p.link}>
                <label className="ad-field">
                  <span>Prenda</span>
                  <input type="text" value={p.tipo} onChange={(e) => setPieza(i, { tipo: e.target.value })} />
                </label>
                <label className="ad-field">
                  <span>Precio €</span>
                  <input type="text" inputMode="decimal" value={p.precio} onChange={(e) => setPieza(i, { precio: e.target.value })} />
                </label>
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm ad-piece-x" onClick={() => set({ piezas: s.piezas.filter((_, j) => j !== i) })}>
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
        )}
        {s.piezas.length > 0 && (
          <p className="ad-hint">
            Total del look: <b>{precioTxt(total)} €</b>
          </p>
        )}
      </div>

      <div className="ad-card">
        <h2>2 · La foto</h2>
        <label className="ad-field">
          <span>Notas para la foto (opcional)</span>
          <input type="text" value={s.notas} onChange={(e) => set({ notas: e.target.value })} placeholder="La sudadera en negro, las zapatillas en blanco" />
          <span className="ad-hint">
            Google la crea sobre la alfombra azul, copiando el estilo de tus fotos. Cada foto cuesta unos 5 céntimos y tarda 1–2 minutos. La ropa sale
            muy parecida a la de las fotos de producto, pero no idéntica: revísala antes de guardar.
          </span>
        </label>
        <div className="ad-row">
          <button type="button" className="ad-btn" disabled={!!busy || !s.piezas.length} onClick={crearFoto}>
            {busy === "foto" ? "Creando la foto… (1–2 min)" : s.fotos.length ? "Crear otra versión" : "Crear la foto"}
          </button>
        </div>
        {s.fotos.length > 0 && (
          <ul className="ad-create-fotos">
            {s.fotos.map((url) => (
              <li key={url}>
                <button type="button" aria-pressed={s.elegida === url} onClick={() => set({ elegida: url })}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ver(url)} alt="Versión de la foto" />
                </button>
                <a className="ad-hint" href={url} target="_blank" rel="noopener">Ver grande ↗</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ad-card">
        <h2>3 · Guardar</h2>
        <label className="ad-field">
          <span>Nombre del outfit</span>
          <input type="text" value={s.nombre} onChange={(e) => set({ nombre: e.target.value })} placeholder="Total black hoodie" />
        </label>
        <div className="ad-row">
          <button type="button" className="ad-btn" disabled={!!busy || !s.elegida || !s.piezas.length} onClick={guardar}>
            {busy === "guardar" ? "Guardando…" : prelanzamiento ? "Guardar · oculto hasta el 1 de noviembre" : "Guardar sin publicar"}
          </button>
          <button
            type="button"
            className="ad-btn ad-btn-ghost"
            disabled={!!busy}
            onClick={() => {
              setS({ ...INICIAL, genero: s.genero, categoria: s.categoria, temporada: s.temporada });
              setResultados(null);
              setMsg(null);
            }}
          >
            Empezar otro
          </button>
        </div>
      </div>
      {msg && (
        <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>
          {msg.text} {msg.saved && <Link href="/admin/outfits">Ver la lista de Outfits →</Link>}
        </p>
      )}
    </>
  );
}
