# US-104: Add Bill Dialog

## Story
As the Insight platform user, I want a dialog to record utility bills so that I can enter bill amounts with their coverage periods for automatic amortization.

## Dependencies
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-080: Home (Utilities) TypeScript Types
- US-083: Utility Bill CRUD Service

## Requirements
- Modal dialog for creating and editing bills (PRD §9.7)
- **Fields:**
  1. **Utility** (select, required) — shown only when from overview; hidden when from detail page
  2. **Amount** (number, required) — total billed amount, with "DKK" suffix
  3. **Period start** (date, required) — first day the bill covers
  4. **Period end** (date, required) — last day the bill covers
  5. **Date received** (datetime-local, optional, default: now)
  6. **Note** (text, optional)
  7. **Attachment** (file, optional) — scanned bill / PDF
- **"Save & Add Another"** (PRD §9): saves, clears form (keeping utility), resets date received to now
- **Edit mode**: pre-filled, no "Save & Add Another"
- Validation:
  - Amount required, positive number
  - Period start and period end required
  - Period end must be >= period start

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Bill" | "Edit Bill", isOpen, onClose, maxWidth: "md" }
- `SelectInput` (US-030) — for Utility select
- `NumberInput` (US-030) — for Amount with "DKK" suffix
- `DateInput` (US-030) — for Period start and Period end
- `DateTimeInput` (US-030) — for Date received
- `TextInput` (US-030) — for Note
- `FileUpload` (US-031) — for Attachment
- `Button` (US-013) — Cancel, Save & Add Another, Save

## UI Specification

**Period fields (side by side):**
```
<div className="grid grid-cols-2 gap-3">
  <DateInput label="Period Start" required value={periodStart} />
  <DateInput label="Period End" required value={periodEnd} />
</div>
```

**Validation error for period:**
```
{periodEnd < periodStart && (
  <p className="text-xs text-rose-500 mt-1">Period end must be on or after period start</p>
)}
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Add Bill dialog: L480-538 (utility select, amount DKK, period start/end grid, date received, note, attachment, footer)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-bill.png`
- `design-artifacts/prototypes/screenshots/home/overview-desktop-add-bill.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-bill.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-bill-drawer.png`

## Acceptance Criteria
- [ ] Create mode: empty form with date received defaulting to now
- [ ] Edit mode: pre-filled with existing bill values
- [ ] Utility select shown when from overview, hidden when from detail page
- [ ] Amount field shows "DKK" suffix
- [ ] Amount required and positive
- [ ] Period start and period end required
- [ ] Validation: period end >= period start
- [ ] Date received optional, defaults to now
- [ ] Note is optional
- [ ] Attachment file upload works (PDF/image)
- [ ] "Save & Add Another" saves, clears form (keeping utility), resets date received
- [ ] "Save & Add Another" not shown in edit mode
- [ ] Save calls utilityBillService.create() / .update()
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet
- [ ] PRD §9.7: Bill dialog fields match spec
- [ ] PRD §14 criterion 3: User can register bills with amount, period range, note, attachment

## Technical Notes
- File: `src/components/home/dialogs/BillDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; bill?: UtilityBill; utilityId?: string }`
- Use `useMutation` wrapping `utilityBillService.create()` / `.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['utilityBills', utilityId] })`, show toast
- Period start/end: date-only inputs (not datetime)
- The amortization (US-085) happens automatically in the calculation layer when bill data changes
- Attachment via FormData
