# GET Hub — Design System (`DESIGN.md`)

Built for **OAU 200L Faculty of Technology** students primarily on **mid-range Android phones and slow 3G/mobile data**. Combines light-mode edtech inspiration (clean alabaster surfaces, high-contrast ink pills, playful 2D drafting micro-details) with **Emil Kowalski's Design Engineering & Mobile-Native** principles.

## 1. Visual Tokens (Light-First, Zero 3D)
- **Canvas (`--bg-canvas`):** `#F8F8F6` (Warm Alabaster — gentle on the eyes during long reading sessions) | Dark: `#0F1012`
- **Elevated Surface (`--bg-surface`):** `#FFFFFF` | Dark: `#181A1E`
- **Subtle Surface (`--bg-subtle`):** `#F2F1EC` | Dark: `#22252B`
- **Hairline Border (`--border-hairline`):** `#E6E4DD` (`1px solid`) | Dark: `#2C3038`
- **Primary Text (`--text-primary`):** `#141413` | Dark: `#F5F5F4`
- **Secondary Text (`--text-secondary`):** `#4B5563` | Dark: `#A1A7B3`
- **Muted Text (`--text-muted`):** `#6B7280` | Dark: `#787E8B`
- **Single Cohesive Accent (`--accent`):** `#EA580C` (Engineering Tangerine) | Hover: `#C2410C` | Soft Tint: `#FFF1EB` | Dark: `#FB923C` / `#2B1B12`
- **Ink Primary CTA (`--ink-cta`):** `#141413` with `#FFFFFF` text (inverts cleanly in dark mode)
- **Semantic States:** Success `#15803D` (`#ECFDF3` tint), Danger `#DC2626` (`#FEF2F2` tint), Warning `#B45309` (`#FFFBEB` tint)

## 2. Typography & Readability
- **UI & Headings:** `Plus Jakarta Sans` — large display headings tightened to `-0.025em` tracking.
- **Code, Course Codes & Refs:** `JetBrains Mono` (`GET 203`, `CCMAS`, formulas metadata).
- **Numbers:** `font-variant-numeric: tabular-nums` on every timer, streak, accuracy percentage, and question counter so numbers never jitter.
- **Measure:** Topic reading prose capped at `max-width: 65ch`.

## 3. Mobile-Native Rules (`emilkowalski/skills/mobile-native`)
1. Viewport meta: `width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content` — **never** `user-scalable=no`.
2. Dual `theme-color` meta tags matching `--bg-canvas` for light and dark schemes.
3. `html { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }`.
4. All `input`, `textarea`, `select` font-size minimum `16px` to prevent unwanted mobile zoom.
5. `touch-action: manipulation` on all buttons, links, and `[role="button"]`.
6. `user-select: none` on interactive controls only — **never** on `body`, formulas, or prose.
7. `min-height: 100svh` for the landing hero (zero layout shift on scroll); `height: 100dvh` for the mock-exam shell; `overscroll-behavior: contain` on inner scrollable drawers/sheets.
8. Safe-area inset padding (`env(safe-area-inset-*)`) on sticky headers and the floating mobile bottom dock.
9. Minimum tap target size: `44px × 44px`.

## 4. Motion & Performance Rules (`emil-design-eng` + `performance-cheatsheet`)
1. **GPU-only:** Only animate `transform` and `opacity`. Never `transition: all`.
2. **Custom Curves:** `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. Never use `ease-in` on UI entrances.
3. **Durations:** Press feedback `100–150ms`; popovers/dropdowns `150–220ms`; drawers/sheets `220–350ms`.
4. **Press Feedback:** Tactile `:active { transform: scale(0.97); }` on all buttons and pressable cards.
5. **No `scale(0)`:** Entrances start at `scale(0.95)` + `opacity: 0`.
6. **Touch-Safe Hovers:** Every `:hover` rule is gated behind `@media (hover: hover) and (pointer: fine)`.
7. **Zero Animation on High-Frequency Actions:** Selecting quiz answers and keyboard shortcuts switch immediately with zero delay.
8. **Reduced Motion:** Under `@media (prefers-reduced-motion: reduce)`, strip spatial transforms and retain short opacity transitions.
