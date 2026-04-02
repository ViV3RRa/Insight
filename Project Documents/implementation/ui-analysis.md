# UI Analysis — Exhaustive Specification

> Generated from forensic analysis of all 7 HTML prototypes and 43 screenshots.
> Target stack: React + Tailwind CSS + Recharts + lucide-react.

---

## Table of Contents

1. [Global Patterns](#1-global-patterns)
2. [Per-Page Breakdown](#2-per-page-breakdown)
3. [Component Catalog](#3-component-catalog)
4. [Responsive Adaptation Map](#4-responsive-adaptation-map)
5. [Interaction & Animation Spec](#5-interaction--animation-spec)
6. [Component Reuse Map](#6-component-reuse-map)

---

## 1. Global Patterns

### 1.1 Tailwind Configuration

All 7 prototypes share an identical `tailwind.config`:

```js
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        white: '#fafcfa',
        base: {
          50:  '#f7f9f7',
          100: '#f0f2f0',
          150: '#e7e9e7',
          200: '#d3d5d3',
          300: '#afb1af',
          400: '#898b89',
          500: '#6a6c6a',
          600: '#515351',
          700: '#3c3e3c',
          800: '#252725',
          900: '#161816',
        },
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
      },
    },
  },
};
```

**Key notes:**
- `white` is overridden to `#fafcfa` — a very slightly green-tinted off-white (NOT pure white).
- `accent` maps to Tailwind's green palette. Stops defined: 50/100/200/400/500/600/700 only.
- `base` is a custom neutral gray scale with a very slight green tint (R=B, G slightly higher). Non-standard stop `base-150` exists.
- Dark mode uses the `class` strategy on `<html>`.
- **Exception:** `ui-states.html` uses a slightly different base palette with pure grays (`#f8f8f8`, `#f1f1f1`, etc.) instead of the green-tinted values. The implementation should unify to the green-tinted palette.

### 1.2 Typography

**Google Fonts loaded:**
- `DM Sans` — weights 400 (normal + italic), 500, 600, 700; optical size 9..40
- `DM Mono` — weights 400, 500

**CSS base rules:**
```css
body { font-family: 'DM Sans', system-ui, sans-serif; }
.font-mono-data { font-family: 'DM Mono', monospace; font-variant-numeric: tabular-nums; }
```

**Typography scale:**

| Usage | Font | Tailwind Size | Weight | Extra |
|-------|------|--------------|--------|-------|
| Brand "Insight" | DM Sans | `text-xl` | `font-bold` | `tracking-tight` |
| Page title h1 (desktop) | DM Sans | `text-2xl` | `font-bold` | `tracking-tight` |
| Page title (mobile nav) | DM Sans | `text-sm` | `font-bold` | `tracking-tight` |
| Mobile nav subtitle | DM Sans | `text-[11px]` | normal | `text-base-400` |
| Section titles (h3 in cards) | DM Sans | `text-sm` | `font-semibold` | |
| Nav links (active) | DM Sans | `text-sm` | `font-medium` | |
| Nav links (inactive) | DM Sans | `text-sm` | normal | |
| Tab active | DM Sans | `text-sm` | `font-medium` | `text-accent-700 dark:text-accent-400` |
| Tab inactive | DM Sans | `text-sm` | normal | `text-base-400` |
| KPI card label | DM Sans | `text-xs` | normal | `text-base-400` |
| KPI card value | DM Mono | `text-xl` | `font-medium` | `.font-mono-data` |
| KPI card sublabel | DM Sans | `text-xs` | normal | `text-base-300 dark:text-base-500` |
| Metric label (overview cards) | DM Sans | `text-[10px]` | normal | `uppercase tracking-wider text-base-300 dark:text-base-500` |
| Metric value (overview cards) | DM Mono | `text-xl` | `font-medium` | `.font-mono-data` |
| Table header | DM Sans | `text-xs` | `font-medium` | `text-base-300 dark:text-base-500` |
| Table data (numeric) | DM Mono | `text-sm` | normal or `font-medium` | `.font-mono-data` |
| Dialog title | DM Sans | `text-base` | `font-semibold` | |
| Form label (required) | DM Sans | `text-xs` | `font-medium` | `text-base-500 dark:text-base-400` |
| Form label (optional) | DM Sans | `text-xs` | `font-medium` | `text-base-400 dark:text-base-500` |
| Button text | DM Sans | `text-sm` | normal or `font-medium` | |
| Mobile bottom tab labels | DM Sans | `text-[10px]` | `font-medium` | |
| Dropdown section header | DM Sans | `text-xs` | `font-medium` | `uppercase tracking-wider` |
| Badge/count | DM Sans | `text-xs` | `font-medium` | |
| Change indicator | DM Mono | `text-xs` | normal | `.font-mono-data` |
| YoY sub-label | DM Sans | `text-[10px]` | normal | `uppercase tracking-wider` |

**Rule: DM Mono is used exclusively for numeric data values** (amounts, percentages, dates in tables, meter readings). DM Sans for everything else (labels, navigation, buttons, titles).

### 1.3 Color Semantic Mapping

| Semantic | Light | Dark |
|----------|-------|------|
| Page background | `bg-base-100` | `dark:bg-base-900` |
| Card/surface | `bg-white` (#fafcfa) | `dark:bg-base-800` |
| Card shadow | `shadow-card` | `dark:shadow-card-dark` |
| Primary text | `text-base-900` | `dark:text-base-100` |
| Secondary text | `text-base-500` / `text-base-400` | `dark:text-base-400` / `dark:text-base-500` |
| Tertiary/muted | `text-base-300` | `dark:text-base-500` |
| Positive/gain | `text-emerald-600` | `dark:text-emerald-400` |
| Negative/loss | `text-rose-500` | `dark:text-rose-400` |
| Active nav/tab | `text-accent-700` | `dark:text-accent-400` |
| Primary button bg | `bg-base-900` | `dark:bg-accent-600` |
| Primary button hover | `hover:bg-base-800` | `dark:hover:bg-accent-700` |
| Input background | `bg-white` | `dark:bg-base-900` |
| Input border | `border-base-200` | `dark:border-base-600` |
| Input focus ring | `focus:ring-accent-500/30` | same |
| Divider/border | `border-base-100` or `border-base-150` | `dark:border-base-700` |
| Segmented control bg | `bg-base-100` | `dark:bg-base-700` |
| Active pill | `bg-white shadow-sm` | `dark:bg-base-600` |

### 1.4 Utility-Specific Colors (per section)

**Home — Utility type colors:**
| Utility | Icon bg | Icon color | Chart legend |
|---------|---------|------------|--------------|
| Electricity | `bg-amber-50 dark:bg-amber-900/30` | `text-amber-600 dark:text-amber-400` | `bg-amber-500` |
| Water | `bg-blue-50 dark:bg-blue-900/30` | `text-blue-600 dark:text-blue-400` | `bg-blue-500` |
| Heat | `bg-orange-50 dark:bg-orange-900/30` | `text-orange-600 dark:text-orange-400` | `bg-orange-500` |

**Investment — Allocation colors:**
| Platform | Color |
|----------|-------|
| Nordnet | `bg-blue-500` |
| Mintos | `bg-red-400` |
| Kameo | `bg-violet-500` |
| Revolut (cash) | `bg-base-300 dark:bg-base-500` |
| Danske Bank (cash) | `bg-amber-400` |

**Vehicles — Vehicle gradient colors:**
| Vehicle | Gradient | Icon color |
|---------|----------|------------|
| Car (sky/blue) | `from-sky-50 to-blue-100 dark:from-sky-950/60 dark:to-blue-900/40` | `text-sky-200 dark:text-sky-900` |
| Motorcycle (slate) | `from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/40` | `text-slate-200 dark:text-slate-700` |
| Sold (grayscale) | `from-base-100 to-base-150 dark:from-base-800 dark:to-base-750` | `text-base-200 dark:text-base-700` |

**Vehicles — Fuel type badge colors:**
| Type | Light | Dark |
|------|-------|------|
| Petrol | `bg-orange-100 text-orange-700 border-orange-200/80` | `dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/60` |
| Electric | `bg-blue-50 text-blue-600 border-blue-200/70` | `dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/60` |

### 1.5 Staleness Indicator Colors

Two severity levels, used identically across Home and Investment:

| Level | Background | Text | Border | Dot |
|-------|-----------|------|--------|-----|
| Warning (amber) | `bg-amber-50 dark:bg-amber-900/30` | `text-amber-600 dark:text-amber-400` | `border-amber-600 dark:border-amber-400` | `bg-amber-500 dark:bg-amber-400 animate-pulse` |
| Critical (rose) | `bg-rose-50 dark:bg-rose-900/30` | `text-rose-600 dark:text-rose-400` | `border-rose-600 dark:border-rose-400` | `bg-rose-500 dark:bg-rose-400 animate-pulse` |

Three size variants exist:
- **Small** (in dropdown lists): `text-[10px]`, dot `w-1 h-1`, padding `px-1.5 py-0.5`
- **Medium** (inline in cards/headers): `text-xs`, dot `w-1.5 h-1.5`, padding `px-2 py-0.5`
- **Large** (mobile nav badge): `text-sm font-semibold`, dot `w-2 h-2`, padding `px-3.5 py-1.5`

### 1.6 Layout System

- **Max width:** `max-w-[1440px] mx-auto`
- **Horizontal padding:** `px-3 lg:px-8`
- **Vertical padding (main):** `py-6 lg:py-10`
- **Bottom padding (main):** `pb-24 lg:pb-10` (pb-24 clears mobile tab bar)
- **Nav height:** `h-16` (64px)
- **Bottom tab bar height:** `h-16` (64px)

### 1.7 Navigation

#### Desktop Top Nav
```
<nav class="bg-white dark:bg-base-800 shadow-card dark:shadow-card-dark sticky top-0 z-30 relative">
  <div class="max-w-[1440px] mx-auto px-3 lg:px-8">
    <div class="flex items-center justify-between h-16">
```

**Left side:**
- Brand: `hidden lg:block text-xl font-bold tracking-tight`
- Gap: `gap-10` between brand and section nav
- Section nav: `hidden lg:flex gap-1`
  - Active: `px-4 py-2 text-sm rounded-lg font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-700/20`
  - Inactive: `px-4 py-2 text-sm rounded-lg text-base-400 dark:text-base-400 hover:text-base-600 dark:hover:text-base-200 transition-colors`

**Right side:**
- Settings button: `hidden lg:flex` — `w-9 h-9 rounded-xl bg-base-150 dark:bg-base-700` — toggles dark mode

**Mobile (below lg):**
- Overview pages: Page title + subtitle in `flex lg:hidden items-center gap-2.5`
- Detail pages: Back button + entity switcher dropdown trigger

#### Mobile Bottom Tab Bar
```
<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 z-30 lg:hidden">
  <div class="flex items-center justify-around h-16">
```

4 tabs: Home (house), Investment (trending-up), Vehicles (car), Settings (gear)
- Each tab: `flex flex-col items-center gap-1 px-4 py-2`
- Active: `text-accent-600 dark:text-accent-400`
- Inactive: `text-base-400`
- Icon: `w-5 h-5`, Label: `text-[10px] font-medium`

### 1.8 Scrollbar Styling

```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #c4c4c4; border-radius: 3px; }
.dark ::-webkit-scrollbar-thumb { background: #525252; }
```

### 1.9 Data Formatting Conventions

All prototypes use **Danish locale** formatting:
- **Thousands separator:** period (`.`) — e.g., `1.759.504`
- **Decimal separator:** comma (`,`) — e.g., `9,8%`, `3,13`
- **Currency:** Amount followed by currency code, never a symbol — `842.391 DKK`, `58.924 EUR`
- **Percentages:** Comma decimal, explicit sign — `+13,1%`, `-8,7%`, `9,8%`
- **Percentage points:** `+2,3pp`
- **Date (short):** `Feb 14`, `Jan 31` (English abbreviated month + day)
- **Date (full):** `Feb 14, 2026` (with year)
- **Date (month-year):** `Feb 2026`
- **Date (period):** `Jan 1 – Feb 17, 2025`
- **Positive values:** `text-emerald-600 dark:text-emerald-400`, prefixed with `+`
- **Negative values:** `text-rose-500 dark:text-rose-400`, prefixed with `-`

---

## 2. Per-Page Breakdown

### 2.1 Home Overview (`home-overview.html`)

**Screenshots:** overview-desktop-top, overview-desktop-dark, overview-mobile-top, overview-mobile-add-reading, overview-mobile-add-bill

**Page structure (top to bottom):**
1. Desktop page header (hidden on mobile): h1 "Home", subtitle "3 utilities tracked · Updated Feb 1, 2026", +Add Reading (secondary), +Add Bill (primary)
2. Mobile action buttons (`lg:hidden`): same two buttons at `flex-1`
3. Utility summary cards grid: `grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8`
4. YoY comparison row
5. Monthly Overview chart card with controls
6. "+ Add Utility" text button at bottom

**Utility Summary Cards (3):**
Each is an `<a>` (clickable to detail). Container:
```
bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark
block hover:shadow-lg transition-shadow cursor-pointer group relative
```

Contents: icon (colored 8×8 rounded-lg), name + unit, stale badge (optional), chevron-right, 2-col metric grid (Consumption + Cost), change indicator, 3-col footer stats (YTD Cost, Cost/Unit, Updated).

**Chart controls visible:** YoY toggle, Stacked/Grouped toggle, Consumption/Cost mode toggle, time-span selector.

### 2.2 Utility Detail (`utility-detail.html`)

**Screenshots:** detail-desktop-top, detail-desktop-bills, detail-desktop-yearly, detail-desktop-switcher, detail-desktop-edit-reading, detail-desktop-edit-bill, detail-desktop-delete-confirm, detail-mobile-top, detail-mobile-tables, detail-mobile-switcher, detail-mobile-month-drawer, detail-mobile-reading-drawer, detail-mobile-bill-drawer

**Page structure:**
1. Utility switcher bar: back button + dropdown trigger showing utility icon, name, stale badge, and "Updated" date
2. Desktop action buttons: +Add Reading (secondary), +Add Bill (primary)
3. Summary KPI cards: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4` — 6 cards: This Month, This Month Cost, vs Last Month (change %), YTD Consumption, YTD Cost, Cost per Unit
4. Consumption & Cost chart card (with Consumption/Cost/Cost-per-Unit toggle + time-span selector)
5. Yearly Summary tab card (Yearly | Monthly tabs)
6. Meter Readings table card
7. Bills table card

**Unique patterns in this page:**
- Utility switcher dropdown (desktop: `w-80`, mobile: full-width slide-down)
- Tab bar with `::after` underline indicator (`2px green, border-radius 1px`)
- Monthly/Yearly performance tables with mobile column cycling
- Meter readings table with expand/collapse (VISIBLE_ROWS = 5)
- Bills table with period columns (Start, End)
- Mobile drawers for: month detail, reading detail, bill detail
- Edit reading dialog, Edit bill dialog, Delete confirmation dialog

### 2.3 Portfolio Overview (`portfolio-overview.html`)

**Screenshots:** overview-desktop-top, overview-desktop-tables, overview-desktop-add-platform, overview-desktop-portfolio-switcher, overview-desktop-performance-expanded, overview-mobile-top, overview-mobile-tables, overview-mobile-add-platform, overview-mobile-performance-expanded

**Page structure:**
1. Desktop page header: h1 "Investment Portfolio" + portfolio switcher button, subtitle, +Add Data Point (secondary), +Add Transaction (primary)
2. Mobile: portfolio switcher in nav, action buttons below
3. Summary KPI cards: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4` — 6 cards: Total Value, All-Time Gain/Loss, All-Time XIRR, YTD Gain/Loss, YTD XIRR, Month Earnings
4. YoY comparison row (3 metrics)
5. Performance Charts & Analysis (collapsible accordion)
   - Portfolio Value Over Time: 2-col chart grid (Value: stacked area, Performance: bar chart)
   - Performance Analysis: tab card (Yearly | Monthly) with tables
6. Investment Platforms table card
7. Cash Accounts table card
8. Closed Platforms table card (dimmed `opacity-60`)
9. Portfolio Allocation (proportional bar + legend)
10. "+ Add Platform" text button

**Unique patterns:**
- Portfolio switcher dropdown (desktop: `w-64` absolute, mobile: full-width slide-down from nav)
- Collapsible accordion for performance section (toggle button with chevron rotation)
- Platform table rows with icon images (`w-5 h-5 rounded-full shadow ring-1 ring-black/10`)
- Multi-currency display: primary in native currency, secondary `≈ DKK` equivalent below in `text-xs text-base-300`
- Allocation proportional bar: `h-8 rounded-lg overflow-hidden flex`
- Cash badge on legend: `text-xs bg-base-100 dark:bg-base-700 px-1.5 py-0.5 rounded`

### 2.4 Platform Detail (`platform-detail.html`)

**Screenshots:** detail-desktop-top, detail-desktop-dark, detail-desktop-yearly, detail-desktop-transactions, detail-desktop-switcher, detail-desktop-edit-platform, detail-mobile-top, detail-mobile-tables, detail-mobile-switcher, detail-mobile-edit-platform, detail-mobile-dp-drawer, detail-mobile-perf-drawer, detail-mobile-tx-drawer, detail-mobile-transactions

**Page structure:**
1. Platform switcher bar: back button + dropdown trigger (platform icon `w-7 h-7`, name, subtitle "Investment · DKK · Updated Jan 31, 2026", stale badge, chevron)
2. Action buttons
3. Summary KPI cards: 6 cards (Current Value, Month Earnings, All-Time Gain/Loss, All-Time XIRR, YTD Gain/Loss, YTD XIRR)
4. Performance Overview chart card (single chart: `h-56`)
5. Performance Analysis tab card (Yearly | Monthly)
6. Data Points table card
7. Transactions table card

**Unique patterns:**
- Platform switcher dropdown with "Portfolio Overview" link at top, sections ("Active Platforms", "Cash Accounts", "Closed"), edit platform button at bottom
- Data points table: date, value with `est.` interpolated badge (amber), source, note, actions
- Transactions table: date, type badge (Deposit green, Withdrawal red), amount, note, attachment link, actions
- Mobile abbreviations: `Dep.` / `Wdl.` for Deposit/Withdrawal
- Mobile note/attachment inline indicators (speech-bubble and paperclip icons)
- Edit Platform dialog with "Close Platform" section (rose-colored danger zone, expandable fields)
- Three mobile drawers: data point, performance row, transaction

### 2.5 Vehicles Overview (`vehicles-overview.html`)

**No screenshots exist for vehicles section.**

**Page structure:**
1. Desktop page header: h1 "Vehicles", subtitle, +Add Refueling (secondary), +Add Maintenance (primary)
2. Mobile action buttons
3. Active vehicle cards grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4`
4. Sold Vehicles accordion (collapsible)

**Vehicle Cards:**
Each card has a photo placeholder area (`h-40 bg-gradient-to-br`) with vehicle silhouette SVG (`w-24 h-24 stroke-width="0.8"`), hover chevron overlay, fuel type badge (absolute top-right), and card body with name, metrics grid, change indicator, footer stats.

Sold vehicles: `opacity-60 hover:opacity-90`, different footer layout (`grid-cols-2`), "Sold" badge at top-left.

### 2.6 Vehicle Detail (`vehicle-detail.html`)

**No screenshots exist for vehicles section.**

**Page structure:**
1. Vehicle switcher bar (back button + dropdown with vehicle list, sold section)
2. Action buttons
3. Vehicle header card: photo area (`h-36 sm:w-48 lg:w-56`) + content (name, subtitle, metadata chips)
4. Summary KPI cards: `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7` — 7 cards
5. YoY comparison row
6. Charts accordion (collapsible): efficiency chart, monthly pair (fuel cost + km), maintenance chart
7. Tab card: Performance | Refueling | Maintenance

**Unique patterns:**
- Vehicle header card with side-by-side photo + content (`flex flex-col sm:flex-row`)
- Metadata chips: generic (`bg-base-100`), fuel type (colored), active status (accent with dot)
- Refueling table: Date, Fuel (L), DKK/L, Total, Odometer, Efficiency, Station
- Maintenance table: Date, Description, Cost, Note
- Row actions on hover: `opacity-0 group-hover:opacity-100` (edit + delete buttons)
- Edit Vehicle dialog with "Mark as Sold" toggle (rose danger zone, expandable fields)
- Fuel efficiency unit depends on fuel type: `km/l` (petrol) vs `km/kWh` (electric)
- No mobile column cycling in vehicles — columns simply hidden via `hidden sm:table-cell`

---

## 3. Component Catalog

### 3.1 Card (Base Surface)

```
bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark
```
- Standard padding: `p-5` (compact) or `p-4 sm:p-6` (spacious)
- With header bar: header `px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700`
- Hover variant (clickable): add `hover:shadow-lg dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer group`

### 3.2 Summary KPI Card

```
bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark
```
- Label: `text-xs text-base-400 mb-2`
- Value: `font-mono-data text-xl font-medium`
- Currency/unit suffix in value: `text-xs text-base-300 dark:text-base-500`
- Sublabel: `text-xs text-base-300 dark:text-base-500 mt-1.5`
- Percentage badge: `font-mono-data text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block mt-1.5`

Grid varies by page:
- Home overview: `grid-cols-1 sm:grid-cols-3`
- Portfolio/Platform: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- Vehicle detail: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-7`

### 3.3 YoY Comparison Row

```
bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark px-4 sm:px-5 py-3.5 mb-6 lg:mb-8
```
- Header: `flex items-center gap-2 mb-2.5` — swap-arrows icon `w-3.5 h-3.5 text-base-300` + label `text-xs font-medium text-base-400`
- Grid: `grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6`
- Each metric: sub-label `text-[10px] uppercase tracking-wider text-base-300`, value row `flex items-baseline gap-2`, change indicator
- Mobile: items in `flex items-center justify-between sm:block`, 2nd/3rd items get `border-t border-base-100 dark:border-base-700 pt-3 sm:border-0 sm:pt-0`

### 3.4 Collapsible Accordion

**Toggle button:**
```
w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark hover:bg-base-50 dark:hover:bg-base-750 transition-colors cursor-pointer
```
- Left: icon `w-4 h-4 text-base-400` + title `text-sm font-semibold` + optional count badge
- Right: chevron `w-4 h-4 text-base-400 transition-transform duration-200`
- Open state: chevron `rotate-180`, button `rounded-t-2xl` (from `rounded-2xl`)
- Content: `hidden` class toggled, `mt-3` or `mt-4 space-y-4`

### 3.5 Tab Bar

```
flex items-center border-b border-base-150 dark:border-base-700 px-3 lg:px-6
```
- Active tab: `tab-btn active px-4 py-4 text-sm font-medium text-accent-700 dark:text-accent-400`
- Inactive tab: `tab-btn px-4 py-4 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors`
- Active underline (CSS `::after`): `position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: #16a34a; border-radius: 1px;`
- Dark mode underline: `background: #4ade80`
- Optional right-side toggle (Earnings/XIRR %): same segmented control as chart

### 3.6 Data Table

**Card wrapper:** `bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden`

**Header bar:** `px-3 lg:px-6 py-5 flex items-center justify-between border-b border-base-100 dark:border-base-700`
- Title + count: `flex items-center gap-3` — `text-sm font-semibold` + `text-xs text-base-400 bg-base-100 dark:bg-base-700 px-2 py-0.5 rounded-full font-medium`
- Action button(s) on right

**Table scroll wrapper:** `overflow-x-auto -mx-4 sm:-mx-6 px-3 lg:px-6`

**Table:** `w-full text-sm sm:min-w-[XXXpx]`

**Thead:** `border-b border-base-150 dark:border-base-700`
- Some tables add bg: `bg-base-50/40 dark:bg-base-900/30`
- th: `font-medium text-base-300 dark:text-base-500 px-4 py-3 text-xs`
- First col: `text-left`, others: `text-right`
- Hidden cols: `hidden sm:table-cell`

**Tbody rows:** `border-b border-base-100 dark:border-base-700/50 hover:bg-accent-50/20 dark:hover:bg-accent-900/10 transition-colors`
- Platform tables use slightly stronger hover: `hover:bg-accent-50/30`
- Closed rows: `opacity-60 hover:bg-base-50/50 dark:hover:bg-base-700/30`

**Totals row:** `bg-base-50/60 dark:bg-base-900/40 font-medium`

**Show more/less toggle:** `w-full py-3 text-xs font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 border-t border-base-100 dark:border-base-700/50`

### 3.7 Mobile Column Cycling

Used in: portfolio-overview (yearly/monthly tables), platform-detail (yearly/monthly tables), utility-detail (yearly/monthly tables).

**NOT used in:** vehicles tables (columns simply hidden).

**Header structure:**
```html
<th class="sm:hidden text-right ...">
  <button onclick="cycleColumn(event, 'tableId')" class="inline-flex flex-col items-end gap-1">
    <span class="flex items-center gap-1.5">
      <span class="grid justify-items-end">
        <span class="cycle-header [grid-area:1/1]" data-col="colA">Label A</span>
        <span class="cycle-header [grid-area:1/1] invisible" data-col="colB">Label B</span>
      </span>
      <svg class="w-3 h-3 text-base-300"><!-- chevron-right --></svg>
    </span>
    <span class="flex gap-0.5 cycle-dots">
      <span class="w-1 h-1 rounded-full bg-accent-500"></span>
      <span class="w-1 h-1 rounded-full bg-base-300 dark:bg-base-500"></span>
    </span>
  </button>
</th>
```

**Cell structure:** All values stacked via `[grid-area:1/1]`, `invisible` toggled to show active column.

### 3.8 Dialog / Modal

**Root:** `fixed inset-0 z-50 hidden` with `role="dialog" aria-modal="true"`

**Backdrop:** `fixed inset-0 bg-black/40 sm:backdrop-blur-sm transition-opacity duration-200`

**Positioning:**
- Mobile: `fixed inset-x-0 bottom-0`
- Desktop: `sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4`

**Panel:** `dialog-panel bg-white dark:bg-base-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto`

**Width variants:**
- `sm:max-w-md` — most dialogs (add reading, add bill, add data point, add transaction, etc.)
- `sm:max-w-lg` — add/edit vehicle
- `sm:max-w-sm` — delete confirmation

**Mobile drag handle:** `sm:hidden flex justify-center pt-3 pb-1` — `w-10 h-1 rounded-full bg-base-200 dark:bg-base-600`

**Header:** `px-5 sm:px-6 pb-4 pt-2 sm:pt-5` — `text-base font-semibold`

**Body:** `px-5 sm:px-6 pb-6 space-y-4`

**Footer:** `px-5 sm:px-6 py-4 flex items-center justify-end gap-3`

### 3.9 Delete Confirmation Dialog

Separate pattern from standard dialogs:
- `z-[60]` (stacks above other dialogs)
- `sm:max-w-sm`, always centered (no bottom-sheet on mobile)
- Icon: `w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30` with trash SVG `w-5 h-5 text-rose-600 dark:text-rose-400`
- Title: `text-base font-semibold mb-1`
- Description: `text-sm text-base-500 dark:text-base-400`
- Delete button: `bg-rose-600 hover:bg-rose-700` (always rose, not dark-mode accent)

### 3.10 Mobile Drawer (Bottom Sheet)

Used in: utility-detail, platform-detail. NOT in portfolio-overview or vehicles.

**Wrapper:** `fixed bottom-0 left-0 right-0 z-50 translate-y-full transition-transform duration-300 ease-out lg:hidden`

**Content:** `bg-white dark:bg-base-800 rounded-t-2xl shadow-xl max-h-[92vh] overflow-y-auto`

**Drag handle:** Same as dialog — `w-10 h-1 rounded-full bg-base-200 dark:bg-base-600`

**Title bar:** `px-5 pb-4 pt-2 flex items-center gap-2`
- Prev/next nav buttons: `p-1.5 rounded-lg text-base-300 hover:text-base-600 hover:bg-base-100 disabled:opacity-25 disabled:pointer-events-none`
- Title: `font-semibold text-base truncate`

**Content:** `px-5 pb-6 space-y-4` with data displayed in `grid grid-cols-2 gap-4`

**Footer:** `px-5 py-4 flex items-center gap-3`
- Edit: `flex-1 px-4 py-2.5 text-sm font-medium text-base-700 dark:text-base-200 bg-base-100 dark:bg-base-700 rounded-lg`
- Delete: `px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg`

**Shared backdrop:** `fixed inset-0 bg-black/40 sm:backdrop-blur-sm z-40`

### 3.11 Segmented Control (Pill Toggle)

```
flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5
```
- Active: `px-2.5 py-1 text-xs rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-base-100 font-medium shadow-sm`
- Inactive: `px-2.5 py-1 text-xs rounded-md text-base-400`

Used for: Consumption/Cost toggle, Earnings/XIRR toggle, Stacked/Grouped toggle.

### 3.12 Time Span Selector

**Dual-mode component:**

Below 410px — select dropdown:
```
min-[410px]:hidden w-full px-3 py-2 text-sm bg-base-100 dark:bg-base-700 border border-base-200 dark:border-base-600 rounded-lg
```

At/above 410px — pill bar:
```
hidden min-[410px]:flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5 w-full sm:w-fit
```
- Active pill: `flex-1 sm:flex-none sm:px-2.5 py-1 text-xs rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-base-100 font-medium shadow-sm text-center`
- Inactive pill: `flex-1 sm:flex-none sm:px-2.5 py-1 text-xs rounded-md text-base-400 hover:text-base-600 dark:hover:text-base-200 text-center`

**Standard options:** 1M, 3M, 6M, MTD, YTD (default), 1Y, 3Y, 5Y, All
**Vehicles variant:** 3M, 6M, YTD, 1Y, 2Y, All

### 3.13 YoY Toggle Button

```
px-2.5 py-1 text-xs rounded-lg border text-base-400 border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500 transition-colors flex items-center gap-1.5
```
Active state adds: `bg-accent-50 dark:bg-accent-700/20 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-600`

Contains: swap-arrows icon `w-3 h-3` + "YoY" text.

### 3.14 Form Elements

**Text/Number Input:**
```
w-full px-3 py-2.5 text-sm bg-white dark:bg-base-900 border border-base-200 dark:border-base-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-base-300 dark:placeholder:text-base-500 transition-colors
```

**Number with currency suffix:**
- Input adds: `pr-14 font-mono-data`
- Suffix: `absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data`

**Select:**
```
form-select w-full px-3 py-2.5 pr-10 text-sm bg-white dark:bg-base-900 border border-base-200 dark:border-base-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-colors
```
Custom chevron-down arrow via `background-image` SVG.

**Required label:** `block text-xs font-medium text-base-500 dark:text-base-400 mb-1.5` with `<span class="text-rose-500">*</span>`

**Optional label:** `block text-xs font-medium text-base-400 dark:text-base-500 mb-1.5`

**Error state (from ui-states):**
- Input border: `border-rose-400 dark:border-rose-500`
- Focus ring: `focus:ring-rose-500/20`
- Error message: `flex items-center gap-1.5 mt-1.5` — exclamation icon `w-3.5 h-3.5 text-rose-500` + `text-xs text-rose-500 dark:text-rose-400`

**File upload zone:**
```
w-full px-3 py-4 border border-dashed border-base-200 dark:border-base-600 rounded-lg bg-base-50 dark:bg-base-700/50 text-center cursor-pointer hover:border-base-300 dark:hover:border-base-500 transition-colors
```
Cloud-upload icon `w-5 h-5 text-base-300` + `text-xs text-base-400`

**Radio buttons (Investment transaction type):**
Uses Tailwind `peer` pattern:
- Input: `peer sr-only`
- Deposit checked: `peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:font-medium`
- Withdrawal checked: `peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-700 peer-checked:font-medium`

### 3.15 Button Variants

| Variant | Classes |
|---------|---------|
| **Primary** | `px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 transition-colors` |
| **Secondary** | `px-4 py-2 text-sm text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg shadow-sm hover:border-base-300 dark:hover:border-base-500 transition-colors` |
| **Ghost / Cancel** | `px-4 py-2.5 text-sm font-medium text-base-600 dark:text-base-300 hover:text-base-800 dark:hover:text-base-100 transition-colors` |
| **Save & Add Another** | `px-4 py-2.5 text-sm font-medium text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors` |
| **Destructive (confirm)** | `px-5 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors` |
| **Destructive (text)** | `px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors` |
| **Danger trigger (small)** | `px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors` |
| **Add-item (text)** | `w-full py-3 text-sm font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5` |
| **Loading (primary)** | Primary classes + `opacity-75 cursor-not-allowed inline-flex items-center gap-2` with spinner |
| **Loading (secondary)** | Secondary classes + `opacity-75 cursor-not-allowed inline-flex items-center gap-2` with spinner |

### 3.16 Staleness Badge

```
inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border
```
Plus severity-specific colors (see §1.5).

Dot inside: `w-1.5 h-1.5 rounded-full animate-pulse` + severity color.

### 3.17 Transaction Type Badge

- Deposit: `px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium rounded-md`
- Withdrawal: `px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 text-xs font-medium rounded-md`

### 3.18 Platform Icon

```
w-5 min-w-5 h-5 rounded-full object-cover shrink-0 shadow ring-1 ring-black/10
```
Larger in switcher: `w-7 min-w-7 h-7`

### 3.19 Dropdown Switcher

**Desktop trigger:**
```
flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-xl text-sm font-medium shadow-sm hover:border-base-300 dark:hover:border-base-500 transition-colors
```

**Desktop panel:**
```
hidden absolute top-full left-0 mt-1.5 w-[width] bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-xl shadow-lg z-40 py-1.5 overflow-hidden
```

**Mobile panel:** Slides down from nav via inline `maxHeight` / `opacity` animation.

**Active item:** `bg-accent-50/50 dark:bg-accent-900/15 border-l-2 border-accent-600 dark:border-accent-400`

**Inactive item:** `hover:bg-base-50 dark:hover:bg-base-700 transition-colors cursor-pointer`

---

## 4. Responsive Adaptation Map

### 4.1 Breakpoints

| Token | Width | Usage |
|-------|-------|-------|
| (default) | < 410px | Narrowest mobile |
| `min-[410px]` | ≥ 410px | Time-span pills vs dropdown |
| `sm` | ≥ 640px | Dialog centering, table columns, card grids, YoY layout |
| `lg` | ≥ 1024px | Desktop nav, padding, action buttons, grid columns |

### 4.2 What Changes at Each Breakpoint

| Feature | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Top nav section links | Hidden | Hidden | Visible |
| Mobile page title in nav | Visible | Visible | Hidden |
| Bottom tab bar | Visible | Visible | Hidden |
| Settings button (top right) | Hidden | Hidden | Visible |
| Desktop page header | Hidden | Hidden | Visible |
| Mobile action buttons | Visible | Visible | Hidden |
| Main padding horizontal | `px-3` | `px-3` | `px-8` |
| Main padding vertical | `py-6 pb-24` | `py-6 pb-24` | `py-10 pb-10` |
| Home card grid | 1 col | 3 cols | 3 cols |
| KPI card grid | 2 cols | 3 cols | 6 cols (or 7 for vehicles) |
| YoY row | Stacked (flex between) | 3 cols | 3 cols |
| Table hidden columns | `hidden sm:table-cell` | Visible | Visible |
| Mobile cycling column | Visible (`sm:hidden`) | Hidden | Hidden |
| Dialog style | Bottom sheet (slide up) | Centered modal (scale) | Centered modal |
| Dialog drag handle | Visible | Hidden (`sm:hidden`) | Hidden |
| Dialog backdrop blur | None | `backdrop-blur-sm` | `backdrop-blur-sm` |
| Time-span selector (<410px) | Select dropdown | n/a | n/a |
| Time-span selector (≥410px) | Full-width pills | Fit-width pills | Fit-width pills |
| Chart card padding | `p-4` | `p-6` | `p-6` |
| Table cell padding | `px-3` | `px-3` | `px-6` |
| Card grid gaps | `gap-3` | `gap-3` | `gap-4` |
| Section margins | `mb-6` | `mb-6` | `mb-8` |
| Table row cursor | `cursor-pointer` (opens drawer) | `cursor-default` | `cursor-default` |
| Mobile drawers | Open on row tap | Open on row tap (under lg) | Disabled (noop) |

### 4.3 Vehicle-Specific Responsive

| Feature | Mobile (<640) | Tablet (640–1023) | Desktop (≥1024) |
|---------|--------------|-------------------|-----------------|
| Vehicle card grid | 1 col | 2 cols | 3 cols |
| Vehicle detail KPI grid | 2 cols | 4 cols | 7 cols |
| Vehicle header layout | Stacked (photo on top) | Side-by-side (`sm:flex-row`) | Side-by-side |
| Photo area | Full width `h-36` | `w-48` sidebar | `w-56` sidebar |

---

## 5. Interaction & Animation Spec

### 5.1 Dialog Animations

**Desktop (≥640px) — Scale In:**
```css
/* Closed state */
.dialog-panel {
  transform: scale(0.95);
  opacity: 0;
  transition: transform 150ms ease, opacity 250ms ease;
}
/* Open state */
.dialog-panel.dialog-open {
  transform: scale(1);
  opacity: 1;
  transition: all 200ms ease;
}
```

**Mobile (<640px) — Slide Up:**
```css
/* Closed state */
.dialog-panel {
  transform: translateY(100%);
  opacity: 0;
  transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1), opacity 350ms ease;
}
/* Open state */
.dialog-panel.dialog-open {
  transform: translateY(0);
  opacity: 1;
  transition: all 300ms cubic-bezier(0.32, 0.72, 0, 1);
}
```

**JS open flow:** Remove `hidden` → next `requestAnimationFrame` → add `dialog-open` class.
**JS close flow:** Remove `dialog-open` → `setTimeout(300ms)` → add `hidden`.
**Escape key:** Closes topmost visible dialog.

### 5.2 Drawer Animations

```css
/* Closed (Tailwind classes) */
translate-y-full transition-transform duration-300 ease-out

/* Open: remove translate-y-full → defaults to translate-y-0 */
```

Backdrop fades via `opacity-0` → `opacity-100` transition.

### 5.3 Mobile Dropdown Animation

Inline JS animates:
- `maxHeight`: 0 → `scrollHeight + 'px'`
- `opacity`: 0 → 1
- `pointerEvents`: `none` → `auto`

CSS: `transition-all duration-200 ease-out`

### 5.4 Accordion Toggle

- Chevron rotation: toggle `rotate-180` class (`transition-transform duration-200`)
- Border radius swap: `rounded-2xl` ↔ `rounded-t-2xl`
- Content: toggle `hidden` class

### 5.5 Tab Switching

JS toggles: `active`, `font-medium`, `text-accent-700 dark:text-accent-400` on active tab; `text-base-400` on inactive.
The `::after` underline follows the `.active` class.

### 5.6 Collapsible Table (Show More/Less)

- `VISIBLE_ROWS = 5`
- Extra rows hidden via JS
- Toggle button text: "Show all N {type}" / "Show less"
- Chevron icon rotates `180deg` when expanded
- On collapse: `scrollIntoView({ behavior: 'smooth', block: 'start' })`

### 5.7 Row Hover Actions

Used in vehicle detail refueling/maintenance tables:
- Action buttons: `opacity-0 group-hover:opacity-100 transition-opacity`
- Buttons: edit (pencil) + delete (trash), both `w-3.5 h-3.5`

### 5.8 Skeleton Loading Animation

```css
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #e8e8e8 25%, #f1f1f1 50%, #e8e8e8 75%);
  background-size: 400px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
.dark .skeleton {
  background: linear-gradient(90deg, #3d3d3d 25%, #525252 50%, #3d3d3d 75%);
  background-size: 400px 100%;
}
```

### 5.9 Toast Notification

**Animation:**
```css
@keyframes toast-in {
  0% { transform: translateY(16px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.toast-animate { animation: toast-in 0.25s ease-out forwards; }
```

**Position:** Bottom-center, `fixed bottom-4 left-1/2 -translate-x-1/2`

**Container:** `flex items-center gap-3 px-4 py-3 bg-base-900 dark:bg-base-100 rounded-xl shadow-lg`

**Variants:**
| Type | Icon bg | Icon | Right action |
|------|---------|------|-------------|
| Success | `bg-emerald-500` | Checkmark | Close X |
| Info | `bg-blue-500` | Info dot | Close X |
| Error | `bg-rose-500` | X mark | Close X |
| Undo | `bg-base-600 dark:bg-base-400` | Trash | "Undo" text button |

Auto-dismiss: 4 seconds. Destructive actions show Undo button instead of close.

### 5.10 Spinner

```css
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 0.7s linear infinite; }
```

SVG: circle (opacity-25, stroke-width 3) + arc path (opacity-75, fill currentColor).

### 5.11 Tailwind Transition Classes Used

- `transition-colors` — most interactive elements
- `transition-shadow` — clickable cards
- `transition-opacity` — row actions, backdrop, hover overlays
- `transition-transform duration-200` — chevron rotation
- `transition-all duration-200 ease-out` — dropdown slide
- `transition-colors duration-200` — body background
- `animate-pulse` — staleness indicator dots

---

## 6. Component Reuse Map

### 6.1 Canonical Shared Components

#### A. SummaryKPICard

**Appears on:** Home overview (3 cards in overview card footer pattern), Utility detail (6 cards), Portfolio overview (6 cards), Platform detail (6 cards), Vehicle detail (7 cards)

**What varies:** Label text, value, unit suffix, sublabel text, optional percentage badge, grid column count
**What is identical:** Card shell (`rounded-2xl p-5 shadow-card`), typography hierarchy, spacing, dark mode

#### B. YoYComparisonRow

**Appears on:** Home overview, Portfolio overview, Platform detail (not shown but structure exists), Vehicle detail

**What varies:** Header label text, metric labels, metric values/colors, number of metrics (always 3)
**What is identical:** Container styling, 3-col grid, mobile flex-between pattern, dividers, typography

#### C. CollapsibleAccordion

**Appears on:** Portfolio overview (Performance Charts & Analysis), Vehicles overview (Sold Vehicles), Vehicle detail (Charts)

**What varies:** Icon, title text, optional count badge, content
**What is identical:** Toggle button styling, chevron rotation, rounded-corner swap, hidden toggle

#### D. TabBar

**Appears on:** Utility detail (Yearly | Monthly), Portfolio overview (Yearly | Monthly), Platform detail (Yearly | Monthly), Vehicle detail (Performance | Refueling | Maintenance)

**What varies:** Tab labels, tab count (2 or 3), optional right-side toggle, tab content
**What is identical:** Tab button styling, `::after` underline, border, padding, switching behavior

#### E. DataTable

**Appears on:** Utility detail (Meter Readings, Bills), Portfolio overview (Platforms, Cash, Closed, Yearly perf, Monthly perf), Platform detail (Data Points, Transactions, Yearly perf, Monthly perf), Vehicle detail (Performance, Refueling, Maintenance)

**What varies:** Columns, column count, mobile hidden columns, cycling columns (or not), data types, row click behavior
**What is identical:** Table container with overflow scroll, thead/tbody/totals styling, row hover, header typography, show-more toggle pattern

#### F. Dialog Shell

**Appears on:** All pages — 15+ distinct dialogs total

**What varies:** Title, form fields, footer buttons (2 or 3), max-width (`sm:max-w-md` or `sm:max-w-lg`)
**What is identical:** Root wrapper, backdrop, positioning logic, panel styling, drag handle, header/body/footer padding, open/close animation, escape key handling

Specific dialogs sharing this shell:
- Add Reading, Add Bill, Add Utility (Home)
- Edit Reading, Edit Bill (Utility detail)
- Add Platform, Add Data Point, Add Transaction, Add Portfolio, Edit Portfolio (Investment)
- Edit Data Point, Edit Transaction, Edit Platform (Platform detail)
- Add Refueling, Add Maintenance, Add Vehicle (Vehicles)
- Edit Refueling, Edit Maintenance, Edit Vehicle (Vehicle detail)

#### G. DeleteConfirmDialog

**Appears on:** Utility detail, Portfolio overview, Platform detail, Vehicle detail

**What varies:** Entity type in title ("Delete reading?", "Delete transaction?"), summary text
**What is identical:** `z-[60]`, `max-w-sm`, always centered, rose icon, button styling

#### H. MobileDrawer

**Appears on:** Utility detail (month, reading, bill), Platform detail (data point, performance, transaction)

**What varies:** Title format, field labels, data layout, footer buttons
**What is identical:** Drawer shell (fixed bottom, translate-y animation), drag handle, prev/next nav, backdrop, content padding

#### I. DropdownSwitcher

**Appears on:** Utility detail (utility switcher), Portfolio overview (portfolio switcher), Platform detail (platform switcher), Vehicle detail (vehicle switcher)

**What varies:** Trigger content (icon type, name format, metadata), dropdown width, items, section headers
**What is identical:** Desktop trigger styling, dropdown panel styling, active item indicator (border-l-2 accent), mobile full-width slide-down animation, click-outside dismiss

#### J. TimeSpanSelector

**Appears on:** Home overview chart, Utility detail chart, Portfolio overview chart, Platform detail chart, Vehicle detail chart

**What varies:** Available options (Home/Investment: 1M-All; Vehicles: 3M-All), default selection
**What is identical:** Dual-mode (select < 410px, pills ≥ 410px), styling, responsive behavior

#### K. YoYToggleButton

**Appears on:** Home overview chart, Utility detail chart, Portfolio overview chart, Platform detail chart, Vehicle detail chart

**What varies:** Nothing
**What is identical:** Everything — button styling, swap icon, active state classes

#### L. SegmentedControl

**Appears on:** Home overview (Consumption/Cost, Stacked/Grouped), Utility detail (Consumption/Cost/Cost-per-Unit), Portfolio overview (Earnings/XIRR), Platform detail (Earnings/XIRR), Vehicle detail (not used)

**What varies:** Option labels, option count (2 or 3)
**What is identical:** Container, active/inactive pill styling

#### M. ActionButtonPair (Page-level)

**Appears on:** Every page — desktop in page header, mobile in separate row below nav

**What varies:** Button labels, which is primary vs secondary
**What is identical:** Desktop: `flex items-center gap-3` in header. Mobile: `flex gap-2 mb-4 lg:hidden` with `flex-1` buttons.

### 6.2 Subtle Differences to Watch

| Pattern | Difference | Intentional? |
|---------|-----------|--------------|
| Form input `bg` in dark mode | Most dialogs: `dark:bg-base-900`. Add Utility dialog: `dark:bg-base-700` | **Incidental** — should unify to `dark:bg-base-900` |
| Form input focus ring opacity | Most inputs: `focus:ring-accent-500/30`. Add Utility: `focus:ring-accent-500/20` | **Incidental** — unify to `/30` |
| Form input `outline` | Most: `focus:outline-none`. Add Utility: `outline-none` (always) | **Incidental** — unify to `focus:outline-none` |
| Required asterisk color | Most labels: `text-rose-500`. Add Utility icon label: `text-red-400` | **Incidental** — unify to `text-rose-500` |
| Platform table row hover | `hover:bg-accent-50/30` vs perf table `hover:bg-accent-50/20` | **Intentional** — platform rows are clickable, perf rows less so. Could unify to `/20` |
| Table head background | Some tables: `bg-base-50/40 dark:bg-base-900/30`. Others: none | **Intentional** — tables with expand/click have bg, performance tables within tabs don't |
| Count badge shape | Portfolio overview: `rounded-full`. Some other: `rounded-lg` | **Incidental** — unify to `rounded-full` |
| ui-states.html base palette | Uses pure grays instead of green-tinted | **Incidental** — should use the green-tinted palette |
| Vehicle tables | No mobile column cycling, just `hidden sm:table-cell` | **Intentional** — simpler approach. Should be unified to use cycling for consistency |
| Drawer presence | Utility detail + Platform detail have drawers; others don't | **Intentional** — drawers only where detail rows exist to inspect |

### 6.3 Shared Component Library (Recommended)

Based on the reuse analysis, the following components should be built as shared:

| Component | Props |
|-----------|-------|
| `AppShell` | children, activeSection |
| `TopNav` | activeSection, pageTitle, subtitle (mobile), rightContent |
| `BottomTabBar` | activeSection |
| `Card` | children, className, onClick, hover |
| `KPICard` | label, value, unit, sublabel, badge, color |
| `KPIGrid` | items[], columns (responsive config) |
| `YoYRow` | label, period, metrics[] |
| `CollapsibleSection` | icon, title, count, children, defaultOpen |
| `TabBar` | tabs[], activeTab, onTabChange, rightContent |
| `DataTable` | columns[], data[], sortable, expandable, showMore, mobileColumns (cycling config) |
| `MobileCyclingColumn` | columns[], activeIndex, onCycle |
| `Dialog` | title, children, footer, maxWidth, onClose |
| `DeleteConfirmDialog` | entityType, summary, onConfirm, onCancel |
| `MobileDrawer` | title, children, footer, onPrev, onNext, hasPrev, hasNext |
| `DropdownSwitcher` | trigger, items[], activeId, onChange, sections[] |
| `TimeSpanSelector` | options[], selected, onChange |
| `YoYToggle` | active, onChange |
| `SegmentedControl` | options[], selected, onChange |
| `FormField` | label, required, children, error |
| `TextInput` | ...standard props + mono |
| `NumberInput` | ...standard props + suffix |
| `SelectInput` | ...standard props + options |
| `FileUpload` | label, accept, multiple |
| `Button` | variant (primary/secondary/ghost/destructive/text), loading, children |
| `StalenessBadge` | level (warning/critical), size (sm/md/lg) |
| `TransactionTypeBadge` | type (deposit/withdrawal), mobile (abbreviated) |
| `PlatformIcon` | src, size (sm/md/lg) |
| `Toast` | type (success/info/error/undo), title, message, onClose, onUndo |
| `Skeleton` | variant (kpiCard/chart/tableRow), count |
| `EmptyState` | icon, title, message, action |
| `ErrorState` | icon, title, message, retry |
| `ChangeIndicator` | value, format (percent/absolute), direction (up/down) |
| `ProportionalBar` | segments[] (label, value, color) |

---

## Appendix: Icon Inventory

All icons are inline SVGs with `fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"`.

| Icon | Lucide Equivalent | Size(s) Used | Notes |
|------|-------------------|-------------|-------|
| House | `Home` | w-5 h-5 | Mobile tab |
| Trending up | `TrendingUp` | w-5 h-5 | Mobile tab |
| Car | `Car` | w-5 h-5 | Mobile tab |
| Settings gear | `Settings` | w-4 h-4, w-5 h-5 | Desktop + mobile |
| Chevron right | `ChevronRight` | w-3 h-3, w-4 h-4 | Cards, cycling, dropdowns |
| Chevron left | `ChevronLeft` | w-4 h-4 | Back button |
| Chevron down | `ChevronDown` | w-3 h-3, w-3.5 h-3.5, w-4 h-4 | Dropdowns, accordions, selects |
| Chevron up | n/a (rotate down) | w-3 h-3 | Change indicator (positive) — stroke-width 2.5 |
| Bolt/Zap | `Zap` | w-4 h-4 | Electricity icon |
| Droplet | `Droplet` | w-4 h-4 | Water icon |
| Flame | `Flame` | w-4 h-4 | Heat icon |
| Sun | `Sun` | w-4 h-4 | Icon picker, dark mode toggle |
| Wind | `Wind` | w-4 h-4 | Icon picker |
| Thermometer | `Thermometer` | w-4 h-4 | Icon picker |
| Wifi | `Wifi` | w-4 h-4 | Icon picker |
| Trash | `Trash2` | w-3.5 h-3.5, w-4 h-4, w-5 h-5 | Delete actions, icon picker |
| Pencil/Edit | `Pencil` | w-3.5 h-3.5 | Edit actions |
| Plus | `Plus` | w-4 h-4, w-6 h-6 | Add buttons, empty states |
| Cloud upload | `CloudUpload` | w-4 h-4, w-5 h-5 | File upload |
| Camera | `Camera` | w-4 h-4 | Icon upload |
| Image | `Image` | w-6 h-6 | Photo upload placeholder |
| Clipboard | `ClipboardList` | w-5 h-5 | Empty state (no transactions) |
| Chart/trend | `LineChart` | w-5 h-5, w-8 h-8 | Empty state (no data points, insufficient data) |
| Double arrow | `ArrowLeftRight` | w-3 h-3, w-3.5 h-3.5 | YoY toggle |
| Info | `Info` | w-3.5 h-3.5, w-4 h-4 | Interpolation banner, info toast |
| X / Close | `X` | w-4 h-4 | Toast close, error toast icon |
| Check | `Check` | w-3.5 h-3.5 | Dropdown active, success toast |
| Warning triangle | `AlertTriangle` | w-5 h-5 | Error states |
| Wifi off | `WifiOff` | w-6 h-6 | Server unreachable |
| Moon | `Moon` | w-4 h-4 | Dark mode (light mode visible) |
| Paperclip | `Paperclip` | w-3.5 h-3.5 | Attachment indicator |
| Speech bubble | `MessageSquare` | w-3.5 h-3.5 | Note indicator |
| Bar chart | `BarChart3` | w-3.5 h-3.5, w-4 h-4 | Chart toggle, accordion |
| Grid | `LayoutGrid` | w-4 h-4 | Portfolio overview link |
| Tag | `Tag` | w-3 h-3 | License plate chip |
| List | `List` | w-4 h-4 | All vehicles link |

---

## Appendix: Platform Icon Assets

| File | Platform |
|------|----------|
| `icons/icon_nordnet.webp` | Nordnet |
| `icons/icon_mintos.webp` | Mintos |
| `icons/icon_kameo.png` | Kameo |
| `icons/icon_revolut.webp` | Revolut |
| `icons/icon_danske-bank.png` | Danske Bank |
| `icons/icon_saxo.png` | Saxo Investor |

---

## Appendix: Chart Specifications (from Placeholders)

All charts are placeholder boxes in the prototypes. These specs come from the placeholder descriptions:

| Chart | Page | Type | Details |
|-------|------|------|---------|
| Monthly Overview | Home overview | Bar (grouped/stacked) | Per-utility bars by month, color-coded by utility type. Toggle: Consumption/Cost. YoY: ghost bars. |
| Consumption & Cost | Utility detail | Bar | Single utility, monthly bars. Toggle: Consumption/Cost/Cost-per-Unit. |
| Portfolio Value Over Time — Value | Portfolio overview | Stacked Area | Each platform's value stacked. YoY: dashed ghost line. |
| Portfolio Value Over Time — Performance | Portfolio overview | Bar | Green/red bars per month, values on bars. YoY: semi-transparent bars. |
| Yearly Analysis | Portfolio overview + Platform detail | Bar | Green/red bars per year. |
| Monthly Analysis | Portfolio overview + Platform detail | Bar | Green/red bars per month. Toggle: Earnings/XIRR %. |
| Performance Overview | Platform detail | Line/Area | Earnings line. Toggle: XIRR cumulative. YoY: dashed ghost. |
| Fuel Efficiency Over Time | Vehicle detail | Line (scatter + rolling avg) | Dots per refueling + rolling average line (5). YoY: dashed ghost. |
| Monthly Fuel Cost | Vehicle detail | Bar | DKK per month. YoY: ghost bars. |
| Monthly Km Driven | Vehicle detail | Bar | Km per month. YoY: ghost bars. |
| Maintenance Cost Timeline | Vehicle detail | Dot/Lollipop | Events on timeline, DKK on y-axis. |

**Chart placeholder styling:**
```
h-[height] flex items-center justify-center text-sm text-base-200 dark:text-base-600
border border-dashed border-base-150 dark:border-base-700 rounded-xl
bg-base-50/30 dark:bg-base-900/30
```

Heights vary: `h-44`, `h-48`, `h-52`, `h-56`, `h-64`, `sm:h-80`

---

## Appendix: Empty & Error States (from ui-states.html)

### Loading States
1. **KPI Card Skeleton** — 3 shimmer bars (label h-3, value h-6, sublabel h-3) inside card shell
2. **Chart Card Skeleton** — title bar h-4 + chart area h-48
3. **Table Card Skeleton** — header bar + column headers + 3 data rows (h-3.5)
4. **Button Loading** — spinner (0.7s linear infinite) + "Saving..." / "Loading..." text, `opacity-75 cursor-not-allowed`

### Error States
1. **Card Load Error** — rose warning icon in circle, "Failed to load [entity]", retry button
2. **Full Page Server Error** — wifi-off icon, "Can't reach the server", PocketBase URL in mono, retry CTA
3. **Form Validation Error** — rose border on field, error icon + message below in `text-rose-500`

### Empty States
1. **First Run (no entities)** — accent plus icon in circle, encouraging heading, instructional subtext, primary CTA
2. **No Records in Table** — gray icon in circle, muted text, smaller format inside existing card with header
3. **Insufficient Chart Data** — chart icon in dashed container, "Not enough data", minimum requirement text
