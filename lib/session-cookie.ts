import { COOKIE_NAME } from "@/lib/config";
import type { SessionCookiePayload } from "@/lib/types";

const encoder = new TextEncoder();

function secret() {
  return process.env.SECRET_KEY ?? "recurvoice-local-session-secret";
}

function toBase64Url(input: string | Uint8Array) {
  if (typeof Buffer !== "undefined") {
    const buffer = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  const value =
    typeof input === "string"
      ? input
      : String.fromCharCode(...Array.from(input));
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }

  return atob(padded);
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

export async function signSessionCookie(payload: SessionCookiePayload) {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await hmac(body);
  return `${body}.${signature}`;
}

export async function verifySessionCookie(token?: string | null) {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = await hmac(body);
  if (expected !== signature) return null;

  try {
    return JSON.parse(fromBase64Url(body)) as SessionCookiePayload;
  } catch {
    return null;
  }
}

export function sessionCookieName() {
  return COOKIE_NAME;
}
