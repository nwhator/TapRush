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
  const isLightSurface = active && (activeColor === "yellow" || activeColor === "orange" || activeColor === "cyan" || activeColor === "green");
  const titleTextClass = isLightSurface ? "text-black/80" : "text-white/95";
  const mainTextClass = isLightSurface ? "text-black/88" : "text-white";
  const hintTextClass = isLightSurface ? "text-black/72" : "text-white/80";
  const colorPillClass = isLightSurface ? "bg-black/12 text-black" : "bg-white/20 text-white";

  const fxClass =
    tapEffect === "fire"
      ? "shadow-[0_0_30px_rgba(251,146,60,0.32)]"
      : tapEffect === "lightning"
        ? "shadow-[0_0_30px_rgba(168,85,247,0.32)]"
        : "shadow-[0_0_30px_rgba(34,211,238,0.32)]";

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
        <span className="absolute -inset-3 rounded-[3rem] bg-cyan-300/6 blur-2xl" />
        {relayState === "relay" ? <span className="absolute inset-0 rounded-[2.5rem] bg-black/28" /> : null}
        <span className="relative text-center">
          <span
            className={clsx(
              "block text-xs font-black uppercase tracking-[0.22em]",
              titleTextClass,
              pulseRuleChange && "scale-[1.01]"
            )}
          >
            {actionLabel}{" "}
            <span className={clsx("inline-block rounded-full px-2 py-0.5", colorPillClass)}>{colorLabel(activeColor)}</span>
          </span>
          <span className={clsx("mt-2 block px-4 text-4xl font-black uppercase tracking-[0.02em]", mainTextClass)}>{colorLabel(activeColor)}</span>
          <span className={clsx("mt-4 block text-xs font-bold uppercase tracking-[0.18em]", hintTextClass)}>
            {relayState === "relay" ? "Ready..." : "Tap this panel only"}
          </span>
        </span>
      </button>
    </div>
  );
}
