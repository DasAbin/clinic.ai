-- Minimal storage schema for the clinician-reviewed prototype.
-- Row-level security stays enabled with no public policies. The app's server
-- uses a secret server key; do not deploy it without clinician authentication.
create table if not exists public.patients (
  patient_id text primary key,
  name text not null,
  age integer not null check (age between 0 and 125),
  gender text,
  blood_group text,
  contact text,
  address text,
  emergency_contact text,
  insurance_id text,
  known_allergies text[] default '{}',
  chronic_conditions text[] default '{}',
  current_medications text[] default '{}',
  created_at timestamptz not null default now()
);
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id text not null references public.patients(patient_id),
  created_at timestamptz not null default now(),
  diagnosis text,
  summary text,
  medications jsonb default '[]'::jsonb,
  extracted_data jsonb not null
);
create index if not exists sessions_patient_created_idx on public.sessions(patient_id, created_at desc);
alter table public.patients enable row level security;
alter table public.sessions enable row level security;
-- No anon/authenticated policies. Authorization for real users is not yet implemented.
