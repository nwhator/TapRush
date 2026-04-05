import { Plus_Jakarta_Sans, Spline_Sans } from "next/font/google";
import "./globals.css";
import { GameSettingsProvider } from "@/components/providers/GameSettingsProvider";

const bodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });
const headlineFont = Spline_Sans({ subsets: ["latin"], variable: "--font-headline" });
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taprush.vercel.app";

export const metadata = {
  title: "TapRush – The Fast-Paced Reflex Game You Can't Put Down",
  description:
    "TapRush is a lightning-fast, infinitely replayable reaction game. Climb endless levels, crush the live leaderboard, and prove your reflexes are elite.",
  metadataBase: new URL(appUrl),
  applicationName: "TapRush",
  keywords: [
    "taprush",
    "reaction game",
    "reflex game",
    "fast-paced game",
    "mobile arcade",
    "leaderboard",
    "daily challenge",
    "tap game",
    "skill game"
  ],
  openGraph: {
    type: "website",
    siteName: "TapRush",
    title: "TapRush – Tap Fast. Go Further. Beat Everyone.",
    description:
      "Infinite levels. Lightning reflexes required. Compete on live global leaderboards and see how far you can really go.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TapRush – Fast-paced reflex game"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TapRush – Tap Fast. Go Further. Beat Everyone.",
    description:
      "Infinite levels. Lightning reflexes required. Compete on live global leaderboards and see how far you can really go.",
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
