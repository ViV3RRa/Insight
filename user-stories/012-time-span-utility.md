# US-012: Time Span Utility Functions

## Story
As the Insight platform user, I want time span filtering logic so that charts and tables can be filtered to specific date ranges.

## Dependencies
- US-001: Project Scaffolding (must be completed first)

## Requirements
- Create `src/utils/timeSpan.ts` with the following (PRD §3.1):

**Time span options** (enum or constant):
- `1M`: Last 1 calendar month from today
- `3M`: Last 3 calendar months from today
- `6M`: Last 6 calendar months
- `MTD`: 1st of current month → today
- `YTD`: January 1 of current year → today (DEFAULT)
- `1Y`: Last 12 months
- `3Y`: Last 36 months
- `5Y`: Last 60 months
- `All`: Earliest data point → today

**Functions:**
- `getTimeSpanRange(span: TimeSpan, earliestDate?: Date): { start: Date, end: Date }` — returns the date range for a given time span
- `filterByTimeSpan<T>(items: T[], span: TimeSpan, getDate: (item: T) => Date, earliestDate?: Date): T[]` — filters an array of items by time span
- `getYoYRange(span: TimeSpan): { start: Date, end: Date }` — returns the equivalent prior-year range for YoY comparison (PRD §3.2)

**Rules:**
- Default time span: `YTD`
- Each chart card manages its own selected time span independently
- `All` uses the earliest data point date as start

## Shared Components Used
N/A — utility module

## UI Specification
N/A — utility module

## Acceptance Criteria
- [ ] `getTimeSpanRange('YTD')` returns Jan 1 of current year to today
- [ ] `getTimeSpanRange('1M')` returns last 1 calendar month
- [ ] `getTimeSpanRange('All', someDate)` returns from someDate to today
- [ ] `filterByTimeSpan` correctly filters arrays by the computed date range
- [ ] `getYoYRange` returns the equivalent prior-year period
- [ ] All span options are correctly implemented per PRD §3.1
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test file**: `src/utils/timeSpan.test.ts`
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- Use `vi.useFakeTimers()` to pin "today" for deterministic results
- Test every time span option (1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All)
- Test calendar boundary semantics (1M = first day of previous month, NOT 30 days ago)
- Test `filterByTimeSpan` with arrays: all in range, none in range, empty array
- Test `getYoYRange` returns correct prior-year equivalent
- Test leap year transitions and year boundaries

## Technical Notes
- File to create: `src/utils/timeSpan.ts`
- Define `TimeSpan` as a union type: `'1M' | '3M' | '6M' | 'MTD' | 'YTD' | '1Y' | '3Y' | '5Y' | 'All'`
- Export the `TIME_SPAN_OPTIONS` array with labels for the UI component
- Calendar month calculation should use proper month arithmetic (handle month lengths, leap years)
- **Date range semantics:** All "last N months/years" spans use **calendar boundaries**, not rolling days:
  - `1M` = first day of previous month through today (not "last 30 days")
  - `3M` = first day of the month 3 months ago through today
  - `6M` = first day of the month 6 months ago through today
  - `MTD` = first day of current month through today
  - `YTD` = January 1 of current year through today
  - `1Y` = same date last year through today (or first day of same month last year)
  - `3Y` / `5Y` = same pattern, 3/5 years back
  - `All` = earliest data point date through today
