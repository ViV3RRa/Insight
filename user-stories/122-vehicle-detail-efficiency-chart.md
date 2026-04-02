# US-122: Vehicle Detail — Fuel Efficiency Chart

## Story
As the Insight platform user, I want a fuel efficiency chart on the vehicle detail page showing per-refueling efficiency over time so that I can visualize trends.

## Dependencies
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-022: ChartCard Component
- US-111: Fuel Efficiency Calculation

## Requirements
- Line chart of fuel efficiency over time (PRD §7.5)
- Each data point represents one refueling's efficiency (km driven since last refueling / fuel consumed)
- Y-axis: efficiency in km/l or km/kWh
- X-axis: dates
- Embedded TimeSpanSelector
- YoY toggle: dashed ghost line for prior year
- Vehicles variant of TimeSpanSelector: 3M, 6M, YTD, 1Y, 2Y, All

## Shared Components Used
- `ChartCard` (US-022) — wrapper
- `TimeSpanSelector` (US-019) — vehicles variant: 3M, 6M, YTD, 1Y, 2Y, All
- `YoYToggle` (US-020)

## UI Specification

```
<ChartCard
  title="Fuel Efficiency"
  controls={<YoYToggle />}
  timeSpanSelector={<TimeSpanSelector variant="vehicles" />}
>
  <div className="h-56 lg:h-64">
    <ResponsiveContainer>
      <LineChart data={efficiencyData}>
        <Line dataKey="efficiency" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        {yoyEnabled && <Line dataKey="priorYear" stroke="#3b82f6" strokeDasharray="5 5" opacity={0.4} />}
      </LineChart>
    </ResponsiveContainer>
  </div>
</ChartCard>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Charts collapsible accordion: L346–446
- Fuel efficiency chart card with title, YoY toggle, time span selector, chart placeholder, legend: L360–398
- Time span selector (3M, 6M, YTD, 1Y, 2Y, All) with mobile dropdown fallback: L370–383

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Line chart shows per-refueling efficiency over time
- [ ] Y-axis label matches fuel type unit
- [ ] TimeSpanSelector with vehicles variant (3M, 6M, YTD, 1Y, 2Y, All)
- [ ] YoY toggle overlays prior year as dashed line
- [ ] Responsive, no overflow
- [ ] PRD §7.5: Fuel efficiency over time chart
- [ ] All tests pass and meet coverage target
- [ ] Chart renders with mocked refueling data

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleEfficiencyChart.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test chart renders with per-refueling efficiency data points
- Test Y-axis label matches fuel type unit (km/l or km/kWh)
- Test TimeSpanSelector renders with vehicles variant (3M, 6M, YTD, 1Y, 2Y, All)
- Test YoY toggle overlays prior year as dashed line when enabled
- Test chart renders without errors when no data available
- Test responsive behavior (no overflow)

## Technical Notes
- File: `src/components/vehicles/VehicleEfficiencyChart.tsx`
- Data from `calculatePerRefuelingEfficiency()` (US-111)
- Each point is one refueling — not monthly aggregation
