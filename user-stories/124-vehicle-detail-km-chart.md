# US-124: Vehicle Detail — Monthly km Chart

## Story
As the Insight platform user, I want a monthly km chart on the vehicle detail page so that I can see driving distance patterns over time.

## Dependencies
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-022: ChartCard Component
- US-112: Vehicle Distance Calculations

## Requirements
- Bar or line chart of monthly km driven (PRD §7.5)
- Embedded TimeSpanSelector (vehicles variant)
- YoY toggle

## Shared Components Used
- `ChartCard` (US-022)
- `TimeSpanSelector` (US-019)
- `YoYToggle` (US-020)

## UI Specification

```
<ChartCard title="Monthly Distance" controls={<YoYToggle />} timeSpanSelector={<TimeSpanSelector variant="vehicles" />}>
  <div className="h-56 lg:h-64">
    <ResponsiveContainer>
      <BarChart data={monthlyKmData}>
        {yoyEnabled && <Bar dataKey="priorYear" fill="#3b82f6" opacity={0.3} />}
        <Bar dataKey="km" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</ChartCard>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Monthly km driven chart (right of side-by-side pair): L417–432
- Chart card with title, YoY toggle, bar chart placeholder: L417–431

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Chart shows monthly km driven
- [ ] TimeSpanSelector filters data
- [ ] YoY overlay
- [ ] Responsive
- [ ] PRD §7.5: Monthly km chart
- [ ] All tests pass and meet coverage target
- [ ] Chart renders with mocked distance data

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleKmChart.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test chart renders with monthly km data
- Test TimeSpanSelector filters data correctly
- Test YoY overlay renders when enabled
- Test chart renders without errors when no data available
- Test responsive behavior

## Technical Notes
- File: `src/components/vehicles/VehicleKmChart.tsx`
- Data from `calculateMonthlyKm()` (US-112)
