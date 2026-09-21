"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Copies the outfits that live in the code into the database (one-off). */
export function ImportButton() {
  const router = useRouter();
  const [state, setState] = useState<{ busy: boolean; msg: string; ok: boolean }>({ busy: false, msg: "", ok: true });

  async function run() {
    setState({ busy: true, msg: "", ok: true });
    const res = await fetch("/api/admin/import", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setState({
        busy: false,
        ok: true,
        msg: data.importados ? `Importados ${data.importados} outfits.` : "Ya estaban todos importados.",
      });
      router.refresh();
    } else {
      setState({ busy: false, ok: false, msg: data.error ?? "No se pudo importar." });
    }
  }

  return (
    <>
      <button type="button" className="ad-btn ad-btn-ghost" onClick={run} disabled={state.busy}>
        {state.busy ? "Importando…" : "Importar los outfits del código"}
      </button>
      {state.msg && <p className={`ad-msg ${state.ok ? "ad-msg-ok" : "ad-msg-err"}`}>{state.msg}</p>}
    </>
  );
}
