import Image from "next/image";

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1>
            El look completo,
            <br />
            <em>ya pensado.</em>
          </h1>
          <p className="pitch">
            Parece de 300&nbsp;€. Lo tienes por <strong>menos de 50</strong>.
          </p>
          <p className="sub">
            Outfits del mercado chino ya montados: la talla, el precio y el link de cada prenda. Sin pensar, solo
            copiar.
          </p>
          <div className="cue">
            <span className="dot" /> Elige tu estilo y monta el fit
          </div>
          <p className="hero-season">📦 Pide ya para tenerlo antes de las fiestas</p>
        </div>
        <div className="hero-shot">
          <Image
            src="/img/black-roses.jpg"
            alt="Outfit total black montado: sudadera, shorts y Jordan 4"
            fill
            sizes="(min-width: 720px) 320px, 46vw"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </div>
    </section>
  );
}
