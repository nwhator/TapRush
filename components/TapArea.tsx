"use client";

import clsx from "clsx";
import type { GameColorToken } from "@/types";
import { colorLabel, colorSurfaceClass } from "@/lib/game";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";

interface TapAreaProps {
  activeColor: GameColorToken;
  forbiddenColor: GameColorToken;
  active: boolean;
  relayState: "relay" | "live";
  pulseRuleChange: boolean;
  disabled?: boolean;
  onTap: () => void;
}

export function TapArea({ activeColor, forbiddenColor, active, relayState, pulseRuleChange, disabled, onTap }: TapAreaProps) {
  const { tapEffect } = useGameSettings();
  const shouldAvoidTap = activeColor === forbiddenColor;
  const actionLabel = shouldAvoidTap ? "DO NOT TAP" : "TAP";

  const actionColorClass =
    activeColor === "yellow"
      ? "text-yellow-300"
      : activeColor === "orange"
        ? "text-orange-300"
        : activeColor === "purple"
          ? "text-violet-300"
          : activeColor === "cyan"
            ? "text-cyan-300"
            : activeColor === "green"
              ? "text-emerald-300"
              : activeColor === "blue"
                ? "text-sky-300"
                : "text-rose-300";

  const fxClass =
    tapEffect === "fire"
      ? "shadow-[0_0_45px_rgba(251,146,60,0.45)]"
      : tapEffect === "lightning"
        ? "shadow-[0_0_45px_rgba(168,85,247,0.45)]"
        : "shadow-[0_0_45px_rgba(34,211,238,0.45)]";

  return (
    <div className="relative flex min-h-full w-full items-center justify-center">
      <button
        type="button"
        disabled={disabled}
        onClick={onTap}
        className={clsx(
          "group relative mx-auto flex h-[min(48svh,27rem)] w-full max-w-[24rem] items-center justify-center rounded-[2.5rem] border-4 border-white/20 transition duration-120 active:scale-[0.98]",
          "touch-manipulation",
          disabled ? "opacity-70" : "opacity-100",
          colorSurfaceClass(activeColor, active),
          fxClass,
          relayState === "relay" && "grayscale-[0.35]"
        )}
      >
        <span className="absolute -inset-4 rounded-[3rem] bg-cyan-300/8 blur-3xl" />
        {relayState === "relay" ? <span className="absolute inset-0 rounded-[2.5rem] bg-black/28" /> : null}
        <span className="relative text-center">
          <span
            className={clsx(
              "block text-xs font-black uppercase tracking-[0.22em] text-black/65",
              pulseRuleChange && "animate-pulse"
            )}
          >
            {actionLabel} <span className={clsx("drop-shadow-[0_0_10px_rgba(255,255,255,0.22)]", actionColorClass)}>{colorLabel(activeColor)}</span>
          </span>
          <span className="mt-2 block px-4 text-4xl font-black uppercase tracking-[0.02em] text-black/75">{colorLabel(activeColor)}</span>
          <span className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-black/65">
            {relayState === "relay" ? "Ready..." : "Tap this panel only"}
          </span>
        </span>
      </button>
    </div>
  );
}
