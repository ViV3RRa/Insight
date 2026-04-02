# US-063: Portfolio Overview — Cash Accounts Table

## Story
As the Insight platform user, I want a separate table for cash platform accounts so that I can distinguish between actively invested platforms and cash reserves within my portfolio.

## Dependencies
- US-025: DataTable Component
- US-039: PlatformIcon Component
- US-017: CurrencyDisplay Component
- US-043: Platform CRUD Service

## Requirements
- Render a separate card section titled "Cash Accounts" with a count badge (PRD §6.3 item 4)
- Simpler table than investment platforms — no XIRR, gain/loss, or earnings columns
- Table columns:
  1. **Account**: circular icon (PlatformIcon sm) + account name — always visible
  2. **Current Balance**: native currency + DKK equivalent (CurrencyDisplay) — always visible
  3. **Updated**: date of most recent data point — visible on desktop, hidden on narrow mobile
- Visually distinct from investment platforms table (separate section, simpler data)
- Clickable rows navigate to cash platform detail page (US-075)
- No mobile column cycling needed (only 3 columns, 2 always visible)

## Shared Components Used
- `DataTable` (US-025) — props: { columns: cashColumns, data: cashPlatforms, onRowClick: navigateToCashDetail }
- `PlatformIcon` (US-039) — props: { src: platform.iconUrl, name: platform.name, size: "sm" }
- `CurrencyDisplay` (US-017) — props: { amount: platform.currentBalance, currency: platform.currency, dkkEquivalent: platform.balanceDkk }

## UI Specification

**Section wrapper (same pattern as investment platforms):**
```
<div className="mb-6 lg:mb-8">
  {/* Section header */}
  <div className="flex items-center gap-2 mb-3">
    <h2 className="text-sm font-semibold text-base-900 dark:text-white">Cash Accounts</h2>
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
      {count}
    </span>
  </div>
  {/* Table card */}
  <div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
    <DataTable ... />
  </div>
</div>
```

**Account cell (custom render):**
```
<div className="flex items-center gap-2.5">
  <PlatformIcon src={iconUrl} name={name} size="sm" />
  <span className="font-medium text-base-900 dark:text-white">{name}</span>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Cash Accounts table: L780–831 (simpler table: account/balance/updated, no action buttons)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] Section header shows "Cash Accounts" with count badge
- [ ] Table renders inside a card with rounded-2xl shadow-card
- [ ] Table shows 3 columns: Account, Current Balance, Updated
- [ ] Account column shows circular icon + name
- [ ] Current Balance uses CurrencyDisplay with native + DKK equivalent
- [ ] Updated column shows most recent data point date
- [ ] No XIRR, gain/loss, or earnings columns
- [ ] Rows are clickable and navigate to cash platform detail page
- [ ] Visually separated from the investment platforms table (separate section)
- [ ] Uses shared DataTable, PlatformIcon, CurrencyDisplay — no inline markup
- [ ] PRD §14 criterion 22: Cash platforms show balance; no XIRR/gain-loss analysis
- [ ] PRD §14 criterion 23: Visual distinction between investment and cash platforms

## Technical Notes
- This section is part of `src/components/portfolio/PortfolioOverview.tsx`
- Cash platforms fetched via `platformService.getCashPlatforms(portfolioId)` from US-043
- Cash platform "value" is simply the latest data point value (balance) — no earnings calculation
- Row click navigates to `/investment/cash/{platformId}` (cash detail page, US-075)
