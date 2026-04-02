# US-053: Portfolio-Level Aggregation in DKK

## Story
As the Insight platform user, I want portfolio-level metrics (total value, XIRR, gain/loss, earnings) computed by aggregating all platforms in DKK so that I can see the overall performance of my entire portfolio in my home currency.

## Dependencies
- US-047: Currency Conversion Utilities
- US-048: XIRR Calculation (Newton-Raphson Solver)
- US-050: Gain/Loss Calculation

## Requirements
- Create `src/utils/portfolioAggregation.ts` with the following:

**Core concept** (PRD §6.2.7):
Portfolio-level metrics aggregate all platforms within a portfolio. All values are converted to DKK before aggregation. Cash platform values ARE included — idle cash dilutes the portfolio return, which is the truthful picture.

**Composite value series:**

- `buildCompositeValueSeries(platforms: PlatformWithData[], start: Date, end: Date): Promise<CompositeDataPoint[]>`:
  - For each timestamp where any platform has a data point, sum all platform values (converted to DKK) to get the portfolio-level value.
  - `PlatformWithData` includes the platform record, its data points, and its currency.
  - Returns an array of `{ date: Date; totalValueDKK: number; platformBreakdown: Record<string, number> }` sorted by date.
  - Only includes **active** platforms (closed platforms excluded per PRD §6.6).
  - For timestamps where a platform has no data point, use its most recent prior value (carry forward).

**Merged transaction series:**

- `mergeTransactions(platforms: PlatformWithData[]): Promise<CashFlow[]>`:
  - Combines all transactions across all platforms in the portfolio.
  - Converts each transaction amount to DKK using the exchange rate at the transaction date.
  - Deposits remain negative cash flows; withdrawals remain positive cash flows (XIRR convention).
  - Sorted by date.

**Portfolio-level XIRR** (PRD §6.2.1, §6.2.7):

- `computePortfolioXIRR(platforms: PlatformWithData[], start: Date, end: Date): Promise<number | null>`:
  - Builds DKK-denominated cash flows:
    1. Starting value: sum of all platform values (DKK) at or before `start` — negative cash flow.
    2. All transactions across platforms within `[start, end]` — converted to DKK.
    3. Ending value: sum of all platform values (DKK) at or before `end` — positive cash flow.
  - Runs the XIRR solver on the aggregated cash flows.
  - Cash platforms included (idle cash dilutes return — PRD §6.2.7).

**Portfolio-level gain/loss** (PRD §6.2.7):

- `computePortfolioGainLoss(platforms: PlatformWithData[], start: Date, end: Date): Promise<GainLossResult | null>`:
  - Starting value: sum of all platform DKK values at start.
  - Ending value: sum of all platform DKK values at end.
  - Deposits and withdrawals: summed across all platforms, converted to DKK.
  - Computes gain and gainPercent using the standard formulas from US-050.

**Portfolio-level monthly earnings:**

- `computePortfolioMonthlyEarnings(platforms: PlatformWithData[], year: number, month: number): Promise<number | null>`:
  - Sum of all platform monthly earnings (each converted to DKK).
  - Or equivalently: portfolio ending value (DKK) - portfolio starting value (DKK) - portfolio net deposits (DKK) for the month.

**Total portfolio value:**

- `computeTotalPortfolioValue(platforms: PlatformWithData[]): Promise<number>`:
  - Sum of the latest value of each active platform, converted to DKK.
  - Used for portfolio summary cards and allocation calculations.

**Type definitions:**

- `PlatformWithData`: `{ platform: Platform; dataPoints: DataPoint[]; transactions: Transaction[] }`
- `CompositeDataPoint`: `{ date: Date; totalValueDKK: number; platformBreakdown: Record<string, number> }`

**Closed platform handling** (PRD §6.6):
- Closed platforms are **excluded** from current portfolio totals, current allocation, and current-period calculations.
- Historical calculations that span periods before closure include the closed platform's data up to its closure date.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `buildCompositeValueSeries` sums all platform values in DKK at each timestamp
- [ ] DKK platforms contribute their values directly (no conversion)
- [ ] EUR platforms are converted to DKK using the exchange rate for each date
- [ ] Missing platform values at a timestamp use carry-forward (most recent prior value)
- [ ] `mergeTransactions` combines and converts all transactions to DKK
- [ ] `computePortfolioXIRR` runs XIRR on aggregated DKK cash flows
- [ ] Portfolio XIRR includes cash platform values (idle cash dilutes return)
- [ ] `computePortfolioGainLoss` uses DKK-converted values for start, end, deposits, and withdrawals
- [ ] `computePortfolioMonthlyEarnings` returns the portfolio-level monthly earnings in DKK
- [ ] `computeTotalPortfolioValue` returns sum of latest active platform values in DKK
- [ ] Closed platforms are excluded from current totals and current calculations
- [ ] Historical calculations include closed platform data up to closure date
- [ ] PRD §14 criterion 21: All metrics computed at portfolio level in DKK

## Technical Notes
- File to create: `src/utils/portfolioAggregation.ts`
- All functions are async because currency conversion requires exchange rate lookups
- For the composite value series, the "carry forward" approach means: at each date, each platform's value is either its data point on that date or its most recent prior data point. This creates a step-function per platform.
- The `platformBreakdown` in `CompositeDataPoint` maps platform ID to its DKK value at that point — used for the stacked area chart on the portfolio overview (PRD §6.3 item 3)
- Performance consideration: portfolio aggregation may involve many data points across many platforms, each requiring currency conversion. Use batch conversion (US-047) and rate caching to minimize redundant lookups.
- The `PlatformWithData` type bundles a platform with its pre-fetched data points and transactions. This avoids N+1 queries during aggregation — fetch all data upfront and pass it in.
- For closed platforms in historical calculations: filter data points and transactions to those before `closedDate`
- This module is the most computation-heavy in the investment section. Consider memoization or caching of intermediate results for the portfolio overview page.
