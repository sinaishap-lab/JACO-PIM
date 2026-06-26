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

## Architecture

- **App Router** only — all routes live under `app/`. `app/layout.tsx` is the root layout (loads Geist fonts via `next/font/google`, sets `<html>`/`<body>`); `app/page.tsx` is the index route.
- **Styling**: Tailwind CSS v4 via the PostCSS plugin (`postcss.config.mjs`); global styles and Tailwind layers in `app/globals.css`. There is no `tailwind.config` file — v4 is configured in CSS.
- **TypeScript**: strict mode; path alias `@/*` maps to the repo root (e.g. `@/app/...`).
