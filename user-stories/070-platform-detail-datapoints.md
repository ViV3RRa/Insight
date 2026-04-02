# US-070: Platform Detail — Data Points Table

## Story
As the Insight platform user, I want a collapsible data points table on the platform detail page so that I can review, edit, and manage the raw value observations that drive all calculations for this platform.

## Dependencies
- US-023: CollapsibleSection (Accordion) Component
- US-025: DataTable Component
- US-017: CurrencyDisplay Component
- US-044: Data Point CRUD Service

## Requirements
- Render data points in a collapsible table, collapsed by default (PRD §3.6, §6.4 item 4)
- Show 5 rows by default with a "Show all N data points" toggle for the full list
- Table columns:
  1. **Date**: formatted per locale settings (YYYY-MM-DD or DD/MM/YYYY)
  2. **Value**: native currency + DKK equivalent (CurrencyDisplay) for non-DKK platforms
  3. **Source**: "Manual" for user-entered, or an amber "est." interpolated badge for system-generated data points (`isInterpolated: true`)
  4. **Note**: optional note text (italic, muted)
  5. **Actions**: Edit and Delete icon buttons (desktop only)
- Interpolated rows visually distinguished: the source column shows an amber badge ("est.") and the row may have subtle styling to indicate it's system-generated
- Sorted by date descending (most recent first)
- Edit opens the DataPointDialog (US-078) pre-filled
- Delete triggers a confirmation dialog (US-029)

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Data Points", icon: Database, count: dataPoints.length, defaultExpanded: false, children: <DataTable /> }
- `DataTable` (US-025) — props: { columns: dataPointColumns, data: dataPoints, showMoreThreshold: 5, onEdit: openEditDialog, onDelete: openDeleteConfirm, onRowClick: openMobileDrawer }
- `CurrencyDisplay` (US-017) — props: { amount: dp.value, currency: platform.currency, dkkEquivalent: dp.valueDkk } — rendered in the Value cell
- `Button` (US-013) — for "+ Add Data Point" header action button and row edit/delete actions

## UI Specification

**Placement:** Below the performance analysis tabs, with section spacing `mb-6 lg:mb-8`.

The `CollapsibleSection` wraps the `DataTable`. When expanded, the table appears inside the accordion content area.

**Source column — interpolated badge:**
```
{/* Manual entry */}
<span className="text-sm text-base-500">Manual</span>

{/* Interpolated entry */}
<span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
  est.
</span>
```

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Date | left | locale date format | always visible |
| Value | right | CurrencyDisplay | always visible |
| Source | center | Manual or "est." badge | hidden on mobile |
| Note | left | italic text-xs text-base-300 | hidden on mobile |
| Actions | right | Edit/Delete icons | hidden on mobile (use drawer) |

**Show-more toggle:** "Show all 48 data points" / "Show less" — accent-colored text link below the table.

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Data Points card (header with count badge + add button, table with date/value/source/note/actions, show-more toggle): L666–789
- Mobile Data Point drawer: L1018–1058

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-transactions.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-dp-drawer.png`

## Acceptance Criteria
- [ ] Data points table is wrapped in CollapsibleSection, collapsed by default
- [ ] CollapsibleSection shows "Data Points" title with record count badge
- [ ] Table shows 5 rows by default with "Show all N" toggle
- [ ] Date column formats per locale settings
- [ ] Value column uses CurrencyDisplay for native + DKK equivalent
- [ ] Interpolated data points show amber "est." badge in the Source column
- [ ] Manual data points show "Manual" text in the Source column
- [ ] Notes display as italic muted text
- [ ] Edit button opens DataPointDialog pre-filled with record data
- [ ] Delete button opens confirmation dialog
- [ ] Desktop: inline edit/delete icon buttons per row
- [ ] Mobile: entire row is tappable (opens MobileDrawer, US-073)
- [ ] Rows sorted by date descending
- [ ] Uses shared CollapsibleSection, DataTable, CurrencyDisplay — no inline markup
- [ ] PRD §14 criterion 15: User can register data points
- [ ] PRD §14 criterion 43: Collapsible data tables collapsed by default
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PlatformDetailDataPoints.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (data point rows render correct values)
- Test loading state (skeleton/spinner shown while data point queries are pending)
- Test empty state (EmptyState component when no data points exist)
- Test error state (ErrorState component when query fails)
- Test that data table is wrapped in CollapsibleSection, collapsed by default
- Test that CollapsibleSection shows "Data Points" title with record count badge
- Test that table shows 5 rows by default with "Show all N" toggle
- Test that interpolated data points show amber "est." badge in Source column
- Test that manual data points show "Manual" text in Source column
- Test that edit button opens DataPointDialog pre-filled with record data
- Test that delete button opens confirmation dialog
- Test that "+ Add Data Point" button triggers dialog
- Test that rows are sorted by date descending

## Technical Notes
- This section is within `src/components/portfolio/PlatformDetail.tsx`
- Data points fetched via `dataPointService.getByPlatform(platformId)` from US-044
- The "est." badge is page-specific styling (not a shared component) since it's unique to data points
- Interpolated data points are marked with `isInterpolated: true` in the data model
- DKK equivalent for each data point computed via exchange rate at the data point's timestamp
- The show-more threshold of 5 is appropriate for data points (user typically has 1 per month)
