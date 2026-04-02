# US-065: Portfolio Overview — Allocation Section

## Story
As the Insight platform user, I want a portfolio allocation visualization so that I can see how my investments are distributed across platforms as a proportion of total value.

## Dependencies
- US-037: ProportionalBar Component
- US-054: Portfolio Allocation Calculation

## Requirements
- Render a "Portfolio Allocation" section on the overview page (PRD §6.3 item 5, §6.2.8)
- ProportionalBar showing each active platform's share of total portfolio value
- Legend below the bar with: color square, platform name, DKK value, percentage
- Cash platforms marked with a "Cash" badge in the legend to distinguish from investment platforms
- Closed platforms excluded from the allocation calculation and visualization (PRD §6.6)
- Percentages computed as: `platformValue (DKK) / totalPortfolioValue (DKK) x 100`

## Shared Components Used
- `ProportionalBar` (US-037) — props: { segments: allocationSegments.map(s => ({ label: s.name, value: s.valueDkk, percentage: s.percentage, color: s.color, badge: s.type === "cash" ? "Cash" : undefined })) }

## UI Specification

**Section wrapper:**
```
<div className="mb-6 lg:mb-8">
  {/* Section header */}
  <div className="flex items-center gap-2 mb-3">
    <h2 className="text-sm font-semibold text-base-900 dark:text-white">Portfolio Allocation</h2>
  </div>
  {/* Allocation card */}
  <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 sm:p-5">
    <ProportionalBar segments={allocationSegments} />
  </div>
</div>
```

The `ProportionalBar` component handles:
- The segmented horizontal bar (h-8 rounded-lg)
- The legend grid below with color squares, names, values, and percentages
- Cash platform "Cash" badge rendering

No additional layout markup needed beyond the section wrapper and card shell.

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Portfolio Allocation section: L899–965 (proportional bar L903–909, legend with values/percentages L911–964, cash accounts tagged)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] Section header shows "Portfolio Allocation"
- [ ] ProportionalBar renders inside a card with rounded-2xl shadow-card
- [ ] Each active platform has a proportional segment in the bar
- [ ] Legend shows color square, platform name, DKK value, and percentage for each platform
- [ ] Cash platforms display a "Cash" badge next to their name in the legend
- [ ] Closed platforms are excluded from the visualization
- [ ] Segment widths are proportional to each platform's share of total value
- [ ] Percentages sum to approximately 100%
- [ ] Responsive: bar and legend adapt to mobile widths
- [ ] Uses shared ProportionalBar component — no inline allocation markup
- [ ] PRD §14 criterion 20: Portfolio allocation visualization shows each platform's share
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewAllocation.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (ProportionalBar renders with correct segments)
- Test loading state (skeleton/spinner shown while allocation data is pending)
- Test empty state (EmptyState component when no allocation data exists)
- Test error state (ErrorState component when query fails)
- Test that each active platform has a proportional segment in the bar
- Test that legend shows color square, platform name, DKK value, and percentage
- Test that cash platforms display a "Cash" badge next to their name in the legend
- Test that closed platforms are excluded from the visualization
- Test that percentages sum to approximately 100%
- Test responsive behavior (bar and legend adapt to mobile widths)

## Technical Notes
- This section is part of `src/components/portfolio/PortfolioOverview.tsx`
- Allocation data computed by `calculateAllocation()` from US-054
- Each segment needs a unique color — use a predefined color palette (e.g., Tailwind's named colors: blue-500, emerald-500, amber-500, violet-500, rose-500, cyan-500, orange-500, indigo-500)
- Colors should be consistent per platform (consider hashing platform ID to a color index)
- When a platform's share is very small (< 2%), the segment may be too narrow to show — the legend compensates by always showing all entries
