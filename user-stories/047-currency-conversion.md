# US-047: Currency Conversion Utilities

## Story
As the Insight platform user, I want all non-DKK values automatically converted to DKK so that portfolio-level aggregations, totals, and comparisons are computed in a single home currency.

## Dependencies
- US-046: Exchange Rate Service

## Requirements
- Create `src/utils/currency.ts` with the following functions:

**Core conversion functions** (PRD §4.3):
- `convertToDKK(amount: number, currency: string, date: string): Promise<number | null>`:
  - Converts an amount from the given currency to DKK using the exchange rate for the specified date.
  - Uses `exchangeRateService.getRate(currency, "DKK", date)` to look up the rate.
  - Returns `amount * rate`.
  - **DKK pass-through**: If `currency === "DKK"`, return `amount` directly without rate lookup.
  - Returns `null` if no exchange rate is available for the given currency/date.

- `convertFromDKK(amount: number, currency: string, date: string): Promise<number | null>`:
  - Converts a DKK amount to the target currency.
  - Uses the same rate lookup: `amount / rate`.
  - **DKK pass-through**: If `currency === "DKK"`, return `amount` directly.
  - Returns `null` if no exchange rate is available.

**Batch conversion** (for portfolio aggregation performance):
- `convertToDKKBatch(items: Array<{ amount: number; currency: string; date: string }>): Promise<Array<number | null>>`:
  - Converts multiple amounts to DKK in a single call.
  - Optimizes by grouping lookups: fetches unique currency+date combinations first, then applies rates.
  - Avoids redundant rate lookups when multiple items share the same currency and date.

**Rate display helper:**
- `getDKKEquivalent(amount: number, currency: string, date: string): Promise<{ dkk: number; rate: number } | null>`:
  - Returns both the DKK equivalent amount and the rate used.
  - Used by UI components to show "1.000 EUR / ≈ 7.460 DKK" with the rate available for display.

**Usage context:**
- Portfolio-level XIRR uses DKK-converted values (PRD §4.3, §6.2.1).
- Portfolio totals are always in DKK (PRD §4.3).
- Transaction display shows native currency with DKK equivalent (PRD §4.3).
- Allocation calculations use DKK-converted platform values (PRD §6.2.8).

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `convertToDKK(1000, "EUR", "2026-01-15")` returns 1000 * EUR/DKK rate for that date
- [ ] `convertToDKK(1000, "DKK", anyDate)` returns 1000 (pass-through, no rate lookup)
- [ ] `convertFromDKK(7460, "EUR", "2026-01-15")` returns 7460 / EUR/DKK rate
- [ ] `convertFromDKK(1000, "DKK", anyDate)` returns 1000 (pass-through)
- [ ] Returns `null` when no exchange rate is available for the currency/date
- [ ] `convertToDKKBatch()` correctly converts an array of mixed-currency amounts
- [ ] `convertToDKKBatch()` does not make redundant rate lookups for the same currency+date
- [ ] `getDKKEquivalent()` returns both the converted amount and the rate used
- [ ] DKK pass-through works for all functions without triggering rate lookups
- [ ] PRD §14 criterion 26: Non-DKK values display with DKK equivalent

## Technical Notes
- File to create: `src/utils/currency.ts`
- This module depends on `src/services/exchangeRates.ts` for rate lookups
- All conversion functions are async because rate lookup may involve PocketBase queries or API fetches
- The batch conversion function should build a `Map<string, number>` of `"${currency}-${date}" -> rate` to deduplicate lookups — this is critical for portfolio aggregation where many data points may share the same month-end date
- Consider memoization or a simple in-memory cache for rates within a single calculation pass (e.g. a `RateCache` class or a `Map` passed through calculation chains)
- Floating-point precision: use standard JS number arithmetic. Do not round intermediate results — only round for display (in formatters)
- The `date` parameter uses ISO date strings ("YYYY-MM-DD") matching PocketBase storage format
