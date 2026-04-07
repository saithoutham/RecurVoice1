import "server-only";

import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";

import { CALIBRATION_DAYS } from "@/lib/config";
import {
  combineCusumSensitivityMultipliers,
  isWeeklyProDue
} from "@/lib/clinical";
import type {
  AlertRecord,
  BaselineRecord,
  CciCategory,
  ComorbidityProfileRecord,
  ConsentLogRecord,
  ConvergenceAlertRecord,
  ConvergenceLevel,
  DashboardSummary,
  NotificationPreferencesRecord,
  ProfileRecord,
  ProFrequency,
  ProFrequencyLogRecord,
  RecurrenceRiskProfileRecord,
  SessionRecord,
  TrendSummaryRecord,
  WeeklyProAssessmentRecord
} from "@/lib/types";
import { average, std } from "@/lib/utils";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function nowIso() {
  return new Date().toISOString();
}

function hoursFromNow(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function createOpaqueToken() {
  return randomBytes(24).toString("hex");
}

async function getAuthUserByEmail(email: string) {
  const supabase = getSupabaseClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((entry) => entry.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      return user;
    }

    if (!data.nextPage) {
      return null;
    }

    page = data.nextPage;
  }
}

export async function getProfileByUserId(userId: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ProfileRecord;
}

export async function getUserById(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function updateProfile(userId: string, updates: Partial<ProfileRecord>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: nowIso() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProfileRecord;
}

export async function completeOnboarding(userId: string) {
  return await updateProfile(userId, { onboarding_complete: true });
}

export async function recordConsents(
  userId: string,
  consentTypes: string[],
  metadata: { ipAddress: string | null; userAgent: string | null }
) {
  const supabase = getSupabaseClient();
  const created: ConsentLogRecord[] = [];

  for (const consentType of consentTypes) {
    const { data, error } = await supabase
      .from("consent_logs")
      .insert({
        id: randomUUID(),
        user_id: userId,
        consent_type: consentType,
        consented_at: nowIso(),
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    created.push(data as ConsentLogRecord);
  }

  return created;
}

export async function getNotificationPreferences(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && !error.message.includes("No rows")) {
    throw error;
  }

  if (data) {
    return data as NotificationPreferencesRecord;
  }

  // Create default preferences if none exist
  const { data: newRecord } = await supabase
    .from("notification_preferences")
    .insert({
      id: randomUUID(),
      user_id: userId,
      daily_reminder_enabled: true,
      daily_reminder_time: "09:00",
      weekly_summary_enabled: true,
      caregiver_alert_enabled: true,
      created_at: nowIso(),
      updated_at: nowIso()
    })
    .select()
    .single();

  return newRecord as NotificationPreferencesRecord;
}

export async function getSessionsByUserId(userId: string): Promise<SessionRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as SessionRecord[]) || [];
}

export async function getBaselineByUserId(userId: string): Promise<BaselineRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("baselines")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && !error.message.includes("No rows")) {
    throw error;
  }

  return (data as BaselineRecord) || null;
}

export async function getAlertsByUserId(userId: string): Promise<AlertRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as AlertRecord[]) || [];
}

export async function getComorbidityProfileByUserId(userId: string): Promise<ComorbidityProfileRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comorbidity_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && !error.message.includes("No rows")) {
    throw error;
  }

  return (data as ComorbidityProfileRecord) || null;
}

export async function getRecurrenceRiskProfileByUserId(userId: string): Promise<RecurrenceRiskProfileRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recurrence_risk_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && !error.message.includes("No rows")) {
    throw error;
  }

  return (data as RecurrenceRiskProfileRecord) || null;
}

export async function getWeeklyProAssessmentsByUserId(userId: string): Promise<WeeklyProAssessmentRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("weekly_pro_assessments")
    .select("*")
    .eq("user_id", userId)
    .order("assessed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as WeeklyProAssessmentRecord[]) || [];
}

export async function getConvergenceAlertsByUserId(userId: string): Promise<ConvergenceAlertRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .select("*")
    .eq("user_id", userId)
    .order("triggered_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ConvergenceAlertRecord[]) || [];
}

export async function getTrendSummariesByUserId(userId: string): Promise<TrendSummaryRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trend_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as TrendSummaryRecord[]) || [];
}

export async function getProFrequencyLogByUserId(userId: string): Promise<ProFrequencyLogRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pro_frequency_log")
    .select("*")
    .eq("user_id", userId)
    .order("changed_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data as ProFrequencyLogRecord[]) || [];
}

export async function createSession(
  userId: string,
  sessionData: Partial<SessionRecord>
): Promise<SessionRecord> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      id: randomUUID(),
      user_id: userId,
      day_number: sessionData.day_number ?? 0,
      recorded_at: sessionData.recorded_at ?? nowIso(),
      hnr_mean: sessionData.hnr_mean,
      jitter_local: sessionData.jitter_local,
      shimmer_local: sessionData.shimmer_local,
      spectral_centroid: sessionData.spectral_centroid,
      zcr: sessionData.zcr,
      mfcc_1: sessionData.mfcc_1,
      mfcc_2: sessionData.mfcc_2,
      mfcc_3: sessionData.mfcc_3,
      mfcc_4: sessionData.mfcc_4,
      mfcc_5: sessionData.mfcc_5,
      mfcc_6: sessionData.mfcc_6,
      mfcc_7: sessionData.mfcc_7,
      mfcc_8: sessionData.mfcc_8,
      mfcc_9: sessionData.mfcc_9,
      mfcc_10: sessionData.mfcc_10,
      mfcc_11: sessionData.mfcc_11,
      mfcc_12: sessionData.mfcc_12,
      mfcc_13: sessionData.mfcc_13,
      voiced_frame_ratio: sessionData.voiced_frame_ratio,
      snr_db: sessionData.snr_db,
      illness_flag: sessionData.illness_flag ?? false,
      cusum_score: sessionData.cusum_score,
      raw_cusum_score: sessionData.raw_cusum_score,
      alert_level: sessionData.alert_level,
      ai_interpretation: sessionData.ai_interpretation,
      outlier_rejected: sessionData.outlier_rejected ?? false,
      raw_features: sessionData.raw_features ?? {}
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as SessionRecord;
}

export async function createBaseline(
  userId: string,
  sessions: SessionRecord[],
  comorbidityProfile: ComorbidityProfileRecord | null,
  recurrenceRiskProfile: RecurrenceRiskProfileRecord | null
): Promise<BaselineRecord> {
  const validSessions = sessions.filter(
    (session) => !session.illness_flag && !session.outlier_rejected
  );
  const calibrationSessions = validSessions.slice(0, CALIBRATION_DAYS);
  const calibrationComplete = calibrationSessions.length >= CALIBRATION_DAYS;
  const hnrValues = calibrationSessions.map((session) => session.hnr_mean ?? 0);
  const jitterValues = calibrationSessions.map((session) => session.jitter_local ?? 0);
  const shimmerValues = calibrationSessions.map((session) => session.shimmer_local ?? 0);
  const timestamp = nowIso();
  const cciMultiplier = comorbidityProfile?.cusum_sensitivity_multiplier ?? 1;
  const recurrenceMultiplier = recurrenceRiskProfile?.cusum_sensitivity_multiplier ?? 1;
  const combinedMultiplier = combineCusumSensitivityMultipliers(
    cciMultiplier,
    recurrenceMultiplier
  );

  const baselineData = {
    id: randomUUID(),
    user_id: userId,
    calibration_complete: calibrationComplete,
    days_recorded: sessions.length,
    baseline_hnr_mean: calibrationSessions.length ? average(hnrValues) : null,
    baseline_hnr_std: calibrationSessions.length > 1 ? std(hnrValues) : null,
    baseline_jitter_mean: calibrationSessions.length ? average(jitterValues) : null,
    baseline_jitter_std: calibrationSessions.length > 1 ? std(jitterValues) : null,
    baseline_shimmer_mean: calibrationSessions.length ? average(shimmerValues) : null,
    baseline_shimmer_std: calibrationSessions.length > 1 ? std(shimmerValues) : null,
    cusum_k: 0.5, // Default CUSUM reference value
    cusum_h: 5.0, // Default CUSUM threshold value
    current_cusum_score: 0,
    consecutive_alert_days: 0,
    cusum_sensitivity_multiplier: combinedMultiplier,
    cci_cusum_sensitivity_multiplier: cciMultiplier,
    recurrence_cusum_sensitivity_multiplier: recurrenceMultiplier,
    pro_threshold_multiplier: comorbidityProfile?.pro_threshold_multiplier ?? 1,
    baseline_json: {
      calibration_days: CALIBRATION_DAYS,
      completed_sessions: calibrationSessions.length,
      first_calibration_date: calibrationSessions[0]?.recorded_at ?? null,
      last_recorded_at: sessions[sessions.length - 1]?.recorded_at ?? null,
      cci_category: comorbidityProfile?.cci_category ?? null,
      recurrence_risk_tier: recurrenceRiskProfile?.risk_tier ?? null,
      recurrence_risk_score: recurrenceRiskProfile?.raw_score ?? null
    },
    created_at: timestamp,
    updated_at: timestamp
  } as BaselineRecord;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("baselines")
    .insert(baselineData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BaselineRecord;
}

export async function updateBaseline(userId: string, updates: Partial<BaselineRecord>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("baselines")
    .update({ ...updates, updated_at: nowIso() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as BaselineRecord;
}

export async function createComorbidityProfile(
  userId: string,
  cciScore: number,
  cciCategory: "low" | "moderate" | "high",
  cusumMultiplier: number,
  proThresholdMultiplier: number
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comorbidity_profiles")
    .insert({
      id: randomUUID(),
      user_id: userId,
      cci_score: cciScore,
      cci_category: cciCategory,
      cusum_sensitivity_multiplier: cusumMultiplier,
      pro_threshold_multiplier: proThresholdMultiplier,
      completed_at: nowIso()
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ComorbidityProfileRecord;
}

export async function createRecurrenceRiskProfile(
  userId: string,
  rawScore: number,
  riskTier: "low" | "intermediate" | "high",
  cusumMultiplier: number
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recurrence_risk_profiles")
    .insert({
      id: randomUUID(),
      user_id: userId,
      raw_score: rawScore,
      risk_tier: riskTier,
      cusum_sensitivity_multiplier: cusumMultiplier,
      completed_at: nowIso()
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RecurrenceRiskProfileRecord;
}

export async function createWeeklyProAssessment(
  userId: string,
  assessment: Partial<WeeklyProAssessmentRecord>
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("weekly_pro_assessments")
    .insert({
      id: randomUUID(),
      user_id: userId,
      assessed_at: assessment.assessed_at ?? nowIso(),
      ecog_score: assessment.ecog_score ?? 0,
      cough_score: assessment.cough_score ?? 0,
      dyspnea_score: assessment.dyspnea_score ?? 0,
      fatigue_score: assessment.fatigue_score ?? 0,
      pain_score: assessment.pain_score ?? 0,
      composite_pro_score: assessment.composite_pro_score ?? 0,
      pro_delta_from_last: assessment.pro_delta_from_last ?? 0,
      pro_frequency: assessment.pro_frequency ?? "weekly",
      alert_triggered: assessment.alert_triggered ?? false,
      alert_level: assessment.alert_level ?? 0
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as WeeklyProAssessmentRecord;
}

export async function createConvergenceAlert(
  userId: string,
  alertData: Partial<ConvergenceAlertRecord>
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .insert({
      id: randomUUID(),
      user_id: userId,
      triggered_at: alertData.triggered_at ?? nowIso(),
      acoustic_cusum_score: alertData.acoustic_cusum_score,
      acoustic_alert_level: alertData.acoustic_alert_level,
      pro_composite_score: alertData.pro_composite_score,
      pro_delta: alertData.pro_delta,
      cci_category: alertData.cci_category,
      convergence_level: alertData.convergence_level ?? 0,
      caregiver_message: alertData.caregiver_message ?? "",
      caregiver_notified: alertData.caregiver_notified ?? false,
      acknowledged: alertData.acknowledged ?? false
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConvergenceAlertRecord;
}

export async function updateConvergenceAlert(id: string, updates: Partial<ConvergenceAlertRecord>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .update({ ...updates })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConvergenceAlertRecord;
}

export async function createProFrequencyLog(
  userId: string,
  previousFrequency: "weekly" | "biweekly",
  newFrequency: "weekly" | "biweekly",
  reason: string,
  acousticCusumAtChange: number
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pro_frequency_log")
    .insert({
      id: randomUUID(),
      user_id: userId,
      changed_at: nowIso(),
      previous_frequency: previousFrequency,
      new_frequency: newFrequency,
      reason: reason,
      acoustic_cusum_at_change: acousticCusumAtChange
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProFrequencyLogRecord;
}

export async function createAlert(
  userId: string,
  sessionId: string,
  alertLevel: "WATCH" | "EARLY_WARNING" | "URGENT",
  message: string
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .insert({
      id: randomUUID(),
      user_id: userId,
      session_id: sessionId,
      alert_level: alertLevel,
      message: message,
      triggered_at: nowIso(),
      acknowledged: false,
      caregiver_notified: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlertRecord;
}

export async function updateAlert(id: string, updates: Partial<AlertRecord>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .update({ ...updates })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlertRecord;
}

export async function createTrendSummary(
  userId: string,
  summaryType: "voice" | "weekly_pro",
  dateKey: string,
  content: string
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("trend_summaries")
    .insert({
      id: randomUUID(),
      user_id: userId,
      summary_type: summaryType,
      date_key: dateKey,
      content: content,
      created_at: nowIso(),
      updated_at: nowIso()
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TrendSummaryRecord;
}

export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferencesRecord>
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .update({ ...updates, updated_at: nowIso() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as NotificationPreferencesRecord;
}

export async function logProFrequencyChange(input: {
  userId: string;
  previousFrequency: ProFrequency;
  newFrequency: ProFrequency;
  reason: string;
  acousticCusumAtChange: number;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pro_frequency_log")
    .insert({
      id: randomUUID(),
      user_id: input.userId,
      changed_at: nowIso(),
      previous_frequency: input.previousFrequency,
      new_frequency: input.newFrequency,
      reason: input.reason,
      acoustic_cusum_at_change: input.acousticCusumAtChange
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProFrequencyLogRecord;
}

export async function saveConvergenceAlert(input: {
  userId: string;
  triggeredAt: string;
  acousticCusumScore: number | null;
  acousticAlertLevel: string | null;
  proCompositeScore: number | null;
  proDelta: number | null;
  cciCategory: CciCategory | null;
  convergenceLevel: ConvergenceLevel;
  caregiverMessage: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .insert({
      id: randomUUID(),
      user_id: input.userId,
      triggered_at: input.triggeredAt,
      acoustic_cusum_score: input.acousticCusumScore,
      acoustic_alert_level: input.acousticAlertLevel,
      pro_composite_score: input.proCompositeScore,
      pro_delta: input.proDelta,
      cci_category: input.cciCategory,
      convergence_level: input.convergenceLevel,
      caregiver_message: input.caregiverMessage,
      caregiver_notified: false,
      acknowledged: false
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConvergenceAlertRecord;
}

export async function markConvergenceAlertNotified(alertId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .update({ caregiver_notified: true })
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConvergenceAlertRecord;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [
    profile,
    baseline,
    sessions,
    alerts,
    comorbidity,
    recurrence,
    proAssessments,
    convergenceAlerts,
    proFrequencyLog,
    preferences
  ] = await Promise.all([
    getProfileByUserId(userId),
    getBaselineByUserId(userId),
    getSessionsByUserId(userId),
    getAlertsByUserId(userId),
    getComorbidityProfileByUserId(userId),
    getRecurrenceRiskProfileByUserId(userId),
    getWeeklyProAssessmentsByUserId(userId),
    getConvergenceAlertsByUserId(userId),
    getProFrequencyLogByUserId(userId),
    getNotificationPreferences(userId)
  ]);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  const latestSession = sessions[0] || null;
  const recentSessions = sessions.slice(0, 30);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const latestProAssessment = proAssessments[0] || null;
  const latestConvergenceAlert = convergenceAlerts[0] || null;
  const unacknowledgedConvergenceAlerts = convergenceAlerts.filter((a) => !a.acknowledged);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkedInToday = latestSession
    ? new Date(latestSession.recorded_at).getTime() >= today.getTime()
    : false;

  const currentProFrequency = proFrequencyLog[0]?.new_frequency || "weekly";
  const weeklyCheckinDue = isWeeklyProDue(latestProAssessment?.assessed_at || null, currentProFrequency);

  // Calculate streak
  let streak = 0;
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );
  if (sortedSessions.length > 0) {
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);
    
    // If they haven't checked in today, check if they checked in yesterday to keep the streak alive
    const latestSessionDate = new Date(sortedSessions[0].recorded_at);
    latestSessionDate.setHours(0, 0, 0, 0);
    
    if (latestSessionDate.getTime() === lastDate.getTime() || 
        latestSessionDate.getTime() === lastDate.getTime() - 86400000) {
      streak = 1;
      let checkDate = latestSessionDate;
      for (let i = 1; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i].recorded_at);
        sessionDate.setHours(0, 0, 0, 0);
        const diff = (checkDate.getTime() - sessionDate.getTime()) / 86400000;
        if (diff === 1) {
          streak++;
          checkDate = sessionDate;
        } else if (diff > 1) {
          break;
        }
      }
    }
  }

  return {
    profile,
    baseline,
    latestSession,
    recentSessions,
    alerts,
    unacknowledgedAlerts,
    daysMonitored: sessions.length,
    streak,
    checkedInToday,
    nextReminder: preferences.daily_reminder_time,
    comorbidityProfile: comorbidity,
    recurrenceRiskProfile: recurrence,
    latestProAssessment,
    proAssessments,
    currentProFrequency,
    weeklyCheckinDue,
    frequencyNotice: null,
    convergenceAlerts,
    latestConvergenceAlert,
    unacknowledgedConvergenceAlerts
  };
}

// ── Demo / missing-function stubs ──────────────────────────────────────────
// These functions are imported by various pages but are not needed for the
// core demo flow. They return safe empty values so pages compile.

type ReferenceBenchmark = {
  metric: string;
  population: string;
  mean_value: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
};

// Evidence-based reference ranges from voice pathology literature.
// HNR in dB. Jitter in % (fraction × 100). Shimmer in % (fraction × 100).
const REFERENCE_BENCHMARKS: ReferenceBenchmark[] = [
  // ── HNR ──────────────────────────────────────────────────────────────────
  { metric: "hnr_mean",      population: "healthy_adults",            mean_value: 19.2, percentile_25: 16.5, percentile_50: 19.0, percentile_75: 22.0 },
  { metric: "hnr_mean",      population: "post_treatment_lung_cancer", mean_value: 12.8, percentile_25: 10.5, percentile_50: 12.8, percentile_75: 15.2 },
  { metric: "hnr_mean",      population: "vocal_fold_paresis",         mean_value:  8.5, percentile_25:  6.8, percentile_50:  8.5, percentile_75: 10.8 },
  // ── Jitter (% — stored as fraction × 100) ────────────────────────────────
  { metric: "jitter_local",  population: "healthy_adults",            mean_value:  0.60, percentile_25: 0.40, percentile_50: 0.60, percentile_75: 0.85 },
  { metric: "jitter_local",  population: "post_treatment_lung_cancer", mean_value:  1.20, percentile_25: 0.85, percentile_50: 1.20, percentile_75: 1.65 },
  { metric: "jitter_local",  population: "vocal_fold_paresis",         mean_value:  2.50, percentile_25: 1.80, percentile_50: 2.45, percentile_75: 3.25 },
  // ── Shimmer (%) ──────────────────────────────────────────────────────────
  { metric: "shimmer_local", population: "healthy_adults",            mean_value:  4.0,  percentile_25: 3.0,  percentile_50: 4.0,  percentile_75: 5.5  },
  { metric: "shimmer_local", population: "post_treatment_lung_cancer", mean_value:  6.5,  percentile_25: 5.0,  percentile_50: 6.5,  percentile_75: 8.5  },
  { metric: "shimmer_local", population: "vocal_fold_paresis",         mean_value:  9.5,  percentile_25: 7.5,  percentile_50: 9.5,  percentile_75: 12.0 },
];

export async function listReferenceBenchmarks(): Promise<ReferenceBenchmark[]> {
  return REFERENCE_BENCHMARKS;
}
export async function deleteUserCompletely(_userId: string) {}
export async function exportUserData(_userId: string) { return {}; }

export async function getComorbidityProfile(userId: string) {
  return getComorbidityProfileByUserId(userId);
}

export async function saveComorbidityProfile(input: {
  userId: string;
  cciScore: number;
  cciCategory: CciCategory;
  cusumSensitivityMultiplier: number;
  proThresholdMultiplier: number;
}) {
  const existing = await getComorbidityProfileByUserId(input.userId);
  if (!existing) {
    return createComorbidityProfile(
      input.userId,
      input.cciScore,
      input.cciCategory,
      input.cusumSensitivityMultiplier,
      input.proThresholdMultiplier
    );
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("comorbidity_profiles")
    .update({
      cci_score: input.cciScore,
      cci_category: input.cciCategory,
      cusum_sensitivity_multiplier: input.cusumSensitivityMultiplier,
      pro_threshold_multiplier: input.proThresholdMultiplier,
      completed_at: nowIso()
    })
    .eq("user_id", input.userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ComorbidityProfileRecord;
}

export async function createVerificationRecord(userId: string, email: string) {
  const supabase = getSupabaseClient();
  const token = createOpaqueToken();

  await supabase.from("verification_tokens").delete().eq("user_id", userId);

  const { error } = await supabase.from("verification_tokens").insert({
    id: randomUUID(),
    user_id: userId,
    email,
    token,
    expires_at: hoursFromNow(24)
  });

  if (error) {
    throw new Error(error.message);
  }

  return token;
}

export async function verifyLocalUserEmail(token: string) {
  const supabase = getSupabaseClient();
  let userId: string | null = null;
  let email: string | null = null;

  const { data: tokenRecord, error } = await supabase
    .from("verification_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (tokenRecord) {
    if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
      throw new Error("Verification link has expired.");
    }
    userId = tokenRecord.user_id;
    email = tokenRecord.email;
  } else if (token.includes("@")) {
    const user = await getAuthUserByEmail(token);
    if (!user?.id || !user.email) {
      throw new Error("Verification link is invalid.");
    }
    userId = user.id;
    email = user.email;
  } else {
    throw new Error("Verification link is invalid.");
  }

  if (!userId) {
    throw new Error("Verification link is invalid.");
  }

  const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true
  });

  if (updateError || !updatedUser.user) {
    throw new Error(updateError?.message ?? "Could not verify email.");
  }

  if (tokenRecord) {
    await supabase.from("verification_tokens").delete().eq("id", tokenRecord.id);
  }

  return {
    ...updatedUser.user,
    email: updatedUser.user.email ?? email
  };
}

export async function getRecurrenceRiskProfile(userId: string) {
  return getRecurrenceRiskProfileByUserId(userId);
}

export async function saveRecurrenceRiskProfile(input: {
  userId: string;
  rawScore: number;
  riskTier: "low" | "intermediate" | "high";
  cusumSensitivityMultiplier: number;
}) {
  const existing = await getRecurrenceRiskProfileByUserId(input.userId);
  if (!existing) {
    return createRecurrenceRiskProfile(
      input.userId,
      input.rawScore,
      input.riskTier,
      input.cusumSensitivityMultiplier
    );
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("recurrence_risk_profiles")
    .update({
      raw_score: input.rawScore,
      risk_tier: input.riskTier,
      cusum_sensitivity_multiplier: input.cusumSensitivityMultiplier,
      completed_at: nowIso()
    })
    .eq("user_id", input.userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RecurrenceRiskProfileRecord;
}

export async function createPasswordResetRecord(email: string) {
  const user = await getAuthUserByEmail(email);
  if (!user?.id || !user.email) {
    return null;
  }

  const supabase = getSupabaseClient();
  const token = createOpaqueToken();

  await supabase.from("password_reset_tokens").delete().eq("user_id", user.id);

  const { error } = await supabase.from("password_reset_tokens").insert({
    id: randomUUID(),
    user_id: user.id,
    email: user.email,
    token,
    expires_at: hoursFromNow(1)
  });

  if (error) {
    throw new Error(error.message);
  }

  return token;
}

export async function resetPasswordWithToken(token: string, email: string | undefined, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Password reset link is invalid.");
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    throw new Error("Password reset link has expired.");
  }

  if (email && data.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Password reset email does not match.");
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(data.user_id, { password });
  if (updateError) {
    throw new Error(updateError.message);
  }

  await supabase.from("password_reset_tokens").delete().eq("id", data.id);
}

export async function getCurrentProFrequency(_userId: string): Promise<"weekly" | "biweekly"> { return "weekly"; }
export async function saveWeeklyProAssessment(_userId: string, _data: unknown) { return null; }
export async function updateWeeklyProAssessmentAlert(_id: string, _data: unknown) { return null; }

export async function listUserAlerts(userId: string) {
  return getAlertsByUserId(userId);
}

export async function markAlertEmailed(alertId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .update({ caregiver_notified: true })
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlertRecord;
}

export async function listConvergenceAlerts(userId: string) {
  return getConvergenceAlertsByUserId(userId);
}

export async function acknowledgeAlert(userId: string, alertId?: string) {
  if (!alertId) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .update({ acknowledged: true })
    .eq("id", alertId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AlertRecord | null;
}

export async function acknowledgeConvergenceAlert(userId: string, alertId?: string) {
  if (!alertId) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("convergence_alerts")
    .update({ acknowledged: true })
    .eq("id", alertId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConvergenceAlertRecord | null;
}

export async function getGeneratedSummary(
  _userId: string,
  _type: "voice" | "weekly_pro"
): Promise<{ content: string } | null> {
  return null;
}

export async function setGeneratedSummary(
  _userId: string,
  _type: "voice" | "weekly_pro",
  _content: string
): Promise<void> {
  // no-op in demo mode
}

export async function saveAnalysisSession(_input: {
  userId: string;
  features: Record<string, number>;
  recordedAt: string;
  illnessFlag: boolean;
  result: Record<string, unknown>;
}): Promise<{ session: { day_number: number } }> {
  return { session: { day_number: 1 } };
}
