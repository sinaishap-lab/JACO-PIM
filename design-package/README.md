# JACO PIM — Design Package

A portable **design package** for the JACO PIM app, derived from the **JACO PRINT**
brand. Hand it to the central branch and it will restyle everything you've already built
(products, suppliers, attributes, classification, materials…) — **without changing any
functionality**.

Your app is **shadcn/ui + Tailwind v4**, which is theme‑variable driven, so applying the
brand is mostly a theme swap.

## What's inside

| File | What it is |
|------|------------|
| `SKILL.md` | The design system spec — palette, gradient, fonts, RTL rules, conventions, do/don'ts, and the 4 apply steps. Doubles as a Claude Code skill. |
| `theme.css` | Drop‑in shadcn `:root` / `.dark` brand theme + gradient utilities. |
| `logo.svg` | The JACO PRINT gradient mark. |
| `apply-prompt.md` | A paste‑able prompt to hand to the agent on the central branch. |

## How to use it

**Option A — as a prompt (simplest):** copy the contents of `apply-prompt.md` and paste
it to the agent working on your central branch (with this `design-package/` folder
present in that branch).

**Option B — as a skill:** copy `SKILL.md` (plus `theme.css` and `logo.svg`) into
`.claude/skills/jaco-design/` on the central branch. The agent will pick it up whenever
it works on UI.

Either way the agent: swaps the theme in `app/globals.css`, loads the brand fonts, adds
the logo + RTL, and sweeps the existing screens — visual only.

## The brand in one line

Hot‑pink `#e93c86` · orange `#f47b2d` · gold `#fbbe18`, the orange→pink→gold gradient,
rounded & soft, Hebrew/RTL. Rubik for headings, Heebo for body.
