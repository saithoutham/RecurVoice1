create table if not exists recurrence_risk_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_score integer not null,
  risk_tier text not null check (risk_tier in ('low', 'intermediate', 'high')),
  cusum_sensitivity_multiplier float not null,
  completed_at timestamptz not null default now(),
  unique (user_id)
);
