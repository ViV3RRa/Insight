# US-019: TimeSpanSelector Component

## Story
As the Insight platform user, I want a time span selector on chart cards so that I can filter data views to specific periods like YTD, 1Y, or All time.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-012: Time Span Utility Functions

## Requirements
- Create a `TimeSpanSelector` component per PRD §3.1
- Dual-mode responsive behavior:
  - **Pill buttons** (viewport >= 410px): Horizontal row of pill-shaped buttons
  - **Dropdown** (viewport < 410px): Select-style dropdown showing current selection
- Options: 1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All
- Default selection: YTD
- Each chart card manages its own time span independently
- Active pill has elevated visual treatment (white bg, shadow)
- Inactive pills are subtle (transparent, muted text)

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Pill buttons mode (>= 410px) === */
<div
  className="
    inline-flex items-center
    bg-base-100 dark:bg-base-700
    rounded-lg p-0.5
  "
>
  {/* Inactive pill */}
  <button
    className="
      px-2.5 py-1 text-xs font-medium rounded-md
      text-base-400 dark:text-base-400
      hover:text-base-600 dark:hover:text-base-300
      transition-colors duration-150
    "
  >
    1M
  </button>

  {/* Active pill */}
  <button
    className="
      px-2.5 py-1 text-xs font-medium rounded-md
      bg-white dark:bg-base-600
      text-base-900 dark:text-white
      shadow-sm
      transition-all duration-150
    "
  >
    YTD
  </button>

  {/* Inactive pill */}
  <button
    className="
      px-2.5 py-1 text-xs font-medium rounded-md
      text-base-400 dark:text-base-400
      hover:text-base-600 dark:hover:text-base-300
      transition-colors duration-150
    "
  >
    1Y
  </button>

  {/* ... more pills */}
</div>

/* === Dropdown mode (< 410px) === */
<div className="relative">
  <select
    className="
      form-select
      w-full px-3 py-2 text-xs font-medium
      bg-base-100 dark:bg-base-700
      text-base-900 dark:text-white
      border-none rounded-lg
      appearance-none
    "
  >
    <option value="1M">1M</option>
    <option value="3M">3M</option>
    <option value="6M">6M</option>
    <option value="MTD">MTD</option>
    <option value="YTD" selected>YTD</option>
    <option value="1Y">1Y</option>
    <option value="3Y">3Y</option>
    <option value="5Y">5Y</option>
    <option value="All">All</option>
  </select>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L342--367 -- Pills (>=410px) + dropdown (<410px) responsive pattern
- `design-artifacts/prototypes/portfolio-overview.html` L294--318 -- Same pattern in investment charts

## Acceptance Criteria
- [ ] Pill button mode renders at viewport widths >= 410px
- [ ] Dropdown mode renders at viewport widths < 410px
- [ ] Container uses bg-base-100 dark:bg-base-700 rounded-lg p-0.5
- [ ] Active pill uses bg-white dark:bg-base-600 shadow-sm font-medium
- [ ] Inactive pills use text-base-400 with hover:text-base-600
- [ ] All 9 options render: 1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All
- [ ] Default selection is YTD
- [ ] Clicking a pill calls the onChange callback with the selected TimeSpan value
- [ ] Dropdown mode fires the same onChange callback
- [ ] Dark mode styles apply correctly
- [ ] Transition animations are smooth (duration-150)

## Technical Notes
- File to create: `src/components/shared/TimeSpanSelector.tsx`
- Props: `value: TimeSpan`, `onChange: (span: TimeSpan) => void`
- Use the `TimeSpan` type and `TIME_SPAN_OPTIONS` from US-012
- The 410px breakpoint is not a standard Tailwind breakpoint — use a `useMediaQuery` hook or `window.matchMedia` to detect viewport width
- Consider using `ResizeObserver` on the container rather than viewport width for more robust behavior
- Export as named export: `export { TimeSpanSelector }`
