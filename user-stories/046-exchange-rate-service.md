# US-046: Exchange Rate Service

## Story
As the Insight platform user, I want exchange rates to be automatically fetched and stored so that my non-DKK platform values and transactions are accurately converted to DKK without manual rate entry.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types

## Requirements
- Create `src/services/exchangeRates.ts` with the following functions:

**CRUD operations:**
- `getAll()`: Fetch all exchange rates for the current user. Sort by `date` descending (most recent first).
- `getByDateRange(fromCurrency: string, start: string, end: string)`: Fetch rates for a currency pair within a date range.
- `getOne(id: string)`: Fetch a single exchange rate by ID. Verify ownership.
- `create(data: ExchangeRateCreate)`: Create a new exchange rate record. Set `owner` to current user.
- `update(id: string, data: Partial<ExchangeRateCreate>)`: Update an exchange rate. When the user overrides an auto-fetched rate, set `source` to `"manual"`.
- `delete(id: string)`: Delete an exchange rate record. Verify ownership.

**Rate lookup** (PRD §4.2):
- `getRate(fromCurrency: string, toCurrency: string, date: string)`: Look up the exchange rate for a currency pair on a specific date. Search strategy:
  1. Exact date match in stored rates.
  2. If no exact match, use the closest previous date's rate.
  3. If no stored rate exists at all, trigger auto-fetch.
  4. Returns `null` if no rate can be determined.
- `toCurrency` is always "DKK" (the home currency). The function signature accepts it for API symmetry and future extensibility.

**Auto-fetching** (PRD §4.2):
- `fetchRate(fromCurrency: string, date: string)`: Fetch a rate from a public API (ECB or similar, e.g. `exchangerate.host`, `frankfurter.app`, or ECB Statistical Data Warehouse).
  - On success: store the rate with `source: "auto"` and return it.
  - On failure: log the error, return `null`. The user can manually enter the rate.
- `fetchMonthlyRates(fromCurrency: string)`: Fetch rates for the 1st of the current month (and any missing recent months). Called on app initialization or when navigating to the Investment section.
- `fetchTransactionDayRate(fromCurrency: string, date: string)`: Fetch the rate for a specific transaction date. Called when recording a transaction on a non-DKK platform (PRD §4.2).
- Rate fetching should be **non-blocking** — the UI should not freeze if the API is slow or unavailable.

**Source tracking** (PRD §4.2):
- `source: "auto"` — rate was fetched from the public API.
- `source: "manual"` — rate was entered or overridden by the user.
- When the user edits an auto-fetched rate, the source changes to "manual".

**Visibility and override** (PRD §4.2):
- All fetched rates are visible to the user (shown in a rate management view or alongside transactions).
- The user can edit any rate — overriding changes source from "auto" to "manual".
- The user can manually create new rate entries.

**Supported currencies** (PRD §4.4):
- Currently: EUR to DKK. The system should support additional `fromCurrency` values without structural changes.

**Data isolation:**
- All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getRate("EUR", "DKK", date)` returns the correct rate for the given date
- [ ] If no exact date match, the closest previous rate is used
- [ ] `fetchRate()` successfully retrieves a rate from the public API
- [ ] Fetched rates are stored with `source: "auto"`
- [ ] `fetchMonthlyRates()` fetches rates for the 1st of each month
- [ ] `fetchTransactionDayRate()` fetches a rate for a specific date
- [ ] User can create a manual rate entry with `source: "manual"`
- [ ] User can update an auto-fetched rate; source changes to "manual"
- [ ] `delete()` removes a rate record
- [ ] Rate fetching is non-blocking (does not freeze the UI)
- [ ] Rate fetching gracefully handles API failures (returns null, does not throw)
- [ ] All operations filter by owner for data isolation
- [ ] PRD §14 criterion 25: Exchange rates are auto-fetched, visible, and overridable

## Technical Notes
- File to create: `src/services/exchangeRates.ts`
- PocketBase collection name: `exchange_rates` (PRD §10)
- Read functions are TanStack Query queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['exchangeRates', fromCurrency, date]` for single rate lookups; `['exchangeRates', fromCurrency]` for list. `fetchRate` is a TanStack Query mutation or prefetch.
- The in-memory cache note still applies for bulk calculations within a single render cycle — do not replace that with TanStack Query.
- Collection fields: fromCurrency, toCurrency, rate, date, source (PRD §10)
- Recommended public API: `https://api.frankfurter.app/{date}?from={currency}&to=DKK` — free, no API key, ECB data
  - Alternative: `https://api.exchangerate.host/{date}?base={currency}&symbols=DKK`
- For the closest-previous-rate lookup, use PocketBase filter: `fromCurrency = 'EUR' && toCurrency = 'DKK' && date <= '${date}'` with sort `-date` and limit 1
- Rate fetch calls should use `fetch()` or a lightweight HTTP utility — no heavy HTTP libraries
- Consider caching recently looked-up rates in memory to avoid repeated PocketBase queries during bulk calculations (e.g. portfolio aggregation hitting the same rate many times)
- Monthly rate fetching can be triggered lazily: check if the rate for the current month's 1st exists, and if not, fetch it
- Error handling: API fetch failures should log a warning and return null — never throw from fetch operations. CRUD errors (not found, unauthorized) should throw.
