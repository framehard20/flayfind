import { OutfitScene3D } from "./OutfitScene3D";

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
        <OutfitScene3D />
      </div>
    </section>
  );
}
