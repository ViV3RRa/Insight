# US-068: Platform Detail — Performance Overview Chart

## Story
As the Insight platform user, I want a performance chart on the platform detail page with time span selector and mode toggle so that I can visualize monthly earnings or cumulative XIRR over any time period.

## Dependencies
- US-022: ChartCard Wrapper Component
- US-048: XIRR Calculation
- US-049: Monthly Earnings

## Requirements
- Render a ChartCard with an embedded chart showing platform performance (PRD §6.4 item 1)
- Chart mode toggle with two views:
  - **Earnings**: Monthly earnings as vertical bars (green positive, red negative)
  - **XIRR %**: Cumulative XIRR (inception-to-date) as a smooth line chart evolving over time
- Time span selector (1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All) — default YTD
- YoY toggle: when active, overlays prior year data per PRD §3.2
- Values in platform's native currency
- Always visible (not collapsible) — charts and performance sections are always visible per PRD §3.6

## Shared Components Used
- `ChartCard` (US-022) — props: { title: "Performance Overview", modes: [{ label: "Earnings", value: "earnings" }, { label: "XIRR %", value: "xirr" }], activeMode, onModeChange, timeSpan, onTimeSpanChange, yoyActive, onYoYChange, children: <Chart /> }

## UI Specification

**Placement:** Below the stat cards, with section spacing `mb-6 lg:mb-8`.

The `ChartCard` handles the card shell, title, controls (mode toggle, YoY toggle, time span selector). The chart content is rendered as children.

**Earnings mode chart:**
- Recharts `BarChart`
- One bar per month within the selected time span
- Green (#22c55e) for positive earnings, red (#ef4444) for negative
- Value labels on/above bars
- X-axis: monthly labels (MMM format or MMM YYYY)
- Y-axis: currency value (native)

**XIRR mode chart:**
- Recharts `LineChart` with smooth curve (type="monotone")
- Line color: blue-500 (#3b82f6) with subtle area fill (blue-500/10)
- Shows how the inception-to-date XIRR evolves over time
- X-axis: monthly labels
- Y-axis: percentage

**YoY overlay:**
- Earnings: semi-transparent bars (opacity-0.3) behind current bars
- XIRR: dashed or ghost line for the prior year

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Performance Overview card (title + YoY/mode toggles + time span selector + chart placeholder): L345–399

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-top.png`

## Acceptance Criteria
- [ ] ChartCard renders with title "Performance Overview"
- [ ] Mode toggle switches between Earnings and XIRR %
- [ ] Earnings mode shows green/red bar chart per month
- [ ] XIRR mode shows smooth blue line chart
- [ ] Time span selector filters the visible data range
- [ ] Default time span is YTD
- [ ] YoY toggle overlays prior year data when active
- [ ] Chart values are in the platform's native currency
- [ ] Chart renders smoothly with 7+ years of data
- [ ] Uses shared ChartCard component — no inline chart card markup
- [ ] PRD §6.4 item 1: Line/area chart with time span selector and YoY toggle
- [ ] PRD §14 criterion 40: YoY toggle overlays prior year data

## Technical Notes
- Charts rendered using Recharts (`BarChart`, `LineChart`, `Area`, `Bar`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
- Monthly earnings data from US-049 calculations
- Cumulative XIRR at each month-end computed by running XIRR from inception to each month boundary
- For YoY overlay, compute the same metrics for the equivalent prior-year period
- Use `ResponsiveContainer` with `width="100%"` and `height` from ChartCard's content area
