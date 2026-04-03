"use client";

import clsx from "clsx";
import type { Cue } from "@/types";
import { cueClassName } from "@/lib/game";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";

interface TapAreaProps {
  cue: Cue;
  active: boolean;
  fakeOutActive: boolean;
  disabled?: boolean;
  onTap: () => void;
}

export function TapArea({ cue, active, fakeOutActive, disabled, onTap }: TapAreaProps) {
  const { tapEffect } = useGameSettings();

  const fxClass =
    tapEffect === "fire"
      ? "shadow-[0_0_45px_rgba(251,146,60,0.45)]"
      : tapEffect === "lightning"
        ? "shadow-[0_0_45px_rgba(168,85,247,0.45)]"
        : "shadow-[0_0_45px_rgba(34,211,238,0.45)]";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTap}
      className={clsx(
        "group relative mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-full transition duration-150 active:scale-95",
        disabled ? "opacity-70" : "opacity-100",
        cueClassName(cue.colorToken, active),
        "shadow-[inset_0_0_0_8px_rgba(255,255,255,0.08)]",
        fxClass
      )}
    >
      <span className="absolute -inset-8 rounded-full bg-cyan-300/10 blur-3xl" />
      {fakeOutActive ? (
        <span className="absolute inset-0 rounded-full bg-rose-300/35 animate-pulse" />
      ) : null}
      <span className="relative text-center">
        <span className="block text-xs font-black uppercase tracking-[0.22em] text-black/60">Cue</span>
        <span className="mt-1 block px-4 text-xl font-black uppercase tracking-tight text-black/80">{cue.label}</span>
      </span>
    </button>
  );
}
