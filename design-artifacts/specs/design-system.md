# Design System Specification

**Version**: 1.0
**Last Updated**: February 13, 2026
**Purpose**: Define visual language and design tokens for Insight platform

---

## Design Philosophy

### Core Principles

1. **Data-First Aesthetic** — Numbers and information are the visual priority, UI fades to background
2. **Utilitarian Precision** — Sharp, clean lines; minimal decoration; tool-like feel
3. **Professional Restraint** — Sophisticated without being corporate; personal without being playful
4. **Cognitive Efficiency** — Dense but scannable; maximize information per pixel
5. **Anti-Generic** — Avoid common AI/SaaS visual tropes (purple gradients, excessive rounding, soft shadows)

### Visual References

- **Bloomberg Terminal** — Data density, monospace numbers, utilitarian UI
- **Financial Times** — Editorial sophistication, clean typography
- **Linear.app** — Modern, fast, minimal chrome
- **Notion** — Clean tables, subtle interactions

---

## Color Palette

### Philosophy
Neutral base with a distinctive accent. Color communicates **meaning** (status, gains/losses) not decoration.

### Primary Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Accent (Primary)** | `#0f766e` | `accent-700` | Primary actions, selected states, focus rings, XIRR values |
| Accent Hover | `#115e59` | `accent-800` | Button hover states |
| Accent Background | `#f0fdfa` | `accent-50` | Selected nav items, active buttons (light) |

**Why Teal?** Distinctive (not generic blue/purple), professional, associated with finance/growth, good contrast.

### Neutral Scale (Stone)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | `#fafaf9` | `stone-50` | Page background |
| Surface | `#ffffff` | `white` | Cards, panels, tables |
| Border | `#e7e5e4` | `stone-200` | Dividers, table borders, card edges |
| Border Hover | `#d6d3d1` | `stone-300` | Interactive element borders |
| Text Secondary | `#57534e` | `stone-600` | Labels, secondary text |
| Text Primary | `#1c1917` | `stone-900` | Body text, table values |

**Why Stone?** Warmer than gray, less stark than black/white, sophisticated neutral.

### Semantic Colors

| Meaning | Color | Tailwind | Usage |
|---------|-------|----------|-------|
| **Positive** | Emerald | `emerald-700` / `emerald-100` | Gains, deposits, positive percentages |
| **Negative** | Rose | `rose-700` / `rose-100` | Losses, withdrawals, negative percentages |
| **Warning** | Amber | `amber-600` / `amber-100` | Stale data alerts, warnings |
| **Info** | Blue | `blue-800` / `blue-100` | Value snapshots, informational badges |

---

## Typography

### Philosophy
Dual font system: **Sans-serif for UI, Monospace for data**. Monospace ensures visual alignment and data integrity feel.

### Font Families

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
```

| Element | Font | Weight | Size | Line Height |
|---------|------|--------|------|-------------|
| **Page Title** | Inter | 600 | 24px / 1.5rem | 1.2 |
| **Section Header** | Inter | 600 | 14px / 0.875rem | 1.4 |
| **Body Text** | Inter | 400 | 14px / 0.875rem | 1.5 |
| **Table Header** | Inter | 500 | 14px / 0.875rem | 1.4 |
| **Numbers (Large)** | JetBrains Mono | 600 | 24px / 1.5rem | 1.2 |
| **Numbers (Table)** | JetBrains Mono | 400 | 14px / 0.875rem | 1.4 |
| **Currency Labels** | Inter | 400 | 12px / 0.75rem | 1.4 |

### Typographic Rules

- **All numerical data uses monospace** (values, dates, percentages)
- Use `font-variant-numeric: tabular-nums` for alignment
- Currency labels (DKK, USD) in sans-serif, smaller weight
- UPPERCASE + tracking for labels/headers: `uppercase tracking-wide`
- Regular sentence case for descriptions

---

## Spacing System

Based on 4px base unit. Use Tailwind spacing scale.

| Token | Pixels | Tailwind | Usage |
|-------|--------|----------|-------|
| xs | 4px | `1` | Icon padding, tight spacing |
| sm | 8px | `2` | Vertical rhythm in forms |
| md | 12px | `3` | Button padding, form fields |
| lg | 16px | `4` | Card padding, section spacing |
| xl | 20px | `5` | Card padding (generous) |
| 2xl | 24px | `6` | Section margins |
| 3xl | 32px | `8` | Major section breaks |

### Layout Grid
- **Max width**: `1600px` — optimized for 1920px screens, breathable on larger displays
- **Horizontal padding**: `24px` (Tailwind: `px-6`)
- **Vertical spacing**: `32px` between major sections (Tailwind: `py-8`)

---

## Components

### Buttons

#### Primary Button
```html
<button class="px-3 py-1.5 text-sm font-medium text-white bg-accent-700 hover:bg-accent-800 transition-colors">
  Button Text
</button>
```
- **Height**: 32px (text-sm + py-1.5)
- **No rounded corners** (sharp, precise feel)
- **Transition**: 150ms ease on hover

#### Secondary Button
```html
<button class="px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors">
  Cancel
</button>
```

### Cards

```html
<div class="bg-white border border-stone-200 p-5">
  <!-- Content -->
</div>
```
- **No shadow** — uses border only
- **No rounded corners** — sharp edges
- **Padding**: 20px (`p-5`)

### Tables

- **Header background**: `bg-stone-50` (subtle differentiation)
- **Borders**: `border-stone-200` (1px solid)
- **Row hover**: `hover:bg-stone-50` (subtle interaction)
- **Padding**: `px-5 py-3.5` for cells (generous, scannable)
- **Alignment**: Numbers right-aligned, text left-aligned

### Form Inputs

```html
<input class="w-full px-3 py-2 border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent">
```
- **Border**: 1px `stone-300`
- **Focus**: 2px ring in `accent-500` (not border change)
- **No rounded corners**

### Badges/Pills

```html
<span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium">
  Active
</span>
```
- **Small padding** for compact feel
- **Semantic colors** for status
- **Font size**: 12px

---

## Interaction Patterns

### Collapsible Table Rows

- Click entire row to expand/collapse
- Chevron icon rotates 90° on expand
- Expanded content has `bg-stone-50` background
- Smooth transitions (300ms)

### Slide-out Panel

**Desktop/Tablet**:
- Width: `480px`
- Slides from right
- Overlay: `bg-black bg-opacity-40`
- Shadow: `shadow-2xl`

**Mobile** (< 768px):
- Full width
- Slides from bottom OR full-screen overlay
- Implementation detail for Phase 5

### Hover States

- **Tables**: `hover:bg-stone-50` on rows
- **Buttons**: Background color darkens 1 shade
- **Links**: Text color darkens 1 shade
- **Transition**: 150ms `transition-colors`

---

## Responsive Breakpoints

| Breakpoint | Width | Tailwind | Target |
|------------|-------|----------|--------|
| Mobile | < 640px | `sm:` | Phone portrait |
| Tablet | 640px - 1024px | `md:` | Tablet, small laptop |
| Desktop | > 1024px | `lg:` | Laptop, desktop |
| Wide | > 1600px | `xl:` | Large desktop |

### Responsive Strategy

**Desktop-first approach**:
1. Design for 1440-1920px screens (primary use case)
2. Tables remain scrollable on tablet (horizontal scroll acceptable)
3. Mobile: Stack cards, simplify tables, bottom sheets for panels

---

## States & Indicators

### Data Staleness

**Fresh** (< 24h): Normal display
**Stale** (> 24h): Amber warning icon + text

```html
<div class="text-xs text-amber-600 flex items-center gap-1">
  <svg class="w-3 h-3">...</svg>
  Stale (2d)
</div>
```

### Lifecycle States

```html
<span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-medium">Active</span>
<span class="inline-block px-2 py-0.5 bg-stone-100 text-stone-800 text-xs font-medium">Inactive</span>
<span class="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium">Pending</span>
<span class="inline-block px-2 py-0.5 bg-stone-200 text-stone-700 text-xs font-medium">Closed</span>
```

### Loading States

- Skeleton loaders in `bg-stone-200` with pulse animation
- Spinner for async actions (TBD in Phase 5)

---

## Iconography

**Library**: lucide-react (when implementing React)
**For prototype**: Inline SVG (Heroicons style)

**Size**: `w-4 h-4` (16px) for UI icons, `w-5 h-5` (20px) for emphasis
**Color**: Inherits text color
**Stroke width**: 2px

---

## Chart Specifications

**Library**: Recharts (React implementation)

### Colors
- Primary line: `accent-700` (#0f766e)
- Secondary line: `stone-400`
- Positive bars: `emerald-600`
- Negative bars: `rose-600`
- Grid lines: `stone-200`

### Typography
- Axis labels: 12px Inter, `text-stone-600`
- Values: JetBrains Mono, `text-stone-900`

### Layout
- No outer border (clean integration)
- Subtle grid lines
- Tooltips: white background, border, shadow

---

## Implementation Notes

### Tailwind Configuration

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'accent': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          // ... (full teal scale as shown in HTML)
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      maxWidth: {
        'content': '1600px',
      }
    }
  }
}
```

### CSS Custom Properties (Alternative)

```css
:root {
  --color-accent: #0f766e;
  --color-accent-hover: #115e59;
  --color-accent-bg: #f0fdfa;

  --color-positive: #15803d;
  --color-negative: #be123c;
  --color-warning: #d97706;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --spacing-unit: 4px;
}
```

---

## Anti-Patterns (What NOT to Do)

❌ **Avoid**:
- Rounded corners on tables/data surfaces (use sharp edges)
- Drop shadows on cards (use borders only)
- Purple/blue gradients
- Overly spacious layouts (this is a data tool)
- Mixing monospace and sans-serif for numbers
- Generic stock imagery
- Playful icons or illustrations

✅ **Embrace**:
- Sharp, precise geometry
- Subtle borders and dividers
- Monospace data everywhere
- Dense but breathable layouts
- Functional, tool-like aesthetic
- Transparency in calculations and data

---

## Next Steps for Phase 2

1. ✅ Investment dashboard prototype complete
2. ⏳ Home (Utilities) dashboard prototype
3. ⏳ Vehicles dashboard prototype
4. ⏳ Component library extraction
5. ⏳ Interaction specifications document
6. ⏳ Mobile responsive adaptations

