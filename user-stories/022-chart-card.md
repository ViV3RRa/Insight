# US-022: ChartCard Wrapper Component

## Story
As the Insight platform user, I want a consistent chart card container with built-in controls so that all charts across the platform share the same layout for title, time span selector, and mode toggles.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-021: ChartModeToggle Component

## Requirements
- Create a `ChartCard` wrapper component
- Card shell with rounded-2xl shadow-card
- Header row with: title (left) and controls area (right) containing YoYToggle and optional ChartModeToggle
- TimeSpanSelector on a second row below the header
- Chart content area below the controls
- Responsive padding: p-4 on mobile, p-6 on desktop
- The chart content is passed as children — ChartCard does not render charts itself
- Manages its own time span state internally (or accepts it as controlled prop)

## Shared Components Used
- US-019: TimeSpanSelector
- US-020: YoYToggle
- US-021: ChartModeToggle (optional, via prop)

## UI Specification

```tsx
/* === ChartCard === */
<div
  className="
    bg-white dark:bg-base-800
    rounded-2xl shadow-card dark:shadow-card-dark
    p-4 sm:p-6
  "
>
  {/* Row 1: Title + controls */}
  <div className="flex items-center justify-between mb-3">
    {/* Title */}
    <h3 className="text-sm font-semibold text-base-900 dark:text-white">
      Monthly Earnings
    </h3>

    {/* Controls: YoY toggle + optional mode toggle */}
    <div className="flex items-center gap-2">
      {/* ChartModeToggle (optional) */}
      <div className="inline-flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5 gap-0.5">
        <button className="px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-white shadow-sm">
          Earnings
        </button>
        <button className="px-3 py-1 text-xs font-medium rounded-md text-base-400">
          XIRR
        </button>
      </div>

      {/* YoYToggle */}
      <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-base-200 text-base-400">
        <svg className="w-3.5 h-3.5">{/* ArrowLeftRight */}</svg>
        YoY
      </button>
    </div>
  </div>

  {/* Row 2: Time span selector */}
  <div className="mb-4">
    <div className="inline-flex items-center bg-base-100 dark:bg-base-700 rounded-lg p-0.5">
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">1M</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">3M</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">6M</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">MTD</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md bg-white dark:bg-base-600 text-base-900 dark:text-white shadow-sm">YTD</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">1Y</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">3Y</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">5Y</button>
      <button className="px-2.5 py-1 text-xs font-medium rounded-md text-base-400">All</button>
    </div>
  </div>

  {/* Row 3: Chart content area (children) */}
  <div className="w-full">
    {/* Chart component rendered here via children */}
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L316--391 -- Monthly Overview chart card with header controls + chart area
- `design-artifacts/prototypes/portfolio-overview.html` L277--345 -- Portfolio Value Over Time chart card
- `design-artifacts/prototypes/ui-states.html` L135--142 -- Chart card skeleton loading state

## Acceptance Criteria
- [ ] Card shell uses bg-white dark:bg-base-800 rounded-2xl shadow-card p-4 sm:p-6
- [ ] Header row shows title (text-sm font-semibold) on the left
- [ ] Controls area on the right contains YoYToggle and optional ChartModeToggle
- [ ] TimeSpanSelector renders on a second row below the header
- [ ] Chart content area renders children below the controls
- [ ] Responsive padding: p-4 on mobile, sm:p-6 on desktop
- [ ] YoYToggle state is managed and exposed via onYoYChange callback
- [ ] TimeSpan state defaults to YTD and is exposed via onTimeSpanChange callback
- [ ] ChartModeToggle only renders when `modes` prop is provided
- [ ] Dark mode styles apply correctly
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/ChartCard.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Verify card shell renders with `bg-white rounded-2xl shadow-card p-4 sm:p-6` classes
  - Verify title renders as `text-sm font-semibold` in the header row
  - Verify YoYToggle is present by default and responds to click interactions
  - Verify ChartModeToggle renders only when `modes` prop is provided
  - Verify ChartModeToggle does NOT render when `modes` prop is omitted
  - Verify TimeSpanSelector renders with all 9 options and defaults to YTD
  - Verify TimeSpanSelector is hidden when `hideTimeSpan` prop is true
  - Verify YoYToggle is hidden when `hideYoY` prop is true
  - Verify children are rendered in the chart content area
  - Verify `onTimeSpanChange` callback fires when a time span pill is clicked
  - Verify `onYoYChange` callback fires when YoY toggle is clicked
  - Verify `onModeChange` callback fires when a chart mode segment is clicked
  - Verify internal state management when controlled props are not provided (defaults to YTD)
  - Verify dark mode classes: `dark:bg-base-800`, `dark:shadow-card-dark`
  - Snapshot test for default configuration and with all optional controls visible

## Technical Notes
- File to create: `src/components/shared/ChartCard.tsx`
- Props: `title: string`, `children: ReactNode`, `modes?: Array<{ label: string, value: string }>`, `activeMode?: string`, `onModeChange?: (mode: string) => void`, `timeSpan?: TimeSpan`, `onTimeSpanChange?: (span: TimeSpan) => void`, `yoyActive?: boolean`, `onYoYChange?: (active: boolean) => void`, `hideYoY?: boolean`, `hideTimeSpan?: boolean`
- If `timeSpan` / `onTimeSpanChange` are not provided, ChartCard manages its own internal state (local `useState`) with YTD as default
- Page-level components that need timeSpan/yoyActive to affect data queries should pass controlled props; ChartCard's onChange callbacks then update the Zustand store, which drives the query keys
- The children receive the current timeSpan and yoyActive state via a render prop or context if needed
- Export as named export: `export { ChartCard }`
