# US-087: Utility Year-over-Year Comparison Calculations

## Story
As the Insight platform user, I want year-over-year comparisons for my utility metrics so that I can see how consumption and costs are trending relative to the same period last year.

## Dependencies
- US-084: Monthly Consumption Calculation
- US-085: Bill Amortization Calculation
- US-086: Cost Per Unit Calculation
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Add YoY comparison calculation functions to `src/utils/utilityCosts.ts`:

**YoY Comparison Summary metrics** (PRD §3.2, §5.2):

For the Home overview YoY card:
- **YTD Total Cost**: current year YTD vs same YTD period last year, with percentage change
- **Current Month Cost**: current month vs same month last year, with percentage change
- **Avg Monthly Cost**: current year average vs prior year average for the same period, with percentage change

**Annual change percentages** (PRD §5.2, §5.4):
- **Annual consumption change %**: `(thisYear - lastYear) / lastYear × 100` — YoY consumption change
- **Annual cost change %**: `(thisYear - lastYear) / lastYear × 100` — YoY cost change
- Color-coded: red for increase (costs rising is bad), green for decrease

**Per-month YoY** (for utility detail expandable year rows, PRD §5.4):
- Each monthly summary row includes:
  - Consumption change % vs same month prior year
  - Cost change % vs same month prior year

**Functions:**

- `calculateUtilityYoY(currentYearMetrics: UtilityMetrics, priorYearMetrics: UtilityMetrics): UtilityYoYComparison`:
  - Computes all YoY comparison values for a single utility

- `calculateHomeYoY(allUtilityMetrics: UtilityMetrics[]): HomeYoYComparison`:
  - Aggregates YoY across all utilities for the Home overview card:
    - YTD Total Cost (sum across utilities, current vs prior year)
    - Current Month Cost (sum across utilities)
    - Avg Monthly Cost (sum across utilities)

- `calculateYearlySummaries(readings: MeterReading[], bills: UtilityBill[]): UtilityYearlySummary[]`:
  - Produces one summary per calendar year with all metrics from PRD §5.4:
    - Total consumption, avg monthly consumption, consumption change %
    - Total cost, avg monthly cost, avg cost per unit, cost change %

- `calculateMonthlySummaries(readings: MeterReading[], bills: UtilityBill[], year: number): UtilityMonthlySummary[]`:
  - Produces one summary per month within a given year with PRD §5.4 metrics:
    - Consumption, consumption change % vs same month prior year
    - Amortized cost, cost per unit, cost change % vs same month prior year

**Percentage change formula:**
```
changePercent = ((current - previous) / |previous|) × 100
```
Returns `null` when previous period data is not available.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] YTD Total Cost correctly compares current year YTD to same period last year
- [ ] Current Month Cost correctly compares to same month last year
- [ ] Avg Monthly Cost correctly compares current vs prior year averages for same period
- [ ] Percentage change returns null when prior year data is unavailable
- [ ] Annual consumption change % calculated correctly per year
- [ ] Annual cost change % calculated correctly per year
- [ ] Monthly summaries include consumption and cost change % vs same month prior year
- [ ] Yearly summaries include all metrics from PRD §5.4
- [ ] Aggregate home YoY sums across all utilities correctly
- [ ] Change percentages handle zero previous values gracefully (return null, not Infinity)
- [ ] PRD §14 criteria 8-9: Yearly summaries with YoY change percentages
- [ ] All tests pass and meet coverage target
- [ ] All AC items with specific input/output values verified by test cases

## Testing Requirements
- **Test file**: `src/utils/utilityYoY.test.ts` (co-located)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- All AC items with specific input/output values become test cases
- Test YTD Total Cost comparison: current year YTD vs same YTD period last year
- Test Current Month Cost comparison: current month vs same month last year
- Test Avg Monthly Cost comparison: current year average vs prior year average for same period
- Test percentage change returns null when prior year data is unavailable
- Test zero previous value returns null (not Infinity)
- Test annual consumption change % calculated correctly per year
- Test annual cost change % calculated correctly per year
- Test monthly summaries include consumption and cost change % vs same month prior year
- Test yearly summaries include all metrics from PRD SS5.4
- Test `calculateHomeYoY` aggregates across all utilities correctly
- Test edge cases: single year of data, empty metrics, partial year data

## Technical Notes
- File to modify: `src/utils/utilityCosts.ts`
- The YoY summary card on the Home overview page (US-092) consumes `calculateHomeYoY()`
- The utility detail yearly table (US-101) consumes `calculateYearlySummaries()` and `calculateMonthlySummaries()`
- Color coding (red = increase, green = decrease) is applied in the UI layer, not in these calculation functions
- For utilities, cost increase is negative (red) and cost decrease is positive (green) — opposite of investment returns
