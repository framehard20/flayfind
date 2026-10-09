import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The picture shown when flayfind.com is shared (WhatsApp, Instagram, X…).
// Rendered once at build time from assets/og: Archivo as .ttf (ImageResponse
// can't read the site's .woff2) and three small outfit photos.

export const SHARE_SIZE = { width: 1200, height: 630 };
export const SHARE_ALT = "Flayfind · El look completo, ya pensado. Outfits del mercado chino por menos de 50 €.";

const asset = (name: string) => readFile(join(process.cwd(), "assets", name));
const dataUri = async (name: string, type: string) => `data:${type};base64,${(await asset(name)).toString("base64")}`;

export async function shareImage() {
  const [black, semi, logo, ...photos] = await Promise.all([
    asset("og/archivo-900.ttf"),
    asset("og/archivo-600.ttf"),
    dataUri("flayfind-logo.png", "image/png"),
    dataUri("og/beige-monograma.jpg", "image/jpeg"),
    dataUri("og/corteiz-azul.jpg", "image/jpeg"),
    dataUri("og/essentials-black.jpg", "image/jpeg"),
  ]);

  const card = (src: string, rotate: number, left: number, top: number) => (
    <img
      src={src}
      width={240}
      height={320}
      style={{
        position: "absolute",
        left,
        top,
        borderRadius: 22,
        border: "6px solid #ffffff",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 30px 60px rgba(0,0,0,.45)",
        objectFit: "cover",
      }}
    />
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0a", fontFamily: "Archivo" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 72px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={logo} width={64} height={64} style={{ borderRadius: 14 }} />
            <span style={{ fontSize: 40, fontWeight: 900, color: "#ffffff" }}>
              Flay<span style={{ color: "#2f66f0" }}>find</span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34, fontSize: 70, fontWeight: 900, lineHeight: 1, letterSpacing: -2 }}>
            <span style={{ color: "#ffffff" }}>EL LOOK</span>
            <span style={{ color: "#ffffff" }}>COMPLETO,</span>
            <span style={{ color: "#2f66f0" }}>YA PENSADO.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 27, fontWeight: 600, color: "#b9bcc5", lineHeight: 1.3 }}>
            Outfits del mercado chino ya montados, por menos de 50 €
          </div>
        </div>
        <div style={{ display: "flex", position: "relative", width: 560, height: 630 }}>
          {card(photos[0], -9, 40, 170)}
          {card(photos[2], 8, 290, 160)}
          {card(photos[1], -2, 160, 120)}
        </div>
      </div>
    ),
    {
      ...SHARE_SIZE,
      fonts: [
        { name: "Archivo", data: black, style: "normal", weight: 900 },
        { name: "Archivo", data: semi, style: "normal", weight: 600 },
      ],
    },
  );
}
