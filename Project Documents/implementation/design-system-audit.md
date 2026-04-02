# Design System Audit — Definitive Component Library Specification

**Generated**: 2026-04-01
**Sources**: `design-artifacts/specs/design-system.md` + 7 HTML prototypes
**Resolution Rule**: Prototypes win when they conflict with the spec (they represent latest design decisions)

---

## 1. Definitive Design Tokens

### 1.1 Color Palette

The spec defined a **teal accent + stone neutral** scheme. All 7 prototypes use a **green accent + custom warm-gray neutral** scheme instead.

**RESOLUTION: Prototypes win.**

#### Accent Colors (Green, not Teal)

| Token | Hex | Tailwind Key | Usage |
|-------|-----|-------------|-------|
| accent-50 | `#f0fdf4` | `accent.50` | Selected nav bg (light), active list bg |
| accent-100 | `#dcfce7` | `accent.100` | — |
| accent-200 | `#bbf7d0` | `accent.200` | Active YoY toggle border (light) |
| accent-400 | `#4ade80` | `accent.400` | Dark mode accent text, tab underline (dark) |
| accent-500 | `#22c55e` | `accent.500` | Focus ring, dot indicators |
| accent-600 | `#16a34a` | `accent.600` | Tab underline (light), primary CTA bg (dark mode) |
| accent-700 | `#15803d` | `accent.700` | Primary accent text (light mode), nav selected |

> **Discrepancy**: Spec says teal `#0f766e`. Prototypes use green `#15803d`. These are Tailwind's `green-700` values, NOT teal.

#### Base (Neutral) Colors — Custom warm-gray scale

| Token | Hex | Tailwind Key | Usage |
|-------|-----|-------------|-------|
| base-50 | `#f7f9f7` | `base.50` | Subtle bg, mobile back button bg |
| base-100 | `#f0f2f0` | `base.100` | Page background (light), toggle track bg |
| base-150 | `#e7e9e7` | `base.150` | Borders, nav bottom-border, skeleton base |
| base-200 | `#d3d5d3` | `base.200` | Input borders, card borders, dividers |
| base-300 | `#afb1af` | `base.300` | Chevron icons, secondary labels, tertiary text |
| base-400 | `#898b89` | `base.400` | Secondary text, labels, inactive nav, placeholders |
| base-500 | `#6a6c6a` | `base.500` | Form labels (required fields), settings icon |
| base-600 | `#515351` | `base.600` | Secondary button text, card borders (dark) |
| base-700 | `#3c3e3c` | `base.700` | Dark mode card bg, toggle track (dark), dropdowns |
| base-800 | `#252725` | `base.800` | Dark mode card/nav bg, dark mode surfaces |
| base-900 | `#161816` | `base.900` | Dark mode page bg, primary CTA bg (light mode), body text |

> **Discrepancy**: Spec uses Tailwind `stone-*` (`#fafaf9`, `#e7e5e4`, etc.). Prototypes use a custom greenish warm-gray scale with slightly green tints (`#f7f9f7`, `#e7e9e7`). The `ui-states.html` prototype uses a slightly different neutral scale (`#f8f8f8`, `#f1f1f1`, etc. — pure gray) but this is the oldest prototype; the 6 main prototypes all share the green-tinted base.

#### White Override

| Token | Hex | Usage |
|-------|-----|-------|
| white | `#fafcfa` | Card/surface bg, overrides Tailwind's default `#ffffff` |

> **Note**: This is a subtle off-white with a very slight green tint. All prototypes except `ui-states.html` use this.

#### Semantic Colors (unchanged from Tailwind defaults — NOT customized)

| Purpose | Light | Dark | Tailwind Classes |
|---------|-------|------|-----------------|
| Positive / Gain | `emerald-600` | `emerald-400` | `text-emerald-600 dark:text-emerald-400` |
| Negative / Loss | `rose-500` | `rose-400` | `text-rose-500 dark:text-rose-400` |
| Warning (amber staleness) | `amber-600` | `amber-400` | `text-amber-600 dark:text-amber-400` |
| Error (red staleness) | `rose-600` | `rose-400` | `text-rose-600 dark:text-rose-400` |
| Info | `blue-500` | `blue-400` | Used in toasts |

#### Custom Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `card` | `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)` | All cards, nav bar (light) |
| `card-dark` | `0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)` | All cards, nav bar (dark) |

> **Discrepancy**: Spec says "No shadow — uses border only" and "No rounded corners". Prototypes use `shadow-card` on ALL cards and `rounded-2xl` (16px) on all cards. **Prototypes win completely here.**

### 1.2 Typography

| Spec Says | Prototypes Use | Resolution |
|-----------|---------------|------------|
| `Inter` (sans) | `DM Sans` (sans) | **DM Sans wins** |
| `JetBrains Mono` (mono) | `DM Mono` (mono) | **DM Mono wins** |

#### Definitive Font Configuration

```css
body { font-family: 'DM Sans', system-ui, sans-serif; }
.font-mono-data { font-family: 'DM Mono', monospace; font-variant-numeric: tabular-nums; }
```

**Google Fonts URL** (used in all prototypes):
```
https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap
```

#### Typographic Scale (from prototypes)

| Element | Font | Weight | Size | Tailwind Classes |
|---------|------|--------|------|-----------------|
| Page Title | DM Sans | 700 (bold) | 24px | `text-2xl font-bold tracking-tight` |
| Section Header | DM Sans | 600 (semibold) | 14px | `text-sm font-semibold` |
| Card Label | DM Sans | 400 | 12px | `text-xs text-base-400` |
| Uppercase Label | DM Sans | 400 | 10px | `text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500` |
| Large Number | DM Mono | 500 | 20px | `font-mono-data text-xl font-medium` |
| Table Number | DM Mono | 400 | 14px | `font-mono-data` or `font-mono-data text-base-500` |
| Form Label | DM Sans | 500 | 12px | `text-xs font-medium text-base-500 dark:text-base-400` |
| Body Text | DM Sans | 400 | 14px | `text-sm` |
| Tiny Text | DM Sans | 500 | 10px | `text-[10px] font-medium` |
| Mobile Nav Title | DM Sans | 700 | 14px | `text-sm font-bold tracking-tight` |
| Brand | DM Sans | 700 | 20px | `text-xl font-bold tracking-tight` |

### 1.3 Border Radius

| Spec Says | Prototypes Use | Resolution |
|-----------|---------------|------------|
| No rounded corners | `rounded-2xl` (16px) on cards | **Prototypes win** |
| Sharp edges everywhere | `rounded-lg` (8px) on buttons, inputs, toggles | **Prototypes win** |
| — | `rounded-xl` (12px) on dropdowns, switcher buttons | Prototype standard |
| — | `rounded-full` on badges/pills | Prototype standard |
| — | `rounded-md` (6px) on toggle segments | Prototype standard |

#### Definitive Radius Scale

| Element | Radius | Class |
|---------|--------|-------|
| Cards, dialogs, chart areas | 16px | `rounded-2xl` |
| Dropdowns, switcher buttons, back buttons | 12px | `rounded-xl` |
| Buttons, inputs, selects, toggle containers | 8px | `rounded-lg` |
| Toggle segments, pill badge insets | 6px | `rounded-md` |
| Badges/pills, staleness dots, fuel type badges | 9999px | `rounded-full` |

---

## 2. Tailwind Configuration (Copy-Paste Ready)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'accent': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        'white': '#fafcfa',
        'base': {
          50: '#f7f9f7',
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
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      maxWidth: {
        'content': '1440px',
      },
    },
  },
}
```

### Required CSS

```css
body { font-family: 'DM Sans', system-ui, sans-serif; }
.font-mono-data { font-family: 'DM Mono', monospace; font-variant-numeric: tabular-nums; }

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { background: #c4c4c4; border-radius: 3px; }
.dark ::-webkit-scrollbar-thumb { background: #525252; }

/* Custom select arrow (form-select class) */
select.form-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%238a8a8a' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1rem;
  -webkit-appearance: none;
  appearance: none;
}

/* Tab underline */
.tab-btn { position: relative; }
.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #16a34a;
  border-radius: 1px;
}
.dark .tab-btn.active::after { background: #4ade80; }
.tab-content { display: none; }
.tab-content.active { display: block; }

/* Skeleton shimmer animation */
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

/* Toast animation */
@keyframes toast-in {
  0% { transform: translateY(16px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
.toast-animate { animation: toast-in 0.25s ease-out forwards; }

/* Spinner */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { animation: spin 0.7s linear infinite; }
```

---

## 3. Component Catalog — Canonical Markup

### 3.1 Navigation — Desktop Top Nav

**Appears in**: All 7 prototypes (consistent)

```html
<nav class="bg-white dark:bg-base-800 shadow-card dark:shadow-card-dark sticky top-0 z-30 relative">
  <div class="max-w-[1440px] mx-auto px-3 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-10">
        <!-- Brand (desktop only) -->
        <div class="hidden lg:block text-xl font-bold tracking-tight">Insight</div>
        <!-- Section nav tabs (desktop only) -->
        <div class="hidden lg:flex gap-1">
          <!-- Active tab -->
          <a href="#" class="px-4 py-2 text-sm rounded-lg font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-700/20">{ActiveSection}</a>
          <!-- Inactive tab -->
          <a href="#" class="px-4 py-2 text-sm rounded-lg text-base-400 dark:text-base-400 hover:text-base-600 dark:hover:text-base-200 transition-colors">{InactiveSection}</a>
        </div>
        <!-- Mobile: page title / switcher (varies per page — see DetailPageSwitcher) -->
        <div class="flex lg:hidden items-center gap-2.5">
          {mobile-header-content}
        </div>
      </div>
      <!-- Settings button (desktop only) -->
      <div class="hidden lg:flex items-center">
        <button class="w-9 h-9 rounded-xl bg-base-150 dark:bg-base-700 flex items-center justify-center text-base-500 dark:text-base-300 hover:bg-base-200 dark:hover:bg-base-600 transition-colors">
          {settings-icon}
        </button>
      </div>
    </div>
  </div>
</nav>
```

**Variants**:
- **Overview pages** (home, portfolio, vehicles): Mobile header shows page title + subtitle
- **Detail pages** (utility-detail, platform-detail, vehicle-detail): Mobile header shows back button + item switcher dropdown

### 3.2 Navigation — Mobile Bottom Tab Bar

**Appears in**: All overview & detail prototypes (consistent)

```html
<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 z-30 lg:hidden">
  <div class="flex items-center justify-around h-16">
    <!-- Active tab -->
    <a href="#" class="flex flex-col items-center gap-1 px-4 py-2 text-accent-600 dark:text-accent-400">
      <svg class="w-5 h-5" ...>{icon}</svg>
      <span class="text-[10px] font-medium">{Label}</span>
    </a>
    <!-- Inactive tab -->
    <a href="#" class="flex flex-col items-center gap-1 px-4 py-2 text-base-400">
      <svg class="w-5 h-5" ...>{icon}</svg>
      <span class="text-[10px] font-medium">{Label}</span>
    </a>
    <!-- Settings tab (replaces dark mode toggle) -->
    <a href="#" class="flex flex-col items-center gap-1 px-4 py-2 text-base-400">
      <svg class="w-5 h-5" ...>{settings-icon}</svg>
      <span class="text-[10px] font-medium">Settings</span>
    </a>
  </div>
</nav>
```

### 3.3 StatCard — Summary KPI Card

**Appears in**: All prototypes (6 or 7 per detail page, 3 per home overview, etc.)
**Consistent across all prototypes.**

#### Variant A: Simple Value

```html
<div class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
  <div class="text-xs text-base-400 mb-2">{Label}</div>
  <div class="font-mono-data text-xl font-medium">{Value}</div>
  <div class="text-xs text-base-300 dark:text-base-500 mt-1.5">{Subtitle}</div>
</div>
```

#### Variant B: Colored Value (positive/negative)

```html
<div class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
  <div class="text-xs text-base-400 mb-2">{Label}</div>
  <div class="font-mono-data text-xl font-medium text-emerald-600 dark:text-emerald-400">{Value}</div>
  <div class="text-xs text-base-300 dark:text-base-500 mt-1.5">{Subtitle}</div>
</div>
```

#### Variant C: Value with Percent Badge

```html
<div class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
  <div class="text-xs text-base-400 mb-2">{Label}</div>
  <div class="font-mono-data text-xl font-medium text-emerald-600 dark:text-emerald-400">{Value}</div>
  <div class="font-mono-data text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md inline-block mt-1.5">{+X%}</div>
</div>
```

#### Variant D: Value with Unit Suffix

```html
<div class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
  <div class="text-xs text-base-400 mb-2">{Label}</div>
  <div class="font-mono-data text-xl font-medium">{Value}<span class="text-xs text-base-300">%</span></div>
  <div class="text-xs text-base-300 dark:text-base-500 mt-1.5">{Subtitle}</div>
</div>
```

### 3.4 UtilityCard (Home overview)

**Appears in**: `home-overview.html` only

```html
<a href="{detail-url}" class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark block hover:shadow-lg dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer group relative">
  <!-- Header: Icon + Name + Stale Badge + Chevron -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-{color}-50 dark:bg-{color}-900/30 flex items-center justify-center">
        <svg class="w-4 h-4 text-{color}-600 dark:text-{color}-400" ...>{icon}</svg>
      </div>
      <div>
        <div class="text-sm font-semibold">{Name}</div>
        <div class="text-xs text-base-400">{Unit}</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      {optional-stale-badge}
      <svg class="w-4 h-4 text-base-200 dark:text-base-600 group-hover:text-base-400 dark:group-hover:text-base-400 transition-colors" ...>{chevron-right}</svg>
    </div>
  </div>
  <!-- Metrics: 2-col grid -->
  <div class="grid grid-cols-2 gap-4 mb-3">
    <div>
      <div class="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">{MetricLabel}</div>
      <div class="font-mono-data text-xl font-medium">{Value}</div>
      <div class="text-xs text-base-400">{Unit}</div>
    </div>
    <div>
      <div class="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500 mb-1">{MetricLabel}</div>
      <div class="font-mono-data text-xl font-medium">{Value}</div>
      <div class="text-xs text-base-400">{Unit}</div>
    </div>
  </div>
  <!-- Trend -->
  <div class="font-mono-data text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5 mb-3">
    <svg class="w-3 h-3" ...>{arrow}</svg>
    {trend-text}
  </div>
  <!-- Footer stats -->
  <div class="border-t border-base-100 dark:border-base-700 pt-3 grid grid-cols-3 gap-2 text-xs">
    <div>
      <div class="text-base-300 dark:text-base-500 mb-0.5">{Label}</div>
      <div class="font-mono-data font-medium">{Value}</div>
    </div>
    <div>
      <div class="text-base-300 dark:text-base-500 mb-0.5">{Label}</div>
      <div class="font-mono-data font-medium">{Value}</div>
    </div>
    <div class="text-right">
      <div class="text-base-300 dark:text-base-500 mb-0.5">{Label}</div>
      <div class="font-mono-data">{Value}</div>
    </div>
  </div>
</a>
```

### 3.5 VehicleCard (Vehicles overview)

**Appears in**: `vehicles-overview.html` only

```html
<a href="{detail-url}" class="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark block hover:shadow-lg dark:hover:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)] transition-shadow cursor-pointer group overflow-hidden">
  <!-- Photo area with fuel type badge -->
  <div class="h-40 bg-gradient-to-br from-{color}-50 to-{color}-100 dark:from-{color}-950/60 dark:to-{color}-900/40 relative flex items-center justify-center">
    <svg class="w-24 h-24 text-{color}-200 dark:text-{color}-900" ...>{silhouette}</svg>
    <span class="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-medium rounded-full bg-{fuelColor}-100 text-{fuelColor}-700 dark:bg-{fuelColor}-900/50 dark:text-{fuelColor}-300 border border-{fuelColor}-200/80 dark:border-{fuelColor}-700/60">{FuelType}</span>
    <div class="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/60 dark:bg-base-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
      <svg class="w-3.5 h-3.5 text-base-600 dark:text-base-300" ...>{chevron}</svg>
    </div>
  </div>
  <!-- Card Body (same layout as UtilityCard body) -->
  <div class="p-5">
    {Same structure: header, 2-col metrics, trend, footer stats}
  </div>
</a>
```

**Sold variant**: Add `opacity-60 hover:opacity-90 transition-opacity` to outer `<a>`, add "Sold" badge top-left.

### 3.6 PlatformCard (Portfolio overview — as table rows)

Platforms in the portfolio overview are displayed as **table rows**, not cards. See DataTable (§3.7).

### 3.7 DataTable

**Appears in**: portfolio-overview, platform-detail (yearly/monthly tabs)

#### Desktop Table

```html
<div class="overflow-x-auto -mx-4 sm:-mx-6 px-3 lg:px-6" id="{table-id}">
  <table class="w-full text-sm sm:min-w-[640px]">
    <thead>
      <tr class="border-b border-base-150 dark:border-base-700">
        <th class="text-left font-medium text-base-300 dark:text-base-500 px-4 py-3 text-xs">{Column}</th>
        <th class="hidden sm:table-cell text-right font-medium text-base-300 dark:text-base-500 px-4 py-3 text-xs">{Column}</th>
        <!-- Mobile cyclable column header -->
        <th class="sm:hidden text-right font-medium text-base-300 dark:text-base-500 px-4 py-3 text-xs">
          {MobileColumnCycler — see §3.15}
        </th>
      </tr>
    </thead>
    <tbody>
      <!-- Data row -->
      <tr class="border-b border-base-100 dark:border-base-700/50 hover:bg-accent-50/20 dark:hover:bg-accent-900/10 transition-colors">
        <td class="px-4 py-3 font-medium">{Period}</td>
        <td class="hidden sm:table-cell px-4 py-3 text-right font-mono-data text-base-500 dark:text-base-400">{Value}</td>
        <td class="px-4 py-3 text-right font-mono-data text-emerald-600 dark:text-emerald-400">{Earnings}</td>
        <td class="hidden sm:table-cell px-4 py-3 text-right font-mono-data font-medium">{XIRR}</td>
        <!-- Mobile cyclable values -->
        <td class="sm:hidden px-4 py-3 text-right">{MobileColumnCyclerValues}</td>
      </tr>
      <!-- Totals row -->
      <tr class="bg-base-50/60 dark:bg-base-900/40 font-medium">
        <td class="px-4 py-3">{Label}</td>
        <td class="px-4 py-3 text-right font-mono-data">{Value}</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Key Table Conventions

- Header text: `text-xs font-medium text-base-300 dark:text-base-500`
- Cell padding: `px-4 py-3` (consistent across all tables)
- Row border: `border-b border-base-100 dark:border-base-700/50`
- Row hover: `hover:bg-accent-50/20 dark:hover:bg-accent-900/10`
- Numbers right-aligned: `text-right font-mono-data`
- Secondary values: `text-base-500 dark:text-base-400`
- Positive values: `text-emerald-600 dark:text-emerald-400`
- Negative values: `text-rose-500 dark:text-rose-400`
- Totals row bg: `bg-base-50/60 dark:bg-base-900/40 font-medium`

### 3.8 Dialog / Modal

**Appears in**: All prototypes. Consistent pattern.

```html
<div id="{dialog-id}" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/40 sm:backdrop-blur-sm transition-opacity duration-200" onclick="closeDialog('{dialog-id}')"></div>
  <!-- Panel positioning: bottom sheet on mobile, centered on desktop -->
  <div class="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
    <div class="dialog-panel bg-white dark:bg-base-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
      <!-- Mobile drag handle -->
      <div class="sm:hidden flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600"></div>
      </div>
      <!-- Header -->
      <div class="px-5 sm:px-6 pb-4 pt-2 sm:pt-5">
        <h3 class="text-base font-semibold">{Title}</h3>
      </div>
      <!-- Form body -->
      <div class="px-5 sm:px-6 pb-6 space-y-4">
        {form-fields}
      </div>
      <!-- Footer -->
      <div class="px-5 sm:px-6 py-4 flex items-center justify-end gap-3">
        <button class="px-4 py-2.5 text-sm font-medium text-base-600 dark:text-base-300 hover:text-base-800 dark:hover:text-base-100 transition-colors">Cancel</button>
        <button class="px-4 py-2.5 text-sm font-medium text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg hover:bg-base-50 dark:hover:bg-base-700 transition-colors">Save & Add Another</button>
        <button class="px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 hover:bg-base-800 dark:hover:bg-accent-700 rounded-lg transition-colors">Save {Item}</button>
      </div>
    </div>
  </div>
</div>
```

### 3.9 DeleteConfirmDialog

**Appears in**: `ui-states.html`

```html
<div class="bg-white dark:bg-base-800 rounded-2xl shadow-lg max-w-sm w-full p-6">
  <div class="w-10 h-10 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
    <svg class="w-5 h-5 text-rose-500 dark:text-rose-400" ...>{trash-icon}</svg>
  </div>
  <div class="text-center mb-5">
    <div class="text-base font-semibold mb-1">{Title}?</div>
    <div class="text-sm text-base-400">{Description}</div>
  </div>
  <div class="flex gap-3">
    <button class="flex-1 px-4 py-2.5 text-sm text-base-500 bg-white dark:bg-base-700 border border-base-200 dark:border-base-600 rounded-lg hover:bg-base-50 dark:hover:bg-base-600 transition-colors">Cancel</button>
    <button class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg shadow-sm hover:bg-rose-600 transition-colors">Delete</button>
  </div>
</div>
```

### 3.10 TimeSpanSelector

**Appears in**: portfolio-overview, platform-detail, utility-detail, home-overview chart areas

Two responsive variants stacked:

```html
<!-- Narrow screen (<410px): dropdown -->
<select class="min-[410px]:hidden w-full px-3 py-2 text-sm bg-base-100 dark:bg-base-700 border border-base-200 dark:border-base-600 rounded-lg text-base-900 dark:text-base-100 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500">
  <option>1M</option>
  <option>3M</option>
  <option>6M</option>
  <option>MTD</option>
  <option selected>YTD</option>
  <option>1Y</option>
  <option>3Y</option>
  <option>5Y</option>
  <option>All</option>
</select>
<!-- Wide screen (>=410px): pill buttons -->
<div class="hidden min-[410px]:flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5 w-full sm:w-fit">
  <!-- Inactive -->
  <button class="flex-1 sm:flex-none sm:px-2.5 py-1 text-xs rounded-md text-base-400 hover:text-base-600 dark:hover:text-base-200 text-center">{Period}</button>
  <!-- Active -->
  <button class="flex-1 sm:flex-none sm:px-2.5 py-1 text-xs rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-base-100 font-medium shadow-sm text-center">{Period}</button>
</div>
```

### 3.11 ChartModeToggle (Earnings/XIRR, Consumption/Cost)

**Appears in**: All chart areas across prototypes (consistent)

```html
<div class="flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5">
  <!-- Active -->
  <button class="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-base-100 font-medium shadow-sm">{ActiveLabel}</button>
  <!-- Inactive -->
  <button class="px-2.5 py-1 text-xs rounded-md text-base-400">{InactiveLabel}</button>
</div>
```

### 3.12 YoYToggle

**Appears in**: All chart areas (consistent)

```html
<!-- Inactive state -->
<button class="px-2.5 py-1 text-xs rounded-lg border text-base-400 border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500 transition-colors flex items-center gap-1.5">
  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
  </svg>
  YoY
</button>

<!-- Active state (toggled classes) -->
<!-- Adds: bg-accent-50 dark:bg-accent-700/20 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-600 -->
<!-- Removes: text-base-400 border-base-200 dark:border-base-600 -->
```

### 3.13 StalenessIndicator (Badge)

**Appears in**: home-overview (cards), utility-detail, platform-detail, portfolio-overview

Two severity levels:

#### Amber (warning — between 2nd and 7th of month)

```html
<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium rounded-full border border-amber-600 dark:border-amber-400">
  <span class="w-1.5 h-1.5 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>Stale
</span>
```

#### Red (critical — after 7th of month)

```html
<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-full border border-rose-600 dark:border-rose-400">
  <span class="w-1.5 h-1.5 bg-rose-500 dark:bg-rose-400 rounded-full animate-pulse"></span>Stale
</span>
```

#### Smaller variant (inside dropdown lists)

Uses `px-1.5 py-0.5 text-[10px]` and `w-1 h-1` dot instead.

#### Mobile header variant (larger, more prominent)

```html
<span class="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold rounded-full shrink-0 border border-amber-700 dark:border-amber-400">
  <span class="w-2 h-2 bg-amber-500 dark:bg-amber-400 rounded-full animate-pulse"></span>Stale
</span>
```

### 3.14 Buttons

#### Primary Button

```html
<button class="px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg shadow-sm hover:bg-base-800 dark:hover:bg-accent-700 transition-colors">{Label}</button>
```

> Note: Light mode uses `bg-base-900` (near-black), dark mode uses `bg-accent-600` (green). This is consistent across all prototypes.

#### Secondary Button

```html
<button class="px-4 py-2 text-sm text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg shadow-sm hover:border-base-300 dark:hover:border-base-500 transition-colors">{Label}</button>
```

#### Ghost Button (Cancel)

```html
<button class="px-4 py-2.5 text-sm font-medium text-base-600 dark:text-base-300 hover:text-base-800 dark:hover:text-base-100 transition-colors">Cancel</button>
```

#### Destructive Button

```html
<button class="px-4 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg shadow-sm hover:bg-rose-600 transition-colors">Delete</button>
```

#### Loading Button

```html
<button class="px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg shadow-sm opacity-75 cursor-not-allowed inline-flex items-center gap-2">
  <svg class="w-4 h-4 spinner" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
  </svg>
  Saving...
</button>
```

#### Mobile Action Buttons (page-level)

```html
<div class="flex gap-2 mb-4 lg:hidden">
  <button class="flex-1 px-4 py-2 text-sm text-base-600 dark:text-base-300 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg shadow-card dark:shadow-card-dark hover:border-base-300 dark:hover:border-base-500 transition-colors">{SecondaryAction}</button>
  <button class="flex-1 px-4 py-2 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg hover:bg-base-800 dark:hover:bg-accent-700 transition-colors">{PrimaryAction}</button>
</div>
```

### 3.15 MobileColumnCycler

**Appears in**: portfolio-overview tables, platform-detail tables

```html
<th class="sm:hidden text-right font-medium text-base-300 dark:text-base-500 px-4 py-3 text-xs">
  <button onclick="cycleColumn(event, '{table-id}')" class="inline-flex flex-col items-end gap-1">
    <span class="flex items-center gap-1.5">
      <span class="grid justify-items-end">
        <span class="cycle-header [grid-area:1/1]" data-col="{col1}">{Header1}</span>
        <span class="cycle-header [grid-area:1/1] invisible" data-col="{col2}">{Header2}</span>
        <!-- ... more columns -->
      </span>
      <svg class="w-3 h-3 text-base-300" ...>{chevron-right}</svg>
    </span>
    <span class="flex gap-0.5 cycle-dots">
      <span class="w-1 h-1 rounded-full bg-accent-500"></span>
      <span class="w-1 h-1 rounded-full bg-base-300 dark:bg-base-500"></span>
      <!-- ... more dots -->
    </span>
  </button>
</th>
```

Cell values use `grid` overlay for zero-layout-shift cycling:
```html
<td class="sm:hidden px-4 py-3 text-right">
  <div class="grid">
    <div class="cycle-val [grid-area:1/1]" data-col="{col1}">{Value1}</div>
    <div class="cycle-val [grid-area:1/1] invisible" data-col="{col2}">{Value2}</div>
  </div>
</td>
```

### 3.16 FormInput

**Appears in**: All dialog forms (consistent)

```html
<!-- Text/Number Input -->
<div>
  <label class="block text-xs font-medium text-base-500 dark:text-base-400 mb-1.5">{Label} <span class="text-rose-500">*</span></label>
  <input type="{type}" placeholder="{placeholder}" class="w-full px-3 py-2.5 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 placeholder:text-base-300 dark:placeholder:text-base-500 transition-colors">
</div>

<!-- Select -->
<div>
  <label class="block text-xs font-medium text-base-500 dark:text-base-400 mb-1.5">{Label} <span class="text-rose-500">*</span></label>
  <select class="form-select w-full px-3 py-2.5 pr-10 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-colors">
    <option>{Option}</option>
  </select>
</div>

<!-- Monospace input (for numeric data) -->
<input ... class="... font-mono-data ...">

<!-- Error state input (from ui-states.html) -->
<input class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-base-900 border border-rose-400 dark:border-rose-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono-data" />
<div class="flex items-center gap-1.5 mt-1.5">
  <svg class="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" ...>{alert-icon}</svg>
  <span class="text-xs text-rose-500 dark:text-rose-400">{Error message}</span>
</div>
```

### 3.17 FileAttachment (Upload zone)

**Appears in**: home-overview dialogs (Add Reading, Add Bill)

```html
<div>
  <label class="block text-xs font-medium text-base-400 dark:text-base-500 mb-1.5">Attachment</label>
  <div class="w-full px-3 py-4 border border-dashed border-base-200 dark:border-base-600 rounded-lg bg-base-50 dark:bg-base-700/50 text-center cursor-pointer hover:border-base-300 dark:hover:border-base-500 transition-colors">
    <svg class="w-5 h-5 mx-auto mb-1 text-base-300 dark:text-base-500" ...>{cloud-upload-icon}</svg>
    <span class="text-xs text-base-400">Drop file or click to upload</span>
  </div>
</div>
```

### 3.18 Toast Notifications

**Appears in**: `ui-states.html`

```html
<!-- Success Toast -->
<div class="toast-animate flex items-center gap-3 px-4 py-3 bg-base-900 dark:bg-base-100 rounded-xl shadow-lg">
  <div class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
    <svg class="w-3.5 h-3.5 text-white" ...>{check}</svg>
  </div>
  <div class="flex-1 min-w-0">
    <div class="text-sm font-medium text-white dark:text-base-900">{Title}</div>
    <div class="text-xs text-base-400 dark:text-base-500">{Description}</div>
  </div>
  <button class="text-base-400 hover:text-base-200 dark:hover:text-base-700 transition-colors shrink-0">
    <svg class="w-4 h-4" ...>{close}</svg>
  </button>
</div>
```

Variants (icon color changes):
- **Success**: `bg-emerald-500` (check icon)
- **Info**: `bg-blue-500` (info icon)
- **Error**: `bg-rose-500` (x icon)
- **Undo**: `bg-base-600 dark:bg-base-400` (trash icon) + undo text button

Toast positioning: bottom-center of viewport, auto-dismiss after 4 seconds.

### 3.19 YoY Comparison Row

**Appears in**: home-overview, portfolio-overview, vehicle-detail

```html
<div class="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark px-4 sm:px-5 py-3.5 mb-6 lg:mb-8">
  <div class="flex items-center gap-2 mb-2.5">
    <svg class="w-3.5 h-3.5 text-base-300 dark:text-base-500" ...>{arrows-icon}</svg>
    <span class="text-xs font-medium text-base-400 dark:text-base-500">Year-over-Year · Same period last year ({period})</span>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
    <div class="flex items-center justify-between sm:block">
      <div>
        <div class="text-[10px] text-base-300 dark:text-base-500 uppercase tracking-wider mb-1">{MetricLabel}</div>
        <div class="flex items-baseline gap-2">
          <span class="font-mono-data text-sm font-medium text-emerald-600 dark:text-emerald-400">{CurrentValue}</span>
          <span class="font-mono-data text-xs text-base-300 dark:text-base-500">vs {PreviousValue}</span>
        </div>
      </div>
      <div class="font-mono-data text-xs text-emerald-600 dark:text-emerald-400 sm:mt-0.5 inline-flex items-center gap-0.5">
        {Pct%}<svg class="w-3 h-3" ...>{arrow}</svg>
      </div>
    </div>
    <!-- Repeat for 2 more metrics, with mobile border separators -->
    <div class="flex items-center justify-between sm:block border-t border-base-100 dark:border-base-700 pt-3 sm:border-0 sm:pt-0">
      <!-- same structure -->
    </div>
  </div>
</div>
```

### 3.20 ChartCard

**Appears in**: All sections with charts

```html
<div class="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-6">
  <div class="flex flex-col gap-3 mb-4 sm:mb-5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">{ChartTitle}</h3>
      <div class="flex items-center gap-2">
        {YoYToggle}
        {ChartModeToggle}
      </div>
    </div>
    <div class="sm:flex sm:justify-end">
      {TimeSpanSelector}
    </div>
  </div>
  <!-- Chart placeholder -->
  <div class="h-64 sm:h-80 rounded-xl border-2 border-dashed border-base-200 dark:border-base-600 flex items-center justify-center">
    {chart-content}
  </div>
</div>
```

### 3.21 Collapsible Section (Accordion)

**Appears in**: portfolio-overview (Performance Charts), vehicles-overview (Sold Vehicles)

```html
<div>
  <button onclick="toggle()" class="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark hover:bg-base-50 dark:hover:bg-base-750 transition-colors cursor-pointer">
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-base-400" ...>{section-icon}</svg>
      <span class="text-sm font-semibold">{SectionTitle}</span>
      <span class="text-xs text-base-400 bg-base-100 dark:bg-base-700 px-2 py-0.5 rounded-full font-medium">{count}</span>
    </div>
    <svg class="w-4 h-4 text-base-400 transition-transform duration-200" ...>{chevron-down}</svg>
  </button>
  <div class="hidden mt-4 space-y-6">
    {expanded-content}
  </div>
</div>
```

### 3.22 Tab Bar

**Appears in**: portfolio-overview, platform-detail, vehicle-detail (Yearly/Monthly tabs)

```html
<div class="flex items-center justify-between px-3 lg:px-6 border-b border-base-150 dark:border-base-700">
  <div class="flex items-center gap-0">
    <button class="tab-btn active px-4 py-4 text-sm font-medium text-accent-700 dark:text-accent-400">{ActiveTab}</button>
    <button class="tab-btn px-4 py-4 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors">{InactiveTab}</button>
  </div>
  <div class="flex items-center gap-2">
    {ChartModeToggle}
  </div>
</div>
```

Active tab underline: 2px solid `#16a34a` (light) / `#4ade80` (dark), achieved via CSS `::after` pseudo-element.

### 3.23 DetailPageSwitcher (Mobile dropdown below nav)

**Appears in**: utility-detail, platform-detail, vehicle-detail

```html
<div class="lg:hidden absolute left-0 right-0 top-full bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 shadow-lg z-40 overflow-hidden transition-all duration-200 ease-out" style="max-height: 0; opacity: 0; pointer-events: none;" data-open="false">
  <div class="max-w-[1440px] mx-auto">
    <!-- Overview link -->
    <a href="{overview-url}" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-50 dark:hover:bg-base-700 transition-colors border-b border-base-100 dark:border-base-700">
      <svg class="w-4 h-4 text-base-400" ...>{grid-icon}</svg>
      <span class="font-medium">{Overview Title}</span>
    </a>
    <!-- Items list -->
    <div class="py-1">
      <!-- Active item -->
      <div class="flex items-center gap-3 px-4 py-2.5 bg-accent-50/50 dark:bg-accent-900/15 border-l-2 border-accent-600 dark:border-accent-400">
        {item-icon}
        <div class="flex-1">{item-details}</div>
        <div class="text-right font-mono-data text-sm">{value}</div>
      </div>
      <!-- Other items -->
      <a href="#" class="flex items-center gap-3 px-4 py-2.5 hover:bg-base-50 dark:hover:bg-base-700 transition-colors">
        {item}
      </a>
    </div>
  </div>
</div>
```

### 3.24 PortfolioSwitcher (Desktop dropdown)

**Appears in**: portfolio-overview

```html
<div class="relative">
  <button class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg text-sm font-medium shadow-sm hover:border-base-300 dark:hover:border-base-500 transition-colors">
    {PortfolioName} <span class="font-normal text-base-400">· {Owner}</span>
    <svg class="w-3.5 h-3.5 text-base-400" ...>{chevron-down}</svg>
  </button>
  <div class="hidden absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-xl shadow-lg z-40 py-1.5 overflow-hidden">
    <!-- Active portfolio with edit button -->
    <div class="px-3 py-2 flex items-center justify-between bg-accent-50/50 dark:bg-accent-900/20">
      <div class="flex items-center gap-2">
        <svg class="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" ...>{check}</svg>
        <span class="text-sm font-medium">{Name}</span>
      </div>
      <button class="p-1 text-base-400 hover:text-base-600 rounded transition-colors">{edit-icon}</button>
    </div>
    <!-- Other portfolios -->
    <div class="px-3 py-2 hover:bg-base-50 dark:hover:bg-base-700/50 cursor-pointer">
      <span class="text-sm">{Name}</span>
    </div>
    <!-- Add portfolio -->
    <div class="border-t border-base-100 dark:border-base-700 mt-1.5 pt-1.5">
      <button class="w-full px-3 py-2 flex items-center gap-2 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300">
        <svg class="w-3.5 h-3.5" ...>{plus}</svg> Add Portfolio
      </button>
    </div>
  </div>
</div>
```

### 3.25 Empty States

**Appears in**: `ui-states.html`

#### First-Run Empty State (full-page centered)

```html
<div class="px-6 py-20 text-center">
  <div class="w-12 h-12 mx-auto mb-5 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
    <svg class="w-6 h-6 text-accent-600 dark:text-accent-400" ...>{plus-icon}</svg>
  </div>
  <div class="text-base font-semibold text-base-700 dark:text-base-200 mb-2">{Title}</div>
  <div class="text-sm text-base-400 mb-6 max-w-sm mx-auto">{Description}</div>
  <button class="px-5 py-2.5 text-sm font-medium text-white bg-base-900 dark:bg-accent-600 rounded-lg shadow-sm">{CTA}</button>
</div>
```

#### Section Empty State (smaller, in-card)

```html
<div class="px-6 py-12 text-center">
  <div class="w-10 h-10 mx-auto mb-4 rounded-full bg-base-100 dark:bg-base-700 flex items-center justify-center">
    <svg class="w-5 h-5 text-base-300 dark:text-base-500" ...>{icon}</svg>
  </div>
  <div class="text-sm text-base-500 dark:text-base-400 mb-1">{Title}</div>
  <div class="text-xs text-base-300 dark:text-base-500">{Description}</div>
</div>
```

### 3.26 Error States

#### Card-Level Error

```html
<div class="px-6 py-16 text-center">
  <div class="w-10 h-10 mx-auto mb-4 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
    <svg class="w-5 h-5 text-rose-500 dark:text-rose-400" ...>{warning-icon}</svg>
  </div>
  <div class="text-sm font-medium text-base-600 dark:text-base-300 mb-1">{Error title}</div>
  <div class="text-xs text-base-400 mb-4">{Error message}</div>
  <button class="px-4 py-2 text-sm font-medium text-base-600 dark:text-base-300 bg-white dark:bg-base-700 border border-base-200 dark:border-base-600 rounded-lg">Retry</button>
</div>
```

### 3.27 Skeleton Loading

**Appears in**: `ui-states.html`

```html
<!-- Skeleton element -->
<div class="skeleton h-{height} w-{width}"></div>

<!-- Inside a KPI card shell -->
<div class="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark">
  <div class="skeleton h-3 w-16 mb-3"></div>
  <div class="skeleton h-6 w-24 mb-2"></div>
  <div class="skeleton h-3 w-12"></div>
</div>
```

---

## 4. Cross-Section Component Consistency Audit

### 4.1 Tailwind Config

**Verdict: CONSISTENT across 6 of 7 prototypes.** The `ui-states.html` has a slightly different `base` neutral scale (pure gray instead of green-tinted) and omits the `white` override. The 6 main prototypes are identical.

**Resolution**: Use the green-tinted base scale from the 6 main prototypes. `ui-states.html` was built earlier and its neutrals are superseded.

### 4.2 StatCard

Checked across: home-overview, portfolio-overview, platform-detail, utility-detail, vehicle-detail

**Verdict: CONSISTENT.** All use `bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark`. No padding or radius drift.

### 4.3 Navigation

**Verdict: CONSISTENT.** Desktop nav, brand, tab styling, settings button, and mobile bottom bar are identical across all prototypes.

### 4.4 Dialog Pattern

**Verdict: CONSISTENT.** All dialogs use the same shell: `dialog-panel`, `rounded-t-2xl sm:rounded-2xl`, mobile drag handle, `px-5 sm:px-6` padding, same footer button pattern.

### 4.5 Form Inputs

**Verdict: CONSISTENT.** All inputs use `px-3 py-2.5 border border-base-200 dark:border-base-600 rounded-lg bg-white dark:bg-base-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500`. The `ui-states.html` uses `px-3.5` instead of `px-3` for some inputs — classified as **incidental drift**. Standard is `px-3`.

### 4.6 Table Styling

Checked across: portfolio-overview, platform-detail

**Verdict: CONSISTENT.** Both use identical header styling, cell padding (`px-4 py-3`), row borders, hover states, and mobile column cycling pattern.

### 4.7 Button Styling

**Verdict: CONSISTENT** with one minor variant:
- Desktop header buttons use `shadow-sm` on the secondary button
- Mobile action buttons use `shadow-card` on the secondary button

**Resolution**: Use `shadow-sm` as default for secondary buttons; the mobile action bar is a distinct context where `shadow-card` is appropriate to match the card aesthetic.

### 4.8 TimeSpanSelector

**Verdict: CONSISTENT.** All instances use the same dual-mode (dropdown + pills) pattern with identical classes.

### 4.9 YoY Row

**Verdict: CONSISTENT** across home-overview, portfolio-overview, and vehicle-detail. Same padding, same grid, same metric structure.

### 4.10 Staleness Badge

Minor drift found:
- Standard (card headers): `px-2 py-0.5 text-xs font-medium rounded-full`
- Dropdown lists: `px-1.5 py-0.5 text-[10px] font-medium rounded-full`
- Mobile header: `px-3.5 py-1.5 text-sm font-semibold rounded-full`

**Resolution**: Three intentional size variants (small, standard, large). Document as explicit props.

---

## 5. Discrepancy Log — Spec vs Prototypes

| # | Topic | Spec Says | Prototypes Use | Resolution |
|---|-------|-----------|---------------|------------|
| 1 | Accent color | Teal `#0f766e` | Green `#15803d` | **Prototypes win** |
| 2 | Sans font | `Inter` | `DM Sans` | **Prototypes win** |
| 3 | Mono font | `JetBrains Mono` | `DM Mono` | **Prototypes win** |
| 4 | Neutral scale | `stone-*` (standard Tailwind) | Custom `base-*` (green-tinted) | **Prototypes win** |
| 5 | Card corners | No rounded corners ("sharp edges") | `rounded-2xl` (16px) | **Prototypes win** |
| 6 | Card shadows | "No shadow — uses border only" | `shadow-card` custom shadow | **Prototypes win** |
| 7 | Button corners | No rounded corners | `rounded-lg` (8px) | **Prototypes win** |
| 8 | Input corners | No rounded corners | `rounded-lg` (8px) | **Prototypes win** |
| 9 | Table cell padding | `px-5 py-3.5` | `px-4 py-3` | **Prototypes win** |
| 10 | Table header bg | `bg-stone-50` | No bg, border-only | **Prototypes win** |
| 11 | Badge corners | Not specified (implied no-round) | `rounded-full` | **Prototypes win** |
| 12 | Max width | `1600px` | `1440px` | **Prototypes win** |
| 13 | Horizontal padding | `px-6` (24px) | `px-3 lg:px-8` (12px mobile, 32px desktop) | **Prototypes win** |
| 14 | Dark mode | Not specified | Full `dark:` variant for every component | **Prototypes define the standard** |
| 15 | White override | `#ffffff` | `#fafcfa` (slightly green off-white) | **Prototypes win** |
| 16 | Responsive breakpoint | Desktop-first | Mobile-first with `sm:`, `lg:` breakpoints | **Prototypes win** |
| 17 | Primary button bg (light) | `accent-700` | `base-900` (near-black) | **Prototypes win** |
| 18 | Panel/Slide-out | Slide from right, 480px | Bottom sheet mobile / centered dialog desktop | **Prototypes win** |

---

## 6. Animation & Transition Spec

### 6.1 Dialog Animations

```css
/* Desktop (sm+): Scale + fade */
@media (min-width: 640px) {
  .dialog-panel {
    transform: scale(0.95);
    opacity: 0;
    transition: transform 150ms ease, opacity 250ms ease;
  }
  .dialog-panel.dialog-open {
    transform: scale(1);
    opacity: 1;
    transition: all 200ms ease;
  }
}

/* Mobile (<sm): Slide up from bottom */
@media (max-width: 639px) {
  .dialog-panel {
    transform: translateY(100%);
    opacity: 0;
    transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1), opacity 350ms ease;
  }
  .dialog-panel.dialog-open {
    transform: translateY(0);
    opacity: 1;
    transition: all 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }
}
```

**Close**: Remove `dialog-open` class, hide after 300ms timeout.

### 6.2 Mobile Dropdown (DetailPageSwitcher)

Animated via `max-height` and `opacity` with `transition-all duration-200 ease-out`. Opens by setting `max-height` to content height and `opacity: 1`.

### 6.3 Collapsible Sections

Toggle `hidden` class. Chevron rotation: `transition-transform duration-200` with `rotate-180` when expanded.

### 6.4 Hover Transitions

All interactive elements use `transition-colors` (default 150ms).

Card hover: `transition-shadow` (shadow increases on hover).

Vehicle card sold variant: `opacity-60 hover:opacity-90 transition-opacity`.

### 6.5 Toast Animation

Slide up + fade in: `translateY(16px) → translateY(0)`, 250ms ease-out. Auto-dismiss after 4 seconds.

### 6.6 Skeleton Shimmer

Linear gradient sweep: 1.5s infinite, ease-in-out.

### 6.7 Staleness Pulse

The dot inside staleness badges uses Tailwind's `animate-pulse` (2s infinite).

### 6.8 Spinner

Simple rotation: `0.7s linear infinite`.

### 6.9 Theme Toggle

Body: `transition-colors duration-200` for smooth dark mode switch.

---

## 7. Layout Constants

| Constant | Value | Usage |
|----------|-------|-------|
| Max content width | `1440px` | `max-w-[1440px]` on main and nav |
| Desktop horizontal padding | `32px` | `lg:px-8` |
| Mobile horizontal padding | `12px` | `px-3` |
| Desktop vertical padding (main) | `40px` | `lg:py-10` |
| Mobile vertical padding (main) | `24px` | `py-6` |
| Mobile bottom padding (tab bar clearance) | `96px` | `pb-24 lg:pb-10` |
| Nav height | `64px` | `h-16` |
| Mobile bottom bar height | `64px` | `h-16` |
| Card gap (desktop) | `16px` | `lg:gap-4` |
| Card gap (mobile) | `12px` | `gap-3` |
| Section spacing (desktop) | `32px` | `lg:mb-8` |
| Section spacing (mobile) | `24px` | `mb-6` |
