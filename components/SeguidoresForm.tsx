"use client";

import { useState } from "react";
import { INVITE_CODE, LINKS } from "@/lib/site";

// Public form of the "De seguidores" section: the visitor says who they are,
// which outfit they'd like to see on the page, and confirms they registered on
// Hipobuy with the invite link. Submissions land in /admin/solicitudes.

export function SeguidoresForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/submissions", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus("ok");
      else {
        setStatus("idle");
        setError(data.error ?? "No se pudo enviar, inténtalo otra vez.");
      }
    } catch {
      setStatus("idle");
      setError("Sin conexión. Inténtalo otra vez.");
    }
  }

  if (status === "ok") {
    return (
      <p className="seg-ok">
        ¡Recibido! 🔥 Si tu outfit encaja, lo montamos y lo verás publicado aquí con tu @.
      </p>
    );
  }

  return (
    <section className="seg seg-form-wrap">
      <form className="seg-form" onSubmit={onSubmit}>
        <div className="fld">
          <label htmlFor="s-nombre">Tu nombre</label>
          <input id="s-nombre" name="nombre" type="text" required maxLength={80} placeholder="Tu nombre" />
        </div>
        <div className="fld">
          <label htmlFor="s-outfit">Nombre del outfit</label>
          <input id="s-outfit" name="outfit" type="text" required maxLength={80} placeholder="Total black invierno" />
        </div>
        <div className="fld">
          <label htmlFor="s-ig">Tu Instagram</label>
          <input id="s-ig" name="instagram" type="text" required maxLength={80} placeholder="@tucuenta" />
        </div>
        <div className="fld">
          <label htmlFor="s-email">Tu email</label>
          <input id="s-email" name="email" type="email" required maxLength={120} placeholder="tu@email.com" />
        </div>
        <div className="fld">
          <label htmlFor="s-idea">¿Qué lleva? Cuéntanoslo</label>
          <textarea
            id="s-idea"
            name="idea"
            required
            maxLength={1000}
            placeholder="Un total black de invierno con sudadera oversize, cargo y sneakers negras…"
          />
        </div>
        <div className="fld">
          <label htmlFor="s-hipobuy">Tu usuario o email de Hipobuy</label>
          <input id="s-hipobuy" name="hipobuy" type="text" maxLength={120} placeholder="para comprobar tu registro" />
        </div>

        <a className="seg-submit" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="seg_form_registro">
          Registrarme en Hipobuy con el código {INVITE_CODE} ↗
        </a>

        <label className="consent">
          <input type="checkbox" name="registrado" required />
          <span>
            Ya me he registrado en Hipobuy con este link (es obligatorio para participar y te da un −25% en envíos).
          </span>
        </label>
        <label className="consent">
          <input type="checkbox" name="novedades" />
          <span>Quiero recibir novedades y nuevos outfits en mi email.</span>
        </label>

        {/* honeypot: hidden from people, filled in by bots */}
        <input type="text" name="web" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />

        <button type="submit" className="seg-submit" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar mi outfit →"}
        </button>
        {error && <p className="seg-photo">{error}</p>}
        <p className="seg-photo">
          Se eligen solo los mejores. Si sale el tuyo, lo verás aquí abajo con tu <b>@</b>.
        </p>
      </form>
    </section>
  );
}
