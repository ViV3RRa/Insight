# US-090: Home Overview — YoY Comparison Row

## Story
As the Insight platform user, I want a year-over-year comparison summary on the Home overview so that I can quickly see how total utility costs compare to the same period last year.

## Dependencies
- US-018: YoYComparisonRow Component
- US-087: Utility YoY Calculations

## Requirements
- Always-visible YoY comparison card on the Home overview page (PRD §3.2, §5.3)
- Shows three comparison metrics aggregated across all utilities:
  1. **YTD Total Cost**: current year YTD vs same YTD period last year, with percentage change
  2. **Current Month Cost**: current month vs same month last year, with percentage change
  3. **Avg Monthly Cost**: current year average vs prior year average for the same period, with percentage change
- Comparison period auto-derived (e.g. "Jan 1 – Feb 17, 2025" for the same window last year)
- Percentage changes color-coded: red for cost increase, green for cost decrease

## Shared Components Used
- `YoYComparisonRow` (US-018) — props: { metrics: [ { sublabel: "YTD Total Cost", currentValue, previousValue, changePercent, changeType: "inverse" }, { sublabel: "Current Month Cost", ... }, { sublabel: "Avg Monthly Cost", ... } ] }

## UI Specification

**Placement:** Below the utility summary cards, above the charts area. Spacing: `mb-6 lg:mb-8`.

The `YoYComparisonRow` component handles all layout and styling (US-018). This story composes it with Home-specific metrics.

**Change type "inverse":** For utility costs, an increase is bad (red) and a decrease is good (green) — the opposite of investment returns. The YoYComparisonRow accepts a `changeType: "inverse"` prop to handle this.

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- YoY Comparison Row: L266-310 (3 metrics: YTD Total Cost, Current Month Cost, Avg Monthly Cost)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`

## Acceptance Criteria
- [ ] YoY comparison row renders below utility summary cards
- [ ] Shows YTD Total Cost with current vs prior year comparison
- [ ] Shows Current Month Cost with current vs same month last year
- [ ] Shows Avg Monthly Cost with current vs prior year average for same period
- [ ] Cost increase shown in red (bad), cost decrease shown in green (good)
- [ ] Comparison period label shows correct date range
- [ ] Handles missing prior year data gracefully (shows "N/A" or hides metric)
- [ ] Uses shared YoYComparisonRow component
- [ ] PRD §3.2: YoY comparison summary for Home section metrics
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering data display and edge states

## Testing Requirements
- **Test file**: `src/components/home/HomeOverviewYoYRow.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test YTD Total Cost metric renders with current and prior year values
- Test Current Month Cost metric renders with current and same-month-last-year values
- Test Avg Monthly Cost metric renders with current and prior year averages
- Test cost increase shown in red, cost decrease shown in green (inverse color coding)
- Test comparison period label shows correct date range
- Test missing prior year data shows "N/A" or hides metric gracefully
- Test uses shared YoYComparisonRow component with changeType "inverse"
- Test loading state

## Technical Notes
- Composed within `src/components/home/HomeOverview.tsx`
- Data from `calculateHomeYoY()` (US-087) which aggregates across all utilities
- The "inverse" change type means the ChangeIndicator in YoYComparisonRow renders increase as red and decrease as green
- If no prior year data exists (first year of tracking), show "N/A" for change values
