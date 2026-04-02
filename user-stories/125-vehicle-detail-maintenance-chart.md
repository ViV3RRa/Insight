# US-125: Vehicle Detail — Maintenance Cost Timeline

## Story
As the Insight platform user, I want a maintenance cost timeline chart so that I can visualize service spending patterns.

## Dependencies
- US-022: ChartCard Component
- US-113: Vehicle Cost Calculations

## Requirements
- Maintenance cost timeline chart (PRD §7.5)
- Bar chart of monthly or yearly maintenance costs
- Each bar represents total maintenance cost for that period

## Shared Components Used
- `ChartCard` (US-022)

## UI Specification

```
<ChartCard title="Maintenance Cost">
  <div className="h-56 lg:h-64">
    <ResponsiveContainer>
      <BarChart data={maintenanceCostData}>
        <Bar dataKey="cost" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</ChartCard>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Maintenance cost chart card: L434–443
- Dot/lollipop chart placeholder showing each event on a timeline: L437–441

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Chart shows maintenance costs over time
- [ ] Bar per month or year
- [ ] Responsive
- [ ] PRD §7.5: Maintenance cost timeline
- [ ] All tests pass and meet coverage target
- [ ] Chart renders with mocked maintenance data

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleMaintenanceChart.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test chart renders with maintenance cost data (monthly or yearly bars)
- Test bar chart displays costs over time
- Test chart renders without errors when no maintenance events exist
- Test responsive behavior

## Technical Notes
- File: `src/components/vehicles/VehicleMaintenanceChart.tsx`
- Data from `calculateMonthlyMaintenanceCost()` (US-113)
- Consider using amber/yellow bars to distinguish from fuel cost bars
