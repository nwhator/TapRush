"use client";

import { useEffect, useState } from "react";
import { ensurePlayerInSupabase, getLocalPlayer, getOnboardingState, markOnboardingDone, updatePlayerProfile } from "@/lib/player";

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [firstTime, setFirstTime] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const player = getLocalPlayer();
    const state = getOnboardingState();
    setFirstTime(state.isFirstTime);

    const generatedNamePattern = /^(Neon|Rush|Pulse|Flash|Spark|Volt)_\d{3}$/;
    const needsProfile = !state.isOnboarded || generatedNamePattern.test(player.name);

    if (needsProfile) {
      setName(player.name ?? "");
      setEmail(player.email ?? "");
      setOpen(true);
    }
  }, []);

  async function completeOnboarding() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;

    setSaving(true);
    const updated = updatePlayerProfile({
      name: trimmedName,
      email: email.trim() || undefined
    });
    markOnboardingDone();
    await ensurePlayerInSupabase(updated);
    setSaving(false);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md space-y-4 rounded-3xl bg-(--surface-low) p-5 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Welcome</p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-tight">{firstTime ? "First Run Setup" : "Profile Setup"}</h2>
          <p className="mt-2 text-sm text-soft">
            {firstTime
              ? "Looks like this is your first time. Set your player name so your leaderboard identity sticks."
              : "Add your preferred player details so your name appears correctly on leaderboards."}
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Display Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Your TapRush name"
            className="w-full rounded-2xl bg-(--surface-high) px-4 py-3 text-sm text-(--text) outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Email (Optional)</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl bg-(--surface-high) px-4 py-3 text-sm text-(--text) outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
          />
        </label>

        <button
          type="button"
          disabled={saving || name.trim().length < 2}
          onClick={() => {
            void completeOnboarding();
          }}
          className="kinetic-button w-full rounded-full px-4 py-3 text-sm font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
