"use client";

import clsx from "clsx";
import type { ThemeMode } from "@/types";
import { useGameSettings } from "@/components/providers/GameSettingsProvider";

const themes: ThemeMode[] = ["light", "dark", "neon"];

export function ThemeSwitcher() {
  const { theme, setTheme } = useGameSettings();

  return (
    <div className="grid grid-cols-3 gap-3">
      {themes.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          className={clsx(
            "rounded-2xl px-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition",
            option === theme
              ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_18px_rgba(0,255,255,0.25)]"
              : "glass-card text-soft hover:text-[var(--text)]"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
