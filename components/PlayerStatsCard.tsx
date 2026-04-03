"use client";

import { useEffect, useState } from "react";
import { fetchPlayerStats } from "@/lib/scores";
import type { PlayerStats } from "@/types";

interface PlayerStatsCardProps {
  userId: string;
}

const fallbackStats: PlayerStats = {
  totalRuns: 0,
  arcadeBestLevel: 0,
  dailyBestLevel: 0,
  bestScore: 0
};

export function PlayerStatsCard({ userId }: PlayerStatsCardProps) {
  const [stats, setStats] = useState<PlayerStats>(fallbackStats);

  useEffect(() => {
    let mounted = true;
    void fetchPlayerStats(userId).then((result) => {
      if (mounted) setStats(result);
    });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Arcade Best</p>
        <p className="mt-1 text-2xl font-black text-[var(--tertiary)]">Lv {stats.arcadeBestLevel}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Daily Best</p>
        <p className="mt-1 text-2xl font-black text-[var(--secondary)]">Lv {stats.dailyBestLevel}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Top Score</p>
        <p className="mt-1 text-2xl font-black">{stats.bestScore.toLocaleString()}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Total Runs</p>
        <p className="mt-1 text-2xl font-black">{stats.totalRuns}</p>
      </div>
    </div>
  );
}
