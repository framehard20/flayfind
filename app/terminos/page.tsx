import type { Metadata } from "next";
import Link from "next/link";
import { AGENTE, CONTACT_EMAIL } from "@/lib/site";
import { LEGAL_ACTUALIZADO } from "@/lib/titular";

// Terms of use. Written for Spanish law: consumers keep their rights and their
// own courts, and liability isn't excluded for intent or gross negligence.

export const metadata: Metadata = {
  title: "Términos de uso · Flayfind",
  description: "Qué es Flayfind, qué puedes esperar de sus enlaces y cuáles son las reglas de uso.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
  return (
    <main className="legal">
      <Link href="/" className="legal-back">
        ← Volver a Flayfind
      </Link>
      <h1>Términos de uso</h1>
      <p className="legal-updated">Última actualización: {LEGAL_ACTUALIZADO}</p>

      <h2>1. Qué regulan</h2>
      <p>
        Estos términos se aplican a quien visita flayfind.com. Usar la web es gratis y no hace falta registrarse. Quién está
        detrás está en el <Link href="/aviso-legal">Aviso legal</Link>.
      </p>

      <h2>2. Qué es Flayfind</h2>
      <p>
        Flayfind reúne outfits ya montados, con el enlace de compra y el precio aproximado de cada prenda. Flayfind no fabrica,
        vende ni envía ningún producto. Cuando compras, lo haces con {AGENTE} o con sus vendedores, con sus condiciones, sus
        precios y su política de privacidad. Flayfind no es parte de esa compra.
      </p>

      <h2>3. La información de la web</h2>
      <ul>
        <li>
          Los precios, fotos y enlaces se toman de fuentes de terceros y se revisan a menudo, pero pueden tener errores o cambiar
          sin aviso. Los precios en otras monedas son aproximados, con el cambio del día.
        </li>
        <li>Antes de comprar, comprueba en la tienda el producto, el precio, la talla y los gastos de envío.</li>
        <li>
          Flayfind no garantiza la calidad, la disponibilidad ni el envío de los productos de terceros, ni responde de retrasos,
          pérdidas o retenciones en aduana, que dependen de la tienda, del agente de compras y del transportista.
        </li>
        <li>Las fotos de los outfits pueden estar creadas o retocadas para enseñar el conjunto; la prenda real es la del enlace.</li>
      </ul>

      <h2>4. Enlaces de afiliado</h2>
      <p>
        Los enlaces a {AGENTE} llevan nuestro código de referido. Si te registras o compras a través de ellos, {AGENTE} nos
        puede pagar una comisión. A ti no te cuesta más. El descuento por registrarte lo da {AGENTE} según sus propias
        condiciones, que pueden cambiar.
      </p>

      <h2>5. Tus compras</h2>
      <p>
        Eres responsable de lo que compras y de cumplir las leyes de tu país, incluidas las de aduanas, importación y propiedad
        industrial. Algunos productos pueden no estar permitidos donde vives.
      </p>

      <h2>6. Uso permitido</h2>
      <p>No está permitido:</p>
      <ul>
        <li>copiar el contenido de forma masiva o con programas automáticos;</li>
        <li>intentar dañar o saturar la web, o entrar en partes que no son públicas;</li>
        <li>usar la web para algo ilegal.</li>
      </ul>

      <h2>7. Propiedad intelectual e industrial</h2>
      <p>
        El diseño, los textos y el código de Flayfind son de su titular. Las marcas, logotipos, nombres de producto y fotos de
        terceros pertenecen a sus dueños; aparecen solo para identificar los productos, y eso no significa que colaboren con
        Flayfind ni lo patrocinen.
      </p>
      <p>
        Si eres titular de un derecho y crees que algo de la web lo infringe, escribe a {mail} diciendo qué contenido es y por
        qué. Lo revisaremos y, si procede, lo retiraremos lo antes posible.
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        Flayfind responde de la web conforme a la ley española. No responde del contenido de las webs de terceros a las que
        enlaza, salvo que sepa que es ilícito y no retire el enlace con diligencia. Nada de estos términos limita los derechos
        que la ley te da como consumidor ni la responsabilidad por dolo o culpa grave.
      </p>

      <h2>9. Cambios</h2>
      <p>
        Estos términos pueden actualizarse si cambia la web o la ley. La fecha de arriba indica la versión vigente, que se aplica
        desde que se publica y nunca hacia atrás.
      </p>

      <h2>10. Ley y tribunales</h2>
      <p>Estos términos se rigen por la ley española. Si eres consumidor, puedes acudir a los juzgados de tu domicilio.</p>

      <h2>11. Contacto</h2>
      <p>Para cualquier duda, escribe a {mail}.</p>
    </main>
  );
}
