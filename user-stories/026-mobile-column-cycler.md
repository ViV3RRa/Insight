# US-026: MobileColumnCycler Component

## Story
As the Insight platform user, I want to cycle through hidden table columns on mobile by tapping a column header so that I can access all data without horizontal scrolling.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `MobileColumnCycler` component per PRD §8.3
- Visible only on mobile (sm:hidden)
- Replaces secondary columns that don't fit on mobile screens
- Header button shows: current metric label + chevron + dot indicator
- Dot indicator: small dots showing which column is active and how many are available
- Tapping the header cycles through all hidden column values
- All rows update simultaneously when cycling — the entire column switches together
- Cell values use a grid overlay technique for zero-layout-shift cycling
- Used on: portfolio overview platform table, platform detail yearly/monthly tables

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === MobileColumnCycler header (sm:hidden) === */
<th className="sm:hidden px-4 py-2.5 text-right">
  <button
    className="
      inline-flex flex-col items-end gap-0.5
      text-xs font-medium text-base-300 dark:text-base-400
    "
    onClick={cycleToNextColumn}
  >
    {/* Label row */}
    <div className="flex items-center gap-1">
      <span>XIRR</span>
      <svg
        className="w-3 h-3 text-base-300"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 5l3 3 3-3" />
      </svg>
    </div>

    {/* Dot indicator */}
    <div className="flex items-center gap-1">
      <span className="w-1 h-1 rounded-full bg-accent-500" />
      <span className="w-1 h-1 rounded-full bg-base-300 dark:bg-base-500" />
      <span className="w-1 h-1 rounded-full bg-base-300 dark:bg-base-500" />
      <span className="w-1 h-1 rounded-full bg-base-300 dark:bg-base-500" />
    </div>
  </button>
</th>

/* === MobileColumnCycler cell (sm:hidden) === */
<td className="sm:hidden px-4 py-3 text-right">
  {/* Grid overlay for zero-layout-shift */}
  <div className="grid">
    {/* Only the active value is visible; others are hidden but reserve space */}
    <span
      className="
        col-start-1 row-start-1
        font-mono-data text-sm text-base-900 dark:text-white
        transition-opacity duration-150
      "
      style={{ opacity: activeIndex === 0 ? 1 : 0 }}
    >
      8,42%
    </span>
    <span
      className="
        col-start-1 row-start-1
        font-mono-data text-sm text-base-900 dark:text-white
        transition-opacity duration-150
      "
      style={{ opacity: activeIndex === 1 ? 1 : 0 }}
    >
      +2.450 DKK
    </span>
    <span
      className="
        col-start-1 row-start-1
        font-mono-data text-sm text-base-900 dark:text-white
        transition-opacity duration-150
      "
      style={{ opacity: activeIndex === 2 ? 1 : 0 }}
    >
      +12,5%
    </span>
    <span
      className="
        col-start-1 row-start-1
        font-mono-data text-sm text-base-900 dark:text-white
        transition-opacity duration-150
      "
      style={{ opacity: activeIndex === 3 ? 1 : 0 }}
    >
      Feb 14
    </span>
  </div>
</td>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L636--655 -- Cycling column header with dot indicators
- `design-artifacts/prototypes/portfolio-overview.html` L681--697 -- Cycling cell values (grid overlay technique)
- `design-artifacts/prototypes/portfolio-overview.html` L974--1019 -- JavaScript cycleColumn() implementation

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-tables.png`

## Acceptance Criteria
- [ ] Component is only visible on mobile (sm:hidden on all elements)
- [ ] Header button shows current column label + chevron icon
- [ ] Dot indicator shows active dot (bg-accent-500) and inactive dots (bg-base-300)
- [ ] Number of dots matches the number of cyclable columns
- [ ] Tapping the header advances to the next column (wraps around)
- [ ] All rows update simultaneously when cycling
- [ ] Cell values use grid overlay (col-start-1 row-start-1) for zero layout shift
- [ ] Only the active value has opacity: 1; all others have opacity: 0
- [ ] Values transition smoothly (transition-opacity duration-150)
- [ ] Active dot w-1 h-1 rounded-full bg-accent-500
- [ ] Inactive dots w-1 h-1 rounded-full bg-base-300 dark:bg-base-500

## Technical Notes
- File to create: `src/components/shared/MobileColumnCycler.tsx`
- Export two components: `MobileColumnCyclerHeader` (for the `<th>`) and `MobileColumnCyclerCell` (for each `<td>`)
- Props for header: `columns: Array<{ label: string }>`, `activeIndex: number`, `onCycle: () => void`
- Props for cell: `values: Array<ReactNode>`, `activeIndex: number`
- The `activeIndex` state is managed by the parent DataTable or page component
- The grid overlay technique: all values occupy the same grid cell (col-start-1 row-start-1), so the widest value determines the column width, preventing layout shift
- PRD §8.3 specifies: portfolio table cycles XIRR, Month Earnings, All-Time Gain/Loss, Updated
- Export as named exports: `export { MobileColumnCyclerHeader, MobileColumnCyclerCell }`
