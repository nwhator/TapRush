import type { GameMode, PlayerStats, ScoreRow } from "@/types";
import { supabase } from "@/lib/supabase";

type RawLeaderboardRow = Omit<ScoreRow, "users"> & {
  users?:
    | {
        name: string | null;
        avatar: string | null;
      }
    | Array<{
        name: string | null;
        avatar: string | null;
      }>
    | null;
};

export async function submitScore(input: {
  userId: string;
  level: number;
  score: number;
  mode: GameMode;
  challengeDate?: string;
}) {
  if (!supabase) return;

  await supabase.from("scores").insert({
    user_id: input.userId,
    level_reached: input.level,
    score_value: input.score,
    mode: input.mode,
    challenge_date: input.challengeDate ?? null
  });
}

export async function fetchLeaderboard(mode: GameMode, challengeDate?: string, limit = 50) {
  if (!supabase) return [] as ScoreRow[];

  let query = supabase
    .from("scores")
    .select("id, user_id, level_reached, score_value, mode, challenge_date, created_at, users(name, avatar)")
    .eq("mode", mode)
    .order("level_reached", { ascending: false })
    .order("score_value", { ascending: false })
    .limit(limit);

  if (challengeDate) {
    query = query.eq("challenge_date", challengeDate);
  }

  const { data } = await query;
  const rows = (data ?? []) as unknown as RawLeaderboardRow[];

  return rows.map((row) => {
    const relation = row.users;
    const user = Array.isArray(relation) ? (relation[0] ?? null) : (relation ?? null);

    return {
      ...row,
      users: user
    };
  });
}

export async function fetchPlayerRank(mode: GameMode, userId: string, challengeDate?: string) {
  const leaderboard = await fetchLeaderboard(mode, challengeDate, 200);
  const position = leaderboard.findIndex((row) => row.user_id === userId);
  return position >= 0 ? position + 1 : null;
}

export async function hasDailyAttempt(userId: string, challengeDate: string) {
  if (!supabase) return false;

  const { count } = await supabase
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("mode", "daily")
    .eq("challenge_date", challengeDate);

  return Boolean(count && count > 0);
}

export async function fetchPlayerStats(userId: string): Promise<PlayerStats> {
  const fallback: PlayerStats = {
    totalRuns: 0,
    arcadeBestLevel: 0,
    dailyBestLevel: 0,
    bestScore: 0
  };

  if (!supabase) return fallback;

  const { data } = await supabase
    .from("scores")
    .select("mode, level_reached, score_value")
    .eq("user_id", userId)
    .limit(500);

  if (!data?.length) return fallback;

  let arcadeBestLevel = 0;
  let dailyBestLevel = 0;
  let bestScore = 0;

  for (const row of data) {
    if (row.mode === "arcade") {
      arcadeBestLevel = Math.max(arcadeBestLevel, row.level_reached ?? 0);
    }
    if (row.mode === "daily") {
      dailyBestLevel = Math.max(dailyBestLevel, row.level_reached ?? 0);
    }
    bestScore = Math.max(bestScore, row.score_value ?? 0);
  }

  return {
    totalRuns: data.length,
    arcadeBestLevel,
    dailyBestLevel,
    bestScore
  };
}
