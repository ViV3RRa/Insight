# US-118: Vehicles Overview — Page Assembly

## Story
As the Insight platform user, I want all Vehicles overview sections assembled into a complete page so that I have a cohesive view of all my vehicles with quick access to data entry.

## Dependencies
- US-116: Vehicles Overview — Active Vehicle Cards
- US-117: Vehicles Overview — Sold Vehicle Cards
- US-013: Button Component

## Requirements
- Assemble all Vehicles overview sections (PRD §7.4)
- Page header: "Vehicles" title with subtitle (count + updated)
- Quick-add buttons (from ui-analysis §2.5):
  - "+ Add Refueling" (secondary)
  - "+ Add Maintenance" (primary)
- Desktop: buttons in header row. Mobile: full-width below header.
- "+ Add Vehicle" button at bottom
- Section ordering:
  1. Page header + desktop action buttons
  2. Mobile action buttons (lg:hidden)
  3. Active vehicle cards grid (US-116)
  4. Sold Vehicles accordion (US-117)
  5. "+ Add Vehicle" text link

## Shared Components Used
- `Button` (US-013) — action buttons

## UI Specification

**Desktop layout:**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  <div className="flex items-center justify-between mb-6 lg:mb-8">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">Vehicles</h1>
      <p className="text-sm text-base-400 mt-0.5">{activeCount} active · Updated {lastRefuelingDate}</p>
    </div>
    <div className="hidden lg:flex items-center gap-2">
      <Button variant="secondary" size="sm">+ Add Refueling</Button>
      <Button variant="primary" size="sm">+ Add Maintenance</Button>
    </div>
  </div>
  {/* Mobile action buttons */}
  {/* Active cards grid (US-116) */}
  {/* Sold vehicles (US-117) */}
  {/* "+ Add Vehicle" link */}
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Full page layout: L1–638
- Nav with section tabs (Vehicles active): L58–86
- Desktop page header with title, subtitle, action buttons: L90–101
- Mobile action buttons (full-width): L103–107
- Active vehicle cards grid: L109–225
- Sold vehicles accordion: L227–288
- Mobile bottom tab bar: L292–312

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] All sections render in correct order
- [ ] Desktop header: title, subtitle, action buttons
- [ ] Mobile: action buttons full-width below header
- [ ] "+ Add Refueling" opens RefuelingDialog with vehicle select
- [ ] "+ Add Maintenance" opens MaintenanceDialog with vehicle select
- [ ] "+ Add Vehicle" opens VehicleDialog in create mode
- [ ] Active vehicle cards in grid
- [ ] Sold vehicles in collapsible section (if any)
- [ ] Correct spacing and max-width
- [ ] PRD §7.4: Vehicles overview layout matches spec
- [ ] All tests pass and meet coverage target
- [ ] Page composes all child sections correctly

## Testing Requirements
- **Test file**: `src/components/vehicles/VehiclesOverview.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test active vehicle cards section and sold vehicles section both compose on page
- Test page header renders title "Vehicles" with correct subtitle
- Test action buttons render ("+ Add Refueling", "+ Add Maintenance")
- Test "+ Add Vehicle" link present
- Test correct section ordering (header, active cards, sold accordion)
- Test loading state renders skeleton/loading indicator
- Test empty state when no vehicles exist

## Technical Notes
- Add `data-testid` attributes to section wrappers for stable assembly test selectors
- File: `src/components/vehicles/VehiclesOverview.tsx`
- Route: `/vehicles` (registered in US-006)
- `useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.getAll })` for vehicle list; metrics computed from query data
- Dialog open states in local component `useState`
