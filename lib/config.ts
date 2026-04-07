export const APP_NAME = "RecurVoice";
export const BRAND_GREEN = "#1B4332";
export const CALIBRATION_DAYS = 14;
export const COOKIE_NAME = "recurvoice_session";

export function supabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseAnonKey());
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3001";
}
