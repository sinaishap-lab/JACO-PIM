# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: read the bundled docs first

This project pins **Next.js 16.2.9** (App Router) and **React 19.2.4** — newer than most training data, with breaking changes. Before writing or editing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/`. The App Router docs live in `01-app/` (getting-started guides in `01-app/01-getting-started/`, API reference in `01-app/03-api-reference/`). Heed deprecation notices.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test runner is configured.

## Design system — read before building any UI

This repo has a complete, brand‑derived design system. **Before writing or editing any
UI (pages, screens, components, styling), read `.claude/skills/jaco-design/SKILL.md`**
and reuse `@/components/ui`. The system is Hebrew/RTL and built on the JACO PRINT brand
(hot‑pink + orange + gold gradient, rounded, soft). The live catalog of every token and
component is the route `/design-system`.

Quick rules: use brand tokens (`brand-*`/`accent-*`/`gold-*`/`ink-*`), never raw hex;
use logical RTL utilities (`ps-/pe-`, `ms-/me-`, `start-/end-`), never `left/right`;
compose existing components instead of hand‑rolling buttons/inputs/modals.

## Architecture

- **App Router** only — all routes live under `app/`. `app/layout.tsx` is the root layout
  (Hebrew/RTL, loads **Rubik** + **Heebo** via `next/font/google`, sets `<html dir="rtl" lang="he">`).
- **App screens** live in the `app/(app)/` route group; `app/(app)/layout.tsx` wraps them
  in `AppShell` (brand sidebar + `ToastProvider`). The dashboard is `app/(app)/page.tsx` (route `/`).
  Full‑bleed pages (`app/login`, `app/not-found`, `app/design-system`) sit outside the group.
- **Styling**: Tailwind CSS v4 via the PostCSS plugin (`postcss.config.mjs`); design tokens and
  global styles in `app/globals.css` via `@theme`. There is no `tailwind.config` file.
- **UI library**: `components/ui` (barrel `@/components/ui`); inline icons in `components/icons.tsx`;
  `cn()` helper in `lib/cn.ts`.
- **TypeScript**: strict mode; path alias `@/*` maps to the repo root.
