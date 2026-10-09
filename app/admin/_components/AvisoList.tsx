"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AvisoRow } from "@/lib/db";

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function AvisoList({ rows }: { rows: AvisoRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function remove(body: { id?: string; todos?: boolean }) {
    setBusy(body.id ?? "todos");
    setMsg(null);
    const res = await fetch("/api/admin/avisos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy("");
    if (res.ok) router.refresh();
    else setMsg({ ok: false, text: (await res.json().catch(() => ({}))).error ?? "No se pudo borrar." });
  }

  async function copyAll() {
    const text = rows.map((r) => r.email).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ ok: true, text: `${rows.length} emails copiados. Pégalos en «CCO» para que nadie vea los de los demás.` });
    } catch {
      setMsg({ ok: false, text: "No se pudo copiar; usa «Descargar CSV»." });
    }
  }

  function downloadCsv() {
    const lines = ["email,idioma,fecha", ...rows.map((r) => `${r.email},${r.idioma},${r.created_at}`)];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `avisos-flayfind-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!rows.length) return <p className="ad-empty">Todavía nadie ha pedido aviso.</p>;

  const porIdioma = Object.entries(
    rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.idioma]: (acc[r.idioma] ?? 0) + 1 }), {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([l, n]) => `${l.toUpperCase()} ${n}`)
    .join(" · ");

  return (
    <>
      <div className="ad-row ad-avisos-tools">
        <span className="ad-count">
          {rows.length} {rows.length === 1 ? "persona" : "personas"} · {porIdioma}
        </span>
        <button type="button" className="ad-btn ad-btn-sm" onClick={copyAll}>
          Copiar emails
        </button>
        <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={downloadCsv}>
          Descargar CSV
        </button>
        <button
          type="button"
          className="ad-btn ad-btn-danger ad-btn-sm"
          disabled={busy === "todos"}
          onClick={() => {
            if (confirm(`¿Borrar los ${rows.length} emails? Hazlo cuando ya les hayas avisado. No se puede deshacer.`))
              remove({ todos: true });
          }}
        >
          Borrar todos
        </button>
      </div>
      {msg && <p className={`ad-msg ${msg.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{msg.text}</p>}
      <ul className="ad-list">
        {rows.map((r) => (
          <li className="ad-item" key={r.id}>
            <div className="ad-item-main">
              <b>{r.email}</b>
              <small>
                {r.idioma.toUpperCase()} · {fecha(r.created_at)}
              </small>
            </div>
            <div className="ad-item-actions">
              <button
                type="button"
                className="ad-btn ad-btn-danger ad-btn-sm"
                disabled={busy === r.id}
                onClick={() => {
                  if (confirm(`¿Borrar ${r.email} de la lista?`)) remove({ id: r.id });
                }}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
