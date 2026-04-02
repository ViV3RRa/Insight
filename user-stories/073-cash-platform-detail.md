# US-073: Cash Platform Detail Page

## Story
As the Insight platform user, I want a dedicated detail page for cash platforms so that I can view my balance history, transactions, and data points without the XIRR and gain/loss analysis that only applies to investment platforms.

## Dependencies
- US-014: StatCard Component
- US-017: CurrencyDisplay Component
- US-022: ChartCard Component
- US-023: CollapsibleSection (Accordion) Component
- US-025: DataTable Component
- US-032: DropdownSwitcher Component
- US-038: TransactionTypeBadge Component
- US-039: PlatformIcon Component
- US-043: Platform CRUD Service
- US-044: Data Point CRUD Service
- US-045: Transaction CRUD Service

## Requirements
- Simplified version of the investment platform detail page (PRD §6.5)
- **No** XIRR, gain/loss, or performance analysis sections
- Header: platform icon (editable), name (editable via DropdownSwitcher), currency badge
- Stat cards section:
  - Current balance (native currency + DKK equivalent for non-DKK)
- Balance history: Line chart showing balance over time with embedded TimeSpanSelector
- Transactions table (collapsible, collapsed by default): date, type badge, amount (native + DKK if applicable), note, attachment, edit/delete. "Add Transaction" button.
- Data points table (collapsible, collapsed by default): date, value (native + DKK if applicable), note, edit/delete. "Add Data Point" button.
- Platform switcher dropdown in header (reuses DropdownSwitcher from US-032)
- Quick-add buttons: "+ Add Data Point" (secondary) and "+ Add Transaction" (primary)

## Shared Components Used
- `StatCard` (US-014) — props: { label: "Current Balance", value: formattedBalance, sublabel: dkkEquivalent }
- `CurrencyDisplay` (US-017) — for balance and table amounts
- `ChartCard` (US-022) — wrapping the balance history line chart
- `CollapsibleSection` (US-023) — wrapping Transactions and Data Points tables
- `DataTable` (US-025) — for transactions and data points
- `TransactionTypeBadge` (US-038) — in transactions table Type column
- `DropdownSwitcher` (US-032) — platform switcher in header
- `PlatformIcon` (US-039) — in header and switcher items
- `Button` (US-013) — quick-add action buttons

## UI Specification

**Page layout (desktop):**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {/* Platform switcher bar with back button */}
  {/* Desktop action buttons: +Add Data Point (secondary), +Add Transaction (primary) */}
  {/* Stat card: Current Balance */}
  {/* Balance History chart card (h-56, line chart) */}
  {/* Transactions table (CollapsibleSection) */}
  {/* Data Points table (CollapsibleSection) */}
</div>
```

**Balance History chart:**
- Smooth line chart (blue `#3b82f6` line with subtle area fill)
- Embedded TimeSpanSelector (default: YTD)
- Y-axis: currency values in native currency
- No Earnings/XIRR toggle (not applicable for cash)

**Stat card grid:** Single card (or `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) for current balance:
- Label: "Current Balance"
- Value: formatted in native currency via CurrencyDisplay
- Sublabel: DKK equivalent for non-DKK platforms (e.g. "≈ 7.460 DKK")

**Mobile:** Single-column layout. Platform switcher in mobile nav. Action buttons below header in full-width flex.

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html` (cash variant is a subset of this prototype — no performance analysis sections)
- Header + switcher pattern: L196–309 (reused, minus performance-specific elements)
- Data Points table pattern: L666–789
- Transactions table pattern: L791–964

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-top.png`

## Acceptance Criteria
- [ ] Page renders for platforms with type "cash"
- [ ] Header shows platform icon, name via DropdownSwitcher, and currency badge
- [ ] Current balance stat card shows latest data point value
- [ ] Non-DKK platforms show DKK equivalent on balance card
- [ ] Balance history line chart renders with TimeSpanSelector
- [ ] Transactions table is collapsible and collapsed by default
- [ ] Data Points table is collapsible and collapsed by default
- [ ] No XIRR, gain/loss, or performance analysis sections are present
- [ ] "+ Add Data Point" and "+ Add Transaction" buttons open respective dialogs
- [ ] Platform switcher allows navigating to other platforms
- [ ] Mobile: full-width action buttons, switcher in nav
- [ ] Desktop: action buttons in header row
- [ ] PRD §6.5: Cash platform detail shows balance, balance history, transactions, and data points
- [ ] PRD §14 criterion 22: Cash platforms show balance and balance history; no XIRR/gain-loss analysis
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/CashPlatformDetail.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (balance, chart, and tables render correctly)
- Test loading state (skeleton/spinner shown while platform data is pending)
- Test empty state (EmptyState component when cash platform has no data)
- Test error state (ErrorState component when query fails)
- Test that balance stat card shows latest data point value in native currency
- Test that non-DKK platforms show DKK equivalent on balance card
- Test that balance history line chart renders with TimeSpanSelector
- Test that no XIRR, gain/loss, or performance analysis sections are present
- Test that transactions table is collapsible and collapsed by default
- Test that data points table is collapsible and collapsed by default
- Test that "+ Add Data Point" and "+ Add Transaction" buttons open respective dialogs
- Test that platform switcher allows navigating to other platforms

## Technical Notes
- File: `src/components/portfolio/CashPlatformDetail.tsx`
- Route: `/investment/cash/:platformId` (registered in US-006)
- Balance = latest data point value for this platform
- Balance history chart: plot all data points over time as a line
- Transactions and data points tables reuse the same column definitions as investment detail (US-070, US-071) but without performance-specific columns
- The balance history chart uses Recharts `<AreaChart>` with a single series
