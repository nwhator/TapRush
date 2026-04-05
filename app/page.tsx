"use client";

import Link from "next/link";
import { useMemo } from "react";
import Image from "next/image";
import { AppShell } from "@/components/AppShell";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { ShareButtons } from "@/components/ShareButtons";
import { OnboardingModal } from "@/components/OnboardingModal";
import { getLocalPlayer } from "@/lib/player";
import { todayIsoDate } from "@/lib/daily";

export default function HomePage() {
  const player = useMemo(() => getLocalPlayer(), []);
  const today = todayIsoDate();

  return (
    <AppShell>
      <OnboardingModal />
      <section className="space-y-5 pb-8">
        <div className="relative overflow-hidden rounded-3xl px-5 py-7 glass-card">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -left-10 -bottom-14 h-40 w-40 rounded-full bg-pink-400/15 blur-3xl" />
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-soft">Reflex Challenge</p>
          <Image src="/logo-mark.svg" alt="TapRush logo" width={180} height={60} className="mt-2 h-auto w-[160px]" priority />
          <h1 className="mt-2 text-5xl font-black italic tracking-tight">
            TAP<span className="text-(--primary-strong)">RUSH</span>
          </h1>
          <p className="mt-2 text-sm text-soft">How far can your reflexes take you? Tap fast. Go further.</p>
          <div className="mt-6">
            <Link
              href="/game"
              className="kinetic-button block w-full rounded-full px-4 py-4 text-center text-sm font-black uppercase tracking-[0.2em]"
            >
              Play
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Live Global Top</h2>
            <Link href="/leaderboard" className="text-xs font-black uppercase tracking-[0.2em] text-(--primary)">
              Full Board
            </Link>
          </div>
          <LeaderboardTable mode="arcade" playerId={player.id} />
        </div>

        <div className="space-y-3 rounded-3xl bg-[color-mix(in_srgb,var(--surface-low)_85%,transparent)] p-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-soft">Share Your Heat</h3>
          <ShareButtons mode="Arcade" level={1} rank={null} />
          <p className="text-[11px] text-soft">Today&apos;s challenge key: {today}</p>
        </div>

        <div className="rounded-3xl bg-(--surface-low) p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Future Unlocks</p>
          <p className="mt-2 text-sm text-soft">Cosmetic trails, ad rewards, and booster packs can be plugged in here.</p>
        </div>
      </section>
    </AppShell>
  );
}
