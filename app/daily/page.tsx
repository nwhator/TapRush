import { AppShell } from "@/components/AppShell";
import { GameRunner } from "@/components/GameRunner";

export default function DailyPage() {
  return (
    <AppShell>
      <section className="space-y-4 pb-8">
        <div className="rounded-3xl bg-[var(--surface-low)] px-4 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Daily Challenge</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">One Attempt. Global Seed.</h1>
          <p className="mt-2 text-sm text-soft">Every player gets the same challenge shape each day. One run per player.</p>
        </div>
        <GameRunner mode="daily" />
      </section>
    </AppShell>
  );
}
