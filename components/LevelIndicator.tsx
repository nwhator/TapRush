interface LevelIndicatorProps {
  level: number;
  streak: number;
}

export function LevelIndicator({ level, streak }: LevelIndicatorProps) {
  return (
    <div className="glass-card flex items-end justify-between rounded-3xl px-5 py-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Complexity</p>
        <p className="text-2xl font-black uppercase tracking-tight">Lvl {level}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Streak</p>
        <p className="text-xl font-black text-[var(--secondary)]">{streak}x</p>
      </div>
    </div>
  );
}
