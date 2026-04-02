# US-064: Portfolio Overview — Closed Platforms Section

## Story
As the Insight platform user, I want closed platforms displayed in a muted section so that I can still access historical data while keeping them visually separated from my active investments.

## Dependencies
- US-025: DataTable Component
- US-039: PlatformIcon Component
- US-043: Platform CRUD Service

## Requirements
- Render a "Closed Platforms" section with a count badge (PRD §6.3 item 4, §6.6)
- Muted styling: entire section at opacity-60 to indicate inactive status
- Table columns:
  1. **Platform**: circular icon + name — always visible
  2. **Final Value**: last recorded value before closure (DKK) — always visible
  3. **All-Time Gain/Loss**: absolute + percentage (colored) — hidden on mobile, cyclable
  4. **Closed**: closure date — hidden on mobile, cyclable
- Clickable rows navigate to platform detail page (historical view)
- Only shown when there are closed platforms (hide section if count is 0)
- Mobile: column cycling for Gain/Loss and Closed date

## Shared Components Used
- `DataTable` (US-025) — props: { columns: closedColumns, data: closedPlatforms, onRowClick: navigateToHistoricalDetail }
- `PlatformIcon` (US-039) — props: { src: platform.iconUrl, name: platform.name, size: "sm" }

## UI Specification

**Section wrapper (muted):**
```
<div className="mb-6 lg:mb-8 opacity-60 hover:opacity-80 transition-opacity">
  {/* Section header */}
  <div className="flex items-center gap-2 mb-3">
    <h2 className="text-sm font-semibold text-base-900 dark:text-white">Closed Platforms</h2>
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

The `opacity-60` on the wrapper makes the entire section visually muted. On hover, it transitions to `opacity-80` for better readability when the user focuses on it.

**Platform cell (custom render):**
```
<div className="flex items-center gap-2.5">
  <PlatformIcon src={iconUrl} name={name} size="sm" />
  <span className="font-medium text-base-700 dark:text-base-300">{name}</span>
</div>
```

Note: platform name uses `text-base-700` instead of `text-base-900` for additional muting.

**Mobile cycling columns:** All-Time Gain/Loss, Closed date

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Closed Platforms table: L833–897 (dimmed rows with opacity-60, final value/gain/closed date)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] Section renders only when closed platforms exist (hidden when count is 0)
- [ ] Section header shows "Closed Platforms" with count badge
- [ ] Entire section uses opacity-60 for muted appearance
- [ ] Hover transitions to opacity-80 for readability
- [ ] Table shows 4 columns: Platform, Final Value, Gain/Loss, Closed
- [ ] Platform column shows icon + name in muted text color
- [ ] Gain/Loss uses colored text (emerald/rose)
- [ ] Closed column shows the closure date formatted per locale settings
- [ ] Rows are clickable and navigate to historical platform detail
- [ ] Mobile: Gain/Loss and Closed columns cycle via MobileColumnCycler
- [ ] Closed platforms are excluded from portfolio totals (handled by aggregation, not this component)
- [ ] Uses shared DataTable and PlatformIcon — no inline markup
- [ ] PRD §14 criterion 14: Closed platforms appear muted and excluded from current totals

## Technical Notes
- This section is part of `src/components/portfolio/PortfolioOverview.tsx`
- Closed platforms fetched via `platformService.getClosedPlatforms(portfolioId)` from US-043
- Conditionally rendered: `{closedPlatforms.length > 0 && <ClosedPlatformsSection ... />}`
- Final value is the last data point value before or on the `closedDate`
- Gain/loss is computed over the platform's full lifetime (first data point to closure)
