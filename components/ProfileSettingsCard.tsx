"use client";

import { useEffect, useState } from "react";
import { ensurePlayerInSupabase, getLocalPlayer, updatePlayerProfile } from "@/lib/player";

export function ProfileSettingsCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    const player = getLocalPlayer();
    setName(player.name ?? "");
    setEmail(player.email ?? "");
  }, []);

  async function saveProfile() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;

    const updated = updatePlayerProfile({
      name: trimmedName,
      email: email.trim() || undefined
    });
    await ensurePlayerInSupabase(updated);
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  return (
    <div className="space-y-3 rounded-3xl bg-(--surface-low) p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Player Profile</p>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        placeholder="Display name"
        className="w-full rounded-2xl bg-(--surface-high) px-4 py-3 text-sm text-(--text) outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email (optional)"
        className="w-full rounded-2xl bg-(--surface-high) px-4 py-3 text-sm text-(--text) outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
      />

      <button
        type="button"
        onClick={() => {
          void saveProfile();
        }}
        disabled={name.trim().length < 2}
        className="kinetic-button w-full rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saved" ? "Saved" : "Save Profile"}
      </button>
    </div>
  );
}
