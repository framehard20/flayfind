
// Outfit photos used to be stored as they came: about 3 MB each (Gemini's 2K
// pictures, phone photos). Every download counts against Supabase's monthly
// transfer, so they're stored as a JPEG of at most 1200 px wide instead, still
// sharp in the site's biggest view, at around a tenth of the size.

export const ANCHO_MAX = 1200;

/** A web-sized JPEG of any photo (turned upright from its EXIF data). */
export async function comprimir(bytes: ArrayBuffer | Uint8Array): Promise<{ bytes: Buffer; mime: "image/jpeg" }> {
  // loaded here, not at the top: if its native part were missing, only this
  // call would fail (and the caller can store the photo as it came)
  const sharp = (await import("sharp")).default;
  const out = await sharp(Buffer.from(bytes as ArrayBuffer))
    .rotate()
    .resize({ width: ANCHO_MAX, height: ANCHO_MAX * 2, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { bytes: out, mime: "image/jpeg" };
}

/** The web-sized photo, or the photo as it came if it can't be processed: an
 *  upload never fails just because compressing did. */
export async function comprimirSiSePuede(bytes: ArrayBuffer | Uint8Array, mime: string): Promise<{ bytes: Buffer; mime: string; ext: string }> {
  try {
    return { ...(await comprimir(bytes)), ext: "jpg" };
  } catch (error) {
    console.error("No se pudo comprimir la foto; se guarda tal cual:", error);
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/avif" ? "avif" : "jpg";
    return { bytes: Buffer.from(bytes as ArrayBuffer), mime, ext };
  }
}
