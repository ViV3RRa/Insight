# US-036: Skeleton Loading Component

## Story
As the Insight platform user, I want skeleton loading placeholders while data is being fetched so that the page layout is stable and I can anticipate where content will appear.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `Skeleton` component using the `.skeleton` CSS class from US-002 (shimmer animation)
- 3 preset variants matching common UI patterns:
  - **kpiCard**: Mimics a StatCard with 3 shimmer bars inside a card shell
  - **chart**: Mimics a ChartCard with title bar + chart area placeholder
  - **tableRow**: Mimics DataTable with header + 3 body rows
- Also supports a generic inline skeleton (single bar with configurable width/height)
- Shimmer animation: 1.5s ease-in-out infinite (from US-002)

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Generic skeleton bar === */
<div className="skeleton h-4 w-24 rounded" />

/* The .skeleton class from US-002:
   background: linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent);
   background-size: 200% 100%;
   animation: shimmer 1.5s ease-in-out infinite;
   @apply bg-base-100 dark:bg-base-700;
*/

/* === kpiCard skeleton === */
<div
  className="
    bg-white dark:bg-base-800
    rounded-2xl p-5
    shadow-card dark:shadow-card-dark
  "
>
  {/* Label skeleton */}
  <div className="skeleton h-3 w-20 rounded mb-2" />
  {/* Value skeleton */}
  <div className="skeleton h-6 w-32 rounded mb-1" />
  {/* Sublabel skeleton */}
  <div className="skeleton h-3 w-16 rounded" />
</div>

/* === chart skeleton === */
<div
  className="
    bg-white dark:bg-base-800
    rounded-2xl p-4 sm:p-6
    shadow-card dark:shadow-card-dark
  "
>
  {/* Header row */}
  <div className="flex items-center justify-between mb-4">
    <div className="skeleton h-4 w-36 rounded" />
    <div className="flex gap-2">
      <div className="skeleton h-7 w-14 rounded-lg" />
      <div className="skeleton h-7 w-12 rounded-lg" />
    </div>
  </div>

  {/* Time span selector skeleton */}
  <div className="skeleton h-7 w-64 rounded-lg mb-4" />

  {/* Chart area skeleton */}
  <div className="skeleton h-48 sm:h-64 w-full rounded-lg" />
</div>

/* === tableRow skeleton (header + 3 rows) === */
<div>
  {/* Header */}
  <div className="flex items-center gap-4 px-4 py-2.5 border-b border-base-200 dark:border-base-700">
    <div className="skeleton h-3 w-16 rounded" />
    <div className="skeleton h-3 w-20 rounded" />
    <div className="skeleton h-3 w-12 rounded ml-auto" />
  </div>

  {/* Row 1 */}
  <div className="flex items-center gap-4 px-4 py-3 border-b border-base-100 dark:border-base-700/50">
    <div className="skeleton h-4 w-24 rounded" />
    <div className="skeleton h-4 w-16 rounded" />
    <div className="skeleton h-4 w-20 rounded ml-auto" />
  </div>

  {/* Row 2 */}
  <div className="flex items-center gap-4 px-4 py-3 border-b border-base-100 dark:border-base-700/50">
    <div className="skeleton h-4 w-20 rounded" />
    <div className="skeleton h-4 w-14 rounded" />
    <div className="skeleton h-4 w-24 rounded ml-auto" />
  </div>

  {/* Row 3 */}
  <div className="flex items-center gap-4 px-4 py-3 border-b border-base-100 dark:border-base-700/50">
    <div className="skeleton h-4 w-28 rounded" />
    <div className="skeleton h-4 w-12 rounded" />
    <div className="skeleton h-4 w-16 rounded ml-auto" />
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L16--30 -- Skeleton shimmer CSS animation (light + dark)
- `design-artifacts/prototypes/ui-states.html` L98--133 -- KPI card skeletons (6-column grid)
- `design-artifacts/prototypes/ui-states.html` L135--142 -- Chart card skeleton
- `design-artifacts/prototypes/ui-states.html` L144--190 -- Table card skeleton (header + 3 rows)

## Acceptance Criteria
- [ ] Generic skeleton uses the `.skeleton` CSS class with shimmer animation
- [ ] Shimmer is a 1.5s ease-in-out infinite animation sliding a gradient
- [ ] kpiCard variant renders inside a card shell (bg-white rounded-2xl p-5 shadow-card)
- [ ] kpiCard variant shows 3 bars: label (h-3 w-20), value (h-6 w-32), sublabel (h-3 w-16)
- [ ] chart variant shows header row + time span bar + chart area placeholder (h-48 sm:h-64)
- [ ] tableRow variant shows header row + 3 body rows with varying bar widths
- [ ] All skeleton bars have rounded corners
- [ ] Dark mode: skeleton bars use dark:bg-base-700 as base color
- [ ] Generic skeleton supports custom `width` and `height` props
- [ ] Skeleton elements do not cause layout shift when real content loads
- [ ] All tests pass and meet coverage target
- [ ] Each skeleton variant (kpiCard, chart, tableRow, generic) has dedicated test coverage

## Testing Requirements
- **Test file**: `src/components/shared/Skeleton.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test placeholder elements render for each variant (kpiCard, chart, tableRow, generic)
- Test the `skeleton` CSS class (pulse/shimmer animation) is present on skeleton bar elements
- Test generic skeleton accepts custom `width` and `height` props
- Test SkeletonKpiCard renders the expected 3 shimmer bars inside a card shell
- Test SkeletonChart renders header row, time span bar, and chart area placeholder
- Test SkeletonTableRows renders header row plus 3 body rows
- Test `count` prop renders multiple instances when provided

## Technical Notes
- File to create: `src/components/shared/Skeleton.tsx`
- Export multiple components: `Skeleton` (generic bar), `SkeletonKpiCard`, `SkeletonChart`, `SkeletonTableRows`
- The `.skeleton` CSS class is defined in `src/index.css` per US-002 — uses `@keyframes shimmer`
- Skeleton bar widths are intentionally varied within each variant to look natural
- Consider accepting a `count` prop for SkeletonKpiCard and SkeletonTableRows to render multiple
- Export all as named exports: `export { Skeleton, SkeletonKpiCard, SkeletonChart, SkeletonTableRows }`
