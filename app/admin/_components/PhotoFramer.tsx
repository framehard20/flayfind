"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Cards and the outfit window show every photo in a 9:16 frame, cropped to
// fill it. Rather than leaving that crop to the browser (which always takes
// the middle), this lets you drag and zoom the photo inside the same frame and
// saves exactly what you framed — so the outfit is centred where you want it.

const RATIO = 9 / 16;
/** What gets uploaded: plenty for a phone screen, small enough to load fast. */
const OUT_W = 1080;
const OUT_H = 1920;
const MAX_ZOOM = 4;

type Props = {
  /** The picked file, or an already uploaded photo being re-framed. */
  src: string;
  /** Called with the cropped 9:16 photo. */
  onDone: (file: File) => void;
  onCancel: () => void;
  busy?: boolean;
};

type Box = { w: number; h: number };

export function PhotoFramer({ src, onDone, onCancel, busy = false }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [frame, setFrame] = useState<Box>({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Box | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  // the frame is whatever width it gets, 9:16 tall
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientWidth / RATIO });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // crossOrigin lets an already uploaded photo be redrawn into the canvas;
  // without it the browser refuses to read the pixels back
  useEffect(() => {
    setError("");
    setNatural(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      setPos({ x: 0, y: 0 });
    };
    img.onerror = () => setError("No se ha podido abrir esta foto para encuadrarla. Vuelve a subirla desde tu ordenador.");
    img.src = src;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  /** Size at zoom 1: the photo just covers the frame, like the web does. */
  const cover = natural && frame.w ? Math.max(frame.w / natural.w, frame.h / natural.h) : 0;
  const shown = natural ? { w: natural.w * cover * zoom, h: natural.h * cover * zoom } : { w: 0, h: 0 };

  /** Keeps the photo covering the frame — no empty corners, ever. */
  const clamp = useCallback(
    (p: { x: number; y: number }, size: Box) => {
      const maxX = Math.max(0, (size.w - frame.w) / 2);
      const maxY = Math.max(0, (size.h - frame.h) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, p.x)),
        y: Math.min(maxY, Math.max(-maxY, p.y)),
      };
    },
    [frame.w, frame.h],
  );

  useEffect(() => {
    setPos((p) => clamp(p, shown));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, frame.w, natural]);

  function onPointerDown(e: React.PointerEvent) {
    if (!natural) return;
    drag.current = { id: e.pointerId, x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setPos(clamp({ x: e.clientX - d.x, y: e.clientY - d.y }, shown));
  }
  function onPointerUp(e: React.PointerEvent) {
    if (drag.current?.id === e.pointerId) drag.current = null;
  }

  function centre() {
    setPos({ x: 0, y: 0 });
  }

  function cut() {
    const img = imgRef.current;
    if (!img || !natural) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setError("Tu navegador no ha podido recortar la foto.");
    ctx.imageSmoothingQuality = "high";
    // a PNG's transparent parts would turn black in the JPEG otherwise
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUT_W, OUT_H);

    // same transform as on screen, scaled up to the output size
    const k = OUT_W / frame.w;
    const w = shown.w * k;
    const h = shown.h * k;
    ctx.drawImage(img, (OUT_W - w) / 2 + pos.x * k, (OUT_H - h) / 2 + pos.y * k, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob) return setError("Tu navegador no ha podido recortar la foto.");
        onDone(new File([blob], "outfit.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="ad-framer">
      <div
        className="ad-framer-frame"
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {natural && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              width: shown.w,
              height: shown.h,
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          />
        )}
        <span className="ad-framer-grid" aria-hidden="true" />
      </div>

      <div className="ad-framer-tools">
        <label className="ad-field">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            disabled={!natural}
          />
        </label>
        <span className="ad-hint">Arrastra la foto para moverla y usa el zoom para acercarla.</span>
        <div className="ad-item-actions">
          <button type="button" className="ad-btn ad-btn-sm" onClick={cut} disabled={!natural || busy}>
            {busy ? "Subiendo…" : "Usar este encuadre"}
          </button>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={centre} disabled={!natural || busy}>
            Centrar
          </button>
          <button type="button" className="ad-btn ad-btn-ghost ad-btn-sm" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
        </div>
        {error && <p className="ad-msg ad-msg-err">{error}</p>}
      </div>
    </div>
  );
}
