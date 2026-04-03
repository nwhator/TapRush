"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimationOverlay } from "@/components/AnimationOverlay";
import { LevelIndicator } from "@/components/LevelIndicator";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { TapArea } from "@/components/TapArea";
import { ShareButtons } from "@/components/ShareButtons";
import { trackEvent } from "@/lib/analytics";
import { dailyChallengeConfig, ensureDailyChallenge, todayIsoDate } from "@/lib/daily";
import { getDifficulty, pickCue, scoreFromLevel, shouldTriggerFakeOut } from "@/lib/game";
import { ensurePlayerInSupabase, getLocalPlayer } from "@/lib/player";
import { fetchPlayerRank, hasDailyAttempt, submitScore } from "@/lib/scores";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";
import type { Cue, GameMode } from "@/types";

type OverlayState = "idle" | "success" | "fail" | "fakeout";

type Phase = "boot" | "waiting" | "active" | "failed";

interface GameRunnerProps {
  mode: GameMode;
}

const DAILY_ATTEMPT_KEY = "taprush:dailyAttempt";
const BEST_KEY = "taprush:best";

export function GameRunner({ mode }: GameRunnerProps) {
  const { soundsEnabled } = useGameSettings();
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [phase, setPhase] = useState<Phase>("boot");
  const [overlay, setOverlay] = useState<OverlayState>("idle");
  const [cue, setCue] = useState<Cue>(pickCue(1));
  const [tapEnabled, setTapEnabled] = useState(false);
  const [dailyLocked, setDailyLocked] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  const windowTimer = useRef<number | null>(null);
  const cueTimer = useRef<number | null>(null);
  const overlayTimer = useRef<number | null>(null);
  const runRoundRef = useRef<() => void>(() => undefined);
  const levelRef = useRef(1);
  const streakRef = useRef(0);
  const scoreRef = useRef(0);

  const challenge = useMemo(() => dailyChallengeConfig(), []);

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
      oscillator.frequency.value = type === "tap" ? 320 : type === "good" ? 540 : 180;
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
    if (windowTimer.current) window.clearTimeout(windowTimer.current);
    if (cueTimer.current) window.clearTimeout(cueTimer.current);
    if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
    windowTimer.current = null;
    cueTimer.current = null;
    overlayTimer.current = null;
  }, []);

  const failRound = useCallback(async () => {
    clearTimers();
    setTapEnabled(false);
    setPhase("failed");
    setOverlay("fail");
    playSound("bad");

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

    if (scoreRef.current > best) {
      setBest(scoreRef.current);
      window.localStorage.setItem(BEST_KEY, String(scoreRef.current));
    }

    trackEvent("run_failed", { level: levelRef.current, score: scoreRef.current, mode });
  }, [best, challenge.date, clearTimers, mode, playSound]);

  const advanceSuccess = useCallback(
    (currentLevel: number, currentStreak: number, currentScore: number) => {
      const earned = scoreFromLevel(currentLevel, currentStreak + 1);
      const nextLevel = currentLevel + 1;
      const nextStreak = currentStreak + 1;
      const nextScore = currentScore + earned;

      setOverlay("success");
      setTapEnabled(false);
      setStreak(nextStreak);
      setLevel(nextLevel);
      setScore(nextScore);
      playSound("good");

      trackEvent("round_success", { mode, level: currentLevel, score: nextScore });
      overlayTimer.current = window.setTimeout(() => {
        setOverlay("idle");
        runRoundRef.current();
      }, 120);
    },
    [mode, playSound]
  );

  const runRound = useCallback(() => {
    clearTimers();
    const diff = getDifficulty(level);
    const selectedCue = pickCue(level);
    const fakeOut = shouldTriggerFakeOut(diff.fakeOutProbability + (mode === "daily" ? challenge.fakeOutBoost : 0));
    setCue(selectedCue);
    setPhase("waiting");
    setTapEnabled(false);

    cueTimer.current = window.setTimeout(() => {
      if (fakeOut) {
        setOverlay("fakeout");
        playSound("tap");
      }

      setPhase("active");
      setTapEnabled(true);
      if (selectedCue.tapAllowed) {
        windowTimer.current = window.setTimeout(() => {
          void failRound();
        }, Math.max(100, diff.reactionWindowMs - (mode === "daily" ? 20 : 0)));
      } else {
        windowTimer.current = window.setTimeout(() => {
          setOverlay("success");
          advanceSuccess(levelRef.current, streakRef.current, scoreRef.current);
        }, Math.max(100, diff.reactionWindowMs));
      }
    }, diff.delayBeforeCueMs + (mode === "daily" ? challenge.seed % 90 : 0));
  }, [advanceSuccess, challenge.fakeOutBoost, challenge.seed, clearTimers, failRound, level, mode, playSound]);

  useEffect(() => {
    runRoundRef.current = runRound;
  }, [runRound]);

  useEffect(() => {
    levelRef.current = level;
    streakRef.current = streak;
    scoreRef.current = score;
  }, [level, score, streak]);

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

    const attemptDate = window.localStorage.getItem(DAILY_ATTEMPT_KEY);
    if (mode === "daily" && attemptDate === todayIsoDate()) {
      setDailyLocked(true);
      setPhase("failed");
      return;
    }

    if (mode === "daily") {
      void hasDailyAttempt(player.id, todayIsoDate()).then((alreadyPlayed) => {
        if (alreadyPlayed) {
          setDailyLocked(true);
          setPhase("failed");
          return;
        }
        setPhase("waiting");
        runRound();
      });
    } else {
      setPhase("waiting");
      runRound();
    }

    trackEvent("session_started", { mode, date: todayIsoDate() });

    return () => {
      clearTimers();
    };
  }, [clearTimers, mode, runRound]);

  useEffect(() => {
    if (phase === "failed" && mode === "daily" && !dailyLocked) {
      window.localStorage.setItem(DAILY_ATTEMPT_KEY, todayIsoDate());
      setDailyLocked(true);
    }
  }, [dailyLocked, mode, phase]);

  const onTap = useCallback(() => {
    playSound("tap");

    if (!tapEnabled || phase !== "active") {
      void failRound();
      return;
    }

    if (cue.tapAllowed) {
      clearTimers();
      advanceSuccess(levelRef.current, streakRef.current, scoreRef.current);
      return;
    }

    void failRound();
  }, [advanceSuccess, clearTimers, cue.tapAllowed, failRound, phase, playSound, tapEnabled]);

  function retry() {
    if (mode === "daily" && dailyLocked) return;
    setLevel(1);
    setScore(0);
    setStreak(0);
    setRank(null);
    setOverlay("idle");
    setPhase("waiting");
    runRound();
    trackEvent("instant_replay", { mode });
  }

  return (
    <section className="relative space-y-4 pb-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Mode</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">{mode === "arcade" ? "Arcade Rush" : `Daily ${challenge.title}`}</h1>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--secondary)]">{phase.toUpperCase()}</p>
      </div>

      <ScoreDisplay score={score} best={best} />
      <LevelIndicator level={level} streak={streak} />

      <div className="relative rounded-3xl bg-[color-mix(in_srgb,var(--surface-low)_92%,transparent)] p-4">
        <AnimationOverlay state={overlay} />
        <TapArea cue={cue} active={phase === "active"} fakeOutActive={overlay === "fakeout"} onTap={onTap} disabled={phase === "failed"} />
      </div>

      {phase === "failed" ? (
        <div className="space-y-4 rounded-3xl bg-rose-400/10 p-4 text-center">
          <p className="text-sm font-semibold text-rose-200">Run ended at level {level}. One-tap replay is ready.</p>
          <button
            type="button"
            onClick={retry}
            disabled={mode === "daily" && dailyLocked}
            className="kinetic-button w-full rounded-full px-4 py-4 text-sm font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mode === "daily" && dailyLocked ? "Daily Attempt Used" : "Instant Replay"}
          </button>
          <ShareButtons mode={mode === "arcade" ? "Arcade" : "Daily"} level={level} rank={rank} />
          <p className="text-[11px] text-soft">Player ID: {playerId?.slice(0, 8) ?? "-"}</p>
        </div>
      ) : (
        <p className="text-center text-xs uppercase tracking-[0.2em] text-soft">
          {cue.tapAllowed ? "Tap inside reaction window" : "Do not tap this cue"}
        </p>
      )}
    </section>
  );
}
