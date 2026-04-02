# US-050: Gain/Loss Calculation

## Story
As the Insight platform user, I want gain/loss calculated for any time window so that I can see the absolute and percentage return on my investments, accounting for deposits and withdrawals.

## Dependencies
- US-041: Investment TypeScript Types

## Requirements
- Add gain/loss functions to `src/utils/calculations.ts`:

**Formulas** (PRD §6.2.2):

```
gain = endingValue - startingValue - netDeposits
netDeposits = Σ deposits - Σ withdrawals  (within window)
gainPercent = gain / (startingValue + Σ deposits) × 100
```

Where:
- `endingValue` = platform value at the end of the window
- `startingValue` = platform value at the start of the window
- `netDeposits` = sum of deposits minus sum of withdrawals within the window
- `gainPercent` denominator is the total **capital at risk**: starting value plus total deposits (not net deposits). This represents the maximum capital the user had exposed.

**Functions:**

- `calculateGain(startingValue: number, endingValue: number, deposits: number, withdrawals: number): number`:
  - Pure calculation: `endingValue - startingValue - (deposits - withdrawals)`.
  - Returns absolute gain (positive) or loss (negative).

- `calculateGainPercent(startingValue: number, endingValue: number, deposits: number, withdrawals: number): number | null`:
  - Computes: `gain / (startingValue + deposits) * 100`.
  - Returns `null` if `startingValue + deposits === 0` (division by zero — no capital at risk).
  - Returns the percentage as a number (e.g. 5.48 for 5.48%).

- `computeGainLoss(startingValue: number, endingValue: number, deposits: number, withdrawals: number): GainLossResult`:
  - Returns a combined result object:
    ```
    {
      gain: number,
      gainPercent: number | null,
      startingValue: number,
      endingValue: number,
      deposits: number,
      withdrawals: number,
      netDeposits: number
    }
    ```

- `computePlatformGainLoss(dataPoints: DataPoint[], transactions: Transaction[], start: Date, end: Date): GainLossResult | null`:
  - High-level function that:
    1. Finds the starting value (data point at or nearest before `start`).
    2. Finds the ending value (data point at or nearest before `end`).
    3. Sums deposits and withdrawals within `[start, end]`.
    4. Returns the full `GainLossResult`.
  - Returns `null` if starting or ending value cannot be determined.

**Type definition:**
- `GainLossResult = { gain: number; gainPercent: number | null; startingValue: number; endingValue: number; deposits: number; withdrawals: number; netDeposits: number }`

**Required resolutions** (PRD §6.2.6):
- All time (since first data point to latest).
- Each calendar year historically, including current YTD.
- Each calendar month historically, including current MTD.
- The functions accept arbitrary `[start, end]` windows to support all resolutions.

**Edge cases:**
- No starting value available: return `null`.
- No ending value available: return `null`.
- Zero capital at risk (startingValue + deposits = 0): gainPercent is `null`.
- Negative gain (loss): returned as a negative number.
- Window with no transactions: deposits = 0, withdrawals = 0, so gain = endingValue - startingValue.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `calculateGain(10000, 12000, 1000, 0)` returns 1000 (12000 - 10000 - 1000)
- [ ] `calculateGain(10000, 9000, 0, 0)` returns -1000 (loss)
- [ ] `calculateGain(10000, 15000, 3000, 500)` returns 2500 (15000 - 10000 - (3000 - 500))
- [ ] `calculateGainPercent(10000, 12000, 1000, 0)` returns ~9.09% (1000 / (10000 + 1000) * 100)
- [ ] `calculateGainPercent(0, 0, 0, 0)` returns `null` (division by zero)
- [ ] `computeGainLoss` returns a complete result object with all fields
- [ ] `computePlatformGainLoss` returns null when data points are insufficient
- [ ] Denominator for gainPercent is `startingValue + Σ deposits` (capital at risk), NOT `startingValue + netDeposits`
- [ ] Works for all-time, yearly, monthly, and arbitrary date windows
- [ ] PRD §14 criterion 18: Gain/loss correctly accounts for net deposits
- [ ] All tests pass and meet 100% coverage of exported functions

## Testing Requirements
- **Test file**: `src/utils/calculations.test.ts` (co-located, shared with other calculation stories)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- Test calculateGain(10000, 12000, 1000, 0) returns 1000
- Test calculateGain(10000, 9000, 0, 0) returns -1000
- Test calculateGain(10000, 15000, 3000, 500) returns 2500
- Test calculateGainPercent(10000, 12000, 1000, 0) returns approximately 9.09%
- Test calculateGainPercent(0, 0, 0, 0) returns null (division by zero)
- Test computePlatformGainLoss returns null when data points are insufficient
- **Verify denominator is startingValue + deposits, NOT startingValue + netDeposits**
- Test edge cases: null returns, empty arrays, division by zero

## Technical Notes
- File to modify: `src/utils/calculations.ts` — add gain/loss functions
- The pure calculation functions have no dependencies and are trivially testable
- The high-level `computePlatformGainLoss` depends on data points and transactions being available
- The `gainPercent` denominator uses `Σ deposits` (total deposits), not `netDeposits` (deposits minus withdrawals). This is intentional — it represents the total capital the user put at risk, which is the correct denominator for measuring return on invested capital
- The `GainLossResult` type should be exported from `src/types/index.ts` or defined locally
- This module is used by both per-platform views and portfolio-level aggregation (US-053)
- For yearly and monthly gain/loss series, the caller iterates over periods and calls `computePlatformGainLoss` for each — the function itself handles a single window
