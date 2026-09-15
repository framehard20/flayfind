"use client";

import { useEffect, useRef } from "react";

export type View = "outfits" | "seg";

type Props = {
  view: View;
  onChange: (view: View) => void;
};

export function ViewNav({ view, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const beforeTop = useRef<number | null>(null);

  function handleClick(next: View) {
    if (next === view) return;
    if (ref.current) beforeTop.current = ref.current.getBoundingClientRect().top;
    onChange(next);
  }

  // Switching view changes the height of the section above this nav (Hero vs
  // SegIntro), which would otherwise shove these buttons out from under the
  // user's thumb. Compensate by scrolling back to where the nav was.
  useEffect(() => {
    if (beforeTop.current === null || !ref.current) return;
    const after = ref.current.getBoundingClientRect().top;
    window.scrollBy(0, after - beforeTop.current);
    beforeTop.current = null;
  });

  return (
    <div className="viewnav" ref={ref}>
      <button type="button" aria-pressed={view === "outfits"} onClick={() => handleClick("outfits")}>
        Outfits
      </button>
      <button type="button" aria-pressed={view === "seg"} onClick={() => handleClick("seg")}>
        De seguidores
      </button>
    </div>
  );
}
