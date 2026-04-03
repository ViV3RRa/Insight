# US-015: ChangeIndicator Component

## Story
As the Insight platform user, I want a compact directional indicator showing value changes so that I can instantly see whether a metric has improved or declined.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-011: Shared Formatters (uses `formatPercent`)

## Requirements
- Create a `ChangeIndicator` component that shows an up or down arrow with a formatted value
- Green (emerald-600) for positive change, rose for negative change
- Arrow is an inline SVG: w-3 h-3 with stroke-width 2.5
- Up arrow for positive, down arrow for negative, no arrow for zero/unchanged
- Layout: inline-flex with gap-0.5 for tight spacing
- Used in overview cards and YoY comparison rows
- Optional `invertColor` prop for metrics where increase = bad (e.g., cost increase)

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Positive change (default: green = good) === */
<span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
  <svg
    className="w-3 h-3"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9V3M6 3L3 6M6 3L9 6" />
  </svg>
  <span className="font-mono-data text-xs font-medium">+5,2%</span>
</span>

/* === Negative change (default: red = bad) === */
<span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
  <svg
    className="w-3 h-3"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 3V9M6 9L3 6M6 9L9 6" />
  </svg>
  <span className="font-mono-data text-xs font-medium">-2,1%</span>
</span>

/* === Inverted color (increase = bad, e.g., cost) === */
<span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
  <svg className="w-3 h-3" ...>
    <path d="M6 9V3M6 3L3 6M6 3L9 6" /> {/* up arrow */}
  </svg>
  <span className="font-mono-data text-xs font-medium">+8,3%</span>
</span>

/* === Zero / no change === */
<span className="inline-flex items-center gap-0.5 text-base-400">
  <span className="font-mono-data text-xs font-medium">0,0%</span>
</span>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L146--149 -- Green down arrow with "-8,7% vs last month"
- `design-artifacts/prototypes/home-overview.html` L192--194 -- Red up arrow with "+6,3% vs last month"
- `design-artifacts/prototypes/portfolio-overview.html` L193--194 -- Green percentage badge "+13,1%"
- `design-artifacts/prototypes/portfolio-overview.html` L233--235 -- Green YoY comparison "+50,3%" with up arrow

## Acceptance Criteria
- [ ] Positive values show an up arrow in emerald-600
- [ ] Negative values show a down arrow in rose-600
- [ ] Zero values show no arrow and use text-base-400
- [ ] Arrow SVG is w-3 h-3 with stroke-width 2.5
- [ ] Layout uses inline-flex with gap-0.5
- [ ] Value text uses font-mono-data text-xs font-medium
- [ ] `invertColor` prop swaps the color logic (positive = rose, negative = emerald)
- [ ] Dark mode uses emerald-400 and rose-400 respectively
- [ ] Component renders inline and flows naturally in surrounding text/rows
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/ChangeIndicator.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Positive value: verify up arrow SVG is rendered and container has `text-emerald-600` class
  - Negative value: verify down arrow SVG is rendered and container has `text-rose-600` class
  - Zero value: verify no arrow is rendered and container has `text-base-400` class
  - Verify `invertColor` prop swaps colors: positive value renders `text-rose-600`, negative renders `text-emerald-600`
  - Verify arrow SVG dimensions are `w-3 h-3` with `strokeWidth="2.5"`
  - Verify layout uses `inline-flex items-center gap-0.5`
  - Verify value text has `font-mono-data text-xs font-medium` classes
  - Verify `formattedValue` prop overrides default formatting when provided
  - Verify `suffix` prop (e.g., "pp") appends to the displayed value
  - Verify dark mode classes: `dark:text-emerald-400` for positive, `dark:text-rose-400` for negative
  - Snapshot test for positive, negative, zero, and inverted variants

## Technical Notes
- File to create: `src/components/shared/ChangeIndicator.tsx`
- Props: `value: number`, `formattedValue?: string`, `invertColor?: boolean`, `suffix?: string` (e.g., "pp" for percentage points)
- If `formattedValue` is not provided, format using `formatPercent` from US-011
- The `invertColor` prop is used for cost metrics in the Home section where an increase is negative
- Export as named export: `export { ChangeIndicator }`
