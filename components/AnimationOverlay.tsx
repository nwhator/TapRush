"use client";

import clsx from "clsx";

interface AnimationOverlayProps {
  state: "idle" | "success" | "fail" | "fakeout";
}

export function AnimationOverlay({ state }: AnimationOverlayProps) {
  if (state === "idle") return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl">
      {state === "success" ? (
        <div className="absolute inset-0 bg-emerald-400/10">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-300 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
          <div className="absolute left-1/2 top-1/3 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
        </div>
      ) : null}

      {state === "fail" ? (
        <div className="absolute inset-0 animate-pulse bg-rose-500/20">
          <div className="absolute inset-y-0 left-0 w-1 bg-rose-300" />
          <div className="absolute inset-y-0 right-0 w-1 bg-rose-300" />
        </div>
      ) : null}

      {state === "fakeout" ? (
        <div className="absolute inset-0 bg-amber-300/20">
          <div className={clsx("absolute inset-0", "animate-pulse", "bg-amber-200/15")} />
        </div>
      ) : null}
    </div>
  );
}
