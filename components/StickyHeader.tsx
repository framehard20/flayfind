import Image from "next/image";
import { LINKS } from "@/lib/site";
import logo from "@/assets/flayfind-logo.png";

export function StickyHeader() {
  return (
    <div className="sticktop">
      <a className="topbar" href={LINKS.hipobuy} target="_blank" rel="noopener" data-umami-event="topbar_registro">
        <span className="dot" />
        Regístrate gratis · <span className="code">25% en tus envíos</span>
        <span className="arrow"> →</span>
      </a>
      <header>
        <div className="head-inner">
          <Image className="logo-f" src={logo} alt="Flayfind" width={30} height={30} priority />
          <div className="wordmark">
            Flay<span>find</span>
          </div>
        </div>
      </header>
    </div>
  );
}
