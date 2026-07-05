import { createHmac, randomBytes, pbkdf2Sync, timingSafeEqual } from "crypto";
import { jwtSecret } from "./env";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$120000$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  const [, iterationsRaw, salt, expected] = encoded.split("$");
  const actual = pbkdf2Sync(password, salt, Number(iterationsRaw), 32, "sha256");
  return timingSafeEqual(Buffer.from(expected, "hex"), actual);
}

function secret() {
  return jwtSecret();
}

export function signToken(payload: Record<string, string>) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 86400000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyToken(token?: string) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  if (expected !== signature) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Record<string, string | number>;
  if (typeof payload.exp === "number" && payload.exp < Date.now()) return null;
  return payload;
}
