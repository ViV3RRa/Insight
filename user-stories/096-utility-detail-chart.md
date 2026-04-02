# US-096: Utility Detail — Chart with Mode Toggle

## Story
As the Insight platform user, I want a chart on the utility detail page that toggles between Consumption, Cost, and Cost per Unit views so that I can visualize different aspects of my utility usage over time.

## Dependencies
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-021: ChartModeToggle Component
- US-022: ChartCard Component
- US-084: Monthly Consumption Calculation
- US-085: Bill Amortization Calculation
- US-086: Cost Per Unit Calculation

## Requirements
- Single chart card with three-way mode toggle (PRD §5.4):
  - **Consumption**: Bar chart of monthly consumption in utility's unit
  - **Cost**: Bar chart of monthly cost in DKK
  - **Cost per Unit**: Line chart of monthly cost per unit (DKK/unit)
- Embedded TimeSpanSelector (default: YTD)
- YoY overlay toggle (per PRD §3.2):
  - Bar charts: semi-transparent bars for prior year
  - Line chart: dashed ghost line for prior year
- Chart colors: utility's assigned color for current data

## Shared Components Used
- `ChartCard` (US-022) — wrapper
- `TimeSpanSelector` (US-019) — embedded
- `YoYToggle` (US-020) — in header
- `ChartModeToggle` (US-021) — Consumption / Cost / Cost per Unit toggle

## UI Specification

**Chart card header:**
```
<ChartCard
  title="Consumption & Cost"
  controls={
    <div className="flex items-center gap-2 flex-wrap">
      <YoYToggle />
      <ChartModeToggle options={["Consumption", "Cost", "Cost/Unit"]} />
    </div>
  }
  timeSpanSelector={<TimeSpanSelector />}
>
  <div className="h-56 lg:h-64">
    {mode === "costPerUnit" ? (
      <ResponsiveContainer>
        <LineChart data={costPerUnitData}>
          <Line dataKey="costPerUnit" stroke={utilityColor} strokeWidth={2} dot={false} />
          {yoyEnabled && <Line dataKey="costPerUnitPriorYear" stroke={utilityColor} strokeDasharray="5 5" opacity={0.4} />}
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <ResponsiveContainer>
        <BarChart data={barData}>
          {yoyEnabled && <Bar dataKey="priorYear" fill={utilityColor} opacity={0.3} />}
          <Bar dataKey="currentYear" fill={utilityColor} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
</ChartCard>
```

**X-axis:** Month labels ("Jan", "Feb", etc.)
**Y-axis:** Unit depends on mode (kWh, DKK, DKK/kWh)

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Charts section card: L241-298
  - Header with title + YoY button + mode toggle (Consumption/Cost/Cost per Unit): L243-263
  - Time span selector (dropdown for narrow, pills for wider): L264-289
  - Chart placeholder area: L291-297

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-top.png`

## Acceptance Criteria
- [ ] Three-way mode toggle: Consumption, Cost, Cost per Unit
- [ ] Consumption mode shows bar chart with utility's unit
- [ ] Cost mode shows bar chart with DKK values
- [ ] Cost per Unit mode shows line chart
- [ ] TimeSpanSelector filters data (default: YTD)
- [ ] YoY toggle overlays prior year data
- [ ] Bar chart YoY: semi-transparent bars behind current data
- [ ] Line chart YoY: dashed ghost line
- [ ] Chart uses utility's assigned color
- [ ] Responsive — no overflow at any viewport
- [ ] Dark mode: chart readable
- [ ] Uses shared ChartCard, TimeSpanSelector, YoYToggle, ChartModeToggle
- [ ] PRD §5.4: Chart area with consumption/cost/cost-per-unit toggle
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering chart modes, toggles, and data display

## Testing Requirements
- **Test file**: `src/components/home/UtilityDetailChart.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test three-way mode toggle renders: Consumption, Cost, Cost per Unit
- Test consumption mode renders bar chart with utility's unit
- Test cost mode renders bar chart with DKK values
- Test cost per unit mode renders line chart
- Test TimeSpanSelector filters data (default: YTD)
- Test YoY toggle overlays prior year data
- Test chart uses utility's assigned color
- Test responsive layout (no overflow at any viewport)
- Test loading state renders placeholder
- Test empty data state (no readings/bills)

## Technical Notes
- File: `src/components/home/UtilityDetailChart.tsx`
- Uses Recharts `<BarChart>` for consumption/cost modes, `<LineChart>` for cost-per-unit
- Data: consumption from US-084, cost from US-085, cost per unit from US-086
- YoY data: same metrics from prior year, aligned by month
- Chart height: `h-56 lg:h-64`
- The mode toggle state is local to this component
