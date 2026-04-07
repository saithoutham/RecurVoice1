export type AuthUserRecord = {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type CciCategory = "low" | "moderate" | "high";
export type RecurrenceRiskTier = "low" | "intermediate" | "high";
export type ProFrequency = "weekly" | "biweekly";
export type ConvergenceLevel = 0 | 1 | 2 | 3;

export type ProfileRecord = {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  diagnosis_stage: string | null;
  treatment_type: string | null;
  treatment_start_date: string | null;
  oncologist_name: string | null;
  oncologist_email: string | null;
  caregiver_name: string | null;
  caregiver_email: string | null;
  caregiver_phone: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionRecord = {
  id: string;
  user_id: string;
  day_number: number;
  recorded_at: string;
  hnr_mean: number | null;
  jitter_local: number | null;
  shimmer_local: number | null;
  spectral_centroid: number | null;
  zcr: number | null;
  mfcc_1: number | null;
  mfcc_2: number | null;
  mfcc_3: number | null;
  mfcc_4: number | null;
  mfcc_5: number | null;
  mfcc_6: number | null;
  mfcc_7: number | null;
  mfcc_8: number | null;
  mfcc_9: number | null;
  mfcc_10: number | null;
  mfcc_11: number | null;
  mfcc_12: number | null;
  mfcc_13: number | null;
  voiced_frame_ratio: number | null;
  snr_db: number | null;
  illness_flag: boolean;
  cusum_score: number | null;
  raw_cusum_score?: number | null;
  alert_level: "STABLE" | "WATCH" | "EARLY_WARNING" | "URGENT" | null;
  ai_interpretation: string | null;
  outlier_rejected: boolean;
  raw_features: Record<string, number>;
};

export type BaselineRecord = {
  id: string;
  user_id: string;
  calibration_complete: boolean;
  days_recorded: number;
  baseline_hnr_mean: number | null;
  baseline_hnr_std: number | null;
  baseline_jitter_mean: number | null;
  baseline_jitter_std: number | null;
  baseline_shimmer_mean: number | null;
  baseline_shimmer_std: number | null;
  cusum_k: number;
  cusum_h: number;
  current_cusum_score: number;
  consecutive_alert_days: number;
  cusum_sensitivity_multiplier: number;
  cci_cusum_sensitivity_multiplier: number;
  recurrence_cusum_sensitivity_multiplier: number;
  pro_threshold_multiplier: number;
  baseline_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AlertRecord = {
  id: string;
  user_id: string;
  session_id: string;
  alert_level: "WATCH" | "EARLY_WARNING" | "URGENT";
  message: string;
  triggered_at: string;
  acknowledged: boolean;
  caregiver_notified: boolean;
};

export type ConsentLogRecord = {
  id: string;
  user_id: string;
  consent_type: string;
  consented_at: string;
  ip_address: string | null;
  user_agent: string | null;
};

export type NotificationPreferencesRecord = {
  id: string;
  user_id: string;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  weekly_summary_enabled: boolean;
  caregiver_alert_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailTokenRecord = {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export type TrendSummaryRecord = {
  id: string;
  user_id: string;
  summary_type: "voice" | "weekly_pro";
  date_key: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ReferenceBenchmarkRecord = {
  id: string;
  metric: "hnr_mean" | "jitter_local" | "shimmer_local";
  population: "healthy_adults" | "post_treatment_lung_cancer" | "confirmed_uvfp";
  mean_value: number;
  std_value: number;
  percentile_10: number;
  percentile_25: number;
  percentile_50: number;
  percentile_75: number;
  percentile_90: number;
  source: string;
  notes: string;
};

export type ComorbidityProfileRecord = {
  id: string;
  user_id: string;
  cci_score: number;
  cci_category: CciCategory;
  cusum_sensitivity_multiplier: number;
  pro_threshold_multiplier: number;
  completed_at: string;
};

export type RecurrenceRiskProfileRecord = {
  id: string;
  user_id: string;
  raw_score: number;
  risk_tier: RecurrenceRiskTier;
  cusum_sensitivity_multiplier: number;
  completed_at: string;
};

export type WeeklyProAssessmentRecord = {
  id: string;
  user_id: string;
  assessed_at: string;
  ecog_score: number;
  cough_score: number;
  dyspnea_score: number;
  fatigue_score: number;
  pain_score: number;
  composite_pro_score: number;
  pro_delta_from_last: number;
  pro_frequency: ProFrequency;
  alert_triggered: boolean;
  alert_level: ConvergenceLevel;
};

export type ConvergenceAlertRecord = {
  id: string;
  user_id: string;
  triggered_at: string;
  acoustic_cusum_score: number | null;
  acoustic_alert_level: string | null;
  pro_composite_score: number | null;
  pro_delta: number | null;
  cci_category: CciCategory | null;
  convergence_level: ConvergenceLevel;
  caregiver_message: string;
  caregiver_notified: boolean;
  acknowledged: boolean;
};

export type ProFrequencyLogRecord = {
  id: string;
  user_id: string;
  changed_at: string;
  previous_frequency: ProFrequency;
  new_frequency: ProFrequency;
  reason: string;
  acoustic_cusum_at_change: number;
};

export type LocalStore = {
  users: AuthUserRecord[];
  profiles: ProfileRecord[];
  sessions: SessionRecord[];
  baselines: BaselineRecord[];
  alerts: AlertRecord[];
  consent_logs: ConsentLogRecord[];
  reference_benchmarks: ReferenceBenchmarkRecord[];
  notification_preferences: NotificationPreferencesRecord[];
  verification_tokens: EmailTokenRecord[];
  password_reset_tokens: EmailTokenRecord[];
  trend_summaries: TrendSummaryRecord[];
  comorbidity_profiles: ComorbidityProfileRecord[];
  recurrence_risk_profiles: RecurrenceRiskProfileRecord[];
  weekly_pro_assessments: WeeklyProAssessmentRecord[];
  convergence_alerts: ConvergenceAlertRecord[];
  pro_frequency_log: ProFrequencyLogRecord[];
};

export type SessionCookiePayload = {
  userId: string;
  email: string;
  onboardingComplete: boolean;
  issuedAt: number;
};

export type DashboardSummary = {
  profile: ProfileRecord;
  baseline: BaselineRecord | null;
  latestSession: SessionRecord | null;
  recentSessions: SessionRecord[];
  alerts: AlertRecord[];
  unacknowledgedAlerts: AlertRecord[];
  daysMonitored: number;
  streak: number;
  checkedInToday: boolean;
  nextReminder: string;
  comorbidityProfile: ComorbidityProfileRecord | null;
  recurrenceRiskProfile: RecurrenceRiskProfileRecord | null;
  latestProAssessment: WeeklyProAssessmentRecord | null;
  proAssessments: WeeklyProAssessmentRecord[];
  currentProFrequency: ProFrequency;
  weeklyCheckinDue: boolean;
  frequencyNotice: string | null;
  convergenceAlerts: ConvergenceAlertRecord[];
  latestConvergenceAlert: ConvergenceAlertRecord | null;
  unacknowledgedConvergenceAlerts: ConvergenceAlertRecord[];
};

export type AnalyzeResultPayload = {
  status: "calibrating" | "active";
  days_recorded: number;
  calibration_progress: number;
  cusum_score: number | null;
  alert_level: "STABLE" | "WATCH" | "EARLY_WARNING" | "URGENT" | null;
  consecutive_alert_days: number;
  outlier_rejected: boolean;
  message: string;
  alert_message: string | null;
};
