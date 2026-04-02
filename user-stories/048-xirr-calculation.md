# US-048: XIRR Calculation (Newton-Raphson Solver)

## Story
As the Insight platform user, I want XIRR (Extended Internal Rate of Return) calculated automatically from my data points and transactions so that I can see the true annualized return on each investment platform.

## Dependencies
- US-041: Investment TypeScript Types

## Requirements
- Create `src/utils/xirr.ts` with the following:

**XIRR formula** (PRD §6.2.1):

XIRR solves for `r` in the equation:

```
Σ(CFi / (1 + r)^((di - d0) / 365)) = 0
```

Where:
- `CFi` = cash flow i (positive = money returned, negative = money invested)
- `di` = date of cash flow i
- `d0` = date of the first cash flow
- `r` = the annualized rate of return (the value we solve for)

**Newton-Raphson iteration:**

```
r_new = r - f(r) / f'(r)
```

Where:
- `f(r) = Σ(CFi / (1 + r)^((di - d0) / 365))` — the function to zero
- `f'(r) = Σ(-CFi * ((di - d0) / 365) / (1 + r)^((di - d0) / 365 + 1))` — the derivative

**Cash flow construction** for a time window `[start, end]` (PRD §6.2.1):

1. **Starting value**: The data point value at or nearest before `start` date. This represents capital already deployed. Entered as a **negative** cash flow at the `start` date.
2. **Deposits** within the `[start, end]` window: Each deposit is a **negative** cash flow (money leaving the investor's pocket and going into the platform) at its transaction date.
3. **Withdrawals** within the `[start, end]` window: Each withdrawal is a **positive** cash flow (money returning to the investor) at its transaction date.
4. **Ending value**: The data point value at or nearest before `end` date. Entered as a **positive** cash flow at its timestamp (representing the current/final value of the investment).

**Core functions:**

- `calculateXIRR(cashFlows: CashFlow[]): number | null`:
  - Input: Array of `{ amount: number; date: Date }` where amount sign follows the convention above.
  - Solves the XIRR equation using Newton-Raphson iteration.
  - Returns the annualized rate as a decimal (e.g. 0.12 for 12%).
  - Returns `null` for fewer than 2 cash flows.
  - Returns `null` if Newton-Raphson does not converge within maximum iterations.
  - Initial guess: `0.1` (10%).

- `buildCashFlows(startValue: number, startDate: Date, endValue: number, endDate: Date, transactions: Transaction[]): CashFlow[]`:
  - Constructs the cash flow array from platform data.
  - `startValue` becomes a negative cash flow at `startDate`.
  - Each deposit becomes a negative cash flow; each withdrawal becomes a positive cash flow.
  - `endValue` becomes a positive cash flow at `endDate`.
  - Filters out zero-amount cash flows.

- `computePlatformXIRR(dataPoints: DataPoint[], transactions: Transaction[], start: Date, end: Date): number | null`:
  - High-level function that finds the appropriate starting and ending data points, builds cash flows, and runs the XIRR solver.
  - Uses native currency values (no conversion).

**Newton-Raphson implementation details:**
- Maximum iterations: 100
- Convergence tolerance: 1e-7 (when |f(r)| < tolerance, consider it converged)
- Initial guess: 0.1
- Guard against `(1 + r)` becoming zero or negative during iteration — if `r <= -1`, reset to a smaller step
- If the derivative `f'(r)` is zero, break and return `null` (cannot continue iteration)

**Edge case handling:**
- Fewer than 2 cash flows: return `null`
- All cash flows on the same date: return `null`
- All cash flows have the same sign: return `null` (need both inflows and outflows)
- Starting value is zero and there are no deposits: return `null`
- Non-convergence after max iterations: return `null`
- Very short time periods (< 1 day): return `null`
- Very large or very small rates during iteration: clamp `r` to [-0.999, 1e10] to prevent overflow

**Type definitions:**
- `CashFlow = { amount: number; date: Date }`
- Export both the low-level `calculateXIRR` and the high-level `computePlatformXIRR`

**Currency note** (PRD §6.2.1):
- Per-platform XIRR: calculated in the platform's **native currency**. All data points and transactions are already in native currency.
- Portfolio-level XIRR: uses DKK-converted values. This is handled by the portfolio aggregation module (US-053), not this module.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `calculateXIRR` correctly solves the XIRR equation using Newton-Raphson
- [ ] Known test case: invest 10,000 on Jan 1, receive 11,000 on Dec 31 = ~10% XIRR
- [ ] Known test case: invest 10,000 on Jan 1, deposit 5,000 on Jul 1, end value 16,000 on Dec 31 — XIRR matches Excel/Google Sheets XIRR function
- [ ] `buildCashFlows` correctly constructs cash flows: starting value negative, deposits negative, withdrawals positive, ending value positive
- [ ] Returns `null` for fewer than 2 cash flows
- [ ] Returns `null` when Newton-Raphson does not converge
- [ ] Returns `null` when all cash flows are on the same date
- [ ] Returns `null` when all cash flows have the same sign
- [ ] Handles edge case of zero starting value with deposits correctly
- [ ] Convergence tolerance is 1e-7 or better
- [ ] Maximum 100 iterations before returning null
- [ ] Does not throw exceptions — always returns number or null
- [ ] Results match Excel/Google Sheets XIRR within 0.01% for standard test cases
- [ ] PRD §14 criterion 17: XIRR correctly incorporates data points and transactions as cash flows

## Technical Notes
- File to create: `src/utils/xirr.ts`
- The Newton-Raphson solver is a pure function with no external dependencies — easy to unit test
- Test against known XIRR values from Excel/Google Sheets for validation
- The `date` math uses `(date - firstDate) / (365 * 86400000)` for day fractions (converting milliseconds to days)
- For numerical stability, consider using the Brent method as a fallback if Newton-Raphson fails, though this adds complexity and may not be needed for typical investment data
- The XIRR function operates on `Date` objects internally but the high-level wrapper accepts ISO string dates from the data model
- Performance: XIRR calculations may be called many times (per platform, per time window). The Newton-Raphson solver itself is fast (< 100 iterations), but building cash flows from large transaction sets should be efficient
- Export the `CashFlow` type for use by other calculation modules (monthly XIRR, portfolio aggregation)
