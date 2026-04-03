interface ScoreDisplayProps {
  score: number;
  best: number;
}

export function ScoreDisplay({ score, best }: ScoreDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Score</p>
        <p className="mt-1 text-3xl font-black">{score.toLocaleString()}</p>
      </div>
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-soft">Personal Best</p>
        <p className="mt-1 text-3xl font-black text-[var(--tertiary)]">{best.toLocaleString()}</p>
      </div>
    </div>
  );
}
