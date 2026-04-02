# US-059: Portfolio Overview — Portfolio Value Over Time

## Story
As the Insight platform user, I want side-by-side charts showing portfolio value breakdown and monthly performance so that I can visualize how my portfolio has grown and which months contributed positively or negatively.

## Dependencies
- US-022: ChartCard Wrapper Component
- US-058: Portfolio Overview — Performance Charts Accordion Shell
- US-053: Portfolio-Level Aggregation in DKK

## Requirements
- Render two chart cards side by side inside the performance accordion (PRD §6.3 item 3):
  - **Chart A — Stacked Area Chart**: Per-platform value breakdown over time. Each platform is a colored area segment stacked to show total portfolio value. Uses the composite value series from US-053.
  - **Chart B — Performance Bar Chart**: Monthly green/red bars. Toggle between Earnings (absolute monthly earnings) and XIRR % (monthly XIRR). Green bars for positive months, red for negative. Value labels on bars.
- Both charts share a single time span selector and YoY toggle
- Chart A has no mode toggle (always shows value)
- Chart B has a ChartModeToggle: Earnings / XIRR
- YoY overlay: when toggled, shows prior year data as semi-transparent bars or dashed lines per PRD §3.2
- Chart colors: bar positive = emerald-500 (#22c55e), bar negative = rose-500 (#ef4444), area colors = per-platform color palette

## Shared Components Used
- `ChartCard` (US-022) — 2 instances:
  - Chart A: { title: "Portfolio Value", hideMode: true, children: <StackedAreaChart data={...} /> }
  - Chart B: { title: "Monthly Performance", modes: [{ label: "Earnings", value: "earnings" }, { label: "XIRR", value: "xirr" }], children: <PerformanceBarChart data={...} mode={activeMode} /> }

## UI Specification

**Layout within the performance accordion:**
```
grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6
```

Each grid cell contains one `ChartCard`. On mobile, charts stack vertically. On desktop, they sit side by side.

**Chart A (Stacked Area):**
- Recharts `AreaChart` with `stackId` per platform
- X-axis: monthly labels (MMM YYYY format)
- Y-axis: DKK value
- Tooltip showing breakdown per platform
- Platform colors assigned from a predefined palette

**Chart B (Performance Bars):**
- Recharts `BarChart` with conditional fill (green/red)
- Earnings mode: bar height = monthly earnings (DKK), value labels on bars
- XIRR mode: bar height = monthly XIRR (%), value labels as percentages
- YoY overlay: second semi-transparent bar set behind current data

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Portfolio Value Over Time section: L275–345 (header + YoY/mode toggles + time span + dual chart grid)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] Two chart cards render side by side on desktop, stacked on mobile
- [ ] Grid uses grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6
- [ ] Chart A shows stacked area chart with per-platform breakdown
- [ ] Chart B shows green/red bar chart for monthly performance
- [ ] Chart B mode toggle switches between Earnings and XIRR
- [ ] Both charts respond to the time span selector
- [ ] YoY toggle overlays prior year data when active
- [ ] Positive bars are emerald-500, negative bars are rose-500
- [ ] Value labels appear on or above bars
- [ ] Charts render smoothly with 7+ years of data (PRD §13)
- [ ] Uses shared ChartCard component — no inline chart card markup
- [ ] Dark mode styles apply correctly to chart backgrounds and text

## Technical Notes
- Charts are rendered using Recharts library
- The stacked area chart requires building a composite series where each platform's value at each timestamp is a separate data key
- Bar chart uses conditional `fill` based on value sign: `value >= 0 ? '#22c55e' : '#ef4444'`
- For YoY overlay bars, use `opacity: 0.3` on the prior year bar set
- Time span filtering is handled by ChartCard's internal state + the timeSpan utility from US-012
- Performance data comes from portfolio aggregation service (US-053)
