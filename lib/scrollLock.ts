// Freezes the page behind an open dialog (outfit modal, buy gate, promo popup).
//
// `overflow:hidden` on <body> alone isn't enough: the page scrolls on <html>
// (see globals.css), and iOS Safari ignores it for touch scrolling anyway. So
// the body is pinned with position:fixed at the current scroll offset, and the
// scroll position is restored on unlock. Counted, so dialogs that stack (the
// buy gate over an outfit) only release the page when the last one closes.

let locks = 0;
let savedY = 0;
let savedStyles: [HTMLElement, string, string][] = [];

function set(el: HTMLElement, prop: string, value: string) {
  savedStyles.push([el, prop, el.style.getPropertyValue(prop)]);
  el.style.setProperty(prop, value);
}

export function lockScroll(): () => void {
  if (locks++ === 0) {
    const html = document.documentElement;
    const body = document.body;
    savedY = window.scrollY;
    // keep the layout from jumping sideways when a desktop scrollbar disappears
    const scrollbar = window.innerWidth - html.clientWidth;
    savedStyles = [];
    // sticky elements stop sticking once the body is pinned; globals.css
    // shifts them back into place with this offset
    set(html, "--scroll-lock-y", `${savedY}px`);
    html.setAttribute("data-scroll-locked", "");
    set(html, "overflow", "hidden");
    set(body, "overflow", "hidden");
    set(body, "position", "fixed");
    set(body, "top", `-${savedY}px`);
    set(body, "left", "0");
    set(body, "right", "0");
    set(body, "width", "100%");
    if (scrollbar > 0) set(body, "padding-right", `${scrollbar}px`);
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks > 0) return;
    for (const [el, prop, value] of savedStyles.reverse()) {
      if (value) el.style.setProperty(prop, value);
      else el.style.removeProperty(prop);
    }
    savedStyles = [];
    document.documentElement.removeAttribute("data-scroll-locked");
    window.scrollTo({ top: savedY, left: 0, behavior: "instant" });
  };
}
