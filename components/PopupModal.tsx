"use client";

import { useEffect, useState } from "react";
import { LINKS } from "@/lib/site";

const STORAGE_KEY = "flayfind_pop";

export function PopupModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ya = false;
    try {
      ya = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (ya) return;
    const t = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function cerrar() {
    setShow(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  return (
    <div
      className={`backdrop${show ? " show" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Regístrate y consigue 25% en tus envíos"
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div className="modal">
        <button className="x" aria-label="Cerrar" onClick={cerrar}>
          &times;
        </button>
        <span className="kicker">
          <span className="dot" /> Gratis · 1 minuto
        </span>
        <div className="offer">
          <span className="offer-num">-25%</span>
          <span className="offer-txt">
            en tus
            <br />
            envíos
          </span>
        </div>
        <p>
          Hipobuy es la web para pedir ropa del mercado chino y que te llegue a casa. Ves <b>fotos reales</b> de tu
          pedido antes de recibirlo, tienes <b>ayuda siempre</b> que la necesites, y crear la cuenta es{" "}
          <b>gratis y sin compromiso</b>.
        </p>
        <a className="go" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="popup_registro_hipobuy" onClick={cerrar}>
          Crear mi cuenta gratis →
        </a>
        <p className="mini">
          ¿Solo mirando?{" "}
          <b>
            <a
              href="#"
              style={{ color: "inherit" }}
              onClick={(e) => {
                e.preventDefault();
                cerrar();
              }}
            >
              Ver los outfits →
            </a>
          </b>
        </p>
      </div>
    </div>
  );
}
