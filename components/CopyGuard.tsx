"use client";

import { useEffect } from "react";

// The site's text and photos aren't meant to be copied. globals.css already
// turns off selection (and the iOS long-press menu); this catches what CSS
// can't: keyboard / menu copy & cut, select-all, dragging images out and the
// right-click / long-press "save / copy image" menu on photos.
// Form fields keep working normally. The invite-code "Copiar" button writes
// with navigator.clipboard, which doesn't go through these events.

const editable = (t: EventTarget | null) =>
  t instanceof Element && !!t.closest("input, textarea, select, [contenteditable='true']");

export function CopyGuard() {
  useEffect(() => {
    const block = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const blockImageMenu = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("img, canvas")) e.preventDefault();
    };
    const blockDrag = (e: DragEvent) => {
      if (e.target instanceof Element && e.target.closest("img, a, canvas")) e.preventDefault();
    };

    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("selectstart", block);
    document.addEventListener("contextmenu", blockImageMenu);
    document.addEventListener("dragstart", blockDrag);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("selectstart", block);
      document.removeEventListener("contextmenu", blockImageMenu);
      document.removeEventListener("dragstart", blockDrag);
    };
  }, []);

  return null;
}
