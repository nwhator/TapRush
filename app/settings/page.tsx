import { AppShell } from "@/components/AppShell";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SoundToggle } from "@/components/SoundToggle";
import { TapEffectSelector } from "@/components/TapEffectSelector";
import { HowToPlayCard } from "@/components/HowToPlayCard";
import { ProfileSettingsCard } from "@/components/ProfileSettingsCard";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="space-y-4 pb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Customization</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Game Settings</h1>
        </div>

        <div className="space-y-3 rounded-3xl bg-(--surface-low) p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Visual Theme</p>
          <ThemeSwitcher />
        </div>

        <div className="space-y-3 rounded-3xl bg-(--surface-low) p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Tap Effect</p>
          <TapEffectSelector />
        </div>

        <SoundToggle />

        <ProfileSettingsCard />

        <HowToPlayCard />

        <div className="rounded-3xl bg-(--surface-low) p-4 text-sm text-soft">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Monetization Placeholder</p>
          <p className="mt-2">Reserved slot for ad placements and cosmetic unlock storefront cards.</p>
        </div>
      </section>
    </AppShell>
  );
}
