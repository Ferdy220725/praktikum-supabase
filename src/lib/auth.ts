import "server-only";

/**
 * Sesi admin disimpan sebagai cookie httpOnly berisi token bertanda
 * tangan HMAC-SHA256: `${expiryEpochMs}.${signatureBase64Url}`.
 * Tidak ada password yang disimpan di cookie. Diimplementasikan
 * dengan Web Crypto API (bukan modul `crypto` Node / `Buffer`) agar
 * tetap berjalan di Edge Runtime (dipakai oleh middleware.ts).
 */

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 jam
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET belum diset atau terlalu pendek. Isi dengan string acak panjang di environment variables."
    );
  }
  return secret;
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(message: string): Promise<string> {
  const secret = getSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toBase64Url(signature);
}

export async function createAdminSessionToken(): Promise<string> {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = String(expiry);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isValidAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expiry = Number(payload);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;

  const expectedSignature = await sign(payload);
  return expectedSignature === signature;
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "prak22";
  return candidate.trim() === expected;
}
