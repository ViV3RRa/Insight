# US-123: Vehicle Detail — Monthly Fuel Cost Chart

## Story
As the Insight platform user, I want a monthly fuel cost bar chart on the vehicle detail page so that I can see how fuel spending varies over time.

## Dependencies
- US-019: TimeSpanSelector Component
- US-020: YoYToggle Component
- US-022: ChartCard Component
- US-113: Vehicle Cost Calculations

## Requirements
- Bar chart of monthly fuel cost (PRD §7.5)
- Green bars for fuel costs, YoY overlay as semi-transparent bars
- Embedded TimeSpanSelector (vehicles variant)
- YoY toggle

## Shared Components Used
- `ChartCard` (US-022)
- `TimeSpanSelector` (US-019)
- `YoYToggle` (US-020)

## UI Specification

```
<ChartCard title="Monthly Fuel Cost" controls={<YoYToggle />} timeSpanSelector={<TimeSpanSelector variant="vehicles" />}>
  <div className="h-56 lg:h-64">
    <ResponsiveContainer>
      <BarChart data={monthlyFuelCostData}>
        {yoyEnabled && <Bar dataKey="priorYear" fill="#22c55e" opacity={0.3} />}
        <Bar dataKey="cost" fill="#22c55e" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</ChartCard>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Monthly fuel cost chart (left of side-by-side pair): L401–416
- Chart card with title, YoY toggle, bar chart placeholder: L402–416

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Bar chart shows monthly fuel cost
- [ ] Values in DKK
- [ ] TimeSpanSelector filters data
- [ ] YoY overlay shows prior year as semi-transparent bars
- [ ] Responsive
- [ ] PRD §7.5: Monthly fuel cost chart

## Technical Notes
- File: `src/components/vehicles/VehicleFuelCostChart.tsx`
- Data from `calculateMonthlyFuelCost()` (US-113)
