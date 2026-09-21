// Generates the three admin secrets for /admin. Run it on your own machine:
//
//   node scripts/admin-setup.mjs "your password here"
//
// It prints the values to paste into Vercel → Settings → Environment Variables,
// and the key to type into Google Authenticator / Authy. Nothing is sent
// anywhere: it all happens locally.

import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: node scripts/admin-setup.mjs "a password of at least 10 characters"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32).toString("hex");

// base32 secret (RFC 4648) for the authenticator app
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const raw = randomBytes(20);
let bits = 0;
let value = 0;
let secret = "";
for (const byte of raw) {
  value = (value << 8) | byte;
  bits += 8;
  while (bits >= 5) {
    secret += A[(value >>> (bits - 5)) & 31];
    bits -= 5;
  }
}
if (bits > 0) secret += A[(value << (5 - bits)) & 31];

const session = randomBytes(32).toString("hex");
const otpauth = `otpauth://totp/Flayfind:admin?secret=${secret}&issuer=Flayfind&algorithm=SHA1&digits=6&period=30`;

console.log(`
Paste these three into Vercel → your project → Settings → Environment Variables
(Production, Preview and Development), then redeploy:

ADMIN_PASSWORD_HASH=scrypt.${salt.toString("hex")}.${hash}
ADMIN_TOTP_SECRET=${secret}
ADMIN_SESSION_SECRET=${session}

Then add the code to your phone. In Google Authenticator or Authy choose
"enter a setup key" and type:

  Account:  Flayfind admin
  Key:      ${secret}
  Type:     time based

(or open this link on the phone: ${otpauth})

Keep this output private and don't commit it. Losing the key means you can't
log in: run this script again and replace the variables.
`);
