import { INVITE_CODE, LINKS } from "@/lib/site";

export function Reqs() {
  return (
    <section className="seg reqs">
      <h3 className="reqs-title">Cómo participar</h3>
      <ol className="reqs-list">
        <li>
          <span className="rn">1</span>
          <div className="rc">
            <b>Sigue las dos cuentas</b>
            <span>
              <a href={LINKS.instagramMain} target="_blank" rel="noopener">
                @mariosanczz
              </a>{" "}
              y{" "}
              <a href={LINKS.instagramFits} target="_blank" rel="noopener">
                @mariofits.czz
              </a>{" "}
              en Instagram.
            </span>
          </div>
        </li>
        <li>
          <span className="rn">2</span>
          <div className="rc">
            <b>Regístrate en Hipobuy con el enlace</b>
            <span>
              Hipobuy es la tienda donde se compra la ropa del mercado chino. Aunque ya tengas cuenta, para participar
              tienes que tener una registrada con este enlace (código <b>{INVITE_CODE}</b>). Además te llevas un{" "}
              <b>25% de descuento</b> en tus envíos.{" "}
              <a href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="req_registro">
                Registrarme con {INVITE_CODE} →
              </a>
            </span>
          </div>
        </li>
        <li>
          <span className="rn">3</span>
          <div className="rc">
            <b>Manda tu outfit</b>
            <span>
              Rellena el formulario de aquí abajo. Se publican solo los mejores, así que cúrratelo. ¿Quieres mandar
              fotos? Escríbenos por email.
            </span>
          </div>
        </li>
      </ol>
      <p className="reqs-note">
        Antes de publicar un outfit se comprueba que cumples lo de arriba: tu cuenta de Hipobuy registrada con el
        enlace y que sigues las dos cuentas.
      </p>

      <a className="discord-cta" href={LINKS.discord} target="_blank" rel="noopener" data-umami-event="discord">
        <span className="dc-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.369a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </span>
        <span className="dc-tx">
          <b>Únete al Discord</b>
          <span>Habla con la comunidad, enseña tus fits y pide opinión</span>
        </span>
        <span className="dc-ar" aria-hidden="true">
          →
        </span>
      </a>
    </section>
  );
}
