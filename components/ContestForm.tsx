"use client";

import { useRef, useState } from "react";
import { CONTACT_EMAIL, CONTEST_FORM_ENDPOINT } from "@/lib/site";

type Status = "idle" | "sending" | "ok" | "error" | "unconfigured";

export function ContestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    if (!CONTEST_FORM_ENDPOINT) {
      setStatus("unconfigured");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(CONTEST_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <p className="seg-ok">¡Recibido! 🔥 Si tu outfit entra entre los mejores de la semana, lo verás publicado aquí abajo.</p>
    );
  }

  return (
    <section className="seg seg-form-wrap">
      <form className="seg-form" ref={formRef} onSubmit={onSubmit}>
        <div className="fld">
          <label htmlFor="s-nombre">Tu nombre</label>
          <input id="s-nombre" name="nombre" type="text" required placeholder="Tu nombre" />
        </div>
        <div className="fld">
          <label htmlFor="s-conjunto">Nombre del conjunto</label>
          <input id="s-conjunto" name="conjunto" type="text" required placeholder="Total black invierno" />
        </div>
        <div className="fld">
          <label htmlFor="s-prendas">¿Qué prendas lleva?</label>
          <textarea
            id="s-prendas"
            name="prendas"
            required
            placeholder="Sudadera negra oversize, jogger cargo, sneakers blancas..."
          />
        </div>
        <div className="fld">
          <label htmlFor="s-ig">Tu Instagram</label>
          <input id="s-ig" name="instagram" type="text" required placeholder="@tucuenta" />
        </div>
        <div className="fld">
          <label htmlFor="s-email">Tu email</label>
          <input id="s-email" name="email" type="email" required placeholder="tu@email.com" />
        </div>
        <label className="consent">
          <input type="checkbox" name="consentimiento" required />
          <span>Acepto recibir emails con novedades y nuevos outfits. Puedo darme de baja cuando quiera.</span>
        </label>
        <button type="submit" className="seg-submit" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar mi outfit →"}
        </button>
        {status === "unconfigured" && (
          <p className="seg-photo">
            El envío automático aún no está conectado — mándanoslo directamente a <b>{CONTACT_EMAIL}</b> mientras tanto.
          </p>
        )}
        {status === "error" && (
          <p className="seg-photo">
            No ha llegado, prueba otra vez o escríbenos a <b>{CONTACT_EMAIL}</b>.
          </p>
        )}
        {status !== "unconfigured" && status !== "error" && (
          <p className="seg-photo">
            ¿Quieres mandar fotos para que se vea mejor? Escríbenos a <b>{CONTACT_EMAIL}</b> con tu conjunto.
          </p>
        )}
      </form>
    </section>
  );
}
