"use client";

import { useState } from "react";
import { zipSync } from "fflate";

/** One outfit photo and the folder it goes in ("Hombre/Streetwear"). */
export type FotoZip = { foto: string; nombre: string; carpeta: string };

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" };

/** Safe as a file or folder name on Windows and Mac. */
const limpio = (s: string) =>
  s.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").replace(/[. ]+$/, "").trim().slice(0, 80) || "outfit";

function extDe(tipo: string, url: string) {
  const porTipo = EXT[tipo.split(";")[0].trim().toLowerCase()];
  if (porTipo) return porTipo;
  const m = url.split("?")[0].match(/\.(jpe?g|png|webp|avif|gif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

/** The original file; if storage can't be reached from the page, the copy the
 *  site itself serves (re-encoded, but the same picture). */
async function traer(url: string): Promise<Response> {
  try {
    const res = await fetch(url);
    if (res.ok) return res;
  } catch {}
  if (url.startsWith("/")) throw new Error("no encontrada");
  const res = await fetch(`/_next/image?url=${encodeURIComponent(url)}&w=3840&q=75`);
  if (!res.ok) throw new Error(String(res.status));
  return res;
}

/** Downloads every outfit photo into one zip, one folder per section and style.
 *  It's built in the browser: the photos come straight from storage, so there's
 *  no size limit from the server. */
export function DownloadPhotos({ fotos }: { fotos: FotoZip[] }) {
  const [busy, setBusy] = useState(false);
  const [estado, setEstado] = useState("");

  async function descargar() {
    setBusy(true);
    setEstado(`Descargando fotos… 0/${fotos.length}`);
    const archivos: Record<string, Uint8Array> = {};
    const fallos: string[] = [];
    const cola = [...fotos];
    let hechas = 0;

    // four at a time
    async function trabajador() {
      for (let f = cola.shift(); f; f = cola.shift()) {
        try {
          const res = await traer(f.foto);
          const datos = new Uint8Array(await res.arrayBuffer());
          const base = `${f.carpeta.split("/").map(limpio).join("/")}/${limpio(f.nombre)}`;
          const ext = extDe(res.headers.get("content-type") ?? "", f.foto);
          let ruta = `${base}.${ext}`;
          for (let n = 2; archivos[ruta]; n++) ruta = `${base} (${n}).${ext}`;
          archivos[ruta] = datos;
        } catch {
          fallos.push(f.nombre);
        }
        setEstado(`Descargando fotos… ${++hechas}/${fotos.length}`);
      }
    }
    await Promise.all(Array.from({ length: 4 }, trabajador));

    const guardadas = Object.keys(archivos).length;
    if (guardadas) {
      // photos are already compressed: store them as they are
      const zip = zipSync(archivos, { level: 0 });
      const url = URL.createObjectURL(new Blob([zip as Uint8Array<ArrayBuffer>], { type: "application/zip" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `flayfind-fotos-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }
    setEstado(
      fallos.length
        ? `${guardadas} fotos en el zip. No se pudieron descargar: ${fallos.join(", ")}.`
        : `${guardadas} fotos en el zip.`,
    );
    setBusy(false);
  }

  if (!fotos.length) return null;
  return (
    <>
      <button type="button" className="ad-btn ad-btn-ghost" disabled={busy} onClick={descargar} title="Todas las fotos, en carpetas por sección y estilo">
        {busy ? estado : `Descargar fotos (.zip)`}
      </button>
      {!busy && estado && <span className="ad-hint">{estado}</span>}
    </>
  );
}
