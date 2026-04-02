# US-097: Utility Detail — Collapsible Year Table with Monthly Expansion

## Story
As the Insight platform user, I want an inline collapsible year table on the utility detail page so that I can see yearly summaries with the ability to expand into monthly breakdowns showing consumption and cost trends.

## Dependencies
- US-040: CollapsibleYearTable Component
- US-087: Utility YoY Calculations
- US-027: MobileDrawer (Bottom Sheet) Component

## Requirements
- Single "Yearly Summary" card (no tabs) with collapsible year rows (PRD §5.4)
- Table where each row represents a year:
  - Columns: Year, Total Consumption, Avg Monthly Consumption, Consumption Change %, Total Cost, Avg Monthly Cost, Avg Cost/Unit, Cost Change %
  - Change percentages color-coded: red for increase, green for decrease
  - **Expanding a year row** reveals monthly summary rows for that year
  - Monthly rows show: Month, Consumption, Consumption Change % (vs same month prior year), Amortized Cost, Cost/Unit, Cost Change % (vs same month prior year)
  - These are **derived aggregations**, not raw data records
- Mobile: column cycling for secondary columns (6 metrics: Avg Monthly, Consump. Change, Total Cost, Avg Mo. Cost, Cost/Unit, Cost Change)
- **Mobile month detail drawer**: tapping a monthly row on mobile (< lg) opens a bottom sheet showing all metrics for that month with prev/next navigation:
  - Consumption (font-mono-data text-sm font-medium)
  - Consump. Change (colored: emerald for decrease, rose for increase)
  - Total Cost (font-mono-data text-sm font-medium)
  - Cost/Unit (font-mono-data text-sm)
  - Cost Change (colored)
  - Prev/next arrows to step through monthly rows without closing the drawer
  - No Edit/Delete buttons (these are computed aggregations, not editable records)

## Shared Components Used
- `CollapsibleYearTable` (US-040) — for the expandable year rows
- `MobileDrawer` (US-027) — for month detail bottom sheet on mobile

## UI Specification

**Card wrapper (no tabs):**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  <div className="px-3 lg:px-6 py-5">
    <h3 className="text-sm font-semibold">Yearly Summary</h3>
  </div>
  <CollapsibleYearTable ... />
</div>
```

**Yearly table columns:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Year | left | YYYY or "YYYY (YTD)" | always visible |
| Consumption | right | font-mono-data + unit | always visible |
| Avg Monthly | right | font-mono-data | hidden (cycled) |
| Consumption Δ% | right | colored % with ChangeIndicator | hidden (cycled) |
| Total Cost | right | font-mono-data + DKK | hidden (cycled) |
| Avg Monthly Cost | right | font-mono-data | hidden (cycled) |
| Avg Cost/Unit | right | font-mono-data | hidden (cycled) |
| Cost Δ% | right | colored % with ChangeIndicator | hidden (cycled) |

**Expanded monthly rows:**
| Column | Format |
|--------|--------|
| Month | "Jan", "Feb", etc. |
| Consumption | font-mono-data + unit |
| Consumption Δ% | colored % vs same month prior year |
| Cost | font-mono-data + DKK |
| Cost/Unit | font-mono-data |
| Cost Δ% | colored % vs same month prior year |

**Color coding for change %:** red = increase (bad for costs), green = decrease (good for costs)

**Mobile month detail drawer (lg:hidden):**
```
<MobileDrawer
  title={monthLabel}  // e.g., "Feb 2026"
  fields={[
    { label: "Consumption", value: consumption },        // font-mono-data text-sm font-medium
    { label: "Consump. Change", value: consumpChange },  // colored emerald/rose
    { label: "Total Cost", value: cost },                // font-mono-data text-sm font-medium
    { label: "Cost/Unit", value: costPerUnit },          // font-mono-data text-sm
    { label: "Cost Change", value: costChange },         // colored emerald/rose
  ]}
  onPrev={navigatePrev}
  onNext={navigateNext}
  hasPrev={rowIndex > 0}
  hasNext={rowIndex < monthRows.length - 1}
  // No onEdit/onDelete — these are computed aggregations
/>
```
Layout: 2×2 grid for first 4 fields (Consumption + Consump. Change, Cost + Cost/Unit), then Cost Change full-width below.

Monthly rows are clickable on mobile (`cursor-pointer` on `< lg`) but `lg:cursor-default` on desktop.

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Yearly Summary card: L300-553
  - Card header "Yearly Summary": L301-304
  - Table headers with mobile column cycler: L306-341
  - 2026 (YTD) expanded year row: L344-367
  - Expanded monthly rows (Feb/Jan 2026): L368-410
  - 2025 collapsed year row: L412-435
  - 2025 hidden monthly rows: L436-499
  - 2024/2023 collapsed year rows: L501-549
- Month detail drawer (mobile): L868-910

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-yearly.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-month-drawer.png`

## Acceptance Criteria
- [ ] Card header shows "Yearly Summary" (no tabs)
- [ ] One row per calendar year with all required metrics
- [ ] Current year row labeled "YYYY (YTD)"
- [ ] Expanding a year row reveals monthly summary rows for that year
- [ ] Monthly summary rows show derived aggregations (not raw records)
- [ ] Change percentages color-coded: red for increase, green for decrease
- [ ] Consumption change % and cost change % vs prior year calculated correctly
- [ ] Monthly change % vs same month prior year
- [ ] Handles first year gracefully (no prior year data = null change %)
- [ ] Mobile: column cycling for 6 secondary columns (Avg Monthly, Consump. Change, Total Cost, Avg Mo. Cost, Cost/Unit, Cost Change)
- [ ] Mobile: tapping a monthly row opens month detail drawer (bottom sheet)
- [ ] Month detail drawer shows: Consumption, Consump. Change (colored), Total Cost, Cost/Unit, Cost Change (colored)
- [ ] Month detail drawer has prev/next arrows to step through monthly rows
- [ ] Month detail drawer has NO Edit/Delete buttons (computed aggregations)
- [ ] Monthly rows: cursor-pointer on mobile (< lg), lg:cursor-default on desktop
- [ ] Uses shared CollapsibleYearTable and MobileDrawer
- [ ] PRD §5.4: Inline collapsible year rows with yearly totals, averages, and YoY change
- [ ] PRD §14 criterion 8: Utility detail shows year rows expandable to monthly detail
- [ ] PRD §14 criterion 9: Annual consumption/cost change % calculated and color-coded
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering year/month rows, expansion, and mobile interactions

## Testing Requirements
- **Test file**: `src/components/home/UtilityYearlyTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test card header shows "Yearly Summary"
- Test one row per calendar year with all required metrics
- Test current year labeled "YYYY (YTD)"
- Test expanding a year row reveals monthly summary rows
- Test change percentages color-coded: red for increase, green for decrease
- Test first year handles null change % gracefully (no prior year data)
- Test mobile column cycling for secondary columns
- Test mobile: tapping a monthly row opens month detail drawer
- Test month detail drawer shows all metrics and prev/next navigation
- Test month detail drawer has no Edit/Delete buttons (computed aggregations)
- Test loading state
- Test empty state (no data)

## Technical Notes
- File: `src/components/home/UtilityYearlyTable.tsx`
- Data from `calculateYearlySummaries()` and `calculateMonthlySummaries()` (US-087)
- The expand/collapse is handled by CollapsibleYearTable (US-040)
- Mobile column cycling: cycle through Avg Monthly, Consump. Change, Total Cost, Avg Mo. Cost, Cost/Unit, Cost Change
- Always-visible on mobile: Year and Consumption columns
- Mobile month drawer: monthly row data stored in `data-month` JSON attribute; drawer populated from it
- Month drawer navigation: track current row index, enable/disable prev/next buttons at bounds
