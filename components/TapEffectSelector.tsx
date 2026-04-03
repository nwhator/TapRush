"use client";

import clsx from "clsx";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";

const effects = [
  { key: "neon", label: "Neon" },
  { key: "fire", label: "Fire" },
  { key: "lightning", label: "Lightning" }
] as const;

export function TapEffectSelector() {
  const { tapEffect, setTapEffect } = useGameSettings();

  return (
    <div className="grid grid-cols-3 gap-3">
      {effects.map((effect) => (
        <button
          key={effect.key}
          type="button"
          onClick={() => setTapEffect(effect.key)}
          className={clsx(
            "rounded-2xl px-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition",
            tapEffect === effect.key
              ? "bg-lime-300/20 text-lime-200 shadow-[0_0_16px_rgba(132,204,22,0.35)]"
              : "glass-card text-soft hover:text-[var(--text)]"
          )}
        >
          {effect.label}
        </button>
      ))}
    </div>
  );
}
