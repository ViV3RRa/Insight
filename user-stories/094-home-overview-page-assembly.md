# US-094: Home Overview — Page Assembly

## Story
As the Insight platform user, I want all Home overview sections assembled into a complete page so that I have a single, cohesive view of all my utilities after login.

## Dependencies
- US-089: Home Overview — Utility Summary Cards
- US-090: Home Overview — YoY Comparison Row
- US-091: Home Overview — Charts Area
- US-092: Home Overview — Add Utility Link
- US-093: Home Overview — Quick Actions
- US-013: Button Component

## Requirements
- Assemble all Home overview sections into the complete page (PRD §5.3)
- This is the **default landing page** after login (PRD §2.2, §5)
- Page header: "Home" title with subtitle (e.g. "3 utilities tracked · Updated Feb 1, 2026")
- Section ordering (top to bottom):
  1. Page header with title and desktop action buttons
  2. Mobile action buttons (lg:hidden)
  3. Utility summary cards (US-089)
  4. YoY comparison row (US-090)
  5. Monthly Overview chart card (US-091)
  6. "+ Add Utility" text link (US-092)
- Data fetching via TanStack Query; dialog open states in local component state

## Shared Components Used
- `Button` (US-013) — for action buttons
- All section components: US-089 through US-093

## UI Specification

**Desktop layout:**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {/* Page header */}
  <div className="flex items-center justify-between mb-6 lg:mb-8">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">Home</h1>
      <p className="text-sm text-base-400 mt-0.5">{utilities.length} utilities tracked · Updated {lastUpdateDate}</p>
    </div>
    {/* Desktop action buttons (US-093) */}
  </div>

  {/* Mobile action buttons (US-093) */}
  {/* Utility Summary Cards (US-089) */}
  {/* YoY Comparison Row (US-090) */}
  {/* Monthly Overview Chart (US-091) */}
  {/* "+ Add Utility" link (US-092) */}
</div>
```

**Mobile header (in nav bar):**
Title: "Home", subtitle: "3 utilities tracked"

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Full page layout: L91-401 (header -> mobile buttons -> utility cards -> YoY row -> charts -> add utility)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-desktop-dark.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-top.png`

## Acceptance Criteria
- [ ] Page renders all sections in correct order
- [ ] Desktop header shows "Home" title, subtitle with utility count, and action buttons
- [ ] Mobile: title in nav bar, action buttons below header
- [ ] This is the landing page after login
- [ ] All utility data fetched on mount
- [ ] "+ Add Reading" opens MeterReadingDialog
- [ ] "+ Add Bill" opens BillDialog
- [ ] "+ Add Utility" opens UtilityDialog
- [ ] Sections have correct vertical spacing (mb-6 lg:mb-8)
- [ ] Page content uses max-w-[1440px] mx-auto
- [ ] Bottom padding accounts for mobile tab bar (pb-24 lg:pb-10)
- [ ] Data refreshes when a new reading, bill, or utility is added
- [ ] PRD §5.3: Home overview layout matches spec
- [ ] PRD §14 criterion 7: Home overview shows summary cards per utility and combined charts
- [ ] All tests pass and meet coverage target
- [ ] Page assembly verified by integration-level test covering section composition and data flow

## Testing Requirements
- **Test file**: `src/components/home/HomeOverview.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test all sections render in correct order (header, mobile buttons, summary cards, YoY row, chart, add utility link)
- Test page header shows "Home" title and subtitle with utility count
- Test data fetching triggers on mount (TanStack Query integration)
- Test "+ Add Reading" button opens MeterReadingDialog
- Test "+ Add Bill" button opens BillDialog
- Test "+ Add Utility" link opens UtilityDialog
- Test data refreshes after adding a new reading, bill, or utility
- Test loading state while data is being fetched
- Test error state when data fetch fails
- Test page uses max-w-[1440px] container

## Technical Notes
- Add `data-testid` attributes to section wrappers for stable assembly test selectors
- File: `src/components/home/HomeOverview.tsx`
- Route: `/home` or `/` (default after login, registered in US-006)
- Custom hook `useHomeData()` encapsulates:
  1. `useQuery({ queryKey: ['utilities'], queryFn: utilityService.getAll })`
  2. Per-utility `useQuery` calls for readings and bills, or a combined fetch
- TanStack Query handles loading/error states; pass `isLoading`/`data` down to section components
- Dialog open states in local component `useState`
- Subtitle "Updated" date: most recent meter reading or bill across all utilities
