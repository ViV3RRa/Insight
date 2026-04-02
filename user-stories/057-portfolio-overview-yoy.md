# US-057: Portfolio Overview — YoY Comparison Section

## Story
As the Insight platform user, I want an always-visible year-over-year comparison card on the portfolio overview so that I can see how my current earnings and XIRR compare to the same period last year.

## Dependencies
- US-018: YoYComparisonRow Component
- US-053: Portfolio-Level Aggregation in DKK

## Requirements
- Render a `YoYComparisonRow` card below the summary cards section
- Always visible (not collapsible) per PRD §3.2 and §6.3 item 2
- 3 metrics for the Investment portfolio overview:
  1. **YTD Earnings**: Current YTD earnings vs same YTD period last year, with percentage change
  2. **YTD XIRR**: Current YTD XIRR vs same period last year, with change in percentage points (pp suffix)
  3. **Month Earnings**: Current month earnings vs same month last year, with percentage change
- Period label computed automatically (e.g., "Jan 1 – Apr 1, 2026 vs Jan 1 – Apr 1, 2025")
- All values in DKK (portfolio-level aggregation)

## Shared Components Used
- `YoYComparisonRow` (US-018) — props: { periodLabel: computedPeriodLabel, metrics: [ { label: "YTD Earnings", currentValue: formatCurrency(ytdEarnings), previousValue: formatCurrency(prevYtdEarnings), changePercent: ytdEarningsChangePct }, { label: "YTD XIRR", currentValue: formatPercent(ytdXirr), previousValue: formatPercent(prevYtdXirr), changePercent: xirrChangePp, suffix: "pp" }, { label: "Month Earnings", currentValue: formatCurrency(monthEarnings), previousValue: formatCurrency(prevMonthEarnings), changePercent: monthEarningsChangePct } ] }

## UI Specification

**Placement:** Directly below the summary cards grid, with section spacing `mb-6 lg:mb-8`.

No additional layout markup needed — the `YoYComparisonRow` component handles its own card shell, header, and responsive grid/stack layout.

The period label is derived from `getYoYRange()` utility (US-012).

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- YoY Comparison Row: L218–262

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-top.png`

## Acceptance Criteria
- [ ] YoYComparisonRow renders below the summary cards
- [ ] Card is always visible (not collapsible)
- [ ] Shows 3 metrics: YTD Earnings, YTD XIRR, Month Earnings
- [ ] YTD Earnings shows current vs prior year value with percentage change
- [ ] YTD XIRR shows current vs prior year with change in percentage points
- [ ] Month Earnings shows current month vs same month last year with percentage change
- [ ] Period label dynamically reflects the current date range
- [ ] Desktop: 3-column grid layout
- [ ] Mobile: vertical stack with border dividers
- [ ] Uses the shared YoYComparisonRow component — no inline YoY markup
- [ ] Values update when the active portfolio changes
- [ ] PRD §3.2: YoY comparison summary is always visible on overview pages
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewYoY.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (3 comparison rows render correct values)
- Test loading state (skeleton/spinner shown while aggregation queries are pending)
- Test empty state (graceful handling when no prior year data exists)
- Test error state (ErrorState component when query fails)
- Test that YTD Earnings row shows current vs prior year with percentage change
- Test that YTD XIRR row shows current vs prior year with change in percentage points (pp suffix)
- Test that Month Earnings row shows current month vs same month last year
- Test that period label dynamically reflects the current date range
- Test responsive layout (3-column grid on desktop, vertical stack on mobile)
- Test that the section is always visible (not collapsible)

## Technical Notes
- This is a section within `src/components/portfolio/PortfolioOverview.tsx`
- YoY calculations use the portfolio aggregation service (US-053) with two different date windows
- For XIRR comparison, the change is in percentage points (pp), not a percentage change — pass this distinction to the ChangeIndicator via the suffix prop
- The `getYoYRange` utility from US-012 produces the period label string
