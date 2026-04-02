# US-060: Portfolio Overview — Performance Analysis Yearly Tab

## Story
As the Insight platform user, I want a yearly performance analysis tab with bar chart and summary table so that I can compare portfolio returns across years and see the exact numbers behind the chart.

## Dependencies
- US-024: TabBar Component
- US-025: DataTable Component
- US-021: ChartModeToggle Component
- US-058: Portfolio Overview — Performance Charts Accordion Shell
- US-053: Portfolio-Level Aggregation in DKK

## Requirements
- Inside the performance accordion, render a tabbed card with Yearly and Monthly tabs (PRD §6.3 item 3, §6.4 item 2)
- Yearly tab (active by default) contains:
  1. **Bar chart**: one bar per year, green for positive earnings/XIRR, red for negative. ChartModeToggle to switch between Earnings and XIRR views. Value labels on bars.
  2. **Summary table below the chart**: one row per year with computed metrics.
- Table columns: Year, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR
- Totals row at the bottom summarizing all-time values
- Current year row labeled as "2026 (YTD)"
- All values in DKK (portfolio-level)

## Shared Components Used
- `TabBar` (US-024) — props: { tabs: [{ label: "Yearly", value: "yearly" }, { label: "Monthly", value: "monthly" }], activeTab: "yearly", onTabChange: handleTabChange, rightContent: <ChartModeToggle /> }
- `ChartModeToggle` (US-021) — props: { modes: [{ label: "Earnings", value: "earnings" }, { label: "XIRR", value: "xirr" }], activeMode, onModeChange }
- `DataTable` (US-025) — props: { columns: yearlyColumns, data: yearlyData, totals: totalsRow, sortable: false }

## UI Specification

**Card shell:**
```
bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden
```

**TabBar** renders at the top of the card with Yearly/Monthly tabs on the left and ChartModeToggle on the right.

**Yearly tab content (below TabBar):**
```
<div className="p-4 sm:p-6">
  {/* Bar chart area */}
  <div className="h-64 sm:h-72 mb-6">
    <Recharts BarChart />
  </div>
  {/* Summary table */}
  <DataTable columns={yearlyColumns} data={yearlyData} totals={totalsRow} />
</div>
```

**Bar chart:**
- Recharts `BarChart` with one bar per year
- Earnings mode: bars show absolute earnings in DKK
- XIRR mode: bars show annualized XIRR percentage
- Green (#22c55e) for positive, red (#ef4444) for negative
- Value labels on bars

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Year | left | "2024" or "2026 (YTD)" | always visible |
| Starting Value | right | font-mono-data, DKK | hidden, cyclable |
| Ending Value | right | font-mono-data, DKK | hidden, cyclable |
| Net Deposits | right | font-mono-data, DKK | hidden, cyclable |
| Earnings | right | font-mono-data, colored | always visible |
| Earnings % | right | font-mono-data, colored | hidden, cyclable |
| XIRR | right | font-mono-data, bold | hidden, cyclable |

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Yearly Analysis tab: L361–482 (bar chart placeholder + yearly summary table with All Time totals row)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] TabBar shows Yearly and Monthly tabs with ChartModeToggle on the right
- [ ] Yearly tab is active by default
- [ ] Bar chart shows one bar per year with green/red coloring
- [ ] ChartModeToggle switches chart between Earnings and XIRR views
- [ ] Value labels appear on bars
- [ ] Summary table shows all yearly columns with correct formatting
- [ ] Totals row appears at the bottom with all-time aggregates
- [ ] Current year is labeled "(YTD)"
- [ ] Earnings and Earnings % use colored text (emerald/rose)
- [ ] Mobile: secondary columns cycle via MobileColumnCycler
- [ ] Uses shared TabBar, ChartModeToggle, and DataTable components — no inline markup for these patterns
- [ ] PRD §6.4 item 2: Tabbed card with Yearly/Monthly tabs, bar chart, and summary table

## Technical Notes
- This section lives within the performance accordion content in `src/components/portfolio/PortfolioOverview.tsx`
- Yearly data is computed from the portfolio aggregation service for each calendar year
- The TabBar's `onTabChange` handler switches between yearly and monthly views (US-061)
- The ChartModeToggle is rendered in the TabBar's `rightContent` slot
- Totals row uses the DataTable's `totals` prop for distinct styling (bg-base-50/60)
