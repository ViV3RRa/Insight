# US-113: Vehicle Cost Calculations

## Story
As the Insight platform user, I want fuel costs, maintenance costs, and total cost of ownership calculated automatically so that I can understand the true cost of operating each vehicle.

## Dependencies
- US-107: Vehicle TypeScript Types
- US-111: Fuel Efficiency Calculation
- US-112: Vehicle Distance Calculations

## Requirements
- Add cost calculation functions to `src/utils/vehicleMetrics.ts`:

**Fuel cost metrics** (PRD §7.2):
- `calculateFuelCost(refuelings: Refueling[], startDate?: Date, endDate?: Date): number`:
  - Sum of `totalCost` for refuelings within the period
- `calculateAvgFuelCostPerMonth(refuelings: Refueling[]): number | null`:
  - Total fuel cost / number of months between first and last refueling
- `calculateAvgFuelCostPerDay(refuelings: Refueling[]): number | null`:
  - Total fuel cost / number of days between first and last refueling
- `calculateAvgCostPerUnit(refuelings: Refueling[]): number | null`:
  - Weighted average: total cost / total fuel consumed (DKK/liter or DKK/kWh)
- `calculateMonthlyFuelCost(refuelings: Refueling[]): { month: string; year: number; cost: number }[]`:
  - Monthly fuel cost breakdown for bar charts

**Maintenance cost metrics** (PRD §7.2):
- `calculateMaintenanceCost(events: MaintenanceEvent[], startDate?: Date, endDate?: Date): number`:
  - Sum of `cost` for events within the period
- `calculateYearlyMaintenanceCost(events: MaintenanceEvent[]): { year: number; cost: number }[]`:
  - Per-year breakdown of maintenance costs
- `calculateMonthlyMaintenanceCost(events: MaintenanceEvent[]): { month: string; year: number; cost: number }[]`:
  - Monthly maintenance cost for charts

**Combined metrics:**
- `calculateTotalVehicleCost(refuelings: Refueling[], events: MaintenanceEvent[], startDate?: Date, endDate?: Date): number`:
  - Fuel + maintenance combined for a period

**Total cost of ownership** (PRD §7.2, especially for sold vehicles):
- `calculateTotalCostOfOwnership(vehicle: Vehicle, refuelings: Refueling[], events: MaintenanceEvent[]): TotalCostOfOwnership | null`:
  - `lifetimeFuelCost`: all fuel costs
  - `lifetimeMaintenanceCost`: all maintenance costs
  - `totalOperatingCost`: fuel + maintenance
  - `purchaseToSaleOffset`: `(salePrice || 0) - (purchasePrice || 0)` (secondary info)
  - Returns null if vehicle has no refueling or maintenance data

**Aggregate vehicle metrics:**
- `calculateVehicleMetrics(vehicle: Vehicle, refuelings: Refueling[], events: MaintenanceEvent[]): VehicleMetrics`:
  - Combines all calculations into a single metrics object

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Fuel cost summed correctly for a given period
- [ ] Average fuel cost per month calculated correctly
- [ ] Average fuel cost per day calculated correctly
- [ ] Average cost per unit is weighted (total cost / total fuel)
- [ ] Monthly fuel cost breakdown for charting
- [ ] Maintenance cost summed correctly for a given period
- [ ] Yearly maintenance cost breakdown
- [ ] Total vehicle cost = fuel + maintenance
- [ ] Total cost of ownership includes lifetime fuel + maintenance
- [ ] Purchase-to-sale offset calculated for sold vehicles
- [ ] `calculateVehicleMetrics` produces all required fields
- [ ] Handles vehicles with no refuelings or no maintenance gracefully
- [ ] PRD §14 criterion 37: Total cost of ownership calculated for sold vehicles

## Technical Notes
- File: `src/utils/vehicleMetrics.ts` (extending US-112)
- Cost per unit: `Σ(totalCost) / Σ(fuelAmount)` — weighted, not arithmetic mean
- Monthly cost: assign each refueling's totalCost to its date's month
- For sold vehicles, the period spans from earliest data to sale date
- `VehicleMetrics` type defined in US-107
