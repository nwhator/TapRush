-- Migration 001: Unique username + leaderboard dedupe + attempt tracking
-- Apply this to existing databases that were created from the original schema.sql.
-- The updated schema.sql already includes all of these changes for fresh setups.
--
-- ⚠ DATA LOSS WARNING: Steps 1 and 3 delete rows from `users` and `scores`.
--   Back up the affected tables before running this migration in production.
--   The deletion logic keeps the *earliest-created* record per duplicate group.
--   Scores belonging to deleted duplicate user rows are removed via CASCADE.

-- 1. Case-insensitive unique username index.
--    Before adding it, collapse any existing duplicates by keeping the earliest row.
delete from public.users
where id not in (
  select distinct on (lower(name)) id
  from public.users
  order by lower(name), created_at asc
);

create unique index if not exists users_name_lower_uniq
  on public.users (lower(name));

-- 2. Add attempt_count to scores (tracks games played per scope without extra rows).
alter table public.scores
  add column if not exists attempt_count integer not null default 1;

-- 3. Deduplicate scores: keep only the highest-scoring row per user/scope.
--    Arcade: one row per (user_id, mode).
delete from public.scores s
where mode = 'arcade'
  and id not in (
    select distinct on (user_id) id
    from public.scores
    where mode = 'arcade'
    order by user_id, level_reached desc, score_value desc, created_at asc
  );

--    Daily: one row per (user_id, mode, challenge_date).
delete from public.scores s
where mode = 'daily'
  and id not in (
    select distinct on (user_id, challenge_date) id
    from public.scores
    where mode = 'daily'
    order by user_id, challenge_date, level_reached desc, score_value desc, created_at asc
  );

-- 4. Add unique partial indexes to enforce one-row-per-user constraints going forward.
create unique index if not exists scores_user_arcade_uniq
  on public.scores (user_id, mode)
  where mode = 'arcade';

create unique index if not exists scores_user_daily_uniq
  on public.scores (user_id, mode, challenge_date)
  where mode = 'daily';

-- 5. Allow UPDATE on scores (needed for upsert / best-score logic).
drop policy if exists "scores_update_all" on public.scores;
create policy "scores_update_all" on public.scores
for update to anon, authenticated
using (true)
with check (true);
