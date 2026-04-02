# US-101: Utility Detail — Page Assembly

## Story
As the Insight platform user, I want all utility detail sections assembled into a complete page so that I have a comprehensive view of a single utility's data and trends.

## Dependencies
- US-095: Utility Detail — Header + Stat Cards
- US-096: Utility Detail — Chart
- US-097: Utility Detail — Yearly Table
- US-098: Utility Detail — Meter Readings Table
- US-099: Utility Detail — Bills Table
- US-100: Utility Detail — Utility Switcher

## Requirements
- Assemble all utility detail sections into the complete page (PRD §5.4)
- Section ordering (top to bottom):
  1. Utility switcher bar with back button (US-100 / US-095)
  2. Desktop action buttons (US-095)
  3. Mobile action buttons (lg:hidden)
  4. Summary KPI cards (US-095)
  5. Consumption & Cost chart card (US-096)
  6. Yearly Summary tabbed card (US-097)
  7. Meter Readings table card (US-098)
  8. Bills table card (US-099)
- Data fetching via TanStack Query (re-fetches automatically when `utilityId` changes); dialog open states in local component state

## Shared Components Used
- All section components: US-095 through US-100

## UI Specification

**Page layout:**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {/* Switcher bar + action buttons (US-095/100) */}
  {/* Mobile action buttons */}
  {/* Stat cards (US-095) */}
  {/* Chart card (US-096) */}
  {/* Yearly table (US-097) */}
  {/* Meter Readings table (US-098) */}
  {/* Bills table (US-099) */}
</div>
```

**Section spacing:** `mb-6 lg:mb-8` between all sections.

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Full page layout: L138-841 (switcher bar -> action buttons -> stat cards -> chart -> yearly table -> readings -> bills)
- Mobile drawers: month detail L868-910, reading detail L912-946, bill detail L948-986
- Edit reading dialog: L988+
- Delete confirm dialog referenced throughout

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-yearly.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-bills.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-reading.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-bill.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-delete-confirm.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-switcher.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-reading-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-bill-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-month-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-switcher.png`

## Acceptance Criteria
- [ ] All sections render in correct order
- [ ] Page loads utility data, readings, and bills on mount
- [ ] Data refreshes when switching utilities via switcher
- [ ] All dialogs (add reading, add bill, edit utility) functional
- [ ] Sections have correct vertical spacing
- [ ] Page uses max-w-[1440px] mx-auto
- [ ] Bottom padding clears mobile tab bar
- [ ] PRD §5.4: Utility detail page content matches spec

## Technical Notes
- File: `src/components/home/UtilityDetail.tsx`
- Route: `/home/utility/:utilityId` (registered in US-006)
- Custom hook `useUtilityData(utilityId)` encapsulates:
  1. `useQuery({ queryKey: ['utilities', utilityId], queryFn: () => utilityService.getOne(utilityId) })`
  2. `useQuery({ queryKey: ['meterReadings', utilityId], queryFn: () => meterReadingService.getByUtility(utilityId) })`
  3. `useQuery({ queryKey: ['utilityBills', utilityId], queryFn: () => utilityBillService.getByUtility(utilityId) })`
- TanStack Query automatically re-fetches when `utilityId` (the query key) changes — no manual re-fetch needed on switch
- Dialog open states in local component `useState`
