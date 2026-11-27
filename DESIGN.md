---
name: NeuroDose Assist
description: Bright clinical bento workspace grounded in maritime navy and clinical teal for neuropsychiatric dosing telemetry.
colors:
  clinical-navy: "#1B4965"
  clinical-navy-hover: "#14384E"
  abyssal-navy: "#0E293B"
  clinical-teal: "#2C7A7B"
  teal-mist: "#E8F4F4"
  seafoam-line: "#7FBFBF"
  clinical-emerald: "#1E7A4D"
  emerald-wash: "#E8F4ED"
  clinical-amber: "#B54708"
  amber-wash: "#FDF1E3"
  clinical-crimson: "#B42318"
  crimson-wash: "#FDECEA"
  alabaster-canvas: "#F4F6F8"
  frosted-stone: "#F8FAFC"
  pure-surface: "#FFFFFF"
  cool-mist: "#EEF2F5"
  hairline-slate: "#E5ECF1"
  input-slate: "#D5E0E8"
  hover-slate: "#B4C4D0"
  ink-navy: "#0F1E2E"
  graphite-label: "#374756"
  slate-secondary: "#5A6B7A"
  muted-icon: "#6D7F8E"
  placeholder-slate: "#546473"
typography:
  hero-display:
    fontFamily: "'Newsreader', Georgia, serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  display:
    fontFamily: "'Newsreader', Georgia, serif"
    fontSize: "2.375rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  headline:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  metric-compact:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  subtitle:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  caption:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
  label:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0em"
  nav-section:
    fontFamily: "'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  xs: "4px"
  sm: "6px"
  base: "8px"
  md: "12px"
  lg: "20px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  bento: "20px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  2xl: "48px"
  header: "72px"
components:
  button-primary-pill:
    backgroundColor: "{colors.clinical-navy}"
    textColor: "{colors.pure-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-primary-pill-hover:
    backgroundColor: "{colors.clinical-navy-hover}"
    textColor: "{colors.pure-surface}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-outline-pill:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-outline-pill-hover:
    backgroundColor: "{colors.cool-mist}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-hero-inverted:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.abyssal-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  circle-action:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.pill}"
    size: "34px"
  circle-action-hero:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.abyssal-navy}"
    rounded: "{rounded.pill}"
    size: "34px"
  card-bento:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.lg}"
    padding: "24px"
  card-hero:
    backgroundColor: "{colors.clinical-navy}"
    textColor: "{colors.pure-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  nav-item:
    backgroundColor: "{colors.frosted-stone}"
    textColor: "{colors.slate-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "42px"
  nav-item-active:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.clinical-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "42px"
  search-input:
    backgroundColor: "{colors.alabaster-canvas}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 56px 0 40px"
    height: "40px"
  clinical-input:
    backgroundColor: "{colors.pure-surface}"
    textColor: "{colors.ink-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "48px"
  status-chip-success:
    backgroundColor: "{colors.emerald-wash}"
    textColor: "{colors.clinical-emerald}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  status-chip-warning:
    backgroundColor: "{colors.amber-wash}"
    textColor: "{colors.clinical-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  status-chip-error:
    backgroundColor: "{colors.crimson-wash}"
    textColor: "{colors.clinical-crimson}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  status-chip-info:
    backgroundColor: "{colors.teal-mist}"
    textColor: "{colors.clinical-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
---

# Design System: NeuroDose Assist

## Overview

**Creative North Star: "The Luminous Clinical Deck"**

NeuroDose Assist replaces heavy, dark-rail medical dashboards with an airy, high-legibility clinical bento workspace built for rapid scanning between neuropsychiatric consultations. A cool-alabaster canvas supports generous white bento modules and a frosted-stone navigation rail, letting clinicians read active caseloads, 7-day pharmacological telemetry, and interaction warnings at a single glance without visual fatigue.

Rather than adopting generic emerald SaaS presets, the entire system commits to NeuroDose's maritime-clinical identity: Clinical Navy and Clinical Teal anchor primary calls to action, active navigation states, and data visualization, while a deep navy-to-teal hero gradient (`linear-gradient(145deg, #0E293B 0%, #1B4965 56%, #256873 100%)`) is reserved exclusively for focal anchors—the lead KPI card, the live last-dose tracker, and the compact sidebar dosing prompt. Every interactive pill control, hairline border, and tabular numeral is calibrated for WCAG 2.1 AA legibility in daily `pt-BR` clinical practice.

**Key Characteristics:**
- Bright cool-alabaster canvas paired with pure white rounded bento cards (`20px` radius) and crisp `1px` slate hairlines.
- Light frosted-stone navigation rail (`248px` expanded, `72px` icon-collapsed on desktop; slide-over drawer below `900px`) with white card-style active states instead of side-bar accent tabs.
- Full-pill interactive controls (`9999px` radius) led by a deep-to-clinical navy gradient CTA and white outlined secondary pills.
- Strict tabular numerals (`font-variant-numeric: tabular-nums`) across KPIs, dosing curves, appointment schedules, and pharmacological badges.
- Selective dark navy-teal gradient anchors layered with subtle seafoam topographic SVG wave lines to create depth without ornament overload.

## Colors

A disciplined maritime-clinical palette built on cool neutral paper, authoritative navy ink, clinical teal interactive accents, and muted semantic status washes that satisfy WCAG 2.1 AA contrast.

### Primary
- **Clinical Navy** (`#1B4965` / `--nd-primary`): Primary brand anchor for pill CTA gradients, active navigation text and icons, primary chart lines, brand badge fill, and focal gradient mid-stops.
- **Clinical Navy Hover** (`#14384E` / `--nd-primary-hover`): Darker pressed and hover state for solid primary controls (such as the authentication submit button).
- **Abyssal Navy** (`#0E293B` / `--nd-primary-deep`): Deepest brand anchor used at the origin of the hero gradient, peak telemetry bars, inverted text inside white hero pill buttons, and upcoming patient names.

### Secondary
- **Clinical Teal** (`#2C7A7B` / `--nd-accent`): Interactive companion accent for keyboard focus rings (`2px solid`), text carets, inline clinical links, active telemetry bars, and the start stop of the semicircular efficacy gauge.
- **Teal Mist** (`#E8F4F4` / `--nd-accent-soft`): Soft tinted fill for avatar fallbacks, informational badges (`7 dias`), icon wells, and hover fills on hero white pill buttons and circular triggers.
- **Seafoam Line** (`#7FBFBF` / `--nd-dark-accent-soft`): Fine translucent stroke (`opacity: 0.25`) used for topographic wave lines inside dark hero cards and soft highlights on the dark login showcase panel.

### Tertiary
- **Clinical Emerald & Emerald Wash** (`#1E7A4D` / `#E8F4ED`): Optimal therapeutic efficacy (`>=75%`), positive metric trends, online connectivity dot, confirmed appointment badges, and verified LGPD session status.
- **Clinical Amber & Amber Wash** (`#B54708` / `#FDF1E3`): Moderate efficacy (`50%–74%`), medium pharmacological risk, warning alerts, and offline connectivity pills.
- **Clinical Crimson & Crimson Wash** (`#B42318` / `#FDECEA`): Critical drug-interaction alerts, high risk levels, low efficacy (`<50%`), negative trend badges, and form validation errors.

### Neutral
- **Alabaster Canvas** (`#F4F6F8` / `--nd-bg`): Default page canvas behind all bento grids and resting fill for the header quick-search pill and connectivity status pill.
- **Frosted Stone** (`#F8FAFC` / `--nd-sidebar-bg`): Light navigation rail surface separated from the main column by a hairline border.
- **Pure Surface** (`#FFFFFF` / `--nd-surface`): Primary fill for all bento cards, active navigation pills, top bar (`95%` opacity with backdrop blur), popovers, and outlined pill buttons.
- **Cool Mist** (`#EEF2F5` / `--nd-muted`): Hover surface for sidebar items and outlined pill buttons, static skeleton blocks, neutral trend badges, and segmented tab tracks.
- **Hairline Slate** (`#E5ECF1` / `--nd-border`): Structural `1px` borders on cards, sidebar rail, sticky header, popover containers, horizontal chart gridlines, and internal dividers.
- **Input Slate** (`#D5E0E8` / `--nd-border-input`): Higher-definition `1px` stroke for interactive controls—outlined pill buttons, circular card triggers, form inputs, and thin scrollbar thumbs.
- **Hover Slate** (`#B4C4D0` / `--nd-border-hover`): Elevated border color on hover for interactive cards, outline buttons, and notification triggers.
- **Ink Navy** (`#0F1E2E` / `--nd-text` & `--nd-dark-bg`): Primary high-contrast body and heading text on light surfaces; also serves as the left split-panel canvas on the Login route.
- **Graphite Label** (`#374756` / `--nd-label`): Dense metadata, chart legends, connectivity pill text, and secondary action labels.
- **Slate Secondary** (`#5A6B7A` / `--nd-text-secondary`): Page descriptions, timestamps, axis ticks, empty-state explanations, and inactive navigation items.
- **Muted Icon** (`#6D7F8E` / `--nd-icon`): Default stroke color for navigation icons, search icons, and sidebar section group headers (`Menu`, `Sistema`).
- **Placeholder Slate** (`#546473` / `--nd-placeholder`): Accessible placeholder copy inside clinical inputs and the header quick-search field.

### Named Rules
**The Selective Hero Anchor Rule.** The deep navy-teal hero gradient (`--nd-hero-gradient`) is limited to at most three focal anchors per viewport—the lead KPI card, the live last-dose card, and the compact sidebar dosing card. Never flood secondary bento cards with dark fills; white cards provide the breathing room that makes the hero anchors scan instantly.

**The Semantic Signal Rule.** Emerald, amber, and crimson are strictly reserved for clinical efficacy bands, pharmacological risk, trend direction, connectivity, and validation errors. Never use status colors for decorative accents or generic brand buttons.

## Typography

**Display Font:** `'Newsreader'` (with `Georgia, serif` fallback — self-hosted WOFF2)
**Body Font:** `'IBM Plex Sans'` (with `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` fallback — self-hosted WOFF2)
**Label/Mono Font:** `'IBM Plex Sans'` with `font-variant-numeric: tabular-nums` (`.nd-tabular`) for clinical numerals and telemetry readouts.

**Character:** Pairs an editorial scientific-journal serif (`Newsreader`) for gateway display statements with a precision clinical sans-serif (`IBM Plex Sans`) whose distinct `1`/`l`/`I` and `0`/`O` glyphs and tabular numerals support safe dosage reading.

### Hierarchy
- **Display** (`600`, `32px–38px` / `2rem–2.375rem`, `1.0`–`1.08` line-height, `-0.03em` tracking, tabular): Primary KPI figures (`38px` in `MetricCard`), semicircular efficacy gauge percentage (`36px` in `EfficacyGaugeCard`), and last-dose readout (`32px` in `LastDoseCard`).
- **Headline** (`600`, `24px` mobile / `28px` desktop, `1.2` line-height, `-0.025em` tracking): Main page `h1` header (`Centro de Telemetria e Decisão Farmacológica`).
- **Title** (`600`, `16px–19px`, `1.25`–`1.35` line-height, `-0.01em` to `-0.02em` tracking): Bento module `h2` headings (`16px`), sidebar brand wordmark (`19px`), and featured next-appointment patient name (`19px`).
- **Body** (`400` / `500`, `14px–15px`, `1.4`–`1.5` line-height): Page lead copy (`14px`–`15px`), button labels (`14px` medium), navigation links (`14px` medium, `600` when active), patient names (`14px` semibold), and clinical form inputs (`15px`, expanding to `16px` on coarse pointers to prevent iOS zoom).
- **Label** (`500` / `600`, `11px–13px`, `1.2`–`1.35` line-height): Card subtitles and descriptions (`12px–13px`), trend pills (`12px`), efficacy status chips (`11px`), chart axis ticks (`11px–12px`), and keyboard shortcut badges (`11px`).
- **Nav Section** (`600`, `11px`, `1.2` line-height, `0.06em` uppercase tracking): Exclusively for the two sidebar navigation group headers (`MENU`, `SISTEMA`).

### Named Rules
**The Tabular Numerals Rule.** Every numerical datum—KPI values, dosage quantities (`mg`), percentages, trend deltas, timestamps, and appointment counts—must carry `.nd-tabular` (`font-variant-numeric: tabular-nums`) so digits align vertically and never jitter on real-time updates.

**The Single-Heading Card Rule.** Bento cards open directly with a crisp `16px` `h2` title and optional inline pill action or subtitle; never stack decorative uppercase kickers or eyebrow tags above card headings.

## Layout

NeuroDose Assist uses a two-column application shell (`.nd-shell`) built on an `8px` base spacing scale (`--nd-space-1` through `--nd-space-9`) combined with a `20px` bento grid gutter (`gap-5`):

- **Application Shell:** On viewports `<900px`, the sidebar operates as a fixed `244px` slide-over drawer (`z-index: 50`) backed by a translucent ink-navy scrim (`rgba(15, 30, 46, 0.35)`), with focus trapping, `inert` background handling, and focus restoration to the menu button on close. At `>=900px`, the sidebar docks as a sticky `100vh` rail (`248px` expanded at `>=1280px`; auto-collapsed to a `72px` icon rail between `900px` and `1279px`, toggleable via a `28px` circular collapse handle).
- **Sticky Top Bar:** `72px` tall (`z-index: 30`), white at `95%` opacity with `backdrop-filter: blur(12px)` and a `1px` bottom border, spanning `16px` horizontal padding on mobile and `32px` at `>=900px`. Houses the quick module search pill (`max-width: 340px`, `⌘K` shortcut) on `>=640px` or compact section breadcrumb on `<640px`, plus real-time online/offline status, notifications popover, and clinician profile menu.
- **Content Container:** Centered `max-width: 1280px` workspace with `16px` padding (plus `env(safe-area-inset-*)`) below `900px` and `32px` padding at `>=900px`. Vertical section cadence is a consistent `20px` (`space-y-5`).
- **Bento Grid Choreography (Dashboard):**
  1. **KPI Strip:** `1` column mobile → `2` columns at `sm` (`640px`) → `4` equal columns at `xl` (`1280px`), `20px` gap.
  2. **Middle Analytics Row (12-column grid at `xl`):** `6` cols 7-day pharmacological telemetry chart + `3` cols next-appointment reminder card + `3` cols clinical alerts list (`lg`: chart spans full 2 cols above the 2 secondary cards).
  3. **Lower Clinical Row (12-column grid at `xl`):** `5` cols recent patients list + `4` cols semicircular efficacy gauge + `3` cols dark last-dose focus card.
- **Authentication Split Layout:** Separate `.login-shell` stacks vertically below `900px` and splits `55%` dark navy showcase / `45%` light form panel at `>=900px`, expanding padding at `1180px` around a `400px` max-width form column.

## Elevation & Depth

NeuroDose Assist uses a **restraint-first hybrid elevation system**: surface separation relies primarily on tonal contrast (`#F4F6F8` canvas vs. `#FFFFFF` cards) reinforced by crisp `1px` `#E5ECF1` hairlines, while soft ink-navy ambient shadows (`rgba(15, 30, 46, …)`) lift primary modules, hero anchors, and floating overlays gently off the canvas.

### Shadow Vocabulary
- **Control Hairline Lift** (`box-shadow: 0 1px 2px rgba(15, 30, 46, 0.04)` / `--nd-shadow-sm`): Subtle grounding for active sidebar pills, outlined pill buttons, collapse toggles, and segmented tab indicators.
- **Bento Card Resting** (`box-shadow: 0 1px 2px rgba(15, 30, 46, 0.03), 0 6px 20px -8px rgba(15, 30, 46, 0.06)` / `--nd-shadow-card`): Soft downward lift applied to all white bento modules (`.nd-card`).
- **Interactive Card Hover** (`box-shadow: 0 6px 22px -8px rgba(15, 30, 46, 0.1)`): Slightly deepened shadow paired with `#B4C4D0` border shift on `.nd-card-interactive:hover`.
- **Hero Anchor Shadow** (`box-shadow: 0 10px 28px -10px rgba(14, 41, 59, 0.42)`): Tinted abyssal-navy depth grounding `.nd-card-hero` gradient cards.
- **Primary Pill Shadow** (`box-shadow: 0 4px 12px -4px rgba(27, 73, 101, 0.42)`, deepening to `0 6px 16px -4px rgba(27, 73, 101, 0.5)` on hover): Tinted elevation for `.nd-btn-primary-pill`.
- **Floating Popover** (`box-shadow: 0 8px 24px -6px rgba(15, 30, 46, 0.12)` / `--nd-shadow-popover`): Reserved for elevated overlays—search autocomplete listbox, notifications popover, profile dropdown, chart tooltips, and skip-to-content focus link.
- **Input Focus Glow** (`box-shadow: 0 0 0 3px rgba(44, 122, 123, 0.16)` / `--nd-focus-ring`, or `rgba(180, 35, 24, 0.14)` on invalid inputs): Soft 3px clinical-teal halo on focused form inputs; buttons and links use crisp `2px solid #2C7A7B` outlines with `2px` offset.

### Named Rules
**The Tinted-Ink Shadow Rule.** Every shadow in the workspace is tinted with deep ink navy (`rgba(15, 30, 46, …)` or brand navy `rgba(27, 73, 101, …)`), never muddy pure black (`#000000`) and never hard offset drop shadows.

**The Static Skeleton Rule.** Loading placeholders (`.nd-skeleton`) are flat Cool Mist (`#EEF2F5`) shapes with `12px` radius and zero pulsing shimmer, preserving visual calm while clinical data streams in.

## Shapes

The form language pairs **generously rounded bento containers** with **full-pill interactive controls**, softening clinical density without looking playful:

- **Outer Bento Modules (`20px` / `--nd-radius-lg`):** Every primary dashboard card, hero anchor, and chart panel uses a `20px` corner radius with a `1px` hairline border.
- **Full-Pill Controls & Data Forms (`9999px` / `--nd-radius-pill`):** Primary and secondary action buttons, quick-search bar, connectivity status, efficacy/trend chips, circular `ArrowUpRight` triggers, header icon buttons, and even the 7-day telemetry bars use full pill geometry.
- **Nested Interactive Elements (`12px` / `--nd-radius`):** Elements nested inside cards or rails—sidebar nav items, alert icon squares (`36×36px`), clinical form inputs, dropdown menu items, chart tooltips, and skeleton blocks—step down to `12px` so concentric radii nest harmoniously.
- **Compact Controls (`6px`):** Segmented login tab triggers/indicator and compact inline icon buttons use `6px` corners.
- **Signature Graphic Devices:** Diagonal `42°` hatched SVG patterns (`#CBD6DF` / `#B8C8D4`) encode empty days in the telemetry bar chart and remaining headroom in the `180°` semicircular efficacy gauge (`stroke-linecap: round`, `24px` stroke width). Fine organic SVG wave paths (`#7FBFBF` / `#A9C9CC`) add maritime depth behind dark hero cards.

## Components

Clinical controls feel tactile, calm, and unmistakable: high-contrast pills for primary decisions, crisp bordered pills for secondary navigation, and quiet hairline cards for dense clinical telemetry.

### Buttons
- **Shape:** Full pill (`9999px` radius) across dashboard actions; `12px` radius for full-width authentication form buttons.
- **Primary Pill (`.nd-btn-primary-pill`):** Deep-to-clinical navy gradient (`linear-gradient(135deg, #0E293B 0%, #1B4965 100%)`), pure white `14px` medium label, `44px` minimum height, `0 20px` horizontal padding, `8px` icon gap, tinted navy shadow.
- **Outline Pill (`.nd-btn-outline-pill` / `.nd-btn-secondary`):** Pure white fill, `#0F1E2E` `14px` medium text, `1px solid #D5E0E8` border, `44px` minimum height (`40px` for compact secondary buttons, expanding to `44px` on coarse pointers), `0 18px` padding, subtle `--nd-shadow-sm`.
- **Hero Inverted Pill:** Pure white fill with `#0E293B` `13px–14px` semibold text, `36px` (`h-9`) inside the sidebar prompt or `44px` (`h-11`) inside `LastDoseCard`, shifting to Teal Mist (`#E8F4F4`) on hover with a white `2px` focus outline.
- **Circular Card Trigger (`.nd-circle-action` / `.nd-circle-action-hero`):** `34px × 34px` circle holding a `16px` `ArrowUpRight` icon; white with `#D5E0E8` border on standard KPI cards (shifting to navy text and `#E8F4F4` fill on hover) and solid white with `#0E293B` icon on the hero KPI card (nudging `1px, -1px` on hover).
- **Hover / Active / Focus:** `150ms` `cubic-bezier(0.2, 0, 0, 1)` transitions (`brightness(1.08)` on primary pill, `#EEF2F5` fill + `#B4C4D0` border on outline pill); `80ms` `translateY(1px)` press feedback (disabled under `prefers-reduced-motion`); `2px solid #2C7A7B` `focus-visible` outline with `2px` offset.

### Chips
- **Style:** Full pill (`9999px`), `11px–12px` medium/semibold tabular text, `2px 10px` to `4px 10px` padding, borderless soft tinted fills (`#E8F4ED`, `#FDF1E3`, `#FDECEA`, `#E8F4F4`, `#EEF2F5`) or translucent `rgba(255,255,255,0.15)` with `rgba(255,255,255,0.2)` border inside hero gradient cards.
- **State:** Read-only clinical status indicators (efficacy bands, pharmacological risk, 7-day trend delta, appointment confirmation, connectivity status) and `1px`-bordered compact filter/shortcut links (`Interações`, `Analytics`, `+ Pacientes`) that shift to `#F4F6F8` on hover.

### Cards / Containers
- **Corner Style:** Generously curved (`20px` radius).
- **Background:** Pure white (`#FFFFFF`) for standard bento modules (`.nd-card`) and interactive containers (`.nd-card-interactive`); institutional hero gradient (`linear-gradient(145deg, #0E293B 0%, #1B4965 56%, #256873 100%)`) for `.nd-card-hero`.
- **Shadow Strategy:** Resting `--nd-shadow-card` on white cards, deepening on `.nd-card-interactive:hover`; tinted abyssal shadow on `.nd-card-hero`.
- **Border:** `1px solid #E5ECF1` on white cards; `1px solid rgba(255, 255, 255, 0.12)` on hero cards.
- **Internal Padding:** `20px` (`p-5`) on compact KPI cards; `24px` (`p-6`) on analytics, agenda, alert, patient, gauge, and last-dose bento modules.

### Inputs / Fields
- **Header Quick Search:** Full pill (`9999px`), `40px` height, `#F4F6F8` fill with `1px solid #E5ECF1` border, `16px` left search icon, `⌘K` pill keycap on the right, shifting to `#FFFFFF` fill and `#2C7A7B` border on focus; opens a `16px`-radius floating listbox (`--nd-shadow-popover`).
- **Clinical Form Input (`.login-input`):** `48px` height, `12px` radius, pure white fill, `1px solid #D5E0E8` border, `15px` text (`16px` on coarse pointers), `#2C7A7B` caret.
- **Focus / Error / Disabled:** Focus shifts border to `#2C7A7B` with a `3px` `rgba(44, 122, 123, 0.16)` ring; invalid inputs (`aria-invalid="true"`) turn `#B42318` with a `3px` `rgba(180, 35, 24, 0.14)` focus halo and `13px` crimson error helper text; disabled fields drop to `#F1F4F8` with `#5A6B7A` text.

### Navigation
- **Light Clinical Rail (`.nd-sidebar`):** Frosted Stone (`#F8FAFC`) surface with `1px` right hairline border (`#E5ECF1`), `72px` brand header (`36×36px` rounded-`12px` `#1B4965` Brain emblem + `19px` semibold `Neuro-Dose`), and two grouped sections (`Menu` and `Sistema` separated by a hairline divider).
- **Nav Items (`.nd-nav-item`):** `42px` height (`44px` minimum on coarse pointers), `12px` radius, `14px` medium `#5A6B7A` text with `18px` `1.65` stroke Lucide icons. Hover fills with `#EEF2F5` and `#0F1E2E` text. Active state (`aria-current="page"`) elevates into a pure white card pill (`#FFFFFF` fill, `1px solid #E5ECF1`, `--nd-shadow-sm`, `#1B4965` `600` text and `2px`-stroke icon)—zero left accent bar.
- **Mobile Treatment:** Below `900px`, collapses off-canvas (`translateX(-100%)`, `inert` when closed) and slides in as an accessible `role="dialog"` `aria-modal="true"` drawer with `44×44px` close trigger.

### Clinical Telemetry & Hero Focus Cards
- **7-Day Telemetry Chart (`EfficacyChart`):** Dual-axis Recharts `ComposedChart` combining `26px`-wide full-pill vertical bars (`#0E293B` on peak efficacy day, `#2C7A7B` on active days, `42°` `#CBD6DF` hatched pill on empty days) with a dashed `2px` `#1B4965` dose curve (`mg`), custom `.nd-tooltip-surface` popover, and screen-reader summary.
- **Semicircular Efficacy Gauge (`EfficacyGaugeCard`):** `180°` SVG arc (`24px` rounded stroke) overlaying a `42°` `#B8C8D4` hatched headroom track with a horizontal `#2C7A7B → #1B4965 → #0E293B` gradient fill, anchored by a `36px` tabular percentage and 3-state clinical legend.
- **Last-Dose & Sidebar Hero Cards (`LastDoseCard`, Sidebar CTA):** Deep `.nd-card-hero` gradient panels layered with `opacity: 0.25` seafoam topographic SVG wave lines, tabular dosage display, translucent risk/efficacy pills, and a full-width inverted white pill CTA.

## Do's and Don'ts

### Do:
- **Do** build every workspace screen on the `#F4F6F8` alabaster canvas with `#FFFFFF` `20px`-radius bento cards, `1px solid #E5ECF1` borders, and `20px` grid gutters (`gap-5`).
- **Do** reserve the deep navy-teal hero gradient (`#0E293B → #1B4965 → #256873`) for 1–3 high-priority anchors per viewport so the lead metric and primary clinical action stand out immediately.
- **Do** apply `.nd-tabular` (`font-variant-numeric: tabular-nums`) to every dosage, percentage, trend delta, date, and count.
- **Do** use full-pill (`9999px`) buttons (`min-height: 44px`) for dashboard actions, keeping `+ Registrar Dose` as the single primary gradient pill per header.
- **Do** pair semantic status colors with explicit text labels and icons (never color alone) and honor `prefers-reduced-motion: reduce` by disabling entrance animations and press transforms.

### Don't:
- **Don't** reintroduce the legacy dark navy sidebar (`#0F1E2E`) or left accent tabs on navigation items; the authenticated workspace uses the light `#F8FAFC` frosted-stone rail with white active pill items.
- **Don't** substitute generic SaaS emerald greens for NeuroDose's primary brand color—emerald (`#1E7A4D`) is strictly a semantic success/optimal-efficacy indicator, while `#1B4965` and `#2C7A7B` own brand identity.
- **Don't** add pulsing shimmer animations to skeletons, hard offset drop shadows, or uppercase eyebrow kickers above bento card headings.
- **Don't** fabricate clinical metrics, patient trends, or alerts in empty states—render calm, truthful empty cards with a direct pill CTA to record real data.
- **Don't** use pure black (`#000000`) for text or shadows; stay within Ink Navy (`#0F1E2E`) and ink-tinted alpha shadows so the maritime-clinical register remains cohesive.
