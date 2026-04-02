# US-091: Home Overview — Charts Area with Mode Toggle

## Story
As the Insight platform user, I want a chart area on the Home overview showing monthly consumption or cost across all utilities so that I can visualize trends at the aggregate level.

## Dependencies
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-021: ChartModeToggle Component
- US-022: ChartCard Component
- US-084: Monthly Consumption Calculation
- US-085: Bill Amortization Calculation
- US-087: Utility YoY Calculations

## Requirements
- Chart card with multiple controls (PRD §5.3 items 3):
  - **Mode toggle**: Consumption vs. Cost (segmented control)
  - **Stacked/Grouped toggle**: Stacked or grouped bars (segmented control)
  - **YoY overlay toggle**: Shows prior year data overlaid (per PRD §3.2)
  - **TimeSpanSelector**: Filters chart data to selected period (default: YTD)
- **Consumption mode**: Bar chart of monthly consumption per utility (one color per utility, using utility's color field)
- **Cost mode**: Bar chart of monthly cost per utility
- Stacked bars: utilities stacked on top of each other per month
- Grouped bars: utilities side by side per month
- YoY overlay: semi-transparent bar set behind current data showing prior year
- Chart legend: utility names with color swatches
- X-axis: month labels (e.g. "Jan", "Feb")
- Y-axis: consumption units (kWh, m³, etc.) or cost (DKK)

## Shared Components Used
- `ChartCard` (US-022) — wrapper with header bar
- `TimeSpanSelector` (US-019) — embedded in chart card
- `YoYToggle` (US-020) — in chart card header
- `ChartModeToggle` (US-021) — Consumption/Cost segmented control

## UI Specification

**Chart card header (from ui-analysis §2.1):**
```
<ChartCard
  title="Monthly Overview"
  controls={
    <div className="flex items-center gap-2 flex-wrap">
      <YoYToggle />
      <ChartModeToggle options={["Stacked", "Grouped"]} />
      <ChartModeToggle options={["Consumption", "Cost"]} />
    </div>
  }
  timeSpanSelector={<TimeSpanSelector />}
>
  <div className="h-56 lg:h-64">
    <ResponsiveContainer>
      <BarChart data={chartData}>
        {utilities.map(u => <Bar key={u.id} dataKey={u.name} fill={utilityChartColor(u.color)} stackId={isStacked ? "stack" : undefined} />)}
      </BarChart>
    </ResponsiveContainer>
  </div>
  {/* Legend */}
  <div className="flex flex-wrap gap-3 mt-3">
    {utilities.map(u => (
      <div className="flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-full ${utilityLegendColor(u.color)}`} />
        <span className="text-xs text-base-400">{u.name}</span>
      </div>
    ))}
  </div>
</ChartCard>
```

**Chart colors per utility (from ui-analysis §1.4):**
- amber → `#f59e0b`, blue → `#3b82f6`, orange → `#f97316`, emerald → `#10b981`
- violet → `#8b5cf6`, rose → `#f43f5e`, cyan → `#06b6d4`, slate → `#64748b`

**YoY overlay bars:** Same colors but `opacity: 0.3`

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Monthly Overview chart card: L312-393
  - Header controls: L317-341 (title + YoY toggle + stacked/grouped toggle + consumption/cost toggle)
  - Time span selector: L342-367
  - Chart placeholder with legend: L369-390

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-desktop-dark.png`

## Acceptance Criteria
- [ ] Bar chart renders with one series per utility
- [ ] Consumption mode shows consumption values (utility units)
- [ ] Cost mode shows cost values (DKK)
- [ ] Stacked mode stacks utility bars per month
- [ ] Grouped mode places utility bars side by side
- [ ] YoY toggle overlays prior year data as semi-transparent bars
- [ ] TimeSpanSelector filters chart to selected period (default: YTD)
- [ ] Legend shows utility names with correct color swatches
- [ ] Each utility uses its assigned color for bars
- [ ] Chart is responsive and fits within card
- [ ] Dark mode: chart readable with dark backgrounds
- [ ] Uses shared ChartCard, TimeSpanSelector, YoYToggle, ChartModeToggle
- [ ] PRD §5.3 item 3: Charts area with time span selector and mode toggles
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering chart modes, toggles, and data display

## Testing Requirements
- **Test file**: `src/components/home/HomeOverviewChart.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test consumption mode renders bar chart with utility consumption values
- Test cost mode renders bar chart with DKK cost values
- Test mode toggle switches between Consumption and Cost views
- Test stacked/grouped toggle changes bar chart layout
- Test YoY toggle adds prior year overlay data
- Test TimeSpanSelector filters chart data to selected period
- Test chart legend shows utility names with correct color swatches
- Test each utility uses its assigned color for bars
- Test chart renders responsively within container
- Test loading state renders placeholder
- Test empty data state

## Technical Notes
- File: `src/components/home/HomeOverviewChart.tsx`
- Uses Recharts `<BarChart>` with `<Bar>` components
- Data: monthly consumption from `calculateMonthlyConsumption()` per utility, monthly cost from `amortizeAllBills()` per utility
- Stacked: set `stackId="stack"` on all bars. Grouped: omit stackId.
- YoY overlay: add a second set of bars with prior year data and `opacity={0.3}`
- Chart height: `h-56 lg:h-64`
- The mode toggle state is local to this component
