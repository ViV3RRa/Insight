# US-062: Portfolio Overview — Investment Platforms Table

## Story
As the Insight platform user, I want a table of all investment platforms in my portfolio showing key metrics so that I can compare platform performance at a glance and navigate to any platform's detail page.

## Dependencies
- US-025: DataTable Component
- US-039: PlatformIcon Component
- US-017: CurrencyDisplay Component
- US-016: StalenessIndicator Component
- US-043: Platform CRUD Service

## Requirements
- Render a card section titled "Investment Platforms" with a count badge showing the number of active investment platforms (PRD §6.3 item 4)
- **Desktop action buttons** in the card header (right-aligned, hidden lg:flex):
  - "+ Add Data Point" — secondary button, opens DataPointDialog (US-076)
  - "+ Add Transaction" — primary button, opens TransactionDialog (US-077)
- Desktop table columns:
  1. **Platform**: circular icon (PlatformIcon sm) + platform name — always visible
  2. **Currency**: currency code badge (e.g., "DKK", "EUR") — hidden on mobile
  3. **Current Value**: native currency + DKK equivalent (CurrencyDisplay) — always visible
  4. **Month Earnings**: colored value (emerald/rose) — hidden on mobile, cyclable
  5. **All-Time Gain/Loss**: absolute + percentage (colored) — hidden on mobile, cyclable
  6. **All-Time XIRR**: percentage, font-medium — hidden on mobile, cyclable
  7. **Updated**: date of most recent data point (formatted as "MMM DD") — hidden on mobile, cyclable
- Clickable rows navigate to platform detail page
- Staleness badge appears inline with the platform name when applicable
- Mobile: secondary columns cycle through XIRR, Month Earnings, All-Time Gain/Loss, Updated (PRD §8.3)

## Shared Components Used
- `DataTable` (US-025) — props: { columns: platformColumns, data: investmentPlatforms, onRowClick: navigateToDetail }
- `PlatformIcon` (US-039) — props: { src: platform.iconUrl, name: platform.name, size: "sm" } — rendered in the Platform column cell
- `CurrencyDisplay` (US-017) — props: { amount: platform.currentValue, currency: platform.currency, dkkEquivalent: platform.valueDkk } — rendered in the Current Value cell
- `StalenessIndicator` (US-016) — props: { severity: "warning" | "critical", size: "md" } — rendered inline with platform name when stale
- `Button` (US-013) — for "+ Add Data Point" and "+ Add Transaction" action buttons in the card header

## UI Specification

**Card wrapper with header:**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  {/* Card header */}
  <div className="px-3 lg:px-6 py-5 flex items-center justify-between border-b border-base-100 dark:border-base-700">
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold">Investment Platforms</h3>
      <span className="text-xs text-base-400 bg-base-100 dark:bg-base-700 px-2 py-0.5 rounded-full font-medium">{count}</span>
    </div>
    {/* Desktop action buttons */}
    <div className="hidden lg:flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={openDataPointDialog}>+ Add Data Point</Button>
      <Button variant="primary" size="sm" onClick={openTransactionDialog}>+ Add Transaction</Button>
    </div>
  </div>
  {/* Table */}
  <DataTable ... />
</div>
```

The table card wraps the DataTable. Clickable rows use `cursor-pointer` and the row hover state from DataTable.

**Platform cell (custom render):**
```
<div className="flex items-center gap-2.5">
  <PlatformIcon src={iconUrl} name={name} size="sm" />
  <div>
    <span className="font-medium text-base-900 dark:text-white">{name}</span>
    {staleness && <StalenessIndicator severity={staleness} size="sm" />}
  </div>
</div>
```

**Mobile cycling columns order:** XIRR, Month Earnings, All-Time Gain/Loss, Updated

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Investment Platforms table: L613–778 (header with count badge + action buttons, table with icon/name/value/earnings/gain/XIRR/updated columns, mobile cycling)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-tables.png`

## Acceptance Criteria
- [ ] Card header shows "Investment Platforms" with count badge
- [ ] Desktop: card header includes "+ Add Data Point" (secondary) and "+ Add Transaction" (primary) buttons (hidden lg:flex)
- [ ] Table renders inside a card with rounded-2xl shadow-card
- [ ] Desktop shows all 7 columns: Platform, Currency, Current Value, Month Earnings, Gain/Loss, XIRR, Updated
- [ ] Platform column shows circular icon + name + optional staleness badge
- [ ] Current Value uses CurrencyDisplay with native + DKK equivalent for non-DKK platforms
- [ ] Month Earnings and Gain/Loss use colored text (emerald/rose)
- [ ] XIRR displays as a percentage with font-medium
- [ ] Updated shows most recent data point date as "MMM DD"
- [ ] Rows are clickable and navigate to platform detail page
- [ ] Mobile: secondary columns cycle through XIRR, Month Earnings, Gain/Loss, Updated
- [ ] Staleness badges appear for platforms missing current month data
- [ ] Uses shared DataTable, PlatformIcon, CurrencyDisplay, StalenessIndicator — no inline markup
- [ ] PRD §14 criteria 23, 42: Platform list with staleness indicators
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewPlatformsTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (platform rows render correct values)
- Test loading state (skeleton/spinner shown while platform queries are pending)
- Test empty state (EmptyState component when no investment platforms exist)
- Test error state (ErrorState component when query fails)
- Test that card header shows "Investment Platforms" with correct count badge
- Test that desktop action buttons ("+ Add Data Point", "+ Add Transaction") render in card header
- Test that platform rows show icon, name, currency, value, earnings, gain/loss, XIRR, and updated date
- Test that staleness indicators appear for platforms missing current month data
- Test that rows are clickable and trigger navigation callback
- Test mobile column cycling order: XIRR, Month Earnings, All-Time Gain/Loss, Updated
- Test that CurrencyDisplay shows native + DKK equivalent for non-DKK platforms

## Technical Notes
- This section is part of `src/components/portfolio/PortfolioOverview.tsx` (platforms section)
- Platform data fetched via `platformService.getInvestmentPlatforms(portfolioId)` from US-043
- Platform metrics (current value, earnings, gain/loss, XIRR) come from per-platform calculations
- Row click handler uses React Router's `useNavigate` to go to `/investment/platform/{platformId}`
- Staleness is computed by checking if the latest data point timestamp is in the current month per PRD §3.4
