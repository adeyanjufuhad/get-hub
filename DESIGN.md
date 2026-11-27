---
version: "2.0"
name: GET-Hub-Design-System
description: >-
  Warm-cream editorial & engineering-folio interface for GET Hub (OAU 200L Faculty of Technology).
  Synthesizes VoltAgent/awesome-design-md (warm cream parchment + charcoal ink + single tangerine
  signal + obsidian dark showcase bands), tasteskill 2.5 (anti-slop plain copy, equal container
  edges, two-level maximum card nesting, real product chrome & real textbook schematics), and
  Vercel Web Interface Guidelines (strict :focus-visible rings, skip links, semantic forms, CLS-free
  dimensions, tabular numerals, color-scheme parity, and 44px mobile touch ergonomics).

colors:
  canvas: "#FAF9F5"
  surface: "#FFFFFF"
  surface-subtle: "#F3F1EA"
  paper-folio: "#FFFDF9"
  surface-dark: "#141413"
  surface-dark-elevated: "#1E1F23"
  ink: "#141413"
  body: "#3D3D3A"
  muted: "#686660"
  hairline: "#E6E2D8"
  border-strong: "#D4CFC3"
  accent: "#EA580C"
  accent-hover: "#C2410C"
  accent-soft: "#FFF1EB"
  accent-border: "#FDBA74"
  on-accent: "#FFFFFF"
  on-dark: "#FAF9F5"
  on-dark-muted: "#A3A098"
  success: "#15803D"
  success-soft: "#ECFDF3"
  danger: "#DC2626"
  danger-soft: "#FEF2F2"
  warning: "#B45309"
  warning-soft: "#FFFBEB"

typography:
  display-xl:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  display-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body-md:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  folio-prose:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.985rem"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "0"
  code-label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"

rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "24px"
  pill: "9999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "72px"

components:
  button-primary-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.pill}"
    minHeight: "44px"
    padding: "0 20px"
  button-primary-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    minHeight: "44px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.pill}"
    minHeight: "44px"
    padding: "0 20px"
  card-standard:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    padding: "24px"
  notebook-folio-sheet:
    backgroundColor: "{colors.paper-folio}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.xl}"
  showcase-dark-band:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.xl}"
    padding: "32px"
  form-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    minHeight: "46px"
    fontSize: "16px"
---

# GET Hub — Design System (`DESIGN.md`)

Canonical visual and interaction specification for **GET Hub** (Obafemi Awolowo University 200L Faculty of Technology: `GET 205`, `GET 207`, `GET 209`, and the 14-course Part 2 Library). Built on three pillars:
1. **`VoltAgent/awesome-design-md`** (Claude warm-editorial cream + Vercel monochrome discipline + Notion reading calm)
2. **`tasteskill 2.5`** (`design-taste-frontend` anti-slop copy, equal container edges, two-level card nesting cap, real product UI & authentic textbook plates)
3. **Vercel Web Interface Guidelines** (`vercel.com/design/guidelines` accessibility, `:focus-visible`, form ergonomics, CLS prevention, `tabular-nums`, and touch safety)

---

## 1. Visual Theme & Atmosphere

GET Hub feels like an **engineering coursebook folio paired with a precision CBT terminal** — warm enough to read derivations for an hour without eye strain, sharp enough to time a 15-question mechanics exam on a mid-range Android phone.

The interface alternates across **three disciplined surface modes** (90–95% neutral):
1. **Warm Cream Canvas (`{colors.canvas}` `#FAF9F5` / Dark `#0F1012`):** Default floor across landing, auth, dashboard, and runners. Never cold slate-gray or sterile `#FFFFFF` as the page floor.
2. **Crisp Paper & Card Surfaces (`{colors.surface}` `#FFFFFF` & `{colors.paper-folio}` `#FFFDF9`):** Content cards, question sheets, and ruled engineering notebook folios separated by `1px` warm hairlines (`#E6E2D8`).
3. **Obsidian Ink Anchors (`{colors.surface-dark}` `#141413`):** Used selectively for the resume-study hero card, mobile bottom dock, pre-footer callout, and closing editorial footer.

---

## 2. Color Palette & Roles

| Token | Light | Dark | Role |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#FAF9F5` | `#0F1012` | Page background (`color-scheme: light` / `dark` on `<html>`) |
| `--bg-surface` | `#FFFFFF` | `#181A1E` | Standard cards, modals, sheets, inputs on subtle grounds |
| `--bg-subtle` | `#F3F1EA` | `#22252B` | Segmented control wells, table headers, quiet badges |
| `--paper-bg` | `#FFFDF9` | `#181B21` | Ruled textbook / engineering notebook folio sheet |
| `--border-hairline` | `#E6E2D8` | `#2C3038` | Primary `1px` structural border |
| `--border-strong` | `#D4CFC3` | `#3B404C` | Notebook edges, active outlines, diagram frames |
| `--text-primary` | `#141413` | `#F5F5F4` | Warm off-black ink (never harsh `#000000`) |
| `--text-secondary` | `#3D3D3A` | `#A9AFBC` | Running prose, explanations, option labels (>= 7:1 on white) |
| `--text-muted` | `#686660` | `#858B99` | Metadata, timestamps, eyebrows (>= 4.5:1) |
| `--accent` | `#EA580C` | `#FB923C` | Engineering Tangerine — reserved (< 5% of screen) for active indicators, focus rings, key badges, and high-signal CTAs |
| `--ink-cta` | `#141413` | `#F5F5F4` | Default primary filled pill button |

**Never use violet, purple, or lavender (`tasteskill` rule).**

---

## 3. Typography Rules

- **Display & UI Sans:** `Plus Jakarta Sans` (`--font-jakarta`).
  - Hero `h1`: `clamp(2rem, 5vw, 3.75rem)`, weight `800`, line-height `1.08`, tracking `-0.03em`, `text-wrap: balance`.
  - Section `h2`: `clamp(1.5rem, 3vw, 2rem)`, weight `800`, line-height `1.15`, tracking `-0.025em`, `text-wrap: balance`.
  - Card `h3`: `1.0625rem–1.125rem`, weight `700`, line-height `1.35`, tracking `-0.015em`.
  - Body & Card Copy: `0.9375rem–1rem`, line-height `1.6–1.72`, `text-pretty`, capped at `65ch`.
- **Technical Monospace:** `JetBrains Mono` (`--font-jetbrains`) for course codes (`GET 205`), folio numbers (`FOLIO 01/03`), textbook citations, units (`kPa`, `N·m`), and countdown clocks. Protect codes (`GET 205`, `GET Hub`) with `translate="no"` so browser auto-translate never rewrites `"GET"`.
- **Tabular Numerals:** `font-variant-numeric: tabular-nums` (`.tabular`) on every score, streak, percentage, file size, timer, and question index.
- **Micro-Typography (Vercel Guidelines):** Use real ellipsis `…` (never `...`), curly apostrophes/quotes, en-dashes `–` for numeric ranges (`320–430px`), and non-breaking spaces between numbers and units (`2 KB`, `15 min`).

---

## 4. Layout Principles (`tasteskill` + `awesome-design-md` + `emil-design-eng`)

1. **Equal Left & Right Content Edges:** Every section on a page shares the exact same container max-width (`max-w-5xl` / `1024px` across landing and app shell) and horizontal gutter (`px-4 sm:px-6`) so left and right edges form one unbroken vertical line.
2. **Concentric Border-Radius Rule (`Outer Radius = Inner Radius + Padding`):** Every container `div` holding buttons or nested rounded tiles MUST match its outer radius to the inner radius plus its padding:
   - Compact tray / segmented control (`p-1` = `4px`): `rounded-[16px]` outer → `rounded-[12px]` inner button (`12 + 4 = 16`).
   - Button dock / action bar (`p-1.5` = `6px` or `p-2` = `8px`): `rounded-[18px]` / `rounded-[20px]` outer → `rounded-[12px]` inner button (`12 + 6 = 18`, `12 + 8 = 20`).
   - Standard card / drawer with buttons (`p-3` = `12px`): `rounded-[24px]` outer → `rounded-[12px]` inner button (`12 + 12 = 24`).
   - Roomy card / form / modal with buttons (`p-4` = `16px` / `sm:p-5` = `20px`): `rounded-[28px] sm:rounded-[32px]` outer → `rounded-[12px]` inner button (`12 + 16 = 28`, `12 + 20 = 32`).
   - Pill containers (`rounded-full` + `p-1.5`): `rounded-full` inner controls.
3. **Two Levels, Never Three:** Cards hold content or a single visual plate (`card > plate` or `card > row`). Avoid triple-nested bordered boxes (`card > bordered box > bordered white box`).
4. **4px Spacing Rhythm:** `4, 8, 12, 16, 24, 32, 48, 72px`.
5. **Scroll Margin Clearance:** `scroll-padding-top: 5.5rem` on `<html>` so sticky headers never cover anchored headings or focused controls.

---

## 5. Elevation & Depth

- **Color-Block & Hairline First:** Standard cards sit flat on `--bg-canvas` with `--bg-surface` fill and a `1px solid var(--border-hairline)` border — zero fuzzy drop-shadows at rest.
- **Tactile Paper Folio Exception:** `.notebook-sheet` uses crisp zero-blur stacked page offsets (`3px` / `6px` desktop, `2px` / `3.5px` mobile) to evoke a physical engineering workbook.
- **Floating Chrome Only:** Soft shadows are reserved for floating navigation bars, Vaul bottom sheets, and figure zoom dialogs.

---

## 6. Component Stylings & States

- **Buttons:** Strictly two primary shapes — filled pill (`variant="ink"` default, `variant="accent"` for primary conversion moments) and hairline pill (`variant="secondary"`). Minimum height `44px` on touch viewports; tactile `:active { transform: scale(0.97) }`.
- **Focus Ring (Vercel Guidelines):** Never strip outlines without replacement. All links and buttons show `:focus-visible` `2px solid var(--accent)` with `2px` offset; all inputs/selects/textareas show `border-color: var(--accent)` + `3px` soft tangerine ring on `:focus-visible`.
- **Forms:** Explicit `<label htmlFor>`, `name`, `autoComplete`, `spellCheck={false}` on emails/codes/numeric inputs, `16px` minimum font size on mobile, placeholders ending with `…`, inline field errors with `role="alert"` / `aria-live="polite"`, and explicit `background-color` + `color` on `<select>`/`<option>` for Windows dark-mode legibility.
- **Dashboard Zero-SVG Rule:** Dashboard (`dashboard/page.tsx` and `prescribed-textbooks.tsx`) uses pure typography, raster textbook covers, and cropped textbook schematics — zero inline `<svg>` or icon imports.

---

## 7. Do's and Don'ts

### Do
- Write plain, factual, concrete copy grounded in real OAU 200L details (`GET 205`, `GET 207`, `GET 209`, Çengel, Hibbeler 14e, Stewart 7e, 9 lined folios, 72 server-graded questions, 14 Part 2 library courses).
- Keep numbers and facts 100% consistent across every section and page (`[fact-agree]`).
- Add explicit `width` and `height` on `<img>` tags to prevent Cumulative Layout Shift (CLS), `loading="lazy"` below the fold, and `aria-hidden="true"` on decorative icons.
- Provide a keyboard **Skip to main content** link as the first focusable element of every layout.

### Don't
- Never use AI-slop filler words (`delve`, `unlock`, `unleash`, `supercharge`, `seamless`, `effortless`, `revolutionary`, `game-changing`, `actually`, `truly`), fake testimonials, or leftover `"Draft – under review"` / `"Sample"` apologies on shipped UI.
- Never use `transition: all`, `user-scalable=no`, `<div onClick>` for buttons/links, or `outline-none` without `:focus-visible`.
- Never run continuous animations under `@media (prefers-reduced-motion: reduce)`.

---

## 8. Responsive Behavior

| Breakpoint | Width | Layout Rules |
| :--- | :--- | :--- |
| Small Phone | `320px–374px` | Single column; full-width stacked CTAs; `28px` ruled folio rhythm; `1.08em` KaTeX with `.math-scroll-x` horizontal containment; compact 5–6 icon bottom dock |
| Phone | `375px–639px` | Single column cards, 2-up compact action pills where labels are short (`>= 44px` height), sticky exam timer below `56px` mobile header |
| Tablet | `640px–1023px` | `76px` left icon rail (`md+`), 2-up course/feature grids, `32px` ruled folio rhythm with binder gutter |
| Desktop | `1024px–1440px+` | Hover-expanding `228px` rail on mouse pointers, 12-column bento splits (`7/5` and `8/4`), 3-up coursebook grids, centered `1024px` reading/content frame |

---

## 9. Agent Iteration Guide

1. Read `DESIGN.md` before modifying any route or component.
2. Reference semantic CSS variables (`var(--bg-canvas)`, `var(--bg-surface)`, `var(--text-primary)`, `var(--border-hairline)`, `var(--accent)`) — never introduce off-palette hex values.
3. Audit every UI edit against `.agents/skills/web-design-guidelines/references/command.md` and `.agents/skills/taste-skill/references/copy-tells.md`.
4. Verify with `npm run typecheck` and `npm run build` before committing.
