import { Plus_Jakarta_Sans, Spline_Sans } from "next/font/google";
import "./globals.css";
import { GameSettingsProvider } from "@/components/providers/GameSettingsProvider";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });
const headlineFont = Spline_Sans({ subsets: ["latin"], variable: "--font-headline" });

export const metadata = {
  title: "TapRush: Mind Games",
  description: "Mobile-first infinite reaction game with social leaderboards.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="neon">
      <body className={`${bodyFont.variable} ${headlineFont.variable}`}>
        <GameSettingsProvider>{children}</GameSettingsProvider>
      </body>
    </html>
  );
}
