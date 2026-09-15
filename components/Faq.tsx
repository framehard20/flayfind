const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Por qué tengo que registrarme para comprar?",
    a: (
      <>
        Para ver y comprar los productos primero hay que tener una cuenta en <b>Hipobuy</b>, la tienda para comprar
        del mercado chino. Es gratis y tarda 1 minuto. Con el enlace de esta web el código <b>YILTEC</b> ya va
        aplicado, no tienes que escribir nada.
      </>
    ),
  },
  {
    q: "¿Cómo sé que no me van a estafar?",
    a: (
      <>
        Es normal dudar la primera vez. <b>Hipobuy te envía fotos reales</b> de cada producto antes de mandártelo,
        tiene <b>asistencia 24/7</b>, y si hay cualquier problema <b>te devuelven el dinero</b>, tanto de los
        productos como del envío.
      </>
    ),
  },
  {
    q: "¿Por qué me sale un aviso al entrar en un producto?",
    a: (
      <>
        Porque en Hipobuy necesitas una cuenta (gratis) para ver los productos, y al entrar te muestran un aviso de
        seguridad. No es nada malo: es su <b>protección de compra</b>, que confirma que tu pedido y tu dinero están
        cubiertos. Es justo lo que hace que comprar ahí sea seguro.
      </>
    ),
  },
  {
    q: "¿El 25% es un descuento en la ropa?",
    a: (
      <>
        No. El 25% es en el <b>envío</b> a tu casa. Los productos ya tienen precios ultra bajos de por sí.
      </>
    ),
  },
  {
    q: "¿Qué es Hipobuy?",
    a: <>Es la plataforma para comprar del mercado chino y que te lo envíen a casa. Necesitas una cuenta gratis para usarla.</>,
  },
  {
    q: "¿Envían a mi país?",
    a: (
      <>
        Sí. A <b>España y a todo el mundo</b>.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section className="faq">
      <h2>Preguntas</h2>
      {ITEMS.map((item, i) => (
        <details key={i}>
          <summary>{item.q}</summary>
          <div className="ans">{item.a}</div>
        </details>
      ))}
    </section>
  );
}
