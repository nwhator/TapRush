"use client";

import { useMemo } from "react";

interface ShareButtonsProps {
  level: number;
  rank?: number | null;
  mode: "Arcade" | "Daily";
}

export function ShareButtons({ level, rank, mode }: ShareButtonsProps) {
  const shareText = useMemo(
    () => `I reached level ${level} in TapRush: Mind Games (${mode})${rank ? ` and ranked #${rank}` : ""}. Can you beat me?`,
    [level, rank, mode]
  );

  function copyLink() {
    const url = window.location.origin;
    navigator.clipboard.writeText(`${shareText} ${url}`);
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${typeof window !== "undefined" ? window.location.origin : ""}`)}`;

  return (
    <div className="flex items-center justify-center gap-3">
      <a href={waUrl} target="_blank" className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
        WhatsApp
      </a>
      <a href={xUrl} target="_blank" className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
        X
      </a>
      <button type="button" onClick={copyLink} className="rounded-full bg-cyan-400/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
        Copy
      </button>
    </div>
  );
}
