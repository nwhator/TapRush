import type { Cue, DifficultyState } from "@/types";

const BASE_WINDOW = 850;
const BASE_FAKE_OUT = 0.06;
const BASE_DELAY = 420;
const MIN_WINDOW = 100;

const cues: Cue[] = [
  {
    id: "tap-green",
    kind: "tap_green",
    label: "Tap on GREEN",
    tapAllowed: true,
    colorToken: "green"
  },
  {
    id: "tap-blue",
    kind: "tap_blue",
    label: "Tap on BLUE",
    tapAllowed: true,
    colorToken: "blue"
  },
  {
    id: "no-tap-red",
    kind: "no_tap_red",
    label: "Do NOT tap on RED",
    tapAllowed: false,
    colorToken: "red"
  },
  {
    id: "reverse",
    kind: "reverse",
    label: "Reverse rule! Tap only if it flashes RED",
    tapAllowed: true,
    colorToken: "amber"
  },
  {
    id: "sound",
    kind: "sound_hint",
    label: "Sound hint active. Stay ready.",
    tapAllowed: true,
    colorToken: "blue"
  }
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getDifficulty(level: number): DifficultyState {
  // Start forgiving, then accelerate the curve after the first few levels.
  const effectiveLevel = Math.max(0, level - 1);
  const ramp = Math.pow(effectiveLevel, 1.18);

  const reactionWindowMs = Math.max(MIN_WINDOW, BASE_WINDOW - Math.floor(ramp * randomBetween(4, 8)));
  const fakeOutProbability = Math.min(0.85, BASE_FAKE_OUT + ramp * (randomBetween(1, 3) / 100));
  const delayBeforeCueMs = Math.max(140, BASE_DELAY + randomBetween(-100, 360) + Math.floor(ramp * 6));

  return {
    level,
    reactionWindowMs,
    fakeOutProbability,
    delayBeforeCueMs
  };
}

export function pickCue(level: number) {
  if (level < 6) {
    return cues[Math.floor(Math.random() * 2)];
  }

  if (level < 12) {
    return cues[Math.floor(Math.random() * 3)];
  }

  return cues[Math.floor(Math.random() * cues.length)];
}

export function shouldTriggerFakeOut(probability: number) {
  return Math.random() < probability;
}

export function scoreFromLevel(level: number, streak: number) {
  return Math.floor(level * 100 + streak * 28);
}

export function cueClassName(color: Cue["colorToken"], active: boolean) {
  if (!active) {
    return "bg-[var(--surface-high)]";
  }

  if (color === "green") return "bg-emerald-400";
  if (color === "blue") return "bg-cyan-400";
  if (color === "red") return "bg-rose-500";
  return "bg-amber-300";
}
