"use client";

import { useEffect, useState } from "react";
import { checkUsernameAvailable, ensurePlayerInSupabase, getLocalPlayer, updatePlayerProfile } from "@/lib/player";

export function ProfileSettingsCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const player = getLocalPlayer();
    setName(player.name ?? "");
    setEmail(player.email ?? "");
  }, []);

  async function saveProfile() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return;

    setStatus("saving");
    setErrorMsg(null);

    const player = getLocalPlayer();

    // Pre-check username availability before persisting locally.
    const available = await checkUsernameAvailable(trimmedName, player.id);
    if (!available) {
      setErrorMsg("Username already taken. Please choose a different name.");
      setStatus("idle");
      return;
    }

    const updated = updatePlayerProfile({
      name: trimmedName,
      email: email.trim() || undefined
    });

    const { error } = await ensurePlayerInSupabase(updated);
    if (error) {
      setErrorMsg(error);
      setStatus("idle");
      return;
    }

    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1400);
  }

  return (
    <div className="space-y-3 rounded-3xl bg-(--surface-low) p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Player Profile</p>

      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrorMsg(null);
        }}
        maxLength={20}
        placeholder="Display name"
        className="w-full rounded-2xl bg-(--surface-high) px-4 py-3 text-sm text-(--text) outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
      />

      {errorMsg ? (
        <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>
      ) : null}

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
        disabled={name.trim().length < 2 || status === "saving"}
        className="kinetic-button w-full rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.2em] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "saved" ? "Saved" : status === "saving" ? "Checking…" : "Save Profile"}
      </button>
    </div>
  );
}
