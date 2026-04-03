# Design System Strategy: Neon Kineticism

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Electric Pulse."** 

This system is designed to reject the static, "boxy" nature of traditional mobile interfaces in favor of a UI that feels alive, caffeinated, and perpetually in motion. We are moving away from the "app" aesthetic and toward a "high-end digital instrument." 

By utilizing intentional asymmetry, overlapping neon elements, and high-contrast typography scales, we create a sense of frantic energy that is paradoxically organized. The goal is to make the player feel like they are interacting with a living organism of light and speed.

## 2. Colors: High-Contrast Luminosity
The palette is built on a "Void & Vapor" philosophy. The background is a near-total darkness (`surface`), allowing the neon accents to vibrate against the eye.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. In this system, boundaries are invisible. Use background color shifts—such as a `surface-container-low` card resting on a `surface` background—to define edges. If an edge feels too soft, use a light-source glow, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as stacked sheets of tinted, frosted glass. 
*   **Base:** `surface` (#0e0e0e) for the global background.
*   **Secondary Context:** `surface-container-low` (#131313) for large layout blocks.
*   **Active Elements:** `surface-container-highest` (#262626) for interactive cards.
This nesting creates a "sink" or "lift" effect that guides the eye without needing structural lines.

### The "Glass & Gradient" Rule
To achieve the "High-Energy" requirement, never use flat neons for large surfaces. Apply subtle linear gradients (e.g., `primary` transitioning to `primary_container`) for main CTAs. Use `backdrop-blur` (12px to 20px) on all overlays to ensure the neon energy of the gameplay bleeds through the UI.

### Signature Textures
Apply a subtle "Inner Glow" to primary containers using a 10% opacity version of the `primary` token. This makes the UI elements appear as if they are internally illuminated, rather than printed on the screen.

## 3. Typography: The Competitive Voice
The typography is a binary system: **Spline Sans** for the "Game Personality" (Impact) and **Plus Jakarta Sans** for the "Player Intelligence" (Function).

*   **Display & Headline (Spline Sans):** Use `display-lg` and `headline-lg` for scores and "Level Up" moments. These should feel massive and unapologetic. The wide aperture of Spline Sans conveys the "Modern" and "Minimalistic" feel while maintaining high energy.
*   **Titles & Body (Plus Jakarta Sans):** Use `title-md` and `body-lg` for navigation, instructions, and settings. This font provides the "Clean Functional" requirement, ensuring that even in a high-speed game, the player never struggles to read the mechanics.
*   **The Hierarchy Rule:** Always pair a `display-lg` score with a `label-sm` (all caps, tracked out +10%) to create an editorial, premium contrast.

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "soft" for this high-energy system. We use light to create depth.

*   **The Layering Principle:** Stack `surface-container-lowest` (#000000) cards on top of `surface-bright` (#2c2c2c) sections to create a deep, recessed "well" effect for data displays.
*   **Ambient Shadows:** If a floating action button requires a shadow, use a 8% opacity tint of `primary` (Electric Cyan). The blur should be high (24px) with 0px offset to mimic an ambient neon glow rather than a directional drop shadow.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline_variant` at **15% opacity**. This creates a "suggestion" of a border that doesn't break the fluid glass aesthetic.
*   **Glassmorphism:** All modal overlays must use `surface_container` at 70% opacity with a heavy `backdrop-filter: blur(15px)`.

## 5. Components

### Buttons
*   **Primary (The Kinetic Button):** Gradient of `primary` to `primary_dim`. Roundedness: `full`. No border. Add a subtle outer glow on the `hover/active` state using the `surface_tint`.
*   **Secondary:** Ghost style. No background fill. `outline` token at 20% opacity. Text in `on_surface`.

### Chips & Stats
*   **Selection Chips:** Use `tertiary` (Lime Green) for active states to signal "Go/Ready." 
*   **Live Score Chips:** `surface_container_highest` with a 2px left-accent bar of `secondary` (Neon Pink).

### Input Fields
*   **Text Inputs:** No bottom line. Use `surface_container_low` with a `md` (0.75rem) corner radius. When focused, the background should shift to `surface_container_high` with a subtle glow from the `primary` token.

### Cards & Lists
*   **Strict Rule:** No dividers. Use 16px or 24px of vertical white space to separate list items. For complex lists, use alternating background tints between `surface_container_low` and `surface_container_lowest`.

### Progress Bars (The "Rush" Meter)
*   A custom component for this system. A thick bar using `surface_variant` as the track, with a `primary` to `tertiary` gradient fill. The leading edge of the progress bar should have a "bloom" (glow) effect to simulate speed.

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts for scoreboards (e.g., massive score on the left, tiny labels on the right).
*   **Do** use "Motion Blur" transitions—UI elements should slide in with a slight scale-up and fade.
*   **Do** lean into the "Neon Pink" (`secondary`) for competitive/high-stress elements like timers or "Defeat" screens.

### Don't:
*   **Don't** use pure white for body text; use `on_surface_variant` (#adaaaa) to reduce eye strain against the dark background.
*   **Don't** use sharp 90-degree corners. Everything must feel "Smooth" per the design request (use `lg` or `xl` tokens).
*   **Don't** use standard Material Design drop shadows. If it doesn't look like a neon tube glowing, it doesn't belong in this system.