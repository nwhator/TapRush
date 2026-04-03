export type GameMode = "arcade" | "daily";

export type ThemeMode = "neon" | "dark" | "light";

export type CueKind = "tap_green" | "tap_blue" | "no_tap_red" | "reverse" | "sound_hint";

export interface Cue {
  id: string;
  kind: CueKind;
  label: string;
  tapAllowed: boolean;
  colorToken: "green" | "blue" | "red" | "amber";
}

export interface DifficultyState {
  level: number;
  reactionWindowMs: number;
  fakeOutProbability: number;
  delayBeforeCueMs: number;
}

export interface ScoreRow {
  id: string;
  user_id: string;
  level_reached: number;
  score_value: number;
  mode: GameMode;
  challenge_date: string | null;
  created_at: string;
  users?: {
    name: string | null;
    avatar: string | null;
  } | null;
}

export interface PlayerStats {
  totalRuns: number;
  arcadeBestLevel: number;
  dailyBestLevel: number;
  bestScore: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  challenge_data: {
    seed: number;
    baseWindow: number;
    fakeOutBoost: number;
    title: string;
  };
}
