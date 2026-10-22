import type { Metadata } from "next";
import Link from "next/link";
import { AGENTE, antesDelLanzamiento, CONTACT_EMAIL } from "@/lib/site";
import { hayTitular, LEGAL_ACTUALIZADO, TITULAR } from "@/lib/titular";

// Privacy notice for the two places the site asks for personal data: the
// "notify me" box shown while the outfits are hidden, and the followers' form.
// In Spanish: the site is run from Spain and this is the reference text.

export const metadata: Metadata = {
  title: "Política de privacidad · Flayfind",
  description: "Qué datos recoge Flayfind, para qué los usa, cuánto tiempo los guarda y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

const UPDATED = LEGAL_ACTUALIZADO;

// The handle stays out of the page until the launch (lib/site.ts); regenerating
// hourly is what brings it back on its own afterwards.
export const revalidate = 3600;

export default function PrivacidadPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        ← Volver a Flayfind
      </Link>
      <h1>Política de privacidad</h1>
      <p className="legal-updated">Última actualización: {UPDATED}</p>

      <h2>Quién trata tus datos</h2>
      <p>
        {antesDelLanzamiento() ? "Flayfind (flayfind.com)." : "Flayfind (flayfind.com), el proyecto de outfits de @mariosanczz."}{" "}
        {hayTitular() && (
          <>
            Responsable: <b>{TITULAR.nombre}</b>, NIF {TITULAR.nif}, {TITULAR.domicilio}.{" "}
          </>
        )}
        Para cualquier cosa sobre tus datos, escribe a {mail}. Los datos del titular están en el{" "}
        <Link href="/aviso-legal">Aviso legal</Link>.
      </p>

      <h2>Qué datos recogemos y para qué</h2>
      <ul>
        <li>
          <b>Aviso de nuevos outfits.</b> Si dejas tu email en «Nuevos outfits en camino», guardamos ese email y el idioma
          en el que ves la web, solo para escribirte cuando los outfits vuelvan a estar disponibles. No te mandaremos
          otra cosa.
        </li>
        <li>
          <b>Formulario de «De seguidores».</b> Si nos envías un outfit, guardamos tu nombre, tu Instagram, el email con el
          que te registraste en {AGENTE} y lo que nos cuentes del outfit, para valorarlo y, si sale elegido, publicarlo con
          tu @. Si marcas la casilla de novedades, también para escribirte con nuevos outfits.
        </li>
        <li>
          <b>Visitas.</b> Contamos las visitas con Umami: qué páginas se ven, el país aproximado y el tipo de dispositivo y
          navegador, siempre en conjunto, sin cookies y sin guardar tu IP ni nada que te identifique. Sirve para saber cuánta
          gente usa la web y qué funciona.
        </li>
        <li>
          <b>Si nos escribes.</b> Usamos tu email y tu mensaje solo para responderte.
        </li>
      </ul>
      <p>
        La base legal es tu <b>consentimiento</b> (art. 6.1.a del RGPD), que das al marcar la casilla y que puedes retirar
        cuando quieras escribiendo a {mail}, sin que eso afecte a lo hecho antes. El recuento de visitas se basa en nuestro
        interés legítimo en saber cómo se usa la web (art. 6.1.f), sin identificarte; puedes oponerte escribiendo al mismo
        email. No tomamos decisiones automatizadas sobre ti ni hacemos perfiles.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Los emails del aviso se borran en cuanto enviamos el aviso y, en cualquier caso, a los 12 meses como máximo. Lo
        enviado por el formulario de seguidores se guarda mientras dure el concurso y, como máximo, 12 meses. Los emails que
        nos mandes se borran cuando ya no hacen falta para responderte y, como máximo, a los 12 meses. Si pides que borremos tus
        datos, lo hacemos antes.
      </p>

      <h2>Con quién se comparten</h2>
      <p>
        No vendemos ni cedemos tus datos a nadie. Se guardan con los proveedores técnicos que hacen funcionar la web
        —Supabase (base de datos), Vercel (alojamiento), Umami (estadísticas de visitas) y Google (el correo de contacto)—,
        que solo los tratan por cuenta nuestra y con las garantías que exige el RGPD.
      </p>
      <p>
        Algunos de estos proveedores son de Estados Unidos y pueden guardar datos fuera de la Unión Europea. En ese caso la
        transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo aprobadas
        por la Comisión Europea.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceder a tus datos, corregirlos, borrarlos, oponerte a su uso, limitarlo o llevártelos, escribiendo a{" "}
        {mail}. Si crees que no los hemos tratado bien, puedes reclamar ante la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" target="_blank" rel="noopener">
          aepd.es
        </a>
        ).
      </p>
      <p>Si tienes menos de 14 años, no nos envíes tus datos.</p>

      <h2>Cookies y almacenamiento en tu navegador</h2>
      <p>
        No usamos cookies de publicidad ni de seguimiento. La web guarda en tu propio navegador el idioma y la moneda que
        eliges, el cambio de divisas del día y si ya has pasado por el registro, solo para que funcione como esperas. Para
        contar visitas usamos Umami, que no usa cookies ni guarda datos que te identifiquen.
      </p>

      <h2>Enlaces a otras tiendas</h2>
      <p>
        Flayfind no vende nada: enlaza a {AGENTE} y a sus vendedores, que tienen sus propias condiciones y su propia
        política de privacidad. Los enlaces a {AGENTE} llevan nuestro código de referido, que a ti te da el descuento
        al registrarte y a nosotros nos puede reportar un beneficio por recomendarlo.
      </p>
    </main>
  );
}
