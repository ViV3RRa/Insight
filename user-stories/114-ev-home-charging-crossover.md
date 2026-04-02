# US-114: EV Home-Charging Crossover Logic

## Story
As the Insight platform user, I want home-charging kWh from my electric vehicle tracked and optionally excluded from my electricity utility consumption so that I can get an accurate picture of household electricity usage when vehicle charging is reimbursed.

## Dependencies
- US-107: Vehicle TypeScript Types
- US-084: Monthly Consumption Calculation
- US-109: Refueling CRUD Service

## Requirements
- When a refueling record for an electric vehicle has `chargedAtHome = true` (PRD §7.3):
  - The kWh consumed is flagged as vehicle-related electricity consumption
  - On the **electricity utility detail page**, a toggle allows excluding home-charging kWh from consumption
  - Total home-charging kWh displayed as supplementary metric on electricity utility page

**Functions in `src/utils/evCrossover.ts`:**

- `getHomeChargingKwh(refuelings: Refueling[], startDate?: Date, endDate?: Date): number`:
  - Sum of `fuelAmount` for refuelings where `chargedAtHome === true` within the period
  - Only applicable to electric vehicles

- `getMonthlyHomeChargingKwh(refuelings: Refueling[]): { month: string; year: number; kwh: number }[]`:
  - Monthly breakdown of home-charging kWh for display/subtraction

- `adjustConsumptionForEvCharging(monthlyConsumption: MonthlyConsumption[], homeChargingKwh: { month: string; year: number; kwh: number }[]): MonthlyConsumption[]`:
  - Subtracts home-charging kWh from the electricity utility's monthly consumption
  - Returns adjusted consumption array
  - Only applied when the user enables the toggle

**Business rules:**
- The toggle only appears on the electricity utility detail page
- The toggle state is stored in component state (or user settings extension)
- When toggle is OFF: consumption shown as-is (includes home charging)
- When toggle is ON: home-charging kWh subtracted from consumption view
- Total home-charging kWh shown as a supplementary info metric regardless of toggle state

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story (UI integration in US-153)

## Acceptance Criteria
- [ ] Home-charging kWh correctly summed from EV refuelings with chargedAtHome=true
- [ ] Monthly home-charging breakdown computed correctly
- [ ] Adjusted consumption correctly subtracts home-charging from utility consumption
- [ ] Adjusted consumption never goes negative (floor at 0)
- [ ] Returns unchanged consumption when no EV charging data exists
- [ ] Only applies to electric vehicle refuelings
- [ ] PRD §14 criterion 49: EV home-charging kWh can be excluded from electricity utility
- [ ] All tests pass and meet coverage target
- [ ] Each AC input/output example is a dedicated test case

## Testing Requirements
- **Test file**: `src/utils/evCrossover.test.ts` (co-located)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- All AC items with specific input -> output values become test cases
- Test `getHomeChargingKwh` sums only refuelings where `chargedAtHome === true`
- Test `getMonthlyHomeChargingKwh` produces correct monthly breakdown
- Test `adjustConsumptionForEvCharging` subtracts home-charging kWh from utility consumption correctly
- Test adjusted consumption never goes negative (floor at 0)
- Test returns unchanged consumption when no EV charging data exists
- Test ignores refuelings where `chargedAtHome === false`
- Test with date range filtering (startDate/endDate)

## Technical Notes
- File: `src/utils/evCrossover.ts`
- This requires cross-referencing vehicle data (refuelings) with utility data (electricity consumption)
- The toggle UI is implemented in the electricity utility detail page (US-153)
- Need to identify which utility is "electricity" — match by icon="bolt" or name convention
- The crossover is purely a display-layer subtraction; it doesn't modify actual reading/consumption data
