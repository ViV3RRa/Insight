# US-120: Vehicle Detail — Stat Cards

## Story
As the Insight platform user, I want summary stat cards on the vehicle detail page showing key metrics so that I can see efficiency, costs, and distance at a glance.

## Dependencies
- US-014: StatCard Component
- US-111: Fuel Efficiency Calculation
- US-112: Vehicle Distance Calculations
- US-113: Vehicle Cost Calculations

## Requirements
- 7 stat cards for active vehicles (PRD §7.5):
  1. **All-Time Efficiency**: weighted average (km/l or km/kWh)
  2. **Year Efficiency**: current year weighted average
  3. **Last 5 Efficiency**: rolling 5-refueling weighted average
  4. **YTD km**: km driven this year
  5. **YTD Fuel Cost**: year-to-date fuel cost (DKK)
  6. **Avg Fuel/Month**: average fuel cost per month (DKK)
  7. **Avg Fuel/Day**: average fuel cost per day (DKK)
- For sold vehicles: replace some cards with Total Cost of Ownership and purchase-to-sale offset
- Grid: `grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4 mb-6 lg:mb-8`

## Shared Components Used
- `StatCard` (US-014) — for each metric card

## UI Specification

**Stat cards grid:**
```
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4 mb-6 lg:mb-8">
  <StatCard label="All-Time" value={allTimeEfficiency} suffix={efficiencyUnit} />
  <StatCard label="This Year" value={yearEfficiency} suffix={efficiencyUnit} />
  <StatCard label="Last 5" value={rolling5Efficiency} suffix={efficiencyUnit} />
  <StatCard label="YTD km" value={ytdKm} suffix="km" />
  <StatCard label="YTD Fuel" value={ytdFuelCost} suffix="DKK" />
  <StatCard label="Avg/Month" value={avgFuelPerMonth} suffix="DKK" />
  <StatCard label="Avg/Day" value={avgFuelPerDay} suffix="DKK" />
</div>
```

**Sold vehicle variation:**
Replace last 2 cards with:
- Total Cost of Ownership (fuel + maintenance lifetime)
- Purchase → Sale offset

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Summary stat cards grid (7 KPIs): L261–298
- Cards: All-Time Eff., 2026 Efficiency (with change badge), Last 5 Fills, YTD Km, YTD Fuel Cost, Avg/Month, Avg/Day

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] 7 stat cards for active vehicles with correct metrics
- [ ] Efficiency unit matches fuel type (km/l or km/kWh)
- [ ] All-time, year, and rolling-5 efficiency use weighted average
- [ ] YTD km, fuel cost, avg/month, avg/day displayed correctly
- [ ] Sold vehicles show total cost of ownership
- [ ] Grid: 2 cols mobile, 4 sm, 7 lg
- [ ] Values show "N/A" when insufficient data
- [ ] Uses shared StatCard
- [ ] PRD §7.5: Summary stat cards match spec
- [ ] All tests pass and meet coverage target
- [ ] Component renders correct number of stat cards for active vs sold vehicles

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleStatCards.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test 7 stat cards rendered for active vehicles
- Test efficiency unit matches fuel type (km/l for Petrol/Diesel, km/kWh for Electric)
- Test all-time, year, and rolling-5 efficiency values displayed
- Test YTD km, fuel cost, avg/month, avg/day values rendered
- Test sold vehicles show total cost of ownership card
- Test "N/A" shown when insufficient data for a metric
- Test responsive grid: 2 cols mobile, 4 sm, 7 lg

## Technical Notes
- Part of `src/components/vehicles/VehicleDetail.tsx`
- Data from `calculateVehicleMetrics()` (US-113)
- Efficiency unit: `vehicle.fuelType === 'Electric' ? 'km/kWh' : 'km/l'`
