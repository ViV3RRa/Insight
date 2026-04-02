# US-086: Cost Per Unit Calculation

## Story
As the Insight platform user, I want cost per unit (e.g. DKK/kWh) calculated automatically so that I can see the effective unit price for each utility over time.

## Dependencies
- US-084: Monthly Consumption Calculation
- US-085: Bill Amortization Calculation
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Add cost-per-unit calculation functions to `src/utils/consumption.ts` or a new `src/utils/utilityCosts.ts`:

**Formula** (PRD §5.2):
```
costPerUnit = amortizedMonthlyCost / monthlyConsumption
```

**Functions:**

- `calculateMonthlyCostPerUnit(monthlyConsumption: MonthlyConsumption[], monthlyCosts: MonthlyCost[]): { month: string; year: number; costPerUnit: number | null }[]`:
  - Joins monthly consumption data with monthly amortized cost data
  - For each month: `costPerUnit = cost / consumption`
  - Returns `null` for months where consumption is zero or missing (division by zero)

- `calculateAverageCostPerUnit(monthlyConsumption: MonthlyConsumption[], monthlyCosts: MonthlyCost[], startDate?: Date, endDate?: Date): number | null`:
  - Weighted average cost per unit for a period: `totalCost / totalConsumption`
  - Returns null if total consumption is zero

- `calculateUtilityMetrics(readings: MeterReading[], bills: UtilityBill[]): UtilityMetrics`:
  - High-level function that computes all utility metrics:
    - Monthly consumption (from readings)
    - Monthly cost (from amortized bills)
    - Monthly cost per unit
    - YTD consumption and cost
    - Average monthly cost
    - Cost trend (rolling average direction vs prior equivalent period)
    - Annual consumption and cost change percentages

**UtilityMetrics type:**
```typescript
type UtilityMetrics = {
  monthlyConsumption: MonthlyConsumption[]
  monthlyCost: MonthlyCost[]
  monthlyCostPerUnit: { month: string; year: number; costPerUnit: number | null }[]
  ytdConsumption: number
  ytdCost: number
  currentMonthConsumption: number | null
  currentMonthCost: number | null
  currentMonthCostPerUnit: number | null
  avgMonthlyCost: number | null
  costTrend: 'up' | 'down' | 'flat' | null
}
```

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Cost per unit correctly divides amortized monthly cost by monthly consumption
- [ ] Returns null when consumption is zero (no division by zero)
- [ ] Returns null when cost data is missing for a month
- [ ] Average cost per unit uses weighted average (total cost / total consumption)
- [ ] YTD consumption sums correctly from January of current year to current month
- [ ] YTD cost sums correctly from January of current year to current month
- [ ] Current month metrics pull from the latest available month
- [ ] Cost trend compares rolling average to prior equivalent period
- [ ] `calculateUtilityMetrics` produces all required metric fields
- [ ] PRD §14 criterion 6: Cost per unit is calculated and displayed
- [ ] All tests pass and meet coverage target
- [ ] All AC items with specific input/output values verified by test cases

## Testing Requirements
- **Test file**: `src/utils/utilityCosts.test.ts` (co-located)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- All AC items with specific input/output values become test cases
- Test cost per unit correctly divides amortized monthly cost by monthly consumption
- Test zero consumption returns null (no division by zero)
- Test missing cost data for a month returns null
- Test weighted average cost per unit: `totalCost / totalConsumption`
- Test YTD consumption and cost sum correctly from January of current year
- Test `calculateUtilityMetrics` produces all required fields (monthlyConsumption, monthlyCost, monthlyCostPerUnit, ytdConsumption, ytdCost, currentMonthConsumption, currentMonthCost, currentMonthCostPerUnit, avgMonthlyCost, costTrend)
- Test cost trend logic: >5% higher = up, >5% lower = down, otherwise flat
- Test edge cases: no data for current month, single month of data, null returns

## Technical Notes
- File to create: `src/utils/utilityCosts.ts` (or extend `src/utils/consumption.ts`)
- Depends on output from `calculateMonthlyConsumption()` (US-084) and `amortizeAllBills()` (US-085)
- The join between consumption and cost data is by month key (e.g. "2026-01")
- Cost trend: compare average of last 3 months vs average of same 3 months last year. Up if >5% higher, down if >5% lower, flat otherwise.
- This is the main "computed metrics" module that the Home UI pages consume
