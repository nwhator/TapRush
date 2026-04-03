"use client";

import { useGameSettings } from "@/components/providers/GameSettingsProvider";

export function SoundToggle() {
  const { soundsEnabled, setSoundsEnabled } = useGameSettings();

  return (
    <button
      type="button"
      onClick={() => setSoundsEnabled(!soundsEnabled)}
      className="glass-card flex w-full items-center justify-between rounded-2xl px-4 py-4"
    >
      <span>
        <span className="block text-xs font-black uppercase tracking-[0.2em] text-soft">Sound FX</span>
        <span className="mt-1 block text-sm font-semibold">Tap, success, and fail cues</span>
      </span>
      <span
        className={
          soundsEnabled
            ? "rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-300"
            : "rounded-full bg-rose-400/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-rose-300"
        }
      >
        {soundsEnabled ? "On" : "Off"}
      </span>
    </button>
  );
}
