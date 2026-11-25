---
name: awesome-design-md
description: >-
  Author, upgrade, and apply DESIGN.md design-system specifications from VoltAgent/awesome-design-md
  (Google Stitch DESIGN.md format). Use whenever creating or updating a project's DESIGN.md, defining
  visual tokens, typography hierarchy, surface rhythm, component states, elevation rules, or applying
  canonical brand design languages (such as Claude warm-editorial cream, Vercel monochrome precision,
  Notion warm knowledge workspace, or Cal.com neutral SaaS) across a frontend codebase.
---

# Awesome DESIGN.md Skill (`VoltAgent/awesome-design-md`)

`DESIGN.md` is a plain-text design-system specification (introduced by Google Stitch and curated across 80+ production products in `VoltAgent/awesome-design-md`) that gives AI coding agents an exact, unambiguous visual source of truth at the repository root.

| File | Primary Reader | Purpose |
| :--- | :--- | :--- |
| `AGENTS.md` | Coding agents | How to build, test, and verify the project |
| `DESIGN.md` | Design & frontend agents | Exact visual tokens, typography, component recipes, layout rhythm, and guardrails |

## Reference Design Systems Bundled in `references/`

Read the matching reference before authoring or applying a `DESIGN.md`:
- [references/README.md](references/README.md) — Catalog overview and Stitch 9-section specification.
- [references/claude-DESIGN.md](references/claude-DESIGN.md) — Warm tinted cream canvas (`#FAF9F5`), warm charcoal ink (`#141413`), terracotta/tangerine voltage accent, alternating cream-to-dark product showcase bands.
- [references/vercel-DESIGN.md](references/vercel-DESIGN.md) — High-contrast monochrome engineering precision, 1px hairline borders, tabular numerals, Geist/grotesk hierarchy, zero decorative shadow clutter.
- [references/notion-DESIGN.md](references/notion-DESIGN.md) — Warm paper reading surfaces, calm neutral chrome, knowledge-first hierarchy.
- [references/cal-DESIGN.md](references/cal-DESIGN.md) — Crisp open-source SaaS component states, high-contrast ink pill CTAs, clean form controls.

## Mandatory Structure of a Root `DESIGN.md`

Every project `DESIGN.md` must include:
1. **YAML Token Frontmatter**: `colors`, `typography`, `rounded`, `spacing`, and `components` using `{token.path}` references (never raw ad-hoc hex values in component definitions).
2. **Overview (Visual Theme & Atmosphere)**: Surface trinity (e.g. warm cream canvas, paper/elevated card, obsidian dark showcase), mood, and density.
3. **Color Palette & Roles**: 90–95% neutral surface budget; semantic roles for canvas, surface, subtle, hairline, ink, body, muted, single brand accent, and semantic status states in both light and dark modes.
4. **Typography Rules**: Display, heading, body, caption, and monospace tokens with exact sizes, weights, line-heights, negative display tracking, `tabular-nums`, and line-length caps (`60–68ch`).
5. **Layout Principles**: 4px base spacing scale, single shared container width (`equal left and right edges`), 12-column responsive grid, and maximum 2-level card nesting.
6. **Elevation & Depth**: Color-block and `1px` hairline border hierarchy first; shadows reserved strictly for floating overlays or physical paper folios.
7. **Component Stylings**: Explicit recipes and interactive states (`default`, `active`, `focus-visible`, `disabled`) for primary/secondary buttons, inputs, cards, tabs, badges, navigation, and footers.
8. **Do's and Don'ts**: Concrete visual, copy, and interaction guardrails.
9. **Responsive Behavior & Iteration Guide**: Breakpoints (`320px`, `390px`, `768px`, `1024px`, `1440px`), `44px` minimum touch targets, `16px` mobile input floor, and single-source token discipline.

## Workflow When Applying `DESIGN.md` to a Codebase

1. **Sync CSS Variables**: Map every `DESIGN.md` color, radius, spacing, and easing token into `:root` and `.dark` CSS custom properties (`globals.css`), including `color-scheme: light` / `color-scheme: dark`.
2. **Enforce Equal Container Edges**: Keep every band on the same max-width container line across a page so left and right edges align vertically.
3. **Enforce Two-Level Nesting Cap**: Never place a bordered card inside a bordered panel inside a bordered card (`card > visual/row`, never 3 nested boxes).
4. **Enforce Button & Accent Scarcity**: Keep 90–95% of the viewport neutral; use one primary filled CTA style (`ink` or `accent`) per view and one secondary hairline style.
5. **Verify Live Surfaces**: Ensure all pages (landing, auth, app shell, dashboard, content readers, forms, and runners) pull exclusively from `DESIGN.md` tokens and pass `tsc` + production build.
