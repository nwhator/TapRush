-- TapRush: Mind Games schema
-- Apply in Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text,
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_challenges (
  id bigint generated always as identity primary key,
  date date not null unique,
  challenge_data jsonb not null,
  top_scores jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  level_reached integer not null check (level_reached >= 0),
  score_value integer not null check (score_value >= 0),
  mode text not null check (mode in ('arcade', 'daily')),
  challenge_date date,
  constraint daily_challenge_date_required check (
    (mode = 'daily' and challenge_date is not null) or
    (mode = 'arcade')
  ),
  created_at timestamptz not null default now()
);

create index if not exists scores_mode_level_idx
  on public.scores (mode, level_reached desc, score_value desc, created_at desc);

create index if not exists scores_user_idx
  on public.scores (user_id, created_at desc);

create index if not exists scores_daily_idx
  on public.scores (challenge_date, score_value desc)
  where mode = 'daily';

drop index if exists public.scores_one_daily_attempt_idx;

create index if not exists scores_daily_user_date_idx
  on public.scores (user_id, challenge_date, created_at desc)
  where mode = 'daily';

alter table public.users enable row level security;
alter table public.scores enable row level security;
alter table public.daily_challenges enable row level security;

drop policy if exists "users_select_all" on public.users;
create policy "users_select_all" on public.users
for select to anon, authenticated
using (true);

drop policy if exists "users_insert_all" on public.users;
create policy "users_insert_all" on public.users
for insert to anon, authenticated
with check (true);

drop policy if exists "users_update_all" on public.users;
create policy "users_update_all" on public.users
for update to anon, authenticated
using (true)
with check (true);

drop policy if exists "scores_select_all" on public.scores;
create policy "scores_select_all" on public.scores
for select to anon, authenticated
using (true);

drop policy if exists "scores_insert_all" on public.scores;
create policy "scores_insert_all" on public.scores
for insert to anon, authenticated
with check (true);

drop policy if exists "daily_select_all" on public.daily_challenges;
create policy "daily_select_all" on public.daily_challenges
for select to anon, authenticated
using (true);

drop policy if exists "daily_insert_all" on public.daily_challenges;
create policy "daily_insert_all" on public.daily_challenges
for insert to anon, authenticated
with check (true);

drop policy if exists "daily_update_all" on public.daily_challenges;
create policy "daily_update_all" on public.daily_challenges
for update to anon, authenticated
using (true)
with check (true);

alter publication supabase_realtime add table public.scores;
