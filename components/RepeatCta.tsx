import { LINKS } from "@/lib/site";

export function RepeatCta() {
  return (
    <div className="repeat-cta-wrap">
      <a className="repeat-cta" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="repeat_registro">
        <span className="repeat-cta-txt">
          <span className="t">¿Ya viste algo que te gusta?</span>
          <span className="s">Crea tu cuenta gratis y llévate un 25% en el envío</span>
        </span>
        <span className="repeat-cta-arrow" aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
