import type { PlayerProfile } from "@/types";
import { supabase } from "@/lib/supabase";

const KEY = "taprush:player";

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
