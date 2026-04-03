import clsx from "clsx";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <div className={clsx("flex items-center", compact ? "gap-2" : "gap-3", className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#00ffff,#ff6b9b)] shadow-[0_0_24px_rgba(0,255,255,0.35)]">
        <span className="absolute inset-[2px] rounded-[10px] bg-(--surface)" />
        <span className="relative text-sm font-black text-(--primary)">TR</span>
      </span>
      <span className="font-black uppercase tracking-[0.2em] text-(--primary)">
        TapRush
      </span>
    </div>
  );
}
