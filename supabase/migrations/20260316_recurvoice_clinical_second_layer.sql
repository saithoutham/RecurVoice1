create table if not exists comorbidity_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  cci_score integer not null,
  cci_category text not null check (cci_category in ('low', 'moderate', 'high')),
  cusum_sensitivity_multiplier float not null,
  pro_threshold_multiplier float not null,
  completed_at timestamptz not null default now()
);

create table if not exists weekly_pro_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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

create table if not exists convergence_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
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

create table if not exists pro_frequency_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  changed_at timestamptz not null default now(),
  previous_frequency text not null check (previous_frequency in ('weekly', 'biweekly')),
  new_frequency text not null check (new_frequency in ('weekly', 'biweekly')),
  reason text not null,
  acoustic_cusum_at_change float not null
);
