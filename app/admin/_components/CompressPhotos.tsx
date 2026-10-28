"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const llamar = (procesar: boolean) =>
  fetch("/api/admin/comprimir-fotos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ procesar }),
  }).then(async (r) => {
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error ?? "Sin conexión.");
    return d as { quedan: number; hechas?: number; fallos?: string[] };
  });

/** Shows up while some outfit photos are still full-size (~3 MB): one button
 *  makes web-sized copies of all of them, a few at a time. */
export function CompressPhotos() {
  const router = useRouter();
  const [quedan, setQuedan] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const parar = useRef(false);

  useEffect(() => {
    llamar(false)
      .then((d) => setQuedan(d.quedan))
      .catch(() => setQuedan(0));
  }, []);

  async function empezar() {
    setBusy(true);
    setMsg(null);
    parar.current = false;
    setTotal(quedan ?? 0);
    const fallos: string[] = [];
    let hechas = 0;
    try {
      // a few per call; stop when nothing is left or a whole call failed
      for (;;) {
        const d = await llamar(true);
        hechas += d.hechas ?? 0;
        fallos.push(...(d.fallos ?? []));
        setQuedan(d.quedan);
        if (!d.quedan || !d.hechas || parar.current) break;
      }
    } catch (err) {
      fallos.push(err instanceof Error ? err.message : "Algo falló.");
    }
    setBusy(false);
    setMsg({
      ok: !fallos.length,
      text: `${hechas} fotos comprimidas.${fallos.length ? ` No se pudieron: ${fallos.slice(0, 5).join(" · ")}${fallos.length > 5 ? "…" : ""}` : ""}`,
    });
    router.refresh();
  }

  if (msg && !busy && !quedan) return <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{msg.text}</p>;
  if (!quedan) return null;

  return (
    <div className="ad-card ad-shoplinks">
      <p>
        <b>{quedan} fotos de outfits pesan unos 3 MB cada una.</b> Cada vez que se descargan gastan mucho del límite mensual de Supabase.
        Comprimirlas las deja en unos 300 KB, con la misma calidad en la web. Las originales no se borran.
      </p>
      {msg && <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{msg.text}</p>}
      <div className="ad-row">
        <button type="button" className="ad-btn" disabled={busy} onClick={empezar}>
          {busy ? `Comprimiendo… ${total - quedan}/${total}` : `Comprimir ${quedan} fotos`}
        </button>
        {busy && (
          <button type="button" className="ad-btn ad-btn-ghost" onClick={() => (parar.current = true)}>
            Parar
          </button>
        )}
      </div>
    </div>
  );
}
