"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Pendiente = { id: string; nombre: string; seccion: string; cambios: { tipo: string; tienda: string }[] };

/** Shows up only while some outfit still has links of a Weidian shop that
 *  moved (lib/cambios-tienda.ts), with one button to swap them all. */
export function ShopLinksBanner() {
  const router = useRouter();
  const [pend, setPend] = useState<Pendiente[] | null>(null);
  const [ver, setVer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/links-tienda", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then((r) => r.json())
      .then((d) => setPend(d.outfits ?? []))
      .catch(() => setPend([]));
  }, []);

  async function cambiar() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/links-tienda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aplicar: true }),
    }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setMsg({ ok: false, text: d.error ?? "Sin conexión. Prueba otra vez." });
    setMsg({
      ok: d.ok,
      text: d.ok
        ? `Hecho: ${d.prendas} links cambiados en ${d.outfits} outfits.`
        : `Se cambiaron ${d.outfits} outfits; fallaron: ${d.fallos.join(" · ")}`,
    });
    setPend(d.ok ? [] : null);
    router.refresh();
  }

  if (msg) return <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{msg.text}</p>;
  if (!pend?.length) return null;

  const prendas = pend.reduce((n, p) => n + p.cambios.length, 0);
  const tiendas = [...new Set(pend.flatMap((p) => p.cambios.map((c) => c.tienda)))].join(", ");
  return (
    <div className="ad-card ad-shoplinks">
      <p>
        <b>
          {prendas} prendas de {pend.length} outfits
        </b>{" "}
        tienen links de una tienda que se ha cambiado ({tiendas}). Son los mismos productos: solo cambia el link, el precio y el nombre se
        quedan igual.
      </p>
      <div className="ad-row">
        <button type="button" className="ad-btn" disabled={busy} onClick={cambiar}>
          {busy ? "Cambiando…" : `Cambiar los ${prendas} links`}
        </button>
        <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setVer((v) => !v)}>
          {ver ? "Ocultar" : "Ver cuáles"}
        </button>
      </div>
      {ver && (
        <ul className="ad-shoplinks-list">
          {pend.map((p) => (
            <li key={p.id}>
              <b>{p.nombre}</b>
              {p.seccion === "seguidores" ? " (De seguidores)" : ""}: {p.cambios.map((c) => c.tipo).join(", ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
