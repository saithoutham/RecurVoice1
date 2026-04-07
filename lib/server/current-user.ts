import "server-only";

import { cache } from "react";

import type { BaselineRecord, ConvergenceAlertRecord, DashboardSummary, ProfileRecord, SessionRecord } from "@/lib/types";
import { acousticSignalState } from "@/lib/clinical";

// ── Demo mode — no Supabase, no auth required ──────────────────────────────

export const DEMO_PATIENT_ID = "00000000-0000-0000-0000-000000000001";

const DEMO_PROFILE: ProfileRecord = {
  id: DEMO_PATIENT_ID,
  full_name: "Sarah Chen",
  date_of_birth: "1967-09-14",          // 58 years old
  diagnosis_stage: "IIIA",               // Stage IIIA NSCLC
  treatment_type: "chemoradiotherapy",   // Completed 4 months ago
  treatment_start_date: "2025-09-01",
  oncologist_name: "Dr. Marcus Webb",
  oncologist_email: "m.webb@oncology.example.com",
  caregiver_name: "James Chen",
  caregiver_email: "jchen@example.com",
  caregiver_phone: null,
  onboarding_complete: true,
  created_at: "2026-03-17T08:00:00.000Z",
  updated_at: new Date().toISOString()
};

const DEMO_USER = {
  user: { id: DEMO_PATIENT_ID, email: "demo@recurvoice.local" },
  profile: DEMO_PROFILE,
  session: {
    userId: DEMO_PATIENT_ID,
    email: "demo@recurvoice.local",
    onboardingComplete: true,
    issuedAt: Date.now()
  }
};

// ── Python API helpers ──────────────────────────────────────────────────────

const API_URL = process.env.RECURVOICE_API_URL ?? "http://127.0.0.1:8010";
const API_KEY = process.env.RECURVOICE_API_KEY ?? "";

async function apiFetch<T>(path: string): Promise<T | null> {
  if (!API_KEY) return null; // No API key = Vercel demo mode, skip all network calls
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "X-API-Key": API_KEY },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type PyHistoryRecord = {
  timestamp: string;
  features: Record<string, number>;
  cusum_score: number | null;
  alert_level: string | null;
  outlier_rejected: boolean;
  illness_flag: boolean;
  created_at: string;
};

type PyBaselineStatus = {
  calibration_complete: boolean;
  days_recorded: number;
  calibration_progress: number;
  current_alert_level: string | null;
};

function mapAlertLevel(level: string | null): SessionRecord["alert_level"] {
  if (level === "STABLE" || level === "WATCH" || level === "EARLY_WARNING" || level === "URGENT") {
    return level;
  }
  return null;
}

function mapSession(row: PyHistoryRecord, index: number): SessionRecord {
  const f = row.features;
  return {
    id: `demo-session-${index}`,
    user_id: DEMO_PATIENT_ID,
    day_number: index + 1,
    recorded_at: row.timestamp,
    hnr_mean: f.hnr_mean ?? null,
    jitter_local: f.jitter_local ?? null,
    shimmer_local: f.shimmer_local ?? null,
    spectral_centroid: f.spectral_centroid_mean ?? null,
    zcr: f.zero_crossing_rate_mean ?? null,
    mfcc_1: f.mfcc_1 ?? null,
    mfcc_2: f.mfcc_2 ?? null,
    mfcc_3: f.mfcc_3 ?? null,
    mfcc_4: f.mfcc_4 ?? null,
    mfcc_5: f.mfcc_5 ?? null,
    mfcc_6: f.mfcc_6 ?? null,
    mfcc_7: f.mfcc_7 ?? null,
    mfcc_8: f.mfcc_8 ?? null,
    mfcc_9: f.mfcc_9 ?? null,
    mfcc_10: f.mfcc_10 ?? null,
    mfcc_11: f.mfcc_11 ?? null,
    mfcc_12: f.mfcc_12 ?? null,
    mfcc_13: f.mfcc_13 ?? null,
    voiced_frame_ratio: f.voiced_frame_ratio ?? null,
    snr_db: f.snr_db ?? null,
    illness_flag: row.illness_flag,
    cusum_score: row.cusum_score,
    alert_level: mapAlertLevel(row.alert_level),
    ai_interpretation: null,
    outlier_rejected: row.outlier_rejected,
    raw_features: f
  };
}

function mapBaseline(status: PyBaselineStatus): BaselineRecord {
  return {
    id: "demo-baseline",
    user_id: DEMO_PATIENT_ID,
    calibration_complete: status.calibration_complete,
    days_recorded: status.days_recorded,
    baseline_hnr_mean: null,
    baseline_hnr_std: null,
    baseline_jitter_mean: null,
    baseline_jitter_std: null,
    baseline_shimmer_mean: null,
    baseline_shimmer_std: null,
    cusum_k: 0.5,
    cusum_h: 5,
    current_cusum_score: 0,
    consecutive_alert_days: 0,
    cusum_sensitivity_multiplier: 1,
    cci_cusum_sensitivity_multiplier: 1,
    recurrence_cusum_sensitivity_multiplier: 1,
    pro_threshold_multiplier: 1,
    baseline_json: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function calcStreak(sessions: SessionRecord[]): number {
  if (!sessions.length) return 0;
  // Deduplicate by calendar date (one entry per day), newest first
  const uniqueDays = [
    ...new Set(
      sessions
        .map((s) => {
          const d = new Date(s.recorded_at);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    )
  ].sort().reverse();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Must have a session today or yesterday to have a streak
  if (uniqueDays[0] !== todayKey) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
    if (uniqueDays[0] !== yKey) return 0;
  }

  let streak = 0;
  let cursor = new Date(today);
  cursor.setHours(0, 0, 0, 0);

  for (const dayKey of uniqueDays) {
    const [y, m, d] = dayKey.split("-").map(Number);
    const day = new Date(y, m, d);
    const diffDays = Math.round((cursor.getTime() - day.getTime()) / 86_400_000);
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      cursor = day;
    } else {
      break;
    }
  }
  return streak;
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// ── Exports ────────────────────────────────────────────────────────────────

export const getCurrentSession = cache(async () => ({
  userId: DEMO_PATIENT_ID,
  email: "demo@recurvoice.local",
  onboardingComplete: true,
  issuedAt: Date.now()
}));

export const getCurrentUser = cache(async () => DEMO_USER);

// ── Static fallback for Vercel / offline demo ────────────────────────────────
// Used when the Python API is unreachable (e.g. Vercel deployment).
// Generates 21 days of realistic data relative to today so the demo always
// looks current. Day profiles match the seed script.

function buildFallbackSessions(): SessionRecord[] {
  type DaySpec = { hnr: number; jitter: number; shimmer: number; cusum: number | null; alert: SessionRecord["alert_level"] };
  const specs: DaySpec[] = [
    ...Array.from({ length: 13 }, () => ({ hnr: 12.8, jitter: 0.0095, shimmer: 0.052, cusum: null, alert: null as null })),
    { hnr: 13.1,  jitter: 0.0093, shimmer: 0.050, cusum: null,  alert: null  },  // day 14 (last cal)
    { hnr: 12.6,  jitter: 0.0098, shimmer: 0.053, cusum: 0.40,  alert: "STABLE" },
    { hnr: 12.4,  jitter: 0.0103, shimmer: 0.056, cusum: 2.39,  alert: "WATCH" },
    { hnr: 12.1,  jitter: 0.0110, shimmer: 0.060, cusum: 4.12,  alert: "WATCH" },
    { hnr: 12.3,  jitter: 0.0105, shimmer: 0.057, cusum: 4.02,  alert: "WATCH" },
    { hnr: 13.2,  jitter: 0.0085, shimmer: 0.045, cusum: 3.94,  alert: "EARLY_WARNING" },
    { hnr: 13.1,  jitter: 0.0088, shimmer: 0.048, cusum: 3.35,  alert: "EARLY_WARNING" },
    { hnr: 13.45, jitter: 0.0101, shimmer: 0.054, cusum: 2.30,  alert: "WATCH" },
  ];
  const today = new Date();
  return specs.map((s, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (20 - i));
    d.setHours(8, 0, 0, 0);
    return {
      id: `demo-fallback-${i + 1}`,
      user_id: DEMO_PATIENT_ID,
      day_number: i + 1,
      recorded_at: d.toISOString(),
      hnr_mean: s.hnr,
      jitter_local: s.jitter,
      shimmer_local: s.shimmer,
      spectral_centroid: 48.0,
      zcr: 62.0,
      mfcc_1: 55.0, mfcc_2: 10.5, mfcc_3: -12.0, mfcc_4: -8.5, mfcc_5: -4.0,
      mfcc_6: 5.5, mfcc_7: -3.0, mfcc_8: -6.0, mfcc_9: 1.5, mfcc_10: -2.8,
      mfcc_11: -1.5, mfcc_12: 2.0, mfcc_13: 3.0,
      voiced_frame_ratio: 0.81,
      snr_db: 22.5,
      illness_flag: false,
      cusum_score: s.cusum,
      alert_level: s.alert,
      ai_interpretation: null,
      outlier_rejected: false,
      raw_features: {}
    };
  });
}

const FALLBACK_BASELINE: BaselineRecord = {
  id: "demo-baseline-fallback",
  user_id: DEMO_PATIENT_ID,
  calibration_complete: true,
  days_recorded: 21,
  baseline_hnr_mean: 12.8,
  baseline_hnr_std: 0.35,
  baseline_jitter_mean: 0.0095,
  baseline_jitter_std: 0.0008,
  baseline_shimmer_mean: 0.052,
  baseline_shimmer_std: 0.003,
  cusum_k: 0.5,
  cusum_h: 5,
  current_cusum_score: 2.30,
  consecutive_alert_days: 6,
  cusum_sensitivity_multiplier: 1,
  cci_cusum_sensitivity_multiplier: 1,
  recurrence_cusum_sensitivity_multiplier: 1,
  pro_threshold_multiplier: 1,
  baseline_json: {},
  created_at: "2026-03-17T08:00:00.000Z",
  updated_at: new Date().toISOString()
};

export const getCurrentDashboardSummary = cache(async (): Promise<DashboardSummary> => {
  const [baselineStatus, historyRaw] = await Promise.all([
    apiFetch<PyBaselineStatus>(`/v1/patient/${DEMO_PATIENT_ID}/baseline-status`),
    apiFetch<PyHistoryRecord[]>(`/v1/patient/${DEMO_PATIENT_ID}/history?days=30`)
  ]);

  // ── Fallback to static demo data when Python API is unreachable ──────────
  const useFallback = !historyRaw || historyRaw.length === 0;

  const history = useFallback
    ? []
    : (historyRaw ?? []).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const sessions: SessionRecord[] = useFallback
    ? buildFallbackSessions()
    : history.map((row, i) => mapSession(row, i));
  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const baseline: BaselineRecord | null = useFallback
    ? FALLBACK_BASELINE
    : (baselineStatus ? mapBaseline(baselineStatus) : null);

  // Pull real cusum score from latest session
  if (baseline && latestSession?.cusum_score != null) {
    baseline.current_cusum_score = latestSession.cusum_score;
  }

  const checkedInToday = latestSession ? isToday(latestSession.recorded_at) : false;
  const streak = calcStreak(sessions);
  const daysMonitored = baselineStatus?.days_recorded ?? sessions.length;

  // Derive convergence level from acoustic signal alone (no PRO data in demo)
  const acousticState = acousticSignalState(
    latestSession?.cusum_score ?? null,
    latestSession?.alert_level ?? null
  );
  const convergenceLevel =
    acousticState === "crossed_threshold" ? 2
    : acousticState === "subclinical_drift" ? 1
    : 0;

  const convergenceAlerts: ConvergenceAlertRecord[] =
    convergenceLevel > 0 && latestSession
      ? [
          {
            id: "demo-convergence-1",
            user_id: DEMO_PATIENT_ID,
            triggered_at: latestSession.recorded_at,
            acoustic_cusum_score: latestSession.cusum_score,
            acoustic_alert_level: latestSession.alert_level,
            pro_composite_score: null,
            pro_delta: null,
            cci_category: null,
            convergence_level: convergenceLevel as 0 | 1 | 2 | 3,
            caregiver_message: "",
            caregiver_notified: false,
            acknowledged: false
          }
        ]
      : [];

  return {
    profile: DEMO_PROFILE,
    baseline,
    latestSession,
    recentSessions: sessions,
    alerts: [],
    unacknowledgedAlerts: [],
    daysMonitored,
    streak,
    checkedInToday,
    nextReminder: "09:00",
    comorbidityProfile: null,
    recurrenceRiskProfile: null,
    latestProAssessment: null,
    proAssessments: [],
    currentProFrequency: "weekly",
    weeklyCheckinDue: true,
    frequencyNotice: null,
    convergenceAlerts,
    latestConvergenceAlert: convergenceAlerts[0] ?? null,
    unacknowledgedConvergenceAlerts: convergenceAlerts
  };
});
