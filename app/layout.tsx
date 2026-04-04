import { Plus_Jakarta_Sans, Spline_Sans } from "next/font/google";
import "./globals.css";
import { GameSettingsProvider } from "@/components/providers/GameSettingsProvider";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });
const headlineFont = Spline_Sans({ subsets: ["latin"], variable: "--font-headline" });
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taprush.vercel.app";

export const metadata = {
  title: "TapRush: Mind Games",
  description: "Mobile-first infinite reaction game with social leaderboards.",
  metadataBase: new URL(appUrl),
  applicationName: "TapRush: Mind Games",
  keywords: ["taprush", "reaction game", "mobile game", "leaderboard", "daily challenge"],
  openGraph: {
    type: "website",
    siteName: "TapRush: Mind Games",
    title: "TapRush: Mind Games",
    description: "Fast, addictive reaction game with infinite levels and live leaderboards.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TapRush: Mind Games"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TapRush: Mind Games",
    description: "Fast, addictive reaction game with infinite levels and live leaderboards.",
    images: ["/twitter-image"]
  },
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
