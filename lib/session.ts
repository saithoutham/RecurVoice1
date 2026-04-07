"use client";

export const SESSION_KEYS = {
  sessionId: "recurvoice:session_id",
  illnessFlag: "recurvoice:illness_flag",
  vowelBlob: "recurvoice:vowel_blob",
  readingBlob: "recurvoice:reading_blob",
  result: "recurvoice:result",
  features: "recurvoice:features"
} as const;

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEYS.sessionId);
}

export function setSessionId(sessionId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEYS.sessionId, sessionId);
}

export function setIllnessFlag(value: boolean) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEYS.illnessFlag, String(value));
}

export function getIllnessFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEYS.illnessFlag) === "true";
}

export function setJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  Object.values(SESSION_KEYS).forEach((key) => window.sessionStorage.removeItem(key));
}

export function ensureSessionId() {
  const existing = getSessionId();
  if (existing) return existing;
  const created = typeof crypto !== "undefined" ? crypto.randomUUID() : `rv-${Date.now()}`;
  setSessionId(created);
  return created;
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export async function storeBlob(key: string, blob: Blob) {
  if (typeof window === "undefined") return;
  const dataUrl = await blobToDataUrl(blob);
  window.sessionStorage.setItem(key, dataUrl);
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const match = meta.match(/data:(.*?);base64/);
  const mime = match?.[1] ?? "audio/wav";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}

export function readBlob(key: string): Blob | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  return dataUrlToBlob(raw);
}
