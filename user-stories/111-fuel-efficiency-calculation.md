# US-111: Fuel Efficiency Calculation (Weighted Average)

## Story
As the Insight platform user, I want fuel efficiency calculated as a weighted average so that the metric accurately reflects real-world driving performance.

## Dependencies
- US-107: Vehicle TypeScript Types

## Requirements
- Create fuel efficiency calculation functions in `src/utils/fuelEfficiency.ts`:

**CRITICAL: Always weighted average, NEVER arithmetic mean** (PRD §7.2):

```
weightedEfficiency = totalKmDriven / totalFuelConsumed
```

The weighted average weights each stint's efficiency by fuel consumed, which is mathematically equivalent to `total km ÷ total fuel`.

**Unit depends on fuelType** (PRD §7.2):
- Petrol/Diesel → km/l
- Electric → km/kWh

**Distance calculation from odometer readings:**
For each consecutive pair of refuelings (sorted by date):
```
distanceDriven = refueling[i].odometerReading - refueling[i-1].odometerReading
fuelConsumed = refueling[i].fuelAmount
```
The first refueling establishes a baseline — no efficiency can be calculated for it alone.

**Functions:**

- `calculateWeightedEfficiency(refuelings: Refueling[]): number | null`:
  - Input: refuelings sorted by date ascending
  - Output: all-time weighted average efficiency (km/l or km/kWh)
  - Returns null if fewer than 2 refuelings
  - Formula: `Σ(distance_i) / Σ(fuel_i)` for all consecutive pairs

- `calculateYearEfficiency(refuelings: Refueling[], year: number): number | null`:
  - Weighted average for refuelings within the given year
  - Needs at least one prior refueling (possibly from previous year) to establish baseline odometer

- `calculateRolling5Efficiency(refuelings: Refueling[]): number | null`:
  - Weighted average of the last 5 refueling intervals
  - Input: last 6 refuelings sorted by date (5 intervals = 6 data points)
  - Returns null if fewer than 6 refuelings

- `calculatePerRefuelingEfficiency(refuelings: Refueling[]): { date: string; efficiency: number; fuelAmount: number }[]`:
  - Per-refueling efficiency for charting
  - Each entry: `km driven since last refueling / fuel consumed at this refueling`

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] All-time efficiency: `total km / total fuel` across all refuelings
- [ ] NOT arithmetic mean of per-refueling ratios (explicit check)
- [ ] Example: 3 refuelings, distances 300/200/500 km, fuel 30/25/45 liters → 1000/100 = 10.0 km/l
- [ ] Arithmetic mean would give (10+8+11.1)/3 = 9.7 km/l — this is WRONG, test must reject this
- [ ] Year efficiency scoped to refuelings in given year (with baseline from prior)
- [ ] Rolling 5 uses last 5 intervals (6 refueling data points)
- [ ] Returns null for < 2 refuelings (all-time), < 6 (rolling 5)
- [ ] Per-refueling efficiency array for charting
- [ ] Handles edge case of negative distance (odometer rollover/correction) gracefully
- [ ] Pure functions, no external dependencies
- [ ] PRD §14 criterion 33: Fuel efficiency uses weighted average, not arithmetic mean
- [ ] PRD §14 criterion 34: Rolling 5-refueling weighted average calculated correctly

## Technical Notes
- File: `src/utils/fuelEfficiency.ts`
- Distance is derived from odometer deltas, not stored directly
- The first refueling cannot produce efficiency (no prior odometer to compare)
- For yearly calculations, the baseline is the last refueling before the year starts
- Per-refueling efficiency is used for line charts (US-128)
- Edge case: if `distance <= 0` between two consecutive readings, flag as anomaly but don't crash
