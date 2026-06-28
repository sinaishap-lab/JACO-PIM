# Prompt — apply the JACO PRINT design to the JACO PIM app

> Paste this to the agent working on the central branch (the one with the real app:
> products, suppliers, attributes, classification, materials…).

---

Apply the **JACO PRINT design system** to this app. The brand spec and assets are in the
`design-package/` folder: read `design-package/SKILL.md` and `design-package/theme.css`
first.

This is a **re‑skin only**. Do **NOT** change features, data, `lib/services`, schemas,
server actions, validation, or routes — visual styling only. The app is shadcn/ui +
Tailwind v4, so most of the rebrand happens by swapping theme variables.

Do exactly this:

1. **Theme** — In `app/globals.css`, replace the values inside the `:root` and `.dark`
   blocks with the brand values from `design-package/theme.css`. Keep the existing
   `@theme inline { … }` mapping and every variable name. Append the gradient utilities
   (`.bg-brand-gradient`, `.text-brand-gradient`).

2. **Fonts** — In `app/layout.tsx`, load `Rubik` + `Heebo` via `next/font/google`
   (subsets `["hebrew","latin"]`, exposing `--font-rubik` / `--font-heebo`). Make
   headings use the display face. Keep `--font-sans: var(--font-heebo)`.

3. **RTL + logo** — Ensure the root layout is `<html dir="rtl" lang="he">`. Copy
   `design-package/logo.svg` to `public/` and show it in the sidebar/header.

4. **Sweep all existing screens** — products, product detail/new, suppliers, attributes,
   classification, materials, dashboard layout, etc. Replace any hardcoded colors with
   theme tokens and any physical‑direction utilities (`pl-/ml-/left-/text-left`) with
   logical ones (`ps-/ms-/start-/text-start`). Use the gradient as a signature accent on
   the primary CTA, the logo, and key numbers — sparingly.

5. **Verify** — `npm run lint` and `npm run build` must pass. Spot‑check a couple of
   screens (ideally a screenshot) to confirm the brand looks right in RTL. Report what
   changed; do not alter behavior.

Follow `design-package/SKILL.md` for the palette, conventions, and do/don'ts.
