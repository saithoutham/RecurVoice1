create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
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

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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
  alert_level text,
  ai_interpretation text,
  outlier_rejected boolean not null default false,
  raw_features jsonb not null default '{}'::jsonb
);

create table if not exists baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
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
  baseline_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid,
  alert_level text not null,
  message text not null,
  triggered_at timestamptz not null default now(),
  acknowledged boolean not null default false,
  caregiver_notified boolean not null default false
);

create table if not exists consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  consent_type text not null,
  consented_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

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
