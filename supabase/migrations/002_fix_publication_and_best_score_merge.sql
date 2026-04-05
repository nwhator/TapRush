-- Migration 002: Safe realtime publication + best-score row merge
--
-- Goals:
-- 1) Avoid "relation is already member of publication" errors.
-- 2) Keep one best score row per user scope (arcade or daily date).
-- 3) Preserve attempt tracking by incrementing attempt_count on repeated plays.

-- Remove duplicate score rows first (keep highest score row per scope).
with duplicate_arcade as (
  select
    id,
    row_number() over (
      partition by user_id, mode
      order by score_value desc, created_at desc, id desc
    ) as rn
  from public.scores
  where mode = 'arcade'
)
delete from public.scores
using duplicate_arcade
where public.scores.id = duplicate_arcade.id
  and duplicate_arcade.rn > 1;

with duplicate_daily as (
  select
    id,
    row_number() over (
      partition by user_id, mode, challenge_date
      order by score_value desc, created_at desc, id desc
    ) as rn
  from public.scores
  where mode = 'daily'
)
delete from public.scores
using duplicate_daily
where public.scores.id = duplicate_daily.id
  and duplicate_daily.rn > 1;

-- Ensure canonical unique index names exist.
drop index if exists public.scores_user_arcade_uniq;
drop index if exists public.scores_user_daily_uniq;

create unique index if not exists scores_user_mode_arcade_uniq
  on public.scores (user_id, mode)
  where challenge_date is null;

create unique index if not exists scores_user_mode_daily_uniq
  on public.scores (user_id, mode, challenge_date)
  where challenge_date is not null;

-- Merge repeated inserts into existing best-score rows.
create or replace function public.merge_best_score_row()
returns trigger
language plpgsql
as $$
declare
  existing_id bigint;
begin
  if new.mode = 'daily' then
    select s.id
      into existing_id
    from public.scores s
    where s.user_id = new.user_id
      and s.mode = 'daily'
      and s.challenge_date = new.challenge_date
    order by s.id desc
    limit 1;
  else
    select s.id
      into existing_id
    from public.scores s
    where s.user_id = new.user_id
      and s.mode = 'arcade'
      and s.challenge_date is null
    order by s.id desc
    limit 1;
  end if;

  if existing_id is null then
    return new;
  end if;

  update public.scores s
  set
    level_reached = greatest(s.level_reached, new.level_reached),
    score_value = greatest(s.score_value, new.score_value),
    attempt_count = s.attempt_count + coalesce(new.attempt_count, 1),
    created_at = now()
  where s.id = existing_id;

  return null;
end;
$$;

drop trigger if exists trg_merge_best_score_row on public.scores;
create trigger trg_merge_best_score_row
before insert on public.scores
for each row
execute function public.merge_best_score_row();

-- Idempotent realtime publication add.
do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'scores'
  ) then
    alter publication supabase_realtime add table public.scores;
  end if;
end
$$;
