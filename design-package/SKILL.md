---
name: jaco-design
description: JACO PRINT brand design system for the JACO PIM app — colors, gradient, typography, logo, and exactly how to apply them to a shadcn/ui + Tailwind v4 codebase. Use whenever styling or restyling ANY UI in JACO PIM so every existing screen matches the JACO PRINT brand. This is a re-skin spec — it changes the look, never the features.
---

# JACO PIM — Brand Design System

Derived from the **JACO PRINT** brand (jacoprint.com): hot‑pink primary, warm‑orange
mid, golden‑yellow secondary, the signature **orange→pink→gold gradient**, rounded
and soft, **Hebrew / RTL**.

**Target stack:** Next.js App Router · React · **Tailwind CSS v4** · **shadcn/ui**
(semantic CSS variables, light + dark). Because shadcn is theme‑variable driven, the
whole app rebrands by changing the theme — **do not change features, data, services,
schemas, or routes. Visual only.**

## How to apply (4 steps)

1. **Theme** — In `app/globals.css`, replace the values in the `:root` and `.dark`
   blocks with the brand values from `theme.css` (keep your existing
   `@theme inline { … }` mapping and all variable names). Append the gradient
   utilities. Every existing `bg-primary`, `text-primary-foreground`, `border-border`,
   `bg-sidebar`, `rounded-lg`, `ring`, chart color, etc. rebrands automatically.

2. **Fonts** — In `app/layout.tsx`, load Rubik + Heebo and expose them; the theme sets
   `--font-sans: var(--font-heebo)` and `--font-display: var(--font-rubik)`:
   ```tsx
   import { Rubik, Heebo } from "next/font/google";
   const rubik = Rubik({ variable: "--font-rubik", subsets: ["hebrew", "latin"] });
   const heebo = Heebo({ variable: "--font-heebo", subsets: ["hebrew", "latin"] });
   // <html lang="he" dir="rtl" className={`${rubik.variable} ${heebo.variable}`}>
   ```
   Make headings use the display face:
   ```css
   h1, h2, h3, h4 { font-family: var(--font-display); letter-spacing: -0.01em; }
   ```

3. **Logo + RTL** — Drop `logo.svg` into `public/` and use it in the sidebar/header.
   Ensure the root is `<html dir="rtl" lang="he">`, and prefer **logical** Tailwind
   utilities (`ps-/pe-`, `ms-/me-`, `start-/end-`, `border-s/border-e`,
   `text-start/end`) over physical `left/right`. Directional icons get `rtl:rotate-180`.

4. **Sweep** — Go screen by screen and replace any hardcoded colors with theme tokens
   and any physical‑direction utilities with logical ones. Add the gradient as a
   signature accent where it fits (logo mark, primary CTA, big KPI numbers).

## Palette (exact)

| Role | Hex | Notes |
|------|-----|-------|
| **Pink** (primary) | `#e93c86` | scale: 50 `#fdecf4` · 400 `#ee5896` · 500 `#e93c86` · 700 `#b01f5e` · 900 `#5a1031` |
| **Orange** (mid) | `#f47b2d` | gradient midpoint |
| **Gold** (secondary) | `#fbbe18` | the "PRINT" color |
| Gradient | `linear-gradient(135deg,#e93c86,#f47b2d 52%,#fbbe18)` | `.bg-brand-gradient` / `.text-brand-gradient` |
| Ink / neutrals | `#18181b` → `#f7f7f8` | warm grays |
| Surface / muted / border | `#ffffff` / `#f5f5f7` / `#ececef` | |
| success / warning / danger / info | `#16a34a` / `#f47b2d` / `#e11d48` / `#2563eb` | |

Full shadcn variable mapping (light + dark) lives in **`theme.css`**.

## Conventions

- **Rounded & soft:** `--radius: 1rem`; cards `rounded-xl`/`2xl`; buttons & status pills
  `rounded-full`; soft shadows.
- **Gradient is a signature, not a background** — use sparingly: logo mark, hero, the
  primary CTA, large stat numbers.
- **Buttons:** primary action → shadcn `Button` default (pink) or a gradient CTA;
  secondary → `outline`; tertiary → `ghost`; destructive → `destructive`.
- **Status:** map domain states to shadcn `Badge` tones — active→green, low→amber/orange,
  out→red, draft→blue.
- **Charts/visuals:** use `--chart-1..5` (pink/orange/gold/…).
- **Typography:** headings = display (Rubik, bold/black); body = Heebo.

## Don'ts

- ❌ Don't touch features, data, `lib/services`, schemas, server actions, or routes.
- ❌ No raw hex in components — use theme tokens (`bg-primary`, `text-muted-foreground`…).
- ❌ No physical‑direction utilities (`pl-`, `ml-`, `left-`, `text-left`) — logical only.
- ❌ Don't flatten the brand to gray — keep it pink/warm, rounded, soft.

## Package contents

- `theme.css` — drop‑in shadcn `:root` / `.dark` brand theme + gradient utilities.
- `logo.svg` — JACO PRINT gradient mark.
- `apply-prompt.md` — a paste‑able prompt to hand to the agent on the central branch.
- `README.md` — handoff instructions.
