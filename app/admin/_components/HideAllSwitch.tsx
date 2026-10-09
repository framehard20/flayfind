"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// The "Ocultar todos / Mostrar todos" card at the top of /admin/outfits. It
// doesn't change each outfit's own Ocultar/Mostrar: it hides the whole
// catalog, and turning it off brings back exactly what was visible before.

export function HideAllSwitch({ ocultos, leido }: { ocultos: boolean; leido: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !ocultos;
    if (!next && !confirm("¿Mostrar todos los outfits visibles en la web?")) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/ajustes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ocultos: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => ({}))).error ?? "No se pudo cambiar.");
  }

  return (
    <div className={`ad-card ad-switch${ocultos ? " ad-switch-off" : ""}`}>
      <div>
        <b>{ocultos ? "🚧 Outfits ocultos en la web" : "🟢 Outfits visibles en la web"}</b>
        <p className="ad-hint">
          {ocultos
            ? "La pestaña Outfits muestra «Nuevos outfits en camino», el formulario para avisar por email y el enlace a la lista de productos. Puedes seguir añadiendo y editando outfits: nadie los ve hasta que pulses «Mostrar todos»."
            : "La web enseña los outfits que no estén ocultos uno a uno. «Ocultar todos» los quita de golpe sin perder qué estaba oculto y qué no."}
        </p>
        {!leido && (
          <p className="ad-hint">
            Ahora mismo este estado viene del código, porque la base de datos aún no tiene la tabla «ajustes». Para
            cambiarlo desde aquí, ejecuta supabase/schema.sql en Supabase (ver ADMIN.md).
          </p>
        )}
      </div>
      <button type="button" className={`ad-btn ad-btn-sm${ocultos ? "" : " ad-btn-danger"}`} disabled={busy} onClick={toggle}>
        {busy ? "Guardando…" : ocultos ? "Mostrar todos" : "Ocultar todos"}
      </button>
      {error && <p className="ad-msg ad-msg-err">{error}</p>}
    </div>
  );
}
