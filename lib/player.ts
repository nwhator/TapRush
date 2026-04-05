import type { PlayerProfile } from "@/types";
import { supabase } from "@/lib/supabase";

const KEY = "taprush:player";
const FIRST_SEEN_KEY = "taprush:firstSeenAt";
const ONBOARDING_DONE_KEY = "taprush:onboardingDone";

function randomName() {
  const words = ["Neon", "Rush", "Pulse", "Flash", "Spark", "Volt"];
  // Math.random() is intentionally used here: the suffix is a cosmetic
  // display-name component, not a security token or secret.
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

/** Escape special ILIKE pattern characters so the value matches literally.
 * Single-quote escaping is unnecessary here because the Supabase client
 * uses parameterized queries under the hood; this only escapes LIKE
 * metacharacters (%, _) that would otherwise act as wildcards.
 */
function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Returns true when `name` is not already used by another player.
 * The check is case-insensitive, matching the unique DB index on lower(name).
 */
export async function checkUsernameAvailable(name: string, currentUserId: string): Promise<boolean> {
  if (!supabase) return true;

  const { data } = await supabase
    .from("users")
    .select("id")
    .ilike("name", escapeIlike(name.trim()))
    .neq("id", currentUserId)
    .limit(1);

  return !data?.length;
}

/**
 * Syncs the local player profile to Supabase.
 * Returns `{ error }` with a user-facing message when the username is already taken.
 */
export async function ensurePlayerInSupabase(player: PlayerProfile): Promise<{ error?: string }> {
  if (!supabase) return {};

  const { error } = await supabase.from("users").upsert(
    {
      id: player.id,
      name: player.name,
      email: player.email ?? null,
      avatar: player.avatar ?? null
    },
    { onConflict: "id" }
  );

  if (error?.code === "23505") {
    return { error: "Username already taken. Please choose a different name." };
  }

  return {};
}
