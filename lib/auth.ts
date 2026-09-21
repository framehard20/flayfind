import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Admin login for /admin: a password plus a 6-digit code from an authenticator
// app (TOTP, RFC 6238). Both secrets live in environment variables, generated
// once with `node scripts/admin-setup.mjs` (see ADMIN.md):
//
//   ADMIN_PASSWORD_HASH   scrypt.<salt hex>.<hash hex>   (dots, not "$": a "$"
//                         would be read as a variable reference in .env files)
//   ADMIN_TOTP_SECRET     base32 secret shared with the authenticator app
//   ADMIN_SESSION_SECRET  random string used to sign the session cookie
//
// The session is a signed cookie (no database round-trip); signing it means a
// visitor can't forge one without the secret.

const COOKIE = "ff_admin";
const SESSION_HOURS = 8;

const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? "";
const TOTP_SECRET = (process.env.ADMIN_TOTP_SECRET ?? "").replace(/\s+/g, "").toUpperCase();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "";

export const adminConfigured = !!(PASSWORD_HASH && TOTP_SECRET && SESSION_SECRET);

const equal = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function checkPassword(password: string): boolean {
  const [scheme, salt, expected] = PASSWORD_HASH.split(".");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const got = scryptSync(password, Buffer.from(salt, "hex"), 32).toString("hex");
  return equal(got, expected);
}

/** base32 (RFC 4648, no padding) → bytes */
function base32Decode(s: string): Buffer {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of s.replace(/=+$/, "")) {
    const idx = A.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function totpAt(counter: number): string {
  const key = base32Decode(TOTP_SECRET);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(msg).digest();
  const offset = h[h.length - 1] & 0x0f;
  const code = ((h[offset] & 0x7f) << 24) | (h[offset + 1] << 16) | (h[offset + 2] << 8) | h[offset + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

/** Accepts the current 30s code and one step either side (clock drift). */
export function checkTotp(code: string): boolean {
  const clean = code.replace(/\D/g, "");
  if (clean.length !== 6 || !TOTP_SECRET) return false;
  const counter = Math.floor(Date.now() / 30000);
  for (const c of [counter, counter - 1, counter + 1]) {
    if (equal(totpAt(c), clean)) return true;
  }
  return false;
}

// ---- session cookie ----

const sign = (payload: string) => createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

export function createSessionValue(): { value: string; expires: Date } {
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const payload = `${expires.getTime()}.${randomBytes(8).toString("hex")}`;
  return { value: `${payload}.${sign(payload)}`, expires };
}

export function isValidSession(value: string | undefined): boolean {
  if (!value || !SESSION_SECRET) return false;
  const i = value.lastIndexOf(".");
  if (i < 0) return false;
  const payload = value.slice(0, i);
  const mac = value.slice(i + 1);
  if (!equal(sign(payload), mac)) return false;
  const expires = Number(payload.split(".")[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** True when the current request carries a valid admin session. */
export async function isLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return isValidSession(jar.get(COOKIE)?.value);
}

export async function startSession() {
  const { value, expires } = createSessionValue();
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

// ---- brute-force brake ----
// Serverless instances are short-lived, so this only slows down a burst on one
// instance; the real protection is the password + the rotating 2FA code.
const attempts = new Map<string, { n: number; until: number }>();

export function tooManyAttempts(ip: string): boolean {
  const a = attempts.get(ip);
  return !!a && a.n >= 8 && a.until > Date.now();
}

export function noteFailure(ip: string) {
  const a = attempts.get(ip) ?? { n: 0, until: 0 };
  a.n += 1;
  a.until = Date.now() + 10 * 60_000;
  attempts.set(ip, a);
}

export function clearAttempts(ip: string) {
  attempts.delete(ip);
}
