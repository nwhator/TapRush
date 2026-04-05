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

  // Look for the user's existing entry for this scope.
  let existingQuery = supabase
    .from("scores")
    .select("id, level_reached, score_value, attempt_count")
    .eq("user_id", input.userId)
    .eq("mode", input.mode)
    .order("score_value", { ascending: false })
    .order("level_reached", { ascending: false })
    .order("id", { ascending: false })
    .limit(1);

  if (input.challengeDate) {
    existingQuery = existingQuery.eq("challenge_date", input.challengeDate);
  } else {
    existingQuery = existingQuery.is("challenge_date", null);
  }

  const { data: existing, error: existingError } = await existingQuery.maybeSingle();
  if (existingError) {
    console.error("[submitScore] failed to fetch existing score row:", existingError.message);
    return;
  }

  if (existing) {
    // Keep the best score and best level while still counting every attempt.
    const updateData: Record<string, unknown> = {
      level_reached: Math.max(existing.level_reached ?? 0, input.level),
      score_value: Math.max(existing.score_value ?? 0, input.score),
      attempt_count: (existing.attempt_count ?? 1) + 1
    };

    const { error: updateError } = await supabase.from("scores").update(updateData).eq("id", existing.id);
    if (updateError) {
      console.error("[submitScore] failed to update score row:", updateError.message);
    }
  } else {
    const { error: insertError } = await supabase.from("scores").insert({
      user_id: input.userId,
      level_reached: input.level,
      score_value: input.score,
      mode: input.mode,
      challenge_date: input.challengeDate ?? null,
      attempt_count: 1
    });
    if (insertError) {
      console.error("[submitScore] failed to insert score row:", insertError.message);
    }
  }
}

export async function fetchLeaderboard(mode: GameMode, challengeDate?: string, limit = 50) {
  if (!supabase) return [] as ScoreRow[];

  let query = supabase
    .from("scores")
    .select("id, user_id, level_reached, score_value, mode, challenge_date, created_at, users(name, avatar)")
    .eq("mode", mode)
    .order("score_value", { ascending: false })
    .order("level_reached", { ascending: false })
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
  const count = await getDailyAttemptCount(userId, challengeDate);
  return count > 0;
}

export async function getDailyAttemptCount(userId: string, challengeDate: string) {
  if (!supabase) return 0;

  const { data } = await supabase
    .from("scores")
    .select("attempt_count")
    .eq("user_id", userId)
    .eq("mode", "daily")
    .eq("challenge_date", challengeDate)
    .maybeSingle();

  return data?.attempt_count ?? 0;
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
    .select("mode, level_reached, score_value, attempt_count")
    .eq("user_id", userId)
    .limit(500);

  if (!data?.length) return fallback;

  let totalRuns = 0;
  let arcadeBestLevel = 0;
  let dailyBestLevel = 0;
  let bestScore = 0;

  for (const row of data) {
    totalRuns += row.attempt_count ?? 1;
    if (row.mode === "arcade") {
      arcadeBestLevel = Math.max(arcadeBestLevel, row.level_reached ?? 0);
    }
    if (row.mode === "daily") {
      dailyBestLevel = Math.max(dailyBestLevel, row.level_reached ?? 0);
    }
    bestScore = Math.max(bestScore, row.score_value ?? 0);
  }

  return {
    totalRuns,
    arcadeBestLevel,
    dailyBestLevel,
    bestScore
  };
}
