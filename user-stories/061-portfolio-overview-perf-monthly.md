# US-061: Portfolio Overview — Performance Analysis Monthly Tab

## Story
As the Insight platform user, I want a monthly performance analysis tab with bar chart and summary table so that I can drill into month-by-month portfolio returns and identify trends at a granular level.

## Dependencies
- US-025: DataTable Component
- US-026: MobileColumnCycler Component
- US-060: Portfolio Overview — Performance Analysis Yearly Tab (shares the TabBar container)

## Requirements
- Monthly tab within the same TabBar created in US-060
- Monthly tab contains (PRD §6.4 item 2):
  1. **Bar chart**: one bar per month, green/red. ChartModeToggle (shared with yearly tab) switches between Earnings and Monthly XIRR.
  2. **Summary table below the chart**: one row per month.
- Table columns: Period (MMM YYYY), Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR
- No totals row for monthly view (the yearly tab covers aggregates)
- Mobile: secondary columns replaced by MobileColumnCycler cycling through: Monthly XIRR, Starting Value, Ending Value, Net Deposits (PRD §8.3)

## Shared Components Used
- `DataTable` (US-025) — props: { columns: monthlyColumns, data: monthlyData, sortable: false }
- `MobileColumnCycler` (US-026) — integrated into DataTable via column config: { hideOnMobile: true } on secondary columns

## UI Specification

**Monthly tab content (same card shell as US-060, switched by TabBar):**
```
<div className="p-4 sm:p-6">
  {/* Bar chart area */}
  <div className="h-64 sm:h-72 mb-6">
    <Recharts BarChart />
  </div>
  {/* Summary table */}
  <DataTable columns={monthlyColumns} data={monthlyData} />
</div>
```

**Bar chart:**
- Recharts `BarChart`, one bar per month
- Earnings mode: monthly earnings (DKK)
- XIRR mode: monthly XIRR (%)
- Green (#22c55e) positive, red (#ef4444) negative
- Value labels on bars

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Period | left | "Feb 2026" | always visible |
| Starting Value | right | font-mono-data, DKK | hidden, cyclable |
| Ending Value | right | font-mono-data, DKK | hidden, cyclable |
| Net Deposits | right | font-mono-data, DKK | hidden, cyclable |
| Earnings | right | font-mono-data, colored | always visible |
| Monthly XIRR | right | font-mono-data | hidden, cyclable |

**Mobile column cycling order:** Monthly XIRR, Starting Value, Ending Value, Net Deposits (PRD §8.3)

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Monthly Analysis tab: L484–607 (bar chart placeholder + monthly table with mobile column cycler)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] Monthly tab shows a bar chart with one bar per month
- [ ] Chart follows the ChartModeToggle state shared with the yearly tab
- [ ] Summary table shows all monthly columns with correct formatting
- [ ] Period labels use "MMM YYYY" format (e.g., "Feb 2026")
- [ ] Earnings values use colored text (emerald/rose based on sign)
- [ ] Monthly XIRR values display as percentages
- [ ] Mobile: secondary columns cycle via MobileColumnCycler
- [ ] Mobile cycling order: Monthly XIRR, Starting Value, Ending Value, Net Deposits
- [ ] Dot indicator below the mobile column header shows active position
- [ ] All rows update simultaneously when cycling columns
- [ ] Uses shared DataTable and MobileColumnCycler — no inline table markup
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewPerfMonthly.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (month rows render correct values)
- Test loading state (skeleton/spinner shown while data queries are pending)
- Test empty state (EmptyState component when no monthly data available)
- Test error state (ErrorState component when query fails)
- Test that bar chart renders with one bar per month in green/red coloring
- Test that chart follows the ChartModeToggle state shared with the yearly tab
- Test that period labels use "MMM YYYY" format (e.g., "Feb 2026")
- Test that Earnings values use colored text (emerald/rose based on sign)
- Test that Monthly XIRR values display as percentages
- Test mobile column cycling order: Monthly XIRR, Starting Value, Ending Value, Net Deposits
- Test dot indicator below mobile column header shows active position
- Test that all rows update simultaneously when cycling columns

## Technical Notes
- Monthly data computed from portfolio aggregation for each calendar month
- Monthly XIRR is a first-class metric per PRD §6.2.5 — XIRR for a single month in isolation
- The ChartModeToggle state is shared between yearly and monthly tabs via the parent component's state
- The monthly view may contain many rows (e.g., 84+ for 7 years) — consider the DataTable's show-more toggle with a threshold of ~12 rows
