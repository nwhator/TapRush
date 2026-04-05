"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { BrandLogo } from "@/components/BrandLogo";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaders" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-4 pb-32 pt-6">
      <header className="ambient-header sticky top-0 z-30 mb-5 flex items-center justify-between rounded-3xl bg-black/30 px-4 py-3 backdrop-blur-xl">
        <BrandLogo compact className="floating-logo" />
        <Link href="/settings" className="text-sm text-soft transition hover:text-(--text)">
          Tune
        </Link>
      </header>

      <div className="animate-slide-up">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-md items-center justify-around rounded-t-3xl bg-black/70 px-4 pb-6 pt-3 backdrop-blur-xl">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={active ? "true" : "false"}
              className={clsx(
                "nav-item rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition duration-200",
                active
                  ? "bg-cyan-300/20 text-cyan-300 shadow-[0_0_16px_rgba(0,255,255,0.35)]"
                  : "text-neutral-500 hover:text-cyan-100"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
