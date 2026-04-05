import type { DifficultyState, GameColorToken, GameMode } from "@/types";

const BASE_WINDOW = 1050;
const MIN_WINDOW = 230;
const BASE_RELAY = 380;
const MIN_RELAY = 110;

export const GAME_COLORS: GameColorToken[] = ["red", "blue", "green", "yellow", "orange", "purple", "cyan"];

const COLOR_LABELS: Record<GameColorToken, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
  purple: "Purple",
  cyan: "Cyan"
};

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function colorLabel(color: GameColorToken) {
  return COLOR_LABELS[color];
}

export function buildColorPool(level: number): GameColorToken[] {
  if (level <= 5) return GAME_COLORS.slice(0, 3);
  if (level <= 8) return GAME_COLORS.slice(0, 4);
  if (level <= 12) return GAME_COLORS.slice(0, 5);
  if (level <= 16) return GAME_COLORS.slice(0, 6);
  return GAME_COLORS;
}

export function getDifficulty(level: number, mode: GameMode = "arcade"): DifficultyState {
  const effectiveLevel = Math.max(0, level - 1);
  const ramp = Math.pow(effectiveLevel, 1.22);
  const modePressure = mode === "daily" ? 42 : 0;

  const reactionWindowMs = Math.max(MIN_WINDOW, BASE_WINDOW - Math.floor(ramp * 10) - modePressure);
  const relayDelayMs = Math.max(MIN_RELAY, BASE_RELAY - Math.floor(ramp * 3.2));

  let ruleSwitchChance = 0;
  if (level >= 6 && level <= 15) {
    ruleSwitchChance = 0.15 + (level - 6) * 0.03;
  } else if (level >= 16) {
    ruleSwitchChance = Math.min(0.78, 0.48 + (level - 16) * 0.01);
  }

  return {
    level,
    reactionWindowMs,
    relayDelayMs,
    ruleSwitchChance
  };
}

export function shouldSwitchRule(chance: number) {
  return Math.random() < chance;
}

export function pickColor(pool: GameColorToken[], except?: GameColorToken) {
  if (!pool.length) return "red" as GameColorToken;
  if (!except || pool.length === 1) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const filtered = pool.filter((color) => color !== except);
  return filtered[Math.floor(Math.random() * filtered.length)] ?? pool[0];
}

export function speedTier(reactionMs: number, reactionWindowMs: number) {
  const ratio = reactionMs / reactionWindowMs;
  if (ratio <= 0.35) return "fast" as const;
  if (ratio <= 0.7) return "medium" as const;
  return "slow" as const;
}

export function speedPoints(tier: "fast" | "medium" | "slow") {
  if (tier === "fast") return 3;
  if (tier === "medium") return 2;
  return 1;
}

export function comboMultiplier(combo: number) {
  return Math.min(4, 1 + Math.floor(combo / 2));
}

export function colorSurfaceClass(color: GameColorToken, active: boolean) {
  if (!active) return "bg-[var(--surface-high)]";
  if (color === "red") return "bg-rose-500";
  if (color === "blue") return "bg-sky-500";
  if (color === "green") return "bg-emerald-500";
  if (color === "yellow") return "bg-yellow-300";
  if (color === "orange") return "bg-orange-400";
  if (color === "purple") return "bg-violet-500";
  return "bg-cyan-400";
}

export function colorTextClass(color: GameColorToken) {
  if (color === "yellow") return "text-yellow-200";
  if (color === "orange") return "text-orange-200";
  if (color === "red") return "text-rose-200";
  if (color === "green") return "text-emerald-200";
  if (color === "blue") return "text-sky-200";
  if (color === "purple") return "text-violet-200";
  return "text-cyan-200";
}
