# US-128: Vehicle Detail — Vehicle Switcher

## Story
As the Insight platform user, I want a dropdown on the vehicle detail page to switch directly between vehicles so that I can navigate without returning to the overview.

## Dependencies
- US-032: DropdownSwitcher Component
- US-108: Vehicle Service

## Requirements
- DropdownSwitcher in vehicle detail header (PRD §8.2)
- Dropdown content:
  - "Vehicles Overview" link at top
  - Active vehicles section
  - Sold vehicles section (if any, muted)
  - Active vehicle highlighted
  - Edit vehicle button at bottom
- Desktop: absolute dropdown (w-64 to w-80)
- Mobile: full-width slide-down

## Shared Components Used
- `DropdownSwitcher` (US-032) — props: { currentId, items, sections, onSelect, overviewHref: "/vehicles" }

## UI Specification
Same pattern as platform switcher (US-072) and utility switcher (US-100), with vehicle-specific sections.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Desktop vehicle switcher dropdown: L161–197
- Back button + dropdown trigger with vehicle name, make/model/year: L163–177
- Dropdown panel with current vehicle highlighted, other vehicles, sold section: L178–196
- Mobile vehicle switcher in nav: L75–91
- Mobile dropdown with full vehicle list (Active/Sold sections, edit button): L101–156

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Vehicle name acts as dropdown trigger
- [ ] "Vehicles Overview" link at top
- [ ] Vehicles grouped: Active, Sold
- [ ] Current vehicle highlighted
- [ ] Edit vehicle button at bottom
- [ ] Desktop: absolute dropdown
- [ ] Mobile: full-width slide-down
- [ ] Click-outside dismisses
- [ ] PRD §8.2: Detail page entity switcher
- [ ] All tests pass and meet coverage target
- [ ] Switcher renders and navigates correctly with mocked vehicle list

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleSwitcher.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test vehicle name renders as dropdown trigger
- Test "Vehicles Overview" link present at top of dropdown
- Test vehicles grouped into Active and Sold sections
- Test current vehicle highlighted in dropdown
- Test edit vehicle button at bottom of dropdown
- Test click-outside dismisses dropdown
- Test selecting a vehicle navigates to correct route

## Technical Notes
- Part of `src/components/vehicles/VehicleDetail.tsx` header
- Vehicles fetched via TanStack Query: `useQuery({ queryKey: ['vehicles'], queryFn: vehicleService.getAll })`
- Navigate: `/vehicles/${selectedId}`
