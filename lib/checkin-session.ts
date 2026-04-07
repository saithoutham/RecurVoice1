"use client";

export const CHECKIN_KEYS = {
  illnessFlag: "recurvoice:checkin:illness_flag",
  vowelBlob: "recurvoice:checkin:vowel_blob",
  readingBlob: "recurvoice:checkin:reading_blob",
  coughBlob: "recurvoice:checkin:cough_blob",
  coughResult: "recurvoice:checkin:cough_result",
  result: "recurvoice:checkin:result",
  features: "recurvoice:checkin:features"
} as const;

export function setCheckinIllnessFlag(value: boolean) {
  window.sessionStorage.setItem(CHECKIN_KEYS.illnessFlag, String(value));
}

export function getCheckinIllnessFlag() {
  return window.sessionStorage.getItem(CHECKIN_KEYS.illnessFlag) === "true";
}

export function setCheckinJson<T>(key: string, value: T) {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function getCheckinJson<T>(key: string): T | null {
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storeCheckinBlob(key: string, blob: Blob) {
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
  window.sessionStorage.setItem(key, dataUrl);
}

export function readCheckinBlob(key: string): Blob | null {
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;
  const [meta, base64] = raw.split(",");
  const mime = meta.match(/data:(.*?);base64/)?.[1] ?? "audio/wav";
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export function clearCheckinSession() {
  Object.values(CHECKIN_KEYS).forEach((key) => window.sessionStorage.removeItem(key));
}
