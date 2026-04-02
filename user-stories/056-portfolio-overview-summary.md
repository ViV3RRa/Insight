# US-056: Portfolio Overview — Summary Cards Section

## Story
As the Insight platform user, I want six summary stat cards on the portfolio overview showing total value, gain/loss, XIRR, and earnings so that I can instantly gauge my portfolio's overall performance.

## Dependencies
- US-014: StatCard Component
- US-053: Portfolio-Level Aggregation in DKK
- US-054: Portfolio Allocation Calculation

## Requirements
- Render 6 `StatCard` components in a responsive grid for the selected portfolio
- All values are portfolio-level aggregates in DKK (PRD §6.3 item 1, §6.2.7)
- Cards:
  1. **Total Value** — Variant A (simple): current portfolio value in DKK, sublabel showing date of most recent data point (e.g., "Feb 14, 2026")
  2. **All-Time Gain/Loss** — Variant C (colored + badge): absolute DKK amount + percentage badge, emerald for positive / rose for negative
  3. **All-Time XIRR** — Variant D (unit suffix): annualized return with "%" suffix, sublabel "Annualized return"
  4. **YTD Gain/Loss** — Variant C (colored + badge): YTD absolute + percentage badge
  5. **YTD XIRR** — Variant D (unit suffix): YTD annualized return with "%" suffix, sublabel "Annualized YTD"
  6. **Month Earnings** — Variant B (colored): current month earnings, emerald/rose colored, sublabel showing current month (e.g., "Feb 2026")

## Shared Components Used
- `StatCard` (US-014) — 6 instances with varying props:
  - Total Value: { label: "Total Value", value: formatCurrency(totalValue, "DKK"), variant: "simple", sublabel: formatDate(latestDataPointDate) }
  - All-Time Gain/Loss: { label: "All-Time Gain/Loss", value: formatCurrency(allTimeGain, "DKK"), variant: "withBadge", badgeValue: formatPercent(allTimeGainPct), trend: allTimeGain >= 0 ? "positive" : "negative" }
  - All-Time XIRR: { label: "All-Time XIRR", value: formatNumber(allTimeXirr), variant: "withUnit", unitSuffix: "%", sublabel: "Annualized return" }
  - YTD Gain/Loss: { label: "YTD Gain/Loss", value: formatCurrency(ytdGain, "DKK"), variant: "withBadge", badgeValue: formatPercent(ytdGainPct), trend: ytdGain >= 0 ? "positive" : "negative" }
  - YTD XIRR: { label: "YTD XIRR", value: formatNumber(ytdXirr), variant: "withUnit", unitSuffix: "%", sublabel: "Annualized YTD" }
  - Month Earnings: { label: "Month Earnings", value: formatCurrency(monthEarnings, "DKK"), variant: "colored", trend: monthEarnings >= 0 ? "positive" : "negative", sublabel: formatMonth(currentMonth) }

## UI Specification

**Grid layout (page-level):**
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4
```

Each grid cell contains one `StatCard`. On mobile (< sm): 2 columns. On sm-lg: 3 columns (2 rows). On lg+: all 6 in a single row.

No additional page-level styling beyond the grid. All card visuals are handled by the StatCard component.

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Summary Cards grid (6 KPIs): L184–216

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`

## Acceptance Criteria
- [ ] 6 StatCards render in the correct responsive grid
- [ ] Mobile (< 640px): 2 columns, 3 rows
- [ ] Tablet (640-1024px): 3 columns, 2 rows
- [ ] Desktop (> 1024px): 6 columns, 1 row
- [ ] Grid gap: gap-3 on mobile, lg:gap-4 on desktop
- [ ] Total Value shows plain DKK value with date sublabel of most recent data point (Variant A)
- [ ] Gain/Loss cards show colored value with percentage badge (Variant C)
- [ ] All-Time XIRR shows value with "%" suffix and sublabel "Annualized return" (Variant D)
- [ ] YTD XIRR shows value with "%" suffix and sublabel "Annualized YTD" (Variant D)
- [ ] Month Earnings shows colored value with current month sublabel e.g. "Feb 2026" (Variant B)
- [ ] All values use formatCurrency / formatPercent from US-011
- [ ] Values update when the active portfolio changes (via PortfolioSwitcher)
- [ ] Summary cards use the shared StatCard component — no inline stat card markup
- [ ] PRD §14 criterion 23: Portfolio overview shows summary cards
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewSummary.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (all 6 stat cards render correct values)
- Test loading state (skeleton placeholders shown while aggregation queries are pending)
- Test empty state (EmptyState component when portfolio has no platforms or data)
- Test error state (ErrorState component when aggregation query fails)
- Test that Total Value card shows DKK value with date sublabel (Variant A)
- Test that Gain/Loss cards show colored value with percentage badge (Variant C)
- Test that XIRR cards show value with "%" suffix and correct sublabel (Variant D)
- Test that Month Earnings card shows colored value with current month sublabel (Variant B)
- Test responsive grid classes (grid-cols-2, sm:grid-cols-3, lg:grid-cols-6)
- Test that values update when active portfolio changes

## Technical Notes
- This is a section within `src/components/portfolio/PortfolioOverview.tsx`
- Receives aggregated portfolio data as props from the parent page component
- All calculations come from US-053 (portfolio aggregation) — this component is purely presentational
- The formatCurrency and formatPercent utilities come from US-011
