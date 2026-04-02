# US-021: ChartModeToggle (Segmented Control) Component

## Story
As the Insight platform user, I want a segmented control to switch between chart modes (e.g., Earnings/XIRR, Consumption/Cost) so that I can view different aspects of the same dataset without leaving the chart card.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `ChartModeToggle` component (segmented control)
- Same visual pattern as the TimeSpanSelector pill buttons
- Supports 2-3 mode options (e.g., "Earnings" / "XIRR", or "Consumption" / "Cost" / "Cost per Unit")
- Active segment: elevated white pill with shadow
- Inactive segments: transparent with muted text
- Container has the same rounded-lg pill-bar background as TimeSpanSelector
- Used in chart card headers and inside TabBar right-side slots

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Container === */
<div
  className="
    inline-flex items-center
    bg-base-100 dark:bg-base-700
    rounded-lg p-0.5 gap-0.5
  "
>
  {/* Active segment */}
  <button
    className="
      px-3 py-1 text-xs font-medium rounded-md
      bg-white dark:bg-base-600
      text-base-900 dark:text-white
      shadow-sm
      transition-all duration-150
    "
  >
    Earnings
  </button>

  {/* Inactive segment */}
  <button
    className="
      px-3 py-1 text-xs font-medium rounded-md
      text-base-400 dark:text-base-400
      hover:text-base-600 dark:hover:text-base-300
      transition-colors duration-150
    "
  >
    XIRR
  </button>
</div>

/* === 3-option variant (e.g., Utility detail) === */
<div
  className="
    inline-flex items-center
    bg-base-100 dark:bg-base-700
    rounded-lg p-0.5 gap-0.5
  "
>
  <button className="px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-white shadow-sm transition-all duration-150">
    Consumption
  </button>
  <button className="px-3 py-1 text-xs font-medium rounded-md text-base-400 hover:text-base-600 dark:text-base-400 dark:hover:text-base-300 transition-colors duration-150">
    Cost
  </button>
  <button className="px-3 py-1 text-xs font-medium rounded-md text-base-400 hover:text-base-600 dark:text-base-400 dark:hover:text-base-300 transition-colors duration-150">
    Cost/Unit
  </button>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L336--339 -- Consumption / Cost toggle (pill pair)
- `design-artifacts/prototypes/portfolio-overview.html` L288--291 -- Earnings / XIRR toggle
- `design-artifacts/prototypes/home-overview.html` L327--334 -- Grouped / Stacked layout toggle (icon-based)

## Acceptance Criteria
- [ ] Container uses bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5
- [ ] Active segment uses bg-white dark:bg-base-600 shadow-sm text-base-900 dark:text-white font-medium
- [ ] Inactive segments use text-base-400 with hover:text-base-600
- [ ] Supports 2-option and 3-option configurations
- [ ] Clicking an inactive segment calls onChange with the new mode value
- [ ] Active segment transitions smoothly (transition-all duration-150)
- [ ] Dark mode styles apply correctly
- [ ] Component is generic — accepts an array of options with labels and values

## Technical Notes
- File to create: `src/components/shared/ChartModeToggle.tsx`
- Props: `options: Array<{ label: string, value: string }>`, `value: string`, `onChange: (value: string) => void`
- This is a controlled component — the parent manages the active mode
- The visual pattern is identical to TimeSpanSelector active/inactive pills, but with fewer options and slightly wider padding (px-3 vs px-2.5)
- Can also be used inside TabBar's right-side content slot (US-024)
- Export as named export: `export { ChartModeToggle }`
