import type { Metadata } from "next";
import Link from "next/link";
import { AGENTE, CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { hayTitular, LEGAL_ACTUALIZADO, TITULAR } from "@/lib/titular";

// Legal notice required by Spanish law (LSSI art. 10) for a site with an
// economic activity (here, affiliate commissions). The owner's details come
// from lib/titular.ts and only show once filled in.

export const metadata: Metadata = {
  title: "Aviso legal · Flayfind",
  description: "Quién está detrás de Flayfind, a qué se dedica y cómo contactar.",
  alternates: { canonical: "/aviso-legal" },
};

export default function AvisoLegalPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        ← Volver a Flayfind
      </Link>
      <h1>Aviso legal</h1>
      <p className="legal-updated">Última actualización: {LEGAL_ACTUALIZADO}</p>

      <h2>Datos del titular</h2>
      <ul>
        {hayTitular() && (
          <>
            <li>
              <b>Titular:</b> {TITULAR.nombre}
            </li>
            <li>
              <b>NIF:</b> {TITULAR.nif}
            </li>
            <li>
              <b>Domicilio:</b> {TITULAR.domicilio}
            </li>
          </>
        )}
        <li>
          <b>Email de contacto:</b> {mail}
        </li>
        <li>
          <b>Web:</b> {SITE_URL.replace(/^https?:\/\//, "")}
        </li>
      </ul>

      <h2>A qué se dedica</h2>
      <p>
        Flayfind es una web informativa que reúne outfits ya montados con el enlace de compra de cada prenda. Flayfind no vende
        ni envía ningún producto: los enlaces llevan a {AGENTE} y a sus vendedores. La web se financia con las comisiones del
        programa de afiliados de {AGENTE}, como se explica en los <Link href="/terminos">Términos de uso</Link>.
      </p>

      <h2>Condiciones y privacidad</h2>
      <p>
        El uso de la web se rige por los <Link href="/terminos">Términos de uso</Link>. Cómo se tratan los datos personales y
        qué se guarda en tu navegador está en la <Link href="/privacidad">Política de privacidad</Link>.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, los textos y el código de Flayfind son de su titular. Las marcas, logotipos y fotos de producto de terceros
        pertenecen a sus dueños. Si crees que algún contenido infringe un derecho tuyo, escribe a {mail} y lo revisaremos.
      </p>

      <h2>Ley aplicable</h2>
      <p>Este aviso legal se rige por la ley española.</p>
    </main>
  );
}
