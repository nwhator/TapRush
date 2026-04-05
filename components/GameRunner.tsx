"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationOverlay } from "@/components/AnimationOverlay";
import { LevelIndicator } from "@/components/LevelIndicator";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { TapArea } from "@/components/TapArea";
import { ShareButtons } from "@/components/ShareButtons";
import { trackEvent } from "@/lib/analytics";
import { dailyChallengeConfig, ensureDailyChallenge, todayIsoDate } from "@/lib/daily";
import {
  buildColorPool,
  colorLabel,
  colorTextClass,
  comboMultiplier,
  getDifficulty,
  pickColor,
  speedPoints,
  speedTier,
  shouldSwitchRule
} from "@/lib/game";
import { ensurePlayerInSupabase, getLocalPlayer } from "@/lib/player";
import { fetchPlayerRank, getDailyAttemptCount, submitScore } from "@/lib/scores";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";
import type { GameColorToken, GameMode } from "@/types";

type OverlayState = "idle" | "success" | "fail";

type Phase = "home" | "countdown" | "playing" | "failed";
type RoundState = "relay" | "live";
type FailReason = "wrong_tap" | "hesitation" | "early_tap";

interface GameRunnerProps {
  mode: GameMode;
}

const DAILY_ATTEMPT_KEY = "taprush:dailyAttempts:v2";
const DAILY_ATTEMPTS_MAX = 20;
const BEST_KEY = "taprush:best";
const COUNTDOWN_STEPS = ["3", "2", "1", "GO!"];
const COUNTDOWN_MS = 1800;

export function GameRunner({ mode }: GameRunnerProps) {
  const { soundsEnabled } = useGameSettings();
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("home");
  const [roundState, setRoundState] = useState<RoundState>("relay");
  const [overlay, setOverlay] = useState<OverlayState>("idle");
  const [countdownText, setCountdownText] = useState(COUNTDOWN_STEPS[0]);
  const [forbiddenColor, setForbiddenColor] = useState<GameColorToken>("red");
  const [activeColor, setActiveColor] = useState<GameColorToken>("blue");
  const [tapEnabled, setTapEnabled] = useState(false);
  const [pulseRuleChange, setPulseRuleChange] = useState(false);
  const [speedLabel, setSpeedLabel] = useState<"fast" | "medium" | "slow" | "restraint">("slow");
  const [reactionWindow, setReactionWindow] = useState(0);
  const [dailyLocked, setDailyLocked] = useState(false);
  const [dailyAttemptsUsed, setDailyAttemptsUsed] = useState(0);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [failReason, setFailReason] = useState<FailReason>("wrong_tap");

  const roundStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const relayTimer = useRef<number | null>(null);
  const overlayTimer = useRef<number | null>(null);
  const countdownTimer = useRef<number | null>(null);
  const roundNonceRef = useRef(0);
  const levelRef = useRef(1);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const dailyAttemptsRef = useRef(0);
  const forbiddenRef = useRef<GameColorToken>("red");
  const activeRef = useRef<GameColorToken>("blue");
  const reactionWindowRef = useRef(0);
  const startingBestRef = useRef(0);

  const challenge = useMemo(() => dailyChallengeConfig(), []);
  const attemptsLeft = Math.max(0, DAILY_ATTEMPTS_MAX - dailyAttemptsUsed);

  const playSound = useCallback(
    (type: "tap" | "good" | "bad") => {
      if (!soundsEnabled) return;
      if (typeof window === "undefined") return;

      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const context = new AudioCtx();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.type = type === "bad" ? "sawtooth" : "triangle";
      oscillator.frequency.value = type === "tap" ? 300 : type === "good" ? 560 : 180;
      gain.gain.value = 0.04;

      oscillator.start();
      oscillator.stop(context.currentTime + 0.08);
      oscillator.onended = () => {
        context.close();
      };
    },
    [soundsEnabled]
  );

  const clearTimers = useCallback(() => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    if (relayTimer.current) window.clearTimeout(relayTimer.current);
    if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
    if (countdownTimer.current) window.clearTimeout(countdownTimer.current);
    rafRef.current = null;
    relayTimer.current = null;
    overlayTimer.current = null;
    countdownTimer.current = null;
  }, []);

  const storeDailyAttempts = useCallback((userId: string, date: string, count: number) => {
    window.localStorage.setItem(
      DAILY_ATTEMPT_KEY,
      JSON.stringify({
        userId,
        date,
        mode,
        count
      })
    );
  }, [mode]);

  const pulseRule = useCallback(() => {
    setPulseRuleChange(true);
    overlayTimer.current = window.setTimeout(() => setPulseRuleChange(false), 320);
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator === "undefined") return;
    if (typeof navigator.vibrate !== "function") return;
    navigator.vibrate(pattern);
  }, []);

  const runRound = useCallback(() => {
    clearTimers();

    const currentLevel = levelRef.current;
    const diff = getDifficulty(currentLevel, mode);
    const pool = buildColorPool(currentLevel);
    const shouldSwitch = shouldSwitchRule(diff.ruleSwitchChance);
    const nextForbidden = shouldSwitch ? pickColor(pool, forbiddenRef.current) : forbiddenRef.current;
    const nextActive = pickColor(pool);

    if (nextForbidden !== forbiddenRef.current) {
      forbiddenRef.current = nextForbidden;
      setForbiddenColor(nextForbidden);
      pulseRule();
    }

    activeRef.current = nextActive;
    setActiveColor(nextActive);
    setReactionWindow(diff.reactionWindowMs);
    reactionWindowRef.current = diff.reactionWindowMs;
    setRoundState("relay");
    setTapEnabled(false);

    const roundNonce = ++roundNonceRef.current;
    relayTimer.current = window.setTimeout(() => {
      if (roundNonce !== roundNonceRef.current) return;

      setRoundState("live");
      setTapEnabled(true);
      roundStartRef.current = performance.now();

      const tick = (now: number) => {
        if (roundNonce !== roundNonceRef.current) return;
        const elapsed = now - roundStartRef.current;

        if (elapsed >= reactionWindowRef.current) {
          if (activeRef.current === forbiddenRef.current) {
            const nextLevel = levelRef.current + 1;
            const nextStreak = streakRef.current + 1;
            const nextScore = scoreRef.current + 1;
            setLevel(nextLevel);
            setStreak(nextStreak);
            setScore(nextScore);
            setSpeedLabel("restraint");
            setCombo(0);
            comboRef.current = 0;
            setMultiplier(1);
            setOverlay("success");
            playSound("good");
            vibrate(8);
            setTapEnabled(false);

            trackEvent("round_success", { mode, level: levelRef.current, score: nextScore, speed: "restraint" });

            levelRef.current = nextLevel;
            streakRef.current = nextStreak;
            scoreRef.current = nextScore;

            overlayTimer.current = window.setTimeout(() => {
              setOverlay("idle");
              runRound();
            }, 140);
            return;
          }

          void failRound("hesitation");
          return;
        }

        rafRef.current = window.requestAnimationFrame(tick);
      };

      rafRef.current = window.requestAnimationFrame(tick);
    }, diff.relayDelayMs);
  }, [clearTimers, mode, playSound, pulseRule, vibrate]);

  const failRound = useCallback(async (reason: FailReason) => {
    clearTimers();
    setTapEnabled(false);
    setPhase("failed");
    setOverlay("fail");
    setFailReason(reason);
    playSound("bad");
    vibrate([12, 30, 12]);

    const player = getLocalPlayer();
    setPlayerId(player.id);
    await ensurePlayerInSupabase(player);
    if (mode === "daily") {
      await ensureDailyChallenge(challenge.date);
    }
    await submitScore({
      userId: player.id,
      level: levelRef.current,
      score: scoreRef.current,
      mode,
      challengeDate: mode === "daily" ? challenge.date : undefined
    });

    const nextRank = await fetchPlayerRank(mode, player.id, mode === "daily" ? challenge.date : undefined);
    setRank(nextRank);

    if (scoreRef.current > startingBestRef.current) {
      setNewBest(true);
      setBest(scoreRef.current);
      window.localStorage.setItem(BEST_KEY, String(scoreRef.current));
    } else {
      setNewBest(false);
    }

    trackEvent("run_failed", { level: levelRef.current, score: scoreRef.current, mode, reason });
  }, [challenge.date, clearTimers, mode, playSound, vibrate]);

  useEffect(() => {
    levelRef.current = level;
    streakRef.current = streak;
    scoreRef.current = score;
    comboRef.current = combo;
  }, [combo, level, score, streak]);

  useEffect(() => {
    dailyAttemptsRef.current = dailyAttemptsUsed;
  }, [dailyAttemptsUsed]);

  useEffect(() => {
    const player = getLocalPlayer();
    setPlayerId(player.id);
    void ensurePlayerInSupabase(player);
    if (mode === "daily") {
      void ensureDailyChallenge();
    }

    const savedBest = Number(window.localStorage.getItem(BEST_KEY) ?? "0");
    if (!Number.isNaN(savedBest)) {
      setBest(savedBest);
    }

    const today = todayIsoDate();
    let localAttempts = 0;
    const raw = window.localStorage.getItem(DAILY_ATTEMPT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { userId?: string; date?: string; mode?: GameMode; count?: number };
        if (parsed.userId === player.id && parsed.date === today && parsed.mode === mode) {
          localAttempts = parsed.count ?? 0;
        }
      } catch {
        localAttempts = 0;
      }
    }

    const remotePromise = mode === "daily" ? getDailyAttemptCount(player.id, today) : Promise.resolve(0);
    void remotePromise.then((remoteAttempts) => {
      const attemptsUsed = Math.max(localAttempts, remoteAttempts);
      setDailyAttemptsUsed(attemptsUsed);
      dailyAttemptsRef.current = attemptsUsed;
      storeDailyAttempts(player.id, today, attemptsUsed);
      setDailyLocked(attemptsUsed >= DAILY_ATTEMPTS_MAX);
    });

    trackEvent("session_started", { mode, date: todayIsoDate() });

    return () => {
      clearTimers();
    };
  }, [clearTimers, mode, storeDailyAttempts]);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

    const preventTouchScroll = (event: TouchEvent) => {
      event.preventDefault();
    };

    document.addEventListener("touchmove", preventTouchScroll, { passive: false });

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, []);

  const startGame = useCallback(() => {
    if (dailyLocked || attemptsLeft <= 0) return;

    const today = todayIsoDate();
    const player = getLocalPlayer();
    const nextAttempts = Math.min(DAILY_ATTEMPTS_MAX, dailyAttemptsRef.current + 1);
    setDailyAttemptsUsed(nextAttempts);
    dailyAttemptsRef.current = nextAttempts;
    storeDailyAttempts(player.id, today, nextAttempts);
    setDailyLocked(nextAttempts >= DAILY_ATTEMPTS_MAX);

    const savedBest = Number(window.localStorage.getItem(BEST_KEY) ?? "0");
    startingBestRef.current = Number.isNaN(savedBest) ? 0 : savedBest;
    setNewBest(false);
    setRank(null);
    setLevel(1);
    setStreak(0);
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    setMultiplier(1);
    levelRef.current = 1;
    streakRef.current = 0;
    scoreRef.current = 0;
    forbiddenRef.current = "red";
    setForbiddenColor("red");
    setActiveColor("blue");
    setOverlay("idle");
    setRoundState("relay");
    setTapEnabled(false);
    setPhase("countdown");

    const startedAt = performance.now();
    const stepDuration = COUNTDOWN_MS / COUNTDOWN_STEPS.length;

    const tickCountdown = () => {
      const elapsed = performance.now() - startedAt;
      const step = Math.min(COUNTDOWN_STEPS.length - 1, Math.floor(elapsed / stepDuration));
      setCountdownText(COUNTDOWN_STEPS[step]);

      if (elapsed >= COUNTDOWN_MS) {
        setPhase("playing");
        setCountdownText(COUNTDOWN_STEPS[0]);
        runRound();
        return;
      }

      countdownTimer.current = window.setTimeout(tickCountdown, 40);
    };

    tickCountdown();
  }, [attemptsLeft, dailyLocked, runRound, storeDailyAttempts]);

  const onTap = useCallback(() => {
    playSound("tap");
    vibrate(6);

    if (!tapEnabled || phase !== "playing" || roundState !== "live") {
      void failRound("early_tap");
      return;
    }

    const tappedForbidden = activeRef.current === forbiddenRef.current;
    if (tappedForbidden) {
      void failRound("wrong_tap");
      return;
    }

    clearTimers();
    setTapEnabled(false);

    const reactionMs = performance.now() - roundStartRef.current;
    const tier = speedTier(reactionMs, reactionWindowRef.current);
    const base = speedPoints(tier);
    const nextCombo = tier === "fast" ? comboRef.current + 1 : 0;
    const nextMultiplier = comboMultiplier(nextCombo);
    const earned = base * nextMultiplier;

    const nextLevel = levelRef.current + 1;
    const nextStreak = streakRef.current + 1;
    const nextScore = scoreRef.current + earned;

    setCombo(nextCombo);
    comboRef.current = nextCombo;
    setMultiplier(nextMultiplier);
    setLevel(nextLevel);
    setStreak(nextStreak);
    setScore(nextScore);
    setSpeedLabel(tier);
    setOverlay("success");
    playSound("good");
    vibrate(10);

    levelRef.current = nextLevel;
    streakRef.current = nextStreak;
    scoreRef.current = nextScore;

    trackEvent("round_success", {
      mode,
      level: levelRef.current,
      score: nextScore,
      speed: tier,
      reactionMs: Math.round(reactionMs),
      multiplier: nextMultiplier
    });

    overlayTimer.current = window.setTimeout(() => {
      setOverlay("idle");
      runRound();
    }, 140);
  }, [clearTimers, failRound, mode, phase, playSound, roundState, runRound, tapEnabled, vibrate]);

  function retry() {
    startGame();
    trackEvent("instant_replay", { mode, attemptsLeft: Math.max(0, attemptsLeft - 1) });
  }

  function returnHome() {
    clearTimers();
    setPhase("home");
    setOverlay("idle");
    setRoundState("relay");
    setTapEnabled(false);
  }

  return (
    <section className="relative flex h-dvh w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_15%_0%,rgba(45,212,191,0.24),transparent_35%),radial-gradient(circle_at_85%_100%,rgba(244,63,94,0.18),transparent_42%)] px-4 pb-4 pt-5">
      <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-soft">Tap Rush • {mode}</p>
        <Link href="/" className="rounded-full border border-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-soft hover:text-white">
          Exit
        </Link>
      </div>

      {phase === "home" ? (
        <div className="mx-auto mt-6 flex w-full max-w-md flex-1 flex-col justify-center gap-6">
          <div className="glass-card rounded-3xl px-5 py-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-soft">Arcade Reflex Challenge</p>
            <h1 className="mt-2 text-5xl font-black uppercase tracking-tight">Tap Rush</h1>
            <p className="mt-3 text-sm text-soft">Tap fast. Think faster. Don&apos;t tap the wrong color.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl bg-black/30 px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Best</p>
                <p className="mt-1 text-2xl font-black">{best.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-black/30 px-3 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Attempts Left</p>
                <p className="mt-1 text-2xl font-black">{attemptsLeft}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={startGame}
              disabled={dailyLocked || attemptsLeft <= 0}
              className="kinetic-button mt-6 w-full rounded-full px-4 py-4 text-sm font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {attemptsLeft <= 0 ? "No Attempts Left" : "Start Game"}
            </button>
            {attemptsLeft <= 0 ? (
              <p className="mt-3 text-xs font-semibold text-rose-200">No attempts left today. Come back tomorrow.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "countdown" ? (
        <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
          <p className="animate-pulse text-7xl font-black uppercase tracking-tight [text-shadow:0_0_24px_rgba(94,234,212,0.65)]">{countdownText}</p>
        </div>
      ) : null}

      {phase === "playing" ? (
        <div className="mx-auto mt-2 flex w-full max-w-md flex-1 overflow-hidden">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 space-y-2">
              <ScoreDisplay score={score} best={best} />
              <LevelIndicator level={level} streak={streak} />

              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-black/25 p-3 text-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Combo</p>
                  <p className="mt-1 text-lg font-black">{combo}x</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Multiplier</p>
                  <p className="mt-1 text-lg font-black text-cyan-200">x{multiplier}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Speed</p>
                  <p className="mt-1 text-lg font-black uppercase">{speedLabel}</p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full rounded-3xl bg-[color-mix(in_srgb,var(--surface-low)_92%,transparent)] p-3">
                <AnimationOverlay state={overlay} />
                <TapArea
                  activeColor={activeColor}
                  forbiddenColor={forbiddenColor}
                  active={roundState === "live"}
                  relayState={roundState}
                  pulseRuleChange={pulseRuleChange}
                  onTap={onTap}
                  disabled={phase !== "playing"}
                />
              </div>
            </div>

            <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[11px] font-black uppercase tracking-[0.2em] text-soft">
              {roundState === "relay"
                ? "Get ready"
                : `React in ${Math.round(reactionWindow)}ms • If color is ${colorLabel(forbiddenColor)}, do not tap`}
            </p>
          </div>
        </div>
      ) : null}

      {phase === "failed" ? (
        <div className="mx-auto mt-6 flex w-full max-w-md flex-1 flex-col justify-center gap-4">
          <div className="rounded-3xl bg-rose-500/12 p-5 text-center shadow-[0_0_40px_rgba(244,63,94,0.18)]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Run Complete</p>
            <h2 className="mt-2 text-4xl font-black">{score.toLocaleString()}</h2>
            <p className="mt-2 text-sm text-soft">Best: {best.toLocaleString()} • Attempts left: {attemptsLeft}</p>
            <p className="mt-2 text-sm font-semibold text-rose-100">
              {newBest ? "New Best!" : score >= Math.max(1, Math.floor(best * 0.9)) ? "So close!" : "Reset and push harder."}
            </p>
            <p className={"mt-2 text-xs font-semibold " + (failReason === "hesitation" ? "text-amber-200" : "text-rose-200")}>{failReason === "hesitation" ? "You hesitated too long." : failReason === "early_tap" ? "Too early. Wait for GO." : "Wrong color tapped."}</p>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={retry}
                disabled={attemptsLeft <= 0}
                className="kinetic-button w-full rounded-full px-4 py-4 text-sm font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {attemptsLeft <= 0 ? "No Attempts Left Today" : "Instant Restart"}
              </button>
              <button
                type="button"
                onClick={returnHome}
                className="w-full rounded-full border border-white/20 bg-black/25 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-soft"
              >
                Back To Home Screen
              </button>
            </div>
          </div>

          <ShareButtons mode={mode === "arcade" ? "Arcade" : "Daily"} level={level} rank={rank} />
          <p className="text-center text-[11px] text-soft">Player ID: {playerId?.slice(0, 8) ?? "-"}</p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/35 to-transparent" />
    </section>
  );
}
