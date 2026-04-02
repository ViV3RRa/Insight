# US-131: Add Refueling Dialog

## Story
As the Insight platform user, I want a dialog to record refueling events so that I can quickly enter fuel amount, cost, and odometer reading — especially at the pump on mobile.

## Dependencies
- US-013: Button Component
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-107: Vehicle TypeScript Types
- US-109: Refueling CRUD Service

## Requirements
- Modal dialog for creating and editing refuelings (PRD §9.9)
- **Fields:**
  1. **Vehicle** (select, required) — shown only when from overview; hidden when from detail
  2. **Date** (date, required, default: today)
  3. **Fuel amount** (number, required) — label shows "Liters" or "kWh" based on vehicle fuel type
  4. **Cost per unit** (number, required) — label shows "DKK/liter" or "DKK/kWh"
  5. **Total cost** (number, auto-computed from `fuelAmount × costPerUnit`, editable override)
  6. **Odometer reading** (number, required) — total km
  7. **Station** (text, optional)
  8. **Charged at home** (checkbox, only for EVs, default: false)
  9. **Note** (text, optional)
  10. **Receipt** (file, optional) — photo of receipt
  11. **Trip counter photo** (file, optional) — photo of odometer
- **"Save & Add Another"** (PRD §9): saves, clears form (keeping vehicle), resets date to today
- Auto-compute: when fuel amount or cost per unit changes, total cost updates live. User can override total.
- **Mobile-optimized** for entry at the pump (PRD §8.3, §13)

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Refueling" | "Edit Refueling", isOpen, onClose, maxWidth: "md" }
- `SelectInput`, `NumberInput`, `DateInput`, `TextInput` (US-030)
- `FileUpload` (US-031) — for Receipt and Trip counter photo
- `Button` (US-013)

## UI Specification

**Auto-compute total cost:**
```
const computedTotal = fuelAmount * costPerUnit;
// If user hasn't manually overridden, show computed value
// If user edits total directly, mark as overridden
```

**Charged at home (EVs only):**
```
{vehicle?.fuelType === 'Electric' && (
  <label className="flex items-center gap-2 text-sm">
    <input type="checkbox" checked={chargedAtHome} onChange={...} />
    Charged at home
  </label>
)}
```

**File uploads (side by side):**
```
<div className="grid grid-cols-2 gap-3">
  <FileUpload label="Receipt" accept="image/*" />
  <FileUpload label="Trip Counter" accept="image/*" />
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Add Refueling dialog (with vehicle select): L373–465
- Fields: Vehicle select, Date, Fuel Amount + Cost per Unit (2-col), Total Cost (auto-computed), Odometer, Station + Note (2-col), Attachments (Receipt + Odometer Photo): L382–456

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Add Refueling dialog (no vehicle select, same fields): L781–850
- Edit Refueling dialog (pre-filled with values): L852–881
- "Save & Add Another" button alongside primary action: L845–846

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] Vehicle select shown from overview, hidden from detail
- [ ] Date defaults to today
- [ ] Fuel amount label changes based on fuel type (Liters / kWh)
- [ ] Cost per unit label changes based on fuel type (DKK/liter / DKK/kWh)
- [ ] Total cost auto-computed from fuelAmount × costPerUnit
- [ ] Total cost editable (override)
- [ ] Odometer reading required
- [ ] "Charged at home" checkbox only for electric vehicles
- [ ] Receipt and trip counter photo uploads work
- [ ] "Save & Add Another" saves, clears, keeps vehicle, resets date
- [ ] No "Save & Add Another" in edit mode
- [ ] Desktop: centered modal. Mobile: bottom sheet (optimized for pump entry)
- [ ] PRD §9.9: Refueling dialog fields match spec
- [ ] PRD §14 criterion 30: Fuel-type-appropriate units
- [ ] PRD §14 criterion 31: EV refueling includes charged-at-home flag
- [ ] All tests pass and meet coverage target
- [ ] Dialog renders correctly in both create and edit modes

## Testing Requirements
- **Test file**: `src/components/vehicles/dialogs/RefuelingDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with mocked services via MSW
- **Coverage target**: 80%+ line coverage
- Test all required fields validated: date, fuelAmount, costPerUnit, odometerReading
- Test fuel type adaptation: labels show "Liters" / "DKK/liter" for Petrol/Diesel and "kWh" / "DKK/kWh" for Electric
- Test "Charged at home" checkbox only visible for Electric vehicles, hidden for others
- Test auto-compute: `totalCost = fuelAmount * costPerUnit` updates live when inputs change
- Test totalCost is editable (user can override auto-computed value)
- Test odometer reading required and validated as positive number
- Test receipt and tripCounterPhoto file uploads work
- Test "Save & Add Another" saves, clears form (keeping vehicle), resets date to today
- Test "Save & Add Another" not shown in edit mode
- Test edit mode pre-populates with existing refueling values
- Test vehicle select shown when opened from overview, hidden from detail
- Test cancel/close dismisses dialog without saving

## Technical Notes
- File: `src/components/vehicles/dialogs/RefuelingDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; refueling?: Refueling; vehicleId?: string }`
- Use `useMutation` wrapping `refuelingService.create()` / `.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['refuelings', vehicleId] })`, show toast
- Vehicle fuel type drives label text and chargedAtHome visibility
- Total cost auto-compute with override tracking
- Mobile form should be quick to fill (number inputs, large touch targets)
