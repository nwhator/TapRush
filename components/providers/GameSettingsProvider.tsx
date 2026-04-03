"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ThemeMode } from "@/types";

interface GameSettingsContextValue {
  theme: ThemeMode;
  soundsEnabled: boolean;
  tapEffect: "neon" | "fire" | "lightning";
  setTheme: (value: ThemeMode) => void;
  setSoundsEnabled: (value: boolean) => void;
  setTapEffect: (value: "neon" | "fire" | "lightning") => void;
}

const GameSettingsContext = createContext<GameSettingsContextValue | null>(null);
const STORAGE_KEY = "taprush:settings";

export function GameSettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("neon");
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [tapEffect, setTapEffect] = useState<"neon" | "fire" | "lightning">("neon");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      document.documentElement.dataset.theme = "neon";
      return;
    }

    try {
      const parsed = JSON.parse(saved) as {
        theme?: ThemeMode;
        soundsEnabled?: boolean;
        tapEffect?: "neon" | "fire" | "lightning";
      };

      if (parsed.theme) {
        setTheme(parsed.theme);
        document.documentElement.dataset.theme = parsed.theme;
      }
      if (typeof parsed.soundsEnabled === "boolean") {
        setSoundsEnabled(parsed.soundsEnabled);
      }
      if (parsed.tapEffect) {
        setTapEffect(parsed.tapEffect);
      }
    } catch {
      document.documentElement.dataset.theme = "neon";
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ theme, soundsEnabled, tapEffect })
    );
  }, [theme, soundsEnabled, tapEffect]);

  const value = useMemo(
    () => ({
      theme,
      soundsEnabled,
      tapEffect,
      setTheme,
      setSoundsEnabled,
      setTapEffect
    }),
    [theme, soundsEnabled, tapEffect]
  );

  return <GameSettingsContext.Provider value={value}>{children}</GameSettingsContext.Provider>;
}

export function useGameSettings() {
  const ctx = useContext(GameSettingsContext);
  if (!ctx) {
    throw new Error("useGameSettings must be used inside GameSettingsProvider");
  }
  return ctx;
}
