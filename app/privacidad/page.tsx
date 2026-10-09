import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, INVITE_CODE } from "@/lib/site";

// Privacy notice for the two places the site asks for personal data: the
// "notify me" box shown while the outfits are hidden, and the followers' form.
// In Spanish: the site is run from Spain and this is the reference text.

export const metadata: Metadata = {
  title: "Política de privacidad · Flayfind",
  description: "Qué datos recoge Flayfind, para qué los usa, cuánto tiempo los guarda y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacidad" },
};

const UPDATED = "9 de octubre de 2026";

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
        Flayfind (flayfind.com), el proyecto de outfits de @mariosanczz. Para cualquier cosa sobre tus datos, escribe a{" "}
        {mail}.
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
          que te registraste en Hipobuy y lo que nos cuentes del outfit, para valorarlo y, si sale elegido, publicarlo con
          tu @. Si marcas la casilla de novedades, también para escribirte con nuevos outfits.
        </li>
      </ul>
      <p>
        La base legal es tu <b>consentimiento</b> (art. 6.1.a del RGPD), que das al marcar la casilla y que puedes retirar
        cuando quieras escribiendo a {mail}, sin que eso afecte a lo hecho antes.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>
        Los emails del aviso se borran en cuanto enviamos el aviso y, en cualquier caso, a los 12 meses como máximo. Lo
        enviado por el formulario de seguidores se guarda mientras dure el concurso y, como máximo, 12 meses. Si pides que
        borremos tus datos, lo hacemos antes.
      </p>

      <h2>Con quién se comparten</h2>
      <p>
        No vendemos ni cedemos tus datos a nadie. Se guardan con los proveedores técnicos que hacen funcionar la web
        —Supabase (base de datos) y Vercel (alojamiento)—, que solo los tratan por cuenta nuestra y con las garantías que
        exige el RGPD.
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
        Flayfind no vende nada: enlaza a Hipobuy y a sus vendedores, que tienen sus propias condiciones y su propia
        política de privacidad. Los enlaces a Hipobuy llevan el código de invitación {INVITE_CODE}, que a ti te da el
        descuento en el envío y a nosotros nos puede reportar un beneficio por recomendarlo.
      </p>
    </main>
  );
}
