# US-052: Monthly XIRR Calculation

## Story
As the Insight platform user, I want XIRR calculated for each individual month so that I can see the annualized return for that specific month alongside monthly earnings as a first-class metric.

## Dependencies
- US-048: XIRR Calculation (Newton-Raphson Solver)
- US-051: Month-End Normalization / Interpolation Engine

## Requirements
- Add a `calculateMonthlyXIRR` function to `src/utils/calculations.ts`:

**Concept** (PRD §6.2.5):
Monthly XIRR is the XIRR calculated for a single month in isolation. It shows the annualized return for that specific month, answering the question: "If the entire year performed like this month, what would the annual return be?"

**Cash flow construction for a single month:**

1. **Starting value**: Previous month-end boundary value (e.g. Dec 31 value for January). This is a **negative** cash flow at the start of the month (capital deployed).
2. **Transactions within the month**: Deposits are **negative** cash flows; withdrawals are **positive** cash flows, at their actual dates.
3. **Ending value**: Current month-end boundary value (e.g. Jan 31). This is a **positive** cash flow at the end of the month (current value).

These cash flows are passed to the XIRR solver from US-048.

**Functions:**

- `computeMonthlyXIRR(startingValue: number, startDate: Date, endingValue: number, endDate: Date, transactions: Transaction[]): number | null`:
  - Builds cash flows for a single month and runs the XIRR solver.
  - `startingValue` and `startDate`: previous month-end boundary value and date.
  - `endingValue` and `endDate`: current month-end boundary value and date.
  - `transactions`: deposits and withdrawals within the month.
  - Returns the annualized rate as a decimal (e.g. 0.12 for 12%), or `null` if XIRR cannot be computed.

- `computeMonthlyXIRRForPlatform(dataPoints: DataPoint[], transactions: Transaction[], year: number, month: number): number | null`:
  - High-level function that:
    1. Finds the previous month-end boundary value.
    2. Finds the current month-end boundary value.
    3. Filters transactions to those within the month.
    4. Delegates to `computeMonthlyXIRR`.
  - Returns `null` if boundary values are missing.

- `computeMonthlyXIRRSeries(dataPoints: DataPoint[], transactions: Transaction[], startDate: Date, endDate: Date): MonthlyXIRREntry[]`:
  - Computes monthly XIRR for each month in the range.
  - Returns an array of `{ year: number; month: number; xirr: number | null }`.

**First-class metric** (PRD §6.2.5):
- Monthly XIRR appears alongside monthly earnings in platform performance tables.
- Monthly columns in the performance analysis table include: Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR (PRD §6.4 item 2).
- Monthly XIRR is displayed in bar charts with toggle between Earnings and XIRR %.

**Edge cases:**
- Month with zero starting value and zero ending value: return `null`.
- Month with no transactions but value change: XIRR is computed from just start and end values (2 cash flows).
- Very short months or partial first/last months: the XIRR solver handles arbitrary time spans via the day-fraction formula.
- Months where XIRR does not converge (e.g. extreme volatility): return `null`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Monthly XIRR is calculated for a single month using month-end boundary values
- [ ] Starting value is used as negative cash flow, ending value as positive cash flow
- [ ] Deposits within the month are negative cash flows, withdrawals are positive
- [ ] The result is an annualized rate (not a monthly rate)
- [ ] Returns `null` when boundary values are missing
- [ ] Returns `null` when XIRR solver does not converge
- [ ] `computeMonthlyXIRRSeries` returns an entry for each month in the range
- [ ] Monthly XIRR uses the same XIRR solver as the general XIRR calculation (US-048)
- [ ] Month with no transactions: XIRR is computed from just start/end values
- [ ] Returns `null` (or 0%) when `startingValue === endingValue` and no transactions occurred in the month
- [ ] PRD §14 criterion 19: Monthly XIRR is computed and displayed as first-class metric
- [ ] All tests pass and meet 100% coverage of exported functions

## Testing Requirements
- **Test file**: `src/utils/calculations.test.ts` (co-located, shared with other calculation stories)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- Test single month XIRR computation with known start/end values and transactions
- Test month with no transactions uses only start and end values (2 cash flows)
- Test startingValue === endingValue with no transactions returns null
- Test non-convergence returns null
- Test computeMonthlyXIRRSeries returns an entry for each month in range
- Test boundary values: missing start or end value returns null
- Test edge cases: null returns, empty transaction arrays

## Technical Notes
- File to modify: `src/utils/calculations.ts` — add monthly XIRR functions
- This module reuses `buildCashFlows` and `calculateXIRR` from `src/utils/xirr.ts`
- The month boundary dates come from the interpolation engine (US-051): `getMonthEndDate(year, month)`
- For a single month, the XIRR calculation typically has 2-5 cash flows (start value, 0-3 transactions, end value). The solver should converge quickly.
- Monthly XIRR for a month where the value increased by X% will be approximately `(1+X%)^12 - 1` annualized, but the exact value depends on transaction timing within the month
- The `MonthlyXIRREntry` type should be: `{ year: number; month: number; xirr: number | null }`
- For the platform detail performance analysis table (PRD §6.4), the monthly tab displays: Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR — this function provides the XIRR column
