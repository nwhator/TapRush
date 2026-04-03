import { supabase } from "@/lib/supabase";

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function seedFromDate(date: string) {
  let hash = 0;
  for (let i = 0; i < date.length; i += 1) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function dailyChallengeConfig(date = todayIsoDate()) {
  const seed = seedFromDate(date);
  return {
    date,
    seed,
    baseWindow: 780 - (seed % 60),
    fakeOutBoost: 0.05 + ((seed % 7) / 100),
    title: `Pulse ${seed % 1000}`
  };
}

export async function ensureDailyChallenge(date = todayIsoDate()) {
  if (!supabase) return;

  const config = dailyChallengeConfig(date);
  await supabase.from("daily_challenges").upsert(
    {
      date,
      challenge_data: config,
      top_scores: []
    },
    { onConflict: "date" }
  );
}
