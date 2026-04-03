# US-018: YoYComparisonRow Component

## Story
As the Insight platform user, I want an always-visible year-over-year comparison card on overview pages so that I can quickly see how current performance compares to the same period last year.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-012: Time Span Utility Functions (uses `getYoYRange`)
- US-015: ChangeIndicator Component

## Requirements
- Create a `YoYComparisonRow` card component per PRD §3.2
- Always visible on overview pages (not collapsed)
- Card header with ArrowLeftRight icon (from lucide-react) and period label (e.g., "Jan 1 – Feb 17, 2025 vs Jan 1 – Feb 17, 2024")
- 3-column grid of metric comparisons
- Each metric shows: uppercase label, current value vs previous value, percentage change
- Mobile layout: vertical flex with border-t separators between metrics
- Used on: Home overview (cost comparisons), Portfolio overview (earnings/XIRR comparisons), Vehicle detail (efficiency comparisons)
- Section-specific metric sets passed via props

## Shared Components Used
- US-015: ChangeIndicator

## UI Specification

```tsx
/* === YoY Comparison Row card === */
<div
  className="
    bg-white dark:bg-base-800
    rounded-2xl shadow-card dark:shadow-card-dark
    p-4 sm:p-5
  "
>
  {/* Header */}
  <div className="flex items-center gap-2 mb-4">
    <svg className="w-4 h-4 text-base-400">
      {/* ArrowLeftRight icon from lucide-react */}
    </svg>
    <span className="text-xs text-base-400 font-medium">
      Jan 1 – Mar 15, 2026 vs Jan 1 – Mar 15, 2025
    </span>
  </div>

  {/* Desktop: 3-col grid */}
  <div className="hidden sm:grid sm:grid-cols-3 gap-6">

    {/* Metric item */}
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-base-400 mb-1">
        YTD Earnings
      </p>
      <div className="flex items-baseline gap-2">
        <span className="font-mono-data text-lg font-medium text-base-900 dark:text-white">
          24.500 DKK
        </span>
        <span className="font-mono-data text-xs text-base-300">
          vs 18.200
        </span>
      </div>
      {/* ChangeIndicator */}
      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 mt-0.5">
        <svg className="w-3 h-3" ...>{/* up arrow */}</svg>
        <span className="font-mono-data text-xs font-medium">+34,6%</span>
      </span>
    </div>

    {/* Repeat for remaining 2 metrics */}
  </div>

  {/* Mobile: vertical stack with dividers */}
  <div className="sm:hidden space-y-0">

    {/* Metric item (mobile) */}
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-base-400 mb-0.5">
          YTD Earnings
        </p>
        <span className="font-mono-data text-base font-medium text-base-900 dark:text-white">
          24.500 DKK
        </span>
      </div>
      <div className="text-right">
        <span className="font-mono-data text-xs text-base-300 block">
          vs 18.200
        </span>
        {/* ChangeIndicator */}
        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
          <svg className="w-3 h-3" ...>{/* up arrow */}</svg>
          <span className="font-mono-data text-xs font-medium">+34,6%</span>
        </span>
      </div>
    </div>

    {/* Divider between metrics */}
    <div className="border-t border-base-100 dark:border-base-700" />

    {/* Next metric... */}
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L218--262 -- Investment YoY row (3 metrics: YTD Earnings, YTD XIRR, Month Earnings)
- `design-artifacts/prototypes/home-overview.html` L266--310 -- Home YoY row (3 metrics: YTD Total Cost, Current Month Cost, Avg Monthly Cost)

## Acceptance Criteria
- [ ] Card shell uses bg-white dark:bg-base-800 rounded-2xl shadow-card p-4 sm:p-5
- [ ] Header shows ArrowLeftRight icon + period label in text-xs text-base-400
- [ ] Desktop layout uses sm:grid-cols-3 with gap-6
- [ ] Each metric shows an uppercase label (text-[10px] font-medium uppercase tracking-wider)
- [ ] Current value shown in font-mono-data text-lg font-medium
- [ ] Previous value shown as "vs {value}" in font-mono-data text-xs text-base-300
- [ ] Percentage change uses ChangeIndicator component (US-015)
- [ ] Mobile layout uses vertical stack with border-t border-base-100 dividers
- [ ] Mobile metrics use flex justify-between with value left and change right
- [ ] Component accepts an array of metric objects with label, current, previous, and change values
- [ ] Dark mode styles apply correctly
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/YoYComparisonRow.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Verify card shell renders with `bg-white rounded-2xl shadow-card` classes
  - Verify header shows ArrowLeftRight icon and period label text
  - Verify 3 metrics render in a `sm:grid-cols-3` grid on desktop
  - Verify each metric shows uppercase label (`text-[10px] font-medium uppercase tracking-wider`)
  - Verify current value displays in `font-mono-data text-lg font-medium`
  - Verify previous value shows "vs {value}" text in `font-mono-data text-xs text-base-300`
  - Verify ChangeIndicator component is used for percentage change display
  - Verify positive change renders green ChangeIndicator (emerald)
  - Verify negative change renders red ChangeIndicator (rose)
  - Verify `invertColor` flag is passed through to ChangeIndicator for cost metrics
  - Verify mobile layout renders vertical stack with `border-t border-base-100` dividers between metrics
  - Verify component handles empty metrics array gracefully (no crash)
  - Verify dark mode classes: `dark:bg-base-800`, `dark:text-white`, `dark:border-base-700`
  - Snapshot test for desktop and mobile layouts

## Technical Notes
- File to create: `src/components/shared/YoYComparisonRow.tsx`
- Props: `periodLabel: string`, `metrics: Array<{ label: string, currentValue: string, previousValue: string, changePercent: number, invertColor?: boolean }>`
- The `invertColor` flag is passed through to ChangeIndicator for cost metrics
- The period label is computed by the parent page using `getYoYRange` from US-012
- The ArrowLeftRight icon comes from lucide-react
- Export as named export: `export { YoYComparisonRow }`
