# US-126: Vehicle Detail — Refueling Log Table

## Story
As the Insight platform user, I want a collapsible refueling log table on the vehicle detail page so that I can review, edit, and manage all refueling records with their details.

## Dependencies
- US-023: CollapsibleSection (Accordion) Component
- US-025: DataTable Component
- US-109: Refueling CRUD Service

## Requirements
- Refueling log in a collapsible table, collapsed by default (PRD §3.6, §7.5)
- Table columns (PRD §7.5):
  1. **Date**: formatted per locale
  2. **Fuel**: amount (liters or kWh based on vehicle fuelType)
  3. **DKK/L** (or DKK/kWh): cost per unit
  4. **Total**: total cost (DKK)
  5. **Odometer**: km reading
  6. **Efficiency**: per-refueling efficiency (km/l or km/kWh) — derived from odometer delta
  7. **Station**: optional station name
  8. **Actions**: Edit/Delete (desktop), hover opacity reveal
- For EVs: additional "Home" column with home-charging indicator
- Row actions on hover: `opacity-0 group-hover:opacity-100`
- Sorted by date descending
- Edit opens RefuelingDialog (US-133) pre-filled
- Delete triggers confirmation dialog

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Refueling Log", icon: Fuel, count: refuelings.length }
- `DataTable` (US-025) — props: { columns, data, onEdit, onDelete }
- `Button` (US-013) — for "+ Add Refueling" header action button and row edit/delete actions

## UI Specification

**Table columns (from ui-analysis §2.6):**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Date | left | locale date | always visible |
| Fuel | right | font-mono-data + unit (L/kWh) | always visible |
| DKK/L | right | font-mono-data | hidden sm |
| Total | right | font-mono-data + DKK | hidden sm |
| Odometer | right | font-mono-data + km | hidden sm |
| Efficiency | right | font-mono-data + unit | hidden sm |
| Station | left | text-xs text-base-400 | hidden sm |
| Actions | right | Edit/Delete (hover) | hidden sm |

**Note:** Vehicles tables do NOT use mobile column cycling — columns are simply hidden via `hidden sm:table-cell` (from ui-analysis §3.7 note).

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Refueling log tab: L527–611
- Tab bar with Performance/Refueling/Maintenance tabs: L452–457
- Refueling table header with record count + "Add Refueling" button: L529–531
- Table columns (Date, Fuel, DKK/L, Total, Odometer, Efficiency, Station, Actions): L534–544
- Row with hover-reveal edit/delete actions: L548–607
- Mobile-hidden columns via `hidden sm:table-cell` and `hidden lg:table-cell`: L538–543

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Refueling table collapsible and collapsed by default
- [ ] Count badge in header
- [ ] Fuel column shows amount with correct unit (L or kWh)
- [ ] Efficiency derived from odometer delta / fuel consumed
- [ ] First refueling shows "—" for efficiency (no prior odometer)
- [ ] Station displayed when present
- [ ] For EVs: home-charging indicator visible
- [ ] Row actions on hover (edit/delete)
- [ ] Mobile: secondary columns hidden (no cycling)
- [ ] Edit opens RefuelingDialog pre-filled
- [ ] Delete opens confirmation
- [ ] Sorted by date descending
- [ ] PRD §7.5: Refueling log table with all required columns
- [ ] PRD §14 criterion 36: Vehicle detail shows collapsible data tables
- [ ] All tests pass and meet coverage target
- [ ] Table renders with mocked refueling records

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleRefuelingTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test table renders all refueling records with correct columns
- Test fuel column shows amount with correct unit (L or kWh based on fuelType)
- Test efficiency derived from odometer delta / fuel consumed
- Test first refueling shows dash for efficiency (no prior odometer)
- Test EV vehicles show home-charging indicator column
- Test table is collapsible and collapsed by default
- Test count badge in header matches record count
- Test row actions (edit/delete) appear on hover
- Test sorted by date descending
- Test loading and empty states

## Technical Notes
- Part of `src/components/vehicles/VehicleDetail.tsx`
- Refuelings from `refuelingService.getByVehicle(vehicleId)` (US-109)
- Efficiency per row: compute from odometer delta between this and previous refueling
- Unit labels driven by `vehicle.fuelType`
