# US-049: Monthly Earnings Calculation

## Story
As the Insight platform user, I want monthly earnings computed automatically for each platform so that I can see how much each investment earned (or lost) in any given month — independent of my deposits and withdrawals.

## Dependencies
- US-041: Investment TypeScript Types

## Requirements
- Add a `calculateMonthlyEarnings` function to `src/utils/calculations.ts`:

**Formula** (PRD §6.2.4):

```
monthlyEarnings = endingValue - startingValue - netDeposits
```

Where:
- `startingValue` = the month-end boundary value of the **previous** month (e.g. Dec 31 value for January's calculation). This is either an actual data point recorded on that date or an interpolated value (per §6.2.3).
- `endingValue` = the month-end boundary value of the **current** month (e.g. Jan 31 value). Same rules — actual or interpolated.
- `netDeposits` = `Σ deposits - Σ withdrawals` for transactions within the current month.

**Functions:**

- `calculateMonthlyEarnings(startingValue: number, endingValue: number, deposits: number, withdrawals: number): number`:
  - Pure calculation: `endingValue - startingValue - (deposits - withdrawals)`.
  - Returns the earnings amount (positive = gain, negative = loss).

- `computeMonthlyEarningsForPlatform(dataPoints: DataPoint[], transactions: Transaction[], year: number, month: number): number | null`:
  - High-level function that:
    1. Finds the previous month-end boundary value (startingValue).
    2. Finds the current month-end boundary value (endingValue).
    3. Sums deposits and withdrawals within the month.
    4. Returns `calculateMonthlyEarnings(startingValue, endingValue, deposits, withdrawals)`.
  - Returns `null` if either boundary value is missing (insufficient data).

- `computeMonthlyEarningsSeries(dataPoints: DataPoint[], transactions: Transaction[], startDate: Date, endDate: Date): MonthlyEarningsEntry[]`:
  - Computes monthly earnings for each month in the range.
  - Returns an array of `{ year: number; month: number; earnings: number; startingValue: number; endingValue: number; netDeposits: number }`.
  - Skips months where boundary values are unavailable.

**First-class metric** (PRD §6.2.4):
- Monthly earnings is displayed on platform cards in the portfolio overview.
- Monthly earnings appears in monthly analysis views and performance tables.
- Monthly earnings is one of the key metrics in the YoY comparison summary.

**Edge cases:**
- First month of a platform's existence: `startingValue` is 0 (no prior month-end value exists) unless the platform was funded mid-month. If the first data point and first deposit are in the same month, `startingValue = 0`.
- Month with no transactions: `netDeposits = 0`, so `earnings = endingValue - startingValue`.
- Month with no data point change: earnings = `-netDeposits` (change is entirely due to deposits/withdrawals, meaning actual earnings are zero).

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `calculateMonthlyEarnings(10000, 10500, 200, 0)` returns 300 (gained 300 after accounting for 200 deposit)
- [ ] `calculateMonthlyEarnings(10000, 9800, 0, 0)` returns -200 (lost 200, no deposits)
- [ ] `calculateMonthlyEarnings(10000, 10000, 500, 0)` returns -500 (flat value with 500 deposit means -500 earnings)
- [ ] `calculateMonthlyEarnings(10000, 11000, 500, 200)` returns 700 (11000 - 10000 - (500 - 200) = 700)
- [ ] `computeMonthlyEarningsForPlatform` returns null when boundary values are missing
- [ ] `computeMonthlyEarningsSeries` returns an entry for each month with sufficient data
- [ ] First month handling: uses 0 as starting value when no prior month-end exists
- [ ] Correctly identifies and uses month-end boundary values from data points
- [ ] Correctly sums deposits and withdrawals within the month boundaries
- [ ] PRD §14 criterion 19: Monthly earnings are computed and displayed as first-class metric
- [ ] All tests pass and meet 100% coverage of exported functions

## Testing Requirements
- **Test file**: `src/utils/calculations.test.ts` (co-located, shared with other calculation stories)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- Test (10000, 10500, 200, 0) returns 300 (gained 300 after accounting for 200 deposit)
- Test (10000, 9800, 0, 0) returns -200 (lost 200, no deposits)
- Test (10000, 10000, 500, 0) returns -500 (flat value with 500 deposit means -500 earnings)
- Test (10000, 11000, 500, 200) returns 700 (11000 - 10000 - (500 - 200) = 700)
- Test computeMonthlyEarningsForPlatform returns null when boundary values are missing
- Test first month handling: startingValue=0 when no prior month-end exists
- Test edge cases: null returns, empty arrays

## Technical Notes
- File to modify: `src/utils/calculations.ts` — add monthly earnings functions alongside any existing calculation utilities
- The pure `calculateMonthlyEarnings` function is trivially testable with no dependencies
- The higher-level functions depend on data points being sorted by timestamp and transactions being sorted by timestamp
- Month boundaries use the last day of each month (Jan 31, Feb 28/29, Mar 31, etc.) — use a date utility to compute these
- The `MonthlyEarningsEntry` type should be defined in this file or in `src/types/index.ts`
- This function uses boundary values that may be interpolated (from US-051). It does not perform interpolation itself — it expects boundary values to already exist in the data points array
- For the series computation, iterate month by month from startDate to endDate, calling the per-month function for each
