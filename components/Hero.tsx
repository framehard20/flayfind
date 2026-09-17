import { Outfit3DViewer } from "./Outfit3DViewer";

export function Hero() {
  return (
    <section className="hero">
      <h1>
        <span className="hero-title">
          <span className="hero-title-l1">El look</span>
          <br />
          completo,
          <br />
          <em>ya pensado.</em>
          <Outfit3DViewer />
        </span>
      </h1>
      <p className="pitch">
        Parece de 300&nbsp;€. Lo tienes por <strong>menos de 50</strong>.
      </p>
      <p className="sub">
        Outfits del mercado chino ya montados: la talla, el precio y el link de cada prenda. Sin pensar, solo copiar.
      </p>
      <div className="cue">
        <span className="dot" /> Elige tu estilo y monta el fit
      </div>
      <p className="hero-season">📦 Pide ya para tenerlo antes de las fiestas</p>
    </section>
  );
}
