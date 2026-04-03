"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { fetchLeaderboard } from "@/lib/scores";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { GameMode, ScoreRow } from "@/types";

interface LeaderboardTableProps {
  mode: GameMode;
  challengeDate?: string;
  playerId?: string;
  scope?: "all" | "friends";
}

export function LeaderboardTable({ mode, challengeDate, playerId, scope = "all" }: LeaderboardTableProps) {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const data = await fetchLeaderboard(mode, challengeDate);
      if (mounted) {
        setRows(data);
        setLoading(false);
      }
    }

    load();

    if (!supabase) return;

    const channel = supabase
      .channel(`scores-${mode}-${challengeDate ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scores" },
        async () => {
          const refreshed = await fetchLeaderboard(mode, challengeDate);
          setRows(refreshed);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [mode, challengeDate]);

  const visibleRows = useMemo(() => {
    if (scope !== "friends" || !playerId) return rows;
    const friendKey = playerId.slice(0, 2);
    return rows.filter((row) => row.user_id.slice(0, 2) === friendKey);
  }, [playerId, rows, scope]);

  const playerRank = useMemo(() => {
    if (!playerId) return null;
    const index = visibleRows.findIndex((row) => row.user_id === playerId);
    return index >= 0 ? index + 1 : null;
  }, [visibleRows, playerId]);

  if (!hasSupabaseConfig) {
    return <p className="text-sm text-soft">Connect Supabase env vars to view live leaderboard data.</p>;
  }

  return (
    <div className="space-y-3">
      {loading ? <p className="text-sm text-soft">Loading leaderboard...</p> : null}
      {!loading && visibleRows.length === 0 ? <p className="text-sm text-soft">No scores in this scope yet.</p> : null}
      {visibleRows.map((row, index) => {
        const mine = row.user_id === playerId;
        return (
          <div
            key={row.id}
            className={clsx(
              "glass-card flex items-center justify-between rounded-2xl px-4 py-3",
              mine && "bg-cyan-400/15"
            )}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">#{index + 1}</p>
              <p className="text-sm font-bold uppercase tracking-wide">{row.users?.name ?? "Anonymous"}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-[var(--tertiary)]">Lv {row.level_reached}</p>
              <p className="text-xs text-soft">{row.score_value.toLocaleString()} pts</p>
            </div>
          </div>
        );
      })}
      {playerRank ? (
        <p className="rounded-xl bg-cyan-300/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Your Rank #{playerRank}</p>
      ) : null}
    </div>
  );
}
