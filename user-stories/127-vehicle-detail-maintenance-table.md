# US-127: Vehicle Detail — Maintenance Log Table

## Story
As the Insight platform user, I want a collapsible maintenance log table on the vehicle detail page so that I can review, edit, and manage all maintenance events.

## Dependencies
- US-023: CollapsibleSection (Accordion) Component
- US-025: DataTable Component
- US-110: Maintenance Event CRUD Service

## Requirements
- Maintenance log in a collapsible table, collapsed by default (PRD §3.6, §7.5)
- Table columns:
  1. **Date**: formatted per locale
  2. **Description**: what was done
  3. **Cost**: amount in DKK
  4. **Note**: optional note (italic, muted)
  5. **Actions**: Edit/Delete (desktop), hover reveal
- Receipt thumbnail: if receipt file exists, small icon link
- Sorted by date descending
- Edit opens MaintenanceDialog (US-134) pre-filled
- Delete triggers confirmation dialog

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Maintenance Log", icon: Wrench, count: events.length }
- `DataTable` (US-025) — props: { columns, data, onEdit, onDelete }

## UI Specification

**Table columns:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Date | left | locale date | always visible |
| Description | left | text-sm | always visible |
| Cost | right | font-mono-data + DKK | always visible |
| Note | left | italic text-xs | hidden sm |
| Actions | right | Edit/Delete (hover) | hidden sm |

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Maintenance log tab: L613–650
- Table header with record count + "Add Maintenance" button: L615–617
- Table columns (Date, Description, Cost, Note, Actions): L621–628
- Row with hover-reveal edit/delete actions: L631–647
- Mobile-hidden Note column via `hidden sm:table-cell`: L626

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Maintenance table collapsible and collapsed by default
- [ ] Count badge in header
- [ ] Description column shows what was done
- [ ] Cost displayed in DKK
- [ ] Notes as italic muted text
- [ ] Receipt link when file attached
- [ ] Row actions on hover
- [ ] Mobile: Note column hidden
- [ ] Edit opens MaintenanceDialog pre-filled
- [ ] Delete opens confirmation
- [ ] Sorted by date descending
- [ ] PRD §7.5: Maintenance log table
- [ ] All tests pass and meet coverage target
- [ ] Table renders with mocked maintenance events

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleMaintenanceTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test table renders all maintenance events with correct columns (Date, Description, Cost, Note)
- Test cost displayed in DKK format
- Test notes rendered as italic muted text
- Test receipt link shown when file attached
- Test table is collapsible and collapsed by default
- Test count badge in header matches event count
- Test row actions (edit/delete) appear on hover
- Test sorted by date descending
- Test loading and empty states

## Technical Notes
- Part of `src/components/vehicles/VehicleDetail.tsx`
- Events from `maintenanceService.getByVehicle(vehicleId)` (US-110)
