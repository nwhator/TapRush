# TapRush: Mind Games

![TapRush Logo](./public/logo-mark.svg)

High-speed, mobile-first reflex game built for instant replay loops.

TapRush drops players into an infinite reaction gauntlet where cues get tighter, fake-outs get nastier, and leaderboards update in real time.

## Why This Hits

- Infinite arcade runs with automatic difficulty scaling
- Daily mode with up to 10 attempts per day and global shared challenge
- Realtime Supabase leaderboards for global and daily rankings
- One-tap instant replay flow tuned for short addictive sessions
- Share-ready result cards for WhatsApp, X, and copy link
- Theme + SFX + tap-effect customization for style and feel
- Analytics event hook points for product tuning and growth

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TailwindCSS 4
- Supabase (Postgres + Realtime)
- TypeScript

## Quick Start

1. Install dependencies

```bash
npm install
```

1. Set local environment variables

```bash
copy .env.example .env.local
```

1. Add your Supabase values in `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

1. Run the app

```bash
npm run dev
```

## Supabase Setup

1. Open Supabase SQL editor
2. Apply [supabase/schema.sql](supabase/schema.sql)
3. Confirm Realtime includes `public.scores`

Schema includes:

- `users`: player profile data
- `scores`: run results for arcade and daily
- `daily_challenges`: seeded daily challenge payload
- row-level security policies
- indexed daily attempt counts per user/date for fast limit checks

## Routes

- `/`: home splash, quick play, and live top entries
- `/game`: infinite arcade mode
- `/daily`: daily challenge with up to 10 attempts
- `/leaderboard`: global, daily, and friends scope tabs
- `/settings`: theme, sound, and tap effect controls

## Core Gameplay Logic

- Reaction window shrinks per level (floored at 100ms)
- Fake-out probability rises each level
- Cue delay randomization introduces timing uncertainty
- Cue set expands with higher levels (reverse and hint behavior)
- Score derived from level plus streak intensity

## Branding + Visual Vibe

- Neon kineticism with layered dark glass surfaces
- Cyan/lime/pink energy accents
- High-contrast typography (Spline Sans + Plus Jakarta Sans)
- No hard border-heavy layout blocks
- Motion-focused transitions for feedback and momentum

Logo and icon assets:

- App icon/favicons: [app/icon.svg](app/icon.svg)
- Brand mark: [public/logo-mark.svg](public/logo-mark.svg)
- Header logo component: [components/BrandLogo.tsx](components/BrandLogo.tsx)

## Scripts

```bash
npm run dev        # local dev
npm run build      # production build
npm run start      # run built app
npm run lint       # lint checks
npm run typecheck  # ts checks
```

## Project Structure

```text
app/
   page.tsx
   game/page.tsx
   daily/page.tsx
   leaderboard/page.tsx
   settings/page.tsx
   layout.tsx
   globals.css
components/
   GameRunner.tsx
   TapArea.tsx
   LeaderboardTable.tsx
   ShareButtons.tsx
   BrandLogo.tsx
lib/
   game.ts
   scores.ts
   daily.ts
   player.ts
   supabase.ts
supabase/
   schema.sql
```

## Future Extensions

- Cosmetic unlock economy
- Rewarded ads and session multipliers
- Seasonal challenge ladders
- Clan/friends invite graph

Tap hard. Fail fast. Replay instantly.
