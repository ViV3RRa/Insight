# US-054: Portfolio Allocation Calculation

## Story
As the Insight platform user, I want to see each platform's percentage share of my total portfolio value so that I can understand my allocation across different investment platforms and cash holdings.

## Dependencies
- US-047: Currency Conversion Utilities

## Requirements
- Add allocation functions to `src/utils/calculations.ts`:

**Formula** (PRD §6.2.8):

```
allocationPercent = platformValue(DKK) / totalPortfolioValue(DKK) × 100
```

**Functions:**

- `calculateAllocation(platformValueDKK: number, totalPortfolioValueDKK: number): number | null`:
  - Pure calculation: `(platformValueDKK / totalPortfolioValueDKK) * 100`.
  - Returns `null` if `totalPortfolioValueDKK === 0` (no portfolio value — division by zero).
  - Returns the percentage as a number (e.g. 35.5 for 35.5%).

- `computePortfolioAllocation(platforms: PlatformAllocationInput[]): Promise<AllocationResult[]>`:
  - Input: Array of `{ platform: Platform; currentValue: number }` where `currentValue` is the platform's latest data point value in native currency.
  - Steps:
    1. Filter to active platforms only (closed platforms excluded per PRD §6.6).
    2. Convert each platform's current value to DKK using the currency conversion utility.
    3. Sum all DKK values to get `totalPortfolioValueDKK`.
    4. Calculate each platform's allocation percentage.
  - Returns an array of `{ platformId: string; platformName: string; type: PlatformType; currency: string; valueDKK: number; allocationPercent: number }` sorted by allocation descending (largest first).

**Computed at current point in time** (PRD §6.2.8):
- Allocation is always computed using the **most recent** data point for each platform.
- It represents the current snapshot, not historical allocation.

**Closed platform exclusion** (PRD §6.6):
- Closed platforms are excluded from allocation calculations entirely.
- Their value is not included in `totalPortfolioValueDKK`.

**Visual usage** (PRD §6.3 item 5):
- The allocation data feeds into a visualization on the portfolio overview (donut chart, proportional bar, or similar).
- Cash platforms and investment platforms should be visually distinguishable in the allocation view.
- The `type` field in the result enables this distinction.

**Type definitions:**

- `PlatformAllocationInput`: `{ platform: Platform; currentValue: number }`
- `AllocationResult`: `{ platformId: string; platformName: string; type: PlatformType; currency: string; valueDKK: number; allocationPercent: number }`

**Edge cases:**
- Portfolio with a single platform: allocation is 100%.
- Platform with zero value: allocation is 0% (included in results but with 0%).
- Empty portfolio (no active platforms): return empty array.
- All platforms have zero value: return results with `allocationPercent: null` for each (total is zero).

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `calculateAllocation(7460, 20000)` returns 37.3
- [ ] `calculateAllocation(5000, 0)` returns `null` (division by zero)
- [ ] `computePortfolioAllocation` converts all platform values to DKK before computing
- [ ] DKK platforms use their value directly (no conversion)
- [ ] EUR platform values are converted to DKK using the current exchange rate
- [ ] Allocation percentages sum to approximately 100% (floating-point tolerance)
- [ ] Results are sorted by allocation percentage descending
- [ ] Closed platforms are excluded from allocation calculation
- [ ] Closed platform values are NOT included in totalPortfolioValueDKK
- [ ] Single-platform portfolio returns 100% allocation
- [ ] Zero-value platform shows 0% allocation
- [ ] Each result includes `type` field for visual distinction between investment and cash platforms
- [ ] PRD §14 criterion 20: Portfolio allocation visualization shows each platform's share

## Technical Notes
- File to modify: `src/utils/calculations.ts` — add allocation functions
- The `computePortfolioAllocation` function is async because it calls currency conversion which may need exchange rate lookups
- The "current" exchange rate for allocation purposes: use today's date (or the most recent available rate). The `convertToDKK` function handles finding the closest rate.
- For the allocation chart on the portfolio overview, the result array provides all data needed: platform names, types, values, and percentages
- Allocation is a simple point-in-time calculation. No historical allocation tracking is needed for v1 (though the data exists to compute it retroactively if desired).
- Floating-point: percentages may not sum to exactly 100.00 due to rounding. The UI should handle this gracefully (e.g. by adjusting the largest slice).
- The `AllocationResult` type should be exported for use by the allocation chart component
