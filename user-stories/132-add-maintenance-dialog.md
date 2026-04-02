# US-132: Add Maintenance Event Dialog

## Story
As the Insight platform user, I want a dialog to record maintenance events so that I can track service history and costs for each vehicle.

## Dependencies
- US-013: Button Component
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-107: Vehicle TypeScript Types
- US-110: Maintenance Event CRUD Service

## Requirements
- Modal dialog for creating and editing maintenance events (PRD §9.10)
- **Fields:**
  1. **Vehicle** (select, required) — shown only when from overview; hidden from detail
  2. **Date** (date, required, default: today)
  3. **Description** (text, required) — what was done
  4. **Cost** (number, required) — DKK suffix
  5. **Note** (text, optional)
  6. **Receipt** (file, optional) — receipt image
- **"Save & Add Another"**: saves, clears, keeps vehicle, resets date
- Edit mode: pre-filled, no "Save & Add Another"

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Maintenance" | "Edit Maintenance", isOpen, onClose, maxWidth: "md" }
- `SelectInput`, `TextInput`, `NumberInput`, `DateInput` (US-030)
- `FileUpload` (US-031)
- `Button` (US-013)

## UI Specification

Standard dialog layout with form fields in `space-y-4`.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Add Maintenance dialog (with vehicle select): L467–518
- Fields: Vehicle select, Date, Description, Cost (DKK), Note, Receipt upload: L476–510

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Add Maintenance dialog (no vehicle select): L883–904
- Edit Maintenance dialog (pre-filled): L906–928
- "Save & Add Another" button: L899

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] Vehicle select shown from overview, hidden from detail
- [ ] Date defaults to today
- [ ] Description required
- [ ] Cost required, with DKK suffix
- [ ] Note optional
- [ ] Receipt upload works
- [ ] "Save & Add Another" saves and clears (keeping vehicle)
- [ ] Edit mode pre-filled, no "Save & Add Another"
- [ ] Desktop: centered modal. Mobile: bottom sheet.
- [ ] PRD §9.10: Maintenance dialog fields match spec
- [ ] PRD §14 criterion 32: User can register maintenance events
- [ ] All tests pass and meet coverage target
- [ ] Dialog renders correctly in both create and edit modes

## Testing Requirements
- **Test file**: `src/components/vehicles/dialogs/MaintenanceDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with mocked services via MSW
- **Coverage target**: 80%+ line coverage
- Test required fields validated: date, description, cost
- Test date defaults to today in create mode
- Test cost field has DKK suffix
- Test receipt upload works (5MB limit, accepts image and PDF)
- Test "Save & Add Another" saves, clears form (keeping vehicle), resets date to today
- Test "Save & Add Another" not shown in edit mode
- Test edit mode pre-populates with existing maintenance event values
- Test vehicle select shown when opened from overview, hidden from detail
- Test cancel/close dismisses dialog without saving
- Test validation errors displayed for missing required fields

## Technical Notes
- File: `src/components/vehicles/dialogs/MaintenanceDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; event?: MaintenanceEvent; vehicleId?: string }`
- Use `useMutation` wrapping `maintenanceEventService.create()` / `.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['maintenanceEvents', vehicleId] })`, show toast
