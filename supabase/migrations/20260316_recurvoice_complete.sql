-- RecurVoice Complete Supabase Schema
-- Run this in your Supabase SQL Editor

create extension if not exists pgcrypto;

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  date_of_birth date,
  diagnosis_stage text,
  treatment_type text,
  treatment_start_date date,
  oncologist_name text,
  oncologist_email text,
  caregiver_name text,
  caregiver_email text,
  caregiver_phone text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sessions table (voice recordings)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_number integer not null,
  recorded_at timestamptz not null default now(),
  hnr_mean double precision,
  jitter_local double precision,
  shimmer_local double precision,
  spectral_centroid double precision,
  zcr double precision,
  mfcc_1 double precision,
  mfcc_2 double precision,
  mfcc_3 double precision,
  mfcc_4 double precision,
  mfcc_5 double precision,
  mfcc_6 double precision,
  mfcc_7 double precision,
  mfcc_8 double precision,
  mfcc_9 double precision,
  mfcc_10 double precision,
  mfcc_11 double precision,
  mfcc_12 double precision,
  mfcc_13 double precision,
  voiced_frame_ratio double precision,
  snr_db double precision,
  illness_flag boolean not null default false,
  cusum_score double precision,
  raw_cusum_score double precision,
  alert_level text,
  ai_interpretation text,
  outlier_rejected boolean not null default false,
  raw_features jsonb not null default '{}'::jsonb
);

-- Baselines table
create table if not exists baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  calibration_complete boolean not null default false,
  days_recorded integer not null default 0,
  baseline_hnr_mean double precision,
  baseline_hnr_std double precision,
  baseline_jitter_mean double precision,
  baseline_jitter_std double precision,
  baseline_shimmer_mean double precision,
  baseline_shimmer_std double precision,
  cusum_k double precision default 0.5,
  cusum_h double precision default 4.0,
  current_cusum_score double precision default 0,
  consecutive_alert_days integer not null default 0,
  cusum_sensitivity_multiplier double precision default 1,
  cci_cusum_sensitivity_multiplier double precision default 1,
  recurrence_cusum_sensitivity_multiplier double precision default 1,
  pro_threshold_multiplier double precision default 1,
  baseline_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Alerts table
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  alert_level text not null,
  message text not null,
  triggered_at timestamptz not null default now(),
  acknowledged boolean not null default false,
  caregiver_notified boolean not null default false
);

-- Consent logs table
create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  consented_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

-- Reference benchmarks table
create table if not exists reference_benchmarks (
  id uuid primary key default gen_random_uuid(),
  metric text not null,
  population text not null,
  mean_value double precision not null,
  std_value double precision not null,
  percentile_10 double precision not null,
  percentile_25 double precision not null,
  percentile_50 double precision not null,
  percentile_75 double precision not null,
  percentile_90 double precision not null,
  source text not null,
  notes text
);

create unique index if not exists reference_benchmarks_metric_population_idx
  on reference_benchmarks(metric, population);

-- Notification preferences table
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  daily_reminder_enabled boolean not null default false,
  daily_reminder_time text,
  weekly_summary_enabled boolean not null default false,
  caregiver_alert_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trend summaries table
create table if not exists trend_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  summary_type text not null check (summary_type in ('voice', 'weekly_pro')),
  date_key text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comorbidity profiles table
create table if not exists comorbidity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  cci_score integer not null,
  cci_category text not null check (cci_category in ('low', 'moderate', 'high')),
  cusum_sensitivity_multiplier float not null,
  pro_threshold_multiplier float not null,
  completed_at timestamptz not null default now()
);

-- Recurrence risk profiles table
create table if not exists recurrence_risk_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  raw_score integer not null,
  risk_tier text not null check (risk_tier in ('low', 'intermediate', 'high')),
  cusum_sensitivity_multiplier float not null,
  completed_at timestamptz not null default now()
);

-- Weekly PRO assessments table
create table if not exists weekly_pro_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessed_at timestamptz not null,
  ecog_score integer not null check (ecog_score between 0 and 4),
  cough_score integer not null check (cough_score between 0 and 3),
  dyspnea_score integer not null check (dyspnea_score between 0 and 3),
  fatigue_score integer not null check (fatigue_score between 0 and 3),
  pain_score integer not null check (pain_score between 0 and 3),
  composite_pro_score float not null,
  pro_delta_from_last float not null default 0,
  pro_frequency text not null check (pro_frequency in ('weekly', 'biweekly')),
  alert_triggered boolean not null default false,
  alert_level integer not null default 0 check (alert_level between 0 and 3)
);

-- Convergence alerts table
create table if not exists convergence_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  triggered_at timestamptz not null,
  acoustic_cusum_score float,
  acoustic_alert_level text,
  pro_composite_score float,
  pro_delta float,
  cci_category text,
  convergence_level integer not null check (convergence_level between 0 and 3),
  caregiver_message text not null,
  caregiver_notified boolean not null default false,
  acknowledged boolean not null default false
);

-- PRO frequency log table
create table if not exists pro_frequency_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  changed_at timestamptz not null default now(),
  previous_frequency text not null check (previous_frequency in ('weekly', 'biweekly')),
  new_frequency text not null check (new_frequency in ('weekly', 'biweekly')),
  reason text not null,
  acoustic_cusum_at_change float not null
);

-- Email verification tokens table
create table if not exists verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Password reset tokens table
create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Insert reference benchmark data
insert into reference_benchmarks (
  metric,
  population,
  mean_value,
  std_value,
  percentile_10,
  percentile_25,
  percentile_50,
  percentile_75,
  percentile_90,
  source,
  notes
) values
('hnr_mean', 'healthy_adults', 11.8505, 5.9444, 6.03, 8.2325, 10.2, 12.9, 21.9181, 'RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls', 'Derived from healthy recordings in data/processed/feature_matrix.csv.'),
('jitter_local', 'healthy_adults', 0.0064, 0.0089, 0.0025, 0.0032, 0.0045, 0.0061, 0.0097, 'RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls', 'Local jitter expressed as proportion, matching engine output.'),
('shimmer_local', 'healthy_adults', 3.9539, 3.4413, 0.0304, 1.8386, 3.7528, 5.2204, 6.7923, 'RecurVoice processed SVD, VOICED, and UVFP Harvard healthy controls', 'Local shimmer stored in percent-like Praat-compatible units.'),
('hnr_mean', 'post_treatment_lung_cancer', 10.0948, 5.829, 3.7876, 6.5026, 9.206, 12.095, 18.8318, 'RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes', 'Reference bridge cohort inferred from available SVD and UVFP Harvard data because a direct post-treatment longitudinal benchmark cohort is not present locally.'),
('jitter_local', 'post_treatment_lung_cancer', 0.0123, 0.0139, 0.0028, 0.0044, 0.0074, 0.0139, 0.027, 'RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes', 'Interpolated clinical monitoring reference for educational comparison only.'),
('shimmer_local', 'post_treatment_lung_cancer', 5.9578, 4.6424, 1.0377, 2.977, 5.2686, 7.6263, 10.3769, 'RecurVoice inferred monitoring cohort from healthy and UVFP benchmark envelopes', 'Interpolated clinical monitoring reference for educational comparison only.'),
('hnr_mean', 'confirmed_uvfp', 6.8343, 5.5598, -0.377, 3.29, 7.36, 10.6, 13.1, 'RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases', 'Confirmed unilateral vocal fold paresis / RLN impairment cohort.'),
('jitter_local', 'confirmed_uvfp', 0.0259, 0.0286, 0.0037, 0.0072, 0.0143, 0.0322, 0.0675, 'RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases', 'Confirmed unilateral vocal fold paresis / RLN impairment cohort.'),
('shimmer_local', 'confirmed_uvfp', 10.6337, 8.2459, 3.388, 5.6331, 8.8053, 13.24, 18.741, 'RecurVoice processed SVD and UVFP Harvard confirmed UVFP cases', 'Confirmed unilateral vocal fold paresis / RLN impairment cohort.')
on conflict (metric, population) do update set
  mean_value = excluded.mean_value,
  std_value = excluded.std_value,
  percentile_10 = excluded.percentile_10,
  percentile_25 = excluded.percentile_25,
  percentile_50 = excluded.percentile_50,
  percentile_75 = excluded.percentile_75,
  percentile_90 = excluded.percentile_90,
  source = excluded.source,
  notes = excluded.notes;

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table baselines enable row level security;
alter table alerts enable row level security;
alter table consent_logs enable row level security;
alter table notification_preferences enable row level security;
alter table trend_summaries enable row level security;
alter table comorbidity_profiles enable row level security;
alter table recurrence_risk_profiles enable row level security;
alter table weekly_pro_assessments enable row level security;
alter table convergence_alerts enable row level security;
alter table pro_frequency_log enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can view own sessions"
  on sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can view own baselines"
  on baselines for select
  using (auth.uid() = user_id);

create policy "Users can update own baselines"
  on baselines for update
  using (auth.uid() = user_id);

create policy "Users can insert own baselines"
  on baselines for insert
  with check (auth.uid() = user_id);

create policy "Users can view own alerts"
  on alerts for select
  using (auth.uid() = user_id);

create policy "Users can update own alerts"
  on alerts for update
  using (auth.uid() = user_id);

create policy "Users can view own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own notification preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can view own trend summaries"
  on trend_summaries for select
  using (auth.uid() = user_id);

create policy "Users can view own comorbidity profile"
  on comorbidity_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own comorbidity profile"
  on comorbidity_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comorbidity profile"
  on comorbidity_profiles for update
  using (auth.uid() = user_id);

create policy "Users can view own recurrence risk profile"
  on recurrence_risk_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own recurrence risk profile"
  on recurrence_risk_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recurrence risk profile"
  on recurrence_risk_profiles for update
  using (auth.uid() = user_id);

create policy "Users can view own weekly pro assessments"
  on weekly_pro_assessments for select
  using (auth.uid() = user_id);

create policy "Users can insert own weekly pro assessments"
  on weekly_pro_assessments for insert
  with check (auth.uid() = user_id);

create policy "Users can view own convergence alerts"
  on convergence_alerts for select
  using (auth.uid() = user_id);

create policy "Users can update own convergence alerts"
  on convergence_alerts for update
  using (auth.uid() = user_id);

create policy "Users can view own pro frequency log"
  on pro_frequency_log for select
  using (auth.uid() = user_id);

-- Public read access for reference benchmarks
create policy "Anyone can read reference benchmarks"
  on reference_benchmarks for select
  using (true);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    now(),
    now()
  );
  insert into public.notification_preferences (user_id, created_at, updated_at)
  values (new.id, now(), now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
