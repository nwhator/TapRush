import type { PlayerProfile } from "@/types";
import { supabase } from "@/lib/supabase";

const KEY = "taprush:player";
const FIRST_SEEN_KEY = "taprush:firstSeenAt";
const ONBOARDING_DONE_KEY = "taprush:onboardingDone";

function randomName() {
  const words = ["Neon", "Rush", "Pulse", "Flash", "Spark", "Volt"];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${words[Math.floor(Math.random() * words.length)]}_${suffix}`;
}

export function getLocalPlayer(): PlayerProfile {
  const fallback: PlayerProfile = {
    id: crypto.randomUUID(),
    name: randomName()
  };

  if (typeof window === "undefined") return fallback;

  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as PlayerProfile;
  } catch {
    window.localStorage.setItem(KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveLocalPlayer(player: PlayerProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(player));
}

export function getOnboardingState() {
  if (typeof window === "undefined") {
    return { isFirstTime: false, isOnboarded: true };
  }

  const firstSeen = window.localStorage.getItem(FIRST_SEEN_KEY);
  const onboardingDone = window.localStorage.getItem(ONBOARDING_DONE_KEY) === "1";

  if (!firstSeen) {
    window.localStorage.setItem(FIRST_SEEN_KEY, new Date().toISOString());
    return { isFirstTime: true, isOnboarded: onboardingDone };
  }

  return {
    isFirstTime: false,
    isOnboarded: onboardingDone
  };
}

export function markOnboardingDone() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_DONE_KEY, "1");
}

export function updatePlayerProfile(patch: Partial<PlayerProfile>) {
  const current = getLocalPlayer();
  const updated = {
    ...current,
    ...patch
  };
  saveLocalPlayer(updated);
  return updated;
}

export async function ensurePlayerInSupabase(player: PlayerProfile) {
  if (!supabase) return;

  await supabase.from("users").upsert(
    {
      id: player.id,
      name: player.name,
      email: player.email ?? null,
      avatar: player.avatar ?? null
    },
    { onConflict: "id" }
  );
}
