# US-069: Platform Detail — Performance Analysis Tabs

## Story
As the Insight platform user, I want tabbed yearly and monthly performance analysis on the platform detail page so that I can see exact earnings, XIRR, and value changes for each period in both chart and table form.

## Dependencies
- US-024: TabBar Component
- US-025: DataTable Component
- US-021: ChartModeToggle Component
- US-026: MobileColumnCycler Component
- US-048: XIRR Calculation
- US-049: Monthly Earnings
- US-050: Gain/Loss Calculation

## Requirements
- Render a tabbed card with Yearly and Monthly tabs (PRD §6.4 item 2)
- Each tab contains a bar chart + summary table below
- ChartModeToggle (in TabBar's right slot): switch between Earnings and XIRR views
- Always visible (not collapsible)

**Yearly tab columns:** Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR
**Monthly tab columns:** Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR

- All values in platform's native currency
- Green/red bar chart: green positive, red negative, value labels on bars
- Totals row on both tabs

**Mobile column cycling (PRD §8.3):**
- Yearly: Earnings %, XIRR, Starting Value, Ending Value, Net Deposits
- Monthly: Monthly XIRR, Starting Value, Ending Value, Net Deposits

## Shared Components Used
- `TabBar` (US-024) — props: { tabs: [{ label: "Yearly", value: "yearly" }, { label: "Monthly", value: "monthly" }], activeTab, onTabChange, rightContent: <ChartModeToggle /> }
- `ChartModeToggle` (US-021) — props: { modes: [{ label: "Earnings", value: "earnings" }, { label: "XIRR", value: "xirr" }], activeMode, onModeChange }
- `DataTable` (US-025) — props: { columns: periodColumns, data: periodData, totals: totalsRow, sortable: false }
- `MobileColumnCycler` (US-026) — integrated via DataTable column config

## UI Specification

**Card shell:**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  <TabBar ... />
  <div className="p-4 sm:p-6">
    {/* Bar chart */}
    <div className="h-64 sm:h-72 mb-6">
      <Recharts BarChart />
    </div>
    {/* Summary table */}
    <DataTable ... />
  </div>
</div>
```

**Yearly table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Period | left | "2024" or "2026 (YTD)" | always visible |
| Starting Value | right | font-mono-data, currency | hidden, cyclable |
| Ending Value | right | font-mono-data, currency | hidden, cyclable |
| Net Deposits | right | font-mono-data, currency | hidden, cyclable |
| Earnings | right | font-mono-data, colored | always visible |
| Earnings % | right | font-mono-data, colored | hidden, cyclable |
| XIRR | right | font-mono-data, font-medium | hidden, cyclable |

**Monthly table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Period | left | "Feb 2026" | always visible |
| Starting Value | right | font-mono-data, currency | hidden, cyclable |
| Ending Value | right | font-mono-data, currency | hidden, cyclable |
| Net Deposits | right | font-mono-data, currency | hidden, cyclable |
| Earnings | right | font-mono-data, colored | always visible |
| Monthly XIRR | right | font-mono-data | hidden, cyclable |

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Performance Analysis card with Yearly/Monthly tabs: L401–664
- Yearly tab (bar chart + summary table with All Time totals): L417–538
- Monthly tab (bar chart + monthly table with mobile column cycler): L540–663

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-yearly.png`

## Acceptance Criteria
- [ ] TabBar shows Yearly and Monthly tabs
- [ ] ChartModeToggle renders in the TabBar's right slot
- [ ] Yearly tab shows bar chart + table with 7 columns
- [ ] Monthly tab shows bar chart + table with 6 columns
- [ ] ChartModeToggle switches chart between Earnings and XIRR
- [ ] Bar chart uses green/red coloring with value labels
- [ ] Totals row appears at bottom of both tables
- [ ] Current year labeled "(YTD)" in yearly tab
- [ ] Values in platform's native currency
- [ ] Earnings and Earnings % use colored text (emerald/rose)
- [ ] Mobile: secondary columns cycle via MobileColumnCycler
- [ ] Yearly mobile cycle: Earnings %, XIRR, Starting Value, Ending Value, Net Deposits
- [ ] Monthly mobile cycle: Monthly XIRR, Starting Value, Ending Value, Net Deposits
- [ ] Uses shared TabBar, ChartModeToggle, DataTable — no inline markup
- [ ] PRD §6.4 item 2: Tabbed card with Yearly/Monthly performance analysis

## Technical Notes
- This section is within `src/components/portfolio/PlatformDetail.tsx`
- Yearly data: for each calendar year, compute starting value, ending value, net deposits, earnings, earnings %, XIRR
- Monthly data: for each calendar month, compute using month-end boundary values from US-051
- Monthly XIRR is per-month isolation XIRR from US-052
- The ChartModeToggle state is shared between yearly and monthly tab views
- Monthly view may have many rows — use DataTable's show-more toggle (threshold ~12)
