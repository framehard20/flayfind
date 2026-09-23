"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OutfitRow, Seccion } from "@/lib/db";
import type { Genero } from "@/lib/outfits";
import { subsections, type ExtraStyle } from "@/lib/styles";
import { PhotoFramer } from "./PhotoFramer";

type Piece = { tipo: string; precio: string; link: string };

const empty: Piece = { tipo: "", precio: "", link: "" };

const GENEROS: { v: Genero; l: string }[] = [
  { v: "hombre", l: "Hombre" },
  { v: "mujer", l: "Mujer" },
  { v: "ambos", l: "Hombre y Mujer" },
];

const TEMPORADAS = [
  { v: "invierno", l: "Invierno" },
  { v: "verano", l: "Verano" },
];

export function OutfitForm({
  seccion,
  outfit,
  estilos,
}: {
  seccion: Seccion;
  outfit?: OutfitRow;
  /** The subsections created in /admin/estilos. */
  estilos: ExtraStyle[];
}) {
  const router = useRouter();
  const editing = !!outfit;
  const backTo = seccion === "seguidores" ? "/admin/seguidores" : "/admin/outfits";

  const [nombre, setNombre] = useState(outfit?.nombre ?? "");
  const [genero, setGenero] = useState<Genero>(
    ((outfit?.genero as string) === "tech" ? "ambos" : outfit?.genero) ?? "hombre",
  );
  const [temporada, setTemporada] = useState(outfit?.temporada ?? "invierno");
  const [categoria, setCategoria] = useState(outfit?.categoria ?? "streetwear");
  const [foto, setFoto] = useState(outfit?.foto ?? "");
  const [precioMarca, setPrecioMarca] = useState(outfit?.precio_marca ? String(outfit.precio_marca) : "");
  const [autor, setAutor] = useState(outfit?.autor ?? "");
  const [instagram, setInstagram] = useState(outfit?.instagram ?? "");
  const [posicion, setPosicion] = useState(outfit?.posicion != null ? String(outfit.posicion) : "");
  const [visible, setVisible] = useState(outfit?.visible ?? true);
  const [prendas, setPrendas] = useState<Piece[]>(
    outfit?.prendas?.length
      ? outfit.prendas.map((p) => ({ tipo: p.tipo, precio: String(p.precio), link: p.link }))
      : [{ ...empty }],
  );

  const [uploading, setUploading] = useState(false);
  /** The photo being framed: a file you just picked, or the current one. */
  const [framing, setFraming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const total = prendas.reduce((s, p) => s + (parseFloat(p.precio.replace(",", ".")) || 0), 0);

  // a subsection created for only one section shouldn't be offered in the other
  const disponibles = subsections(genero, estilos);
  const estiloPerdido = !disponibles.some((s) => s.slug === categoria);

  function setPiece(i: number, patch: Partial<Piece>) {
    setPrendas((list) => list.map((p, j) => (i === j ? { ...p, ...patch } : p)));
  }

  /** Picking a photo opens the framer; nothing is uploaded until you accept. */
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setFraming(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    body.append("nombre", nombre);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setFoto(data.url);
      closeFramer();
    } else {
      setError(data.error ?? "No se pudo subir la foto.");
    }
  }

  /** Re-framing reads the photo's pixels back out of a canvas, which the
   *  browser only allows for same-origin images. Next's own image route is on
   *  this origin and already knows the Supabase bucket, so it stands in. */
  const reframeSrc = (url: string) =>
    `/_next/image?url=${encodeURIComponent(url)}&w=1920&q=75`;

  function closeFramer() {
    setFraming((url) => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      return null;
    });
  }

  async function save() {
    setBusy(true);
    setError("");
    const payload = {
      id: outfit?.id,
      seccion,
      nombre,
      genero,
      temporada,
      categoria,
      foto,
      precioMarca,
      prendas,
      autor,
      instagram,
      posicion,
      visible,
      orden: outfit?.orden ?? 0,
    };
    const res = await fetch("/api/admin/outfits", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push(backTo);
      router.refresh();
    } else {
      setError(data.error ?? "No se pudo guardar.");
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="ad-card">
        <label className="ad-field">
          <span>Nombre del outfit</span>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Total black hoodie" required />
        </label>

        <div className="ad-grid">
          <label className="ad-field">
            <span>Sección</span>
            <select value={genero} onChange={(e) => setGenero(e.target.value as Genero)}>
              {GENEROS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Estilo</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {estiloPerdido && <option value={categoria}>{categoria} (no está en esta sección)</option>}
              {disponibles.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Época</span>
            <select value={temporada} onChange={(e) => setTemporada(e.target.value as typeof temporada)}>
              {TEMPORADAS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </label>
          <label className="ad-field">
            <span>Precio de marca (opcional)</span>
            <input
              type="text"
              inputMode="decimal"
              value={precioMarca}
              onChange={(e) => setPrecioMarca(e.target.value)}
              placeholder="300"
            />
            <span className="ad-hint">Se muestra tachado encima del total.</span>
          </label>
        </div>
      </div>

      <div className="ad-card">
        <h2>Foto del outfit</h2>
        {framing ? (
          <PhotoFramer src={framing} busy={uploading} onDone={upload} onCancel={closeFramer} />
        ) : (
          <div className="ad-drop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ad-preview" src={foto || "data:image/gif;base64,R0lGODlhAQABAAAAACw="} alt="" />
            <div>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPickPhoto} />
              <span className="ad-hint">
                JPG, PNG o WEBP. Al elegirla podrás moverla y centrarla; se guarda recortada en vertical 9:16.
              </span>
              {foto && (
                <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setFraming(reframeSrc(foto))}>
                  Reencuadrar esta foto
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {seccion === "seguidores" && (
        <div className="ad-card">
          <h2>Quién lo manda</h2>
          <div className="ad-grid">
            <label className="ad-field">
              <span>Autor</span>
              <input type="text" value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="@sucuenta" />
            </label>
            <label className="ad-field">
              <span>Instagram (sin @)</span>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="sucuenta" />
            </label>
            <label className="ad-field">
              <span>Puesto</span>
              <input type="text" inputMode="numeric" value={posicion} onChange={(e) => setPosicion(e.target.value)} placeholder="1" />
              <span className="ad-hint">Orden en la lista: 1 sale el primero.</span>
            </label>
          </div>
        </div>
      )}

      <div className="ad-card">
        <h2>Prendas</h2>
        <ul className="ad-pieces">
          {prendas.map((p, i) => (
            <li className="ad-piece" key={i}>
              <label className="ad-field">
                <span>Prenda</span>
                <input type="text" value={p.tipo} onChange={(e) => setPiece(i, { tipo: e.target.value })} placeholder="Sudadera con capucha" />
              </label>
              <label className="ad-field">
                <span>Precio €</span>
                <input type="text" inputMode="decimal" value={p.precio} onChange={(e) => setPiece(i, { precio: e.target.value })} placeholder="20" />
              </label>
              <button
                type="button"
                className="ad-btn ad-btn-ghost ad-btn-sm ad-piece-x"
                onClick={() => setPrendas((l) => (l.length > 1 ? l.filter((_, j) => j !== i) : l))}
                aria-label="Quitar prenda"
              >
                Quitar
              </button>
              <label className="ad-field ad-piece-link">
                <span>Link de compra</span>
                <input type="url" value={p.link} onChange={(e) => setPiece(i, { link: e.target.value })} placeholder="https://hipobuy.com/product/..." />
              </label>
            </li>
          ))}
        </ul>
        <div className="ad-row">
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={() => setPrendas((l) => [...l, { ...empty }])}>
            + Añadir prenda
          </button>
          <span className="ad-hint">
            Total del look: <b>{total.toFixed(2).replace(".", ",")} €</b> · el código {"YILTEC"} se añade solo a los links de Hipobuy.
          </span>
        </div>
      </div>

      <div className="ad-card">
        <label className="ad-check">
          <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          <span>Visible en la web (desmárcalo para dejarlo guardado sin publicar)</span>
        </label>
        <div className="ad-row">
          <button className="ad-btn" type="submit" disabled={busy || uploading}>
            {busy ? "Guardando…" : editing ? "Guardar cambios" : "Publicar outfit"}
          </button>
          <button type="button" className="ad-btn ad-btn-ghost" onClick={() => router.push(backTo)}>
            Cancelar
          </button>
        </div>
        {error && <p className="ad-msg ad-msg-err">{error}</p>}
      </div>
    </form>
  );
}
