"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PlayerStatsCard } from "@/components/PlayerStatsCard";
import { getLocalPlayer } from "@/lib/player";
import { todayIsoDate } from "@/lib/daily";

const tabs = [
  { key: "global", label: "Global" },
  { key: "daily", label: "Today" },
  { key: "friends", label: "Friends" }
] as const;

export default function LeaderboardPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("global");
  const player = useMemo(() => getLocalPlayer(), []);
  const today = todayIsoDate();

  const mode = tab === "daily" ? "daily" : "arcade";

  return (
    <AppShell>
      <section className="space-y-4 pb-8">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Rankings</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Leaderboard</h1>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={clsx(
                "rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em]",
                tab === t.key ? "bg-cyan-300/20 text-cyan-200" : "bg-white/5 text-soft"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <LeaderboardTable
          mode={mode}
          challengeDate={tab === "daily" ? today : undefined}
          playerId={player.id}
          scope={tab === "friends" ? "friends" : "all"}
        />

        <div className="rounded-3xl bg-[var(--surface-low)] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Your Stats</p>
          <div className="mt-3">
            <PlayerStatsCard userId={player.id} />
          </div>
        </div>
      </section>
    </AppShell>
  );
}
