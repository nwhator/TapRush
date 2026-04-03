export function HowToPlayCard() {
  return (
    <div className="space-y-3 rounded-3xl bg-[var(--surface-low)] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">How To Play</p>
      <ol className="space-y-2 text-sm text-soft">
        <li>1. Watch the cue in the center tap area.</li>
        <li>2. Tap quickly when the cue says tap.</li>
        <li>3. Do not tap on fake-out or forbidden cues.</li>
        <li>4. Survive longer to climb levels and leaderboard rank.</li>
      </ol>
      <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200">Tip: Early levels are intentionally easier. Pace yourself.</p>
    </div>
  );
}
