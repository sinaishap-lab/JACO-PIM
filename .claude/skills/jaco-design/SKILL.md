---
name: jaco-design
description: JACO PIM design system — brand tokens, components, and RTL/Hebrew conventions. Use whenever building, editing, or reviewing ANY UI in this repo (new pages, screens, components, layouts, forms, styling). Read this BEFORE writing JSX or Tailwind classes so every screen stays on-brand and consistent.
---

# JACO PIM Design System

The visual language is derived from the **JACO PRINT** brand (jacoprint.com):
hot‑pink primary, warm‑orange mid, golden‑yellow secondary, the signature
**orange→pink→gold gradient**, rounded shapes, soft shadows, and a friendly,
clean feel. The app is **Hebrew, right‑to‑left**.

Stack: **Next.js 16 (App Router) · React 19 · Tailwind CSS v4** (config in CSS via
`@theme`, no `tailwind.config`). Path alias `@/*` → repo root.

## Golden rules

1. **Reuse the component library** in `components/ui` (barrel: `@/components/ui`).
   Do **not** hand‑roll a button/input/card/modal — compose existing ones.
2. **Use brand tokens, never raw hex.** Colors come from the `@theme` scales:
   `brand-*` (pink), `accent-*` (orange), `gold-*` (yellow), `ink-*` (neutrals),
   plus `success/warning/danger/info`. Surfaces: `bg-surface`, `bg-surface-muted`,
   text `text-ink-900`/`text-muted-foreground`, dividers `border-border`.
3. **RTL by default.** Use **logical** Tailwind utilities — `ps-/pe-`, `ms-/me-`,
   `start-/end-`, `border-s/border-e`, `text-start/text-end` — never hard `left/right`.
   For directional glyphs add `rtl:rotate-180`. The `<html>` is `dir="rtl" lang="he"`.
4. **Rounded + soft.** Cards/inputs use `rounded-xl`/`rounded-2xl`; buttons & status
   pills are fully round (`rounded-full`). Shadows: `shadow-sm` → `shadow-md` →
   `shadow-lg`, brand glow `shadow-brand`.
5. **Typography.** Headings use the display face (`font-display`, Rubik) and are
   bold/black; body is `font-sans` (Heebo). Both load in `app/layout.tsx`.
6. **The gradient is a signature, not a background.** Use `bg-brand-gradient` /
   `text-brand-gradient` for hero accents, the logo mark, primary CTAs, big stats —
   sparingly. Default primary action = `Button variant="gradient"` or `"primary"`.

## Brand gradient

`linear-gradient(135deg, brand-500 0%, accent-500 52%, gold-500 100%)` — available as
the utilities `bg-brand-gradient`, `text-brand-gradient`, `ring-brand-gradient`
(defined in `app/globals.css`). Exact hex: pink `#e93c86`, orange `#f47b2d`,
gold `#fbbe18`.

## Component catalog (`@/components/ui`)

- **Brand:** `Logo` (variants `full`/`wordmark`/`mark`, layouts `stacked`/`horizontal`).
- **Core:** `Button` (variants `primary|gradient|accent|outline|ghost|subtle|danger`,
  sizes `sm|md|lg`, `leftIcon`/`rightIcon`/`block`), `Badge` (tones + `dot`),
  `Card` (+ `CardHeader/Title/Description/Body/Footer`).
- **Forms:** `Field` (label/hint/error wrapper) + `Input`/`Textarea`/`Select`,
  `Switch`, `Checkbox`, `Radio`. Pass `invalid` for error state.
- **Data:** `Table` (+ `THead/TBody/TR/TH/TD`), `Avatar`/`AvatarGroup`,
  `Progress`, `Skeleton`, `EmptyState`.
- **Overlays/feedback:** `Dialog` + `ConfirmDialog`, `ToastProvider`/`useToast`,
  `DropdownMenu` (+ `DropdownItem/Separator/Label`), `Tooltip`, `Alert`.
- **Navigation:** `Tabs` (+ `TabsList/Trigger/Content`), `Breadcrumbs`, `Pagination`.
- **App shell:** `Sidebar` (+ `SidebarSection/Item`), `AppHeader` + `IconButton`.

Icons: lightweight inline set in `@/components/icons` (e.g. `BoxIcon`, `SearchIcon`,
`PlusIcon`). Add new ones there in the same lucide‑style, 24×24, `stroke=currentColor`.

## App architecture

- Screens live in the `app/(app)/` route group; `app/(app)/layout.tsx` wraps them in
  `AppShell` (brand sidebar with active‑route nav + `ToastProvider`). **A new app
  screen** = a page in that group that renders its own `<AppHeader …/>` then
  `<main className="flex-1 space-y-6 overflow-y-auto p-6">…</main>`. Don't re‑add a
  sidebar or another `ToastProvider`.
- Full‑bleed pages (login, 404, the `/design-system` catalog) live **outside** the
  group and use only the root layout.
- Shared mock data: `app/(app)/_data.ts`.

### New‑screen skeleton

```tsx
"use client"; // only if the screen has interactivity (state, toasts, dialogs)
import { AppHeader, Button, Card, CardBody /* … */ } from "@/components/ui";

export default function MyScreen() {
  return (
    <>
      <AppHeader title="כותרת" actions={<Button variant="gradient">פעולה</Button>} />
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        <Card><CardBody>…</CardBody></Card>
      </main>
    </>
  );
}
```

Prefer **server components**; add `"use client"` only when you need state, effects,
`useToast`, dialogs, or event handlers. To navigate, use `next/link`.

## Patterns & conventions

- **Primary CTA:** `Button variant="gradient"`. Secondary: `outline`. Tertiary: `ghost`.
  Destructive: `danger` (+ `ConfirmDialog` for irreversible actions).
- **Status:** map domain states to `Badge` tones (`active→success`, `low→warning`,
  `out→danger`, `draft→info`). Keep a single `STATUS_META` map, like in `_data.ts`.
- **Feedback:** confirm saves/deletes with `useToast()` (`tone: "success" | "danger" | …`).
- **Empty/loading:** use `EmptyState` for no‑data and `Skeleton` for loading — never a
  bare "no results" string.
- **Numbers/KPIs:** big stats use `text-3xl font-black` with `text-brand-gradient` or a
  semantic color.
- **Tables:** wrap with `Table`; status column → `Badge`; stock/quantity → `Progress`.
- **Accessibility:** every icon‑only control gets an `aria-label` (use `IconButton`);
  inputs get a `<Field label>` and matching `htmlFor`/`id`.

## Don'ts

- ❌ Raw hex / arbitrary colors (`bg-[#ff0000]`) — use the token scales.
- ❌ Physical direction utilities (`pl-`, `ml-`, `left-`, `text-left`) — use logical ones.
- ❌ New ad‑hoc buttons/inputs/modals — extend or reuse `components/ui`.
- ❌ Square, hard‑shadowed, or flat‑gray UI — keep it rounded, soft, warm.
- ❌ Adding a dependency for something the library already covers (cn, toasts, dialogs…).

## Reference

Live catalog of every token and component: route **`/design-system`**
(`app/design-system/page.tsx`). When unsure how something should look, match it there.
