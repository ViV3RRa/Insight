# US-129: Vehicle Detail — Page Assembly

## Story
As the Insight platform user, I want all vehicle detail sections assembled into a complete page so that I have a comprehensive view of a single vehicle's data, metrics, and history.

## Dependencies
- US-119: Vehicle Detail — Header + Metadata
- US-120: Vehicle Detail — Stat Cards
- US-121: Vehicle Detail — YoY Comparison Row
- US-122: Vehicle Detail — Fuel Efficiency Chart
- US-123: Vehicle Detail — Monthly Fuel Cost Chart
- US-124: Vehicle Detail — Monthly km Chart
- US-125: Vehicle Detail — Maintenance Cost Timeline
- US-126: Vehicle Detail — Refueling Log Table
- US-127: Vehicle Detail — Maintenance Log Table
- US-128: Vehicle Detail — Vehicle Switcher

## Requirements
- Assemble all vehicle detail sections (PRD §7.5)
- Charts in a collapsible accordion section (from ui-analysis §2.6)
- Section ordering:
  1. Vehicle switcher bar (US-128)
  2. Action buttons
  3. Vehicle header card (US-119)
  4. Stat cards (US-120)
  5. YoY comparison row (US-121)
  6. Charts accordion: Efficiency (US-122), Monthly Fuel Cost + km pair (US-123/124), Maintenance (US-125)
  7. Refueling log (US-126)
  8. Maintenance log (US-127)
- Data fetching via TanStack Query; re-fetches automatically when `vehicleId` changes

## Shared Components Used
- `CollapsibleSection` (US-023) — for charts accordion
- All section components

## UI Specification

**Page layout:**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {/* Switcher + action buttons */}
  {/* Vehicle header card */}
  {/* Stat cards */}
  {/* YoY row */}
  {/* Charts accordion */}
  {/* Refueling log */}
  {/* Maintenance log */}
</div>
```

**Charts accordion (from ui-analysis §2.6):**
```
<CollapsibleSection title="Charts & Analysis" defaultExpanded={false}>
  <div className="space-y-4">
    <VehicleEfficiencyChart />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <VehicleFuelCostChart />
      <VehicleKmChart />
    </div>
    <VehicleMaintenanceChart />
  </div>
</CollapsibleSection>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Full page layout: L1–1044 (ITERATION 1/3 — nav, header, stat cards, YoY row, charts, tables, and dialogs are present)
- Desktop vehicle switcher + action buttons: L161–208
- Vehicle header card: L216–259
- Stat cards: L261–298
- YoY comparison row: L300–344
- Charts accordion (collapsed by default): L346–446
- Tabs section (Performance, Refueling, Maintenance): L448–651
- Dialogs (Add/Edit Refueling, Add/Edit Maintenance, Edit Vehicle, Delete Confirm): L777–1008

**Note:** This prototype is labeled ITERATION 1/3. All major sections are present but some may receive further refinement in future iterations.

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] All sections in correct order
- [ ] Charts in collapsible accordion
- [ ] Fuel cost and km charts side-by-side on desktop
- [ ] Data loads on mount and refreshes on vehicle switch
- [ ] All dialogs functional
- [ ] Correct spacing
- [ ] PRD §7.5: Vehicle detail page content matches spec
- [ ] PRD §14 criterion 36: Vehicle detail shows all charts and collapsible data tables
- [ ] All tests pass and meet coverage target
- [ ] Page composes all child sections correctly

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleDetail.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test all sections render in correct order (switcher, header, stats, YoY, charts, tables)
- Test charts accordion section is collapsible
- Test fuel cost and km charts render side-by-side on desktop (grid-cols-2)
- Test data loads on mount with correct query keys
- Test data refreshes when vehicleId route param changes
- Test loading state renders skeleton/loading indicators
- Test error state handled gracefully

## Technical Notes
- File: `src/components/vehicles/VehicleDetail.tsx`
- Route: `/vehicles/:vehicleId` (registered in US-006)
- Custom hook `useVehicleData(vehicleId)` encapsulates:
  1. `useQuery({ queryKey: ['vehicles', vehicleId], queryFn: () => vehicleService.getOne(vehicleId) })`
  2. `useQuery({ queryKey: ['refuelings', vehicleId], queryFn: () => refuelingService.getByVehicle(vehicleId) })`
  3. `useQuery({ queryKey: ['maintenanceEvents', vehicleId], queryFn: () => maintenanceEventService.getByVehicle(vehicleId) })`
- Dialog open states in local component `useState`
