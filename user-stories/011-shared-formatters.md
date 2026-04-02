# US-011: Shared Formatters (Danish Locale)

## Story
As the Insight platform user, I want all numbers, currencies, percentages, and dates formatted in Danish locale conventions so that the data feels familiar and consistent.

## Dependencies
- US-001: Project Scaffolding (must be completed first)

## Requirements
- Create `src/utils/formatters.ts` with the following functions (PRD §3.7):

**Number formatting:**
- `formatNumber(value: number, decimals?: number)`: Danish format with period as thousands separator, comma as decimal (e.g., `1.000,00`)
- `formatCurrency(value: number, currency: string)`: Currency with suffix (e.g., `1.000,00 DKK`, `1.000 EUR`)
- `formatPercent(value: number, decimals?: number)`: Comma decimal, 2 decimal places + % (e.g., `5,48%`)
- `formatPercentagePoints(value: number)`: For XIRR comparisons (e.g., `+2,3pp`)

**Date formatting** (context-dependent per PRD §3.7):
- `formatRecordDate(date: Date | string, format: string)`: For tables — `YYYY-MM-DD` or `DD/MM/YYYY` based on settings
- `formatHumanDate(date: Date | string)`: For headers/cards — `MMM DD, YYYY` (e.g., `Feb 14, 2026`)
- `formatMonthPeriod(date: Date | string)`: For chart axes — `MMM YYYY` (e.g., `Feb 2026`)
- `formatRecentUpdate(date: Date | string)`: For "Updated" column — `MMM DD` (e.g., `Feb 14`)
- `formatYearLabel(year: number, isCurrentYear: boolean)`: `YYYY` or `YYYY (YTD)`

**Sign formatting:**
- Positive gains: prefix with `+` (e.g., `+182.914`)
- Negative losses: prefix with `-` (e.g., `-1.842`)
- Format should work with `formatNumber` and `formatCurrency`

## Shared Components Used
N/A — utility module

## UI Specification
N/A — utility module

## Acceptance Criteria
- [ ] `formatNumber(1000.5)` returns `"1.000,50"` (or `"1.000,5"` with 1 decimal)
- [ ] `formatCurrency(5057.80, "DKK")` returns `"5.057,80 DKK"`
- [ ] `formatPercent(5.48)` returns `"5,48%"`
- [ ] `formatRecordDate` respects the configurable date format setting
- [ ] `formatHumanDate` returns `"Feb 14, 2026"` format
- [ ] `formatMonthPeriod` returns `"Feb 2026"` format
- [ ] `formatRecentUpdate` returns `"Feb 14"` format
- [ ] `formatYearLabel(2026, true)` returns `"2026 (YTD)"`
- [ ] Positive values can be prefixed with `+`
- [ ] PRD §14 criterion 47: Danish locale formatting is applied throughout

## Technical Notes
- File to create: `src/utils/formatters.ts`
- Use `Intl.NumberFormat('da-DK', ...)` for number formatting where possible
- For date formatting, use `Intl.DateTimeFormat` or a lightweight helper — avoid heavy libraries like moment.js
- The date format setting comes from SettingsProvider — formatRecordDate should accept the format as a parameter
- Export all functions as named exports
