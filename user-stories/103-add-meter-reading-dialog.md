# US-103: Add Meter Reading Dialog

## Story
As the Insight platform user, I want a dialog to record meter readings so that I can quickly enter cumulative meter values with timestamps, notes, and optional photo attachments.

## Dependencies
- US-013: Button Component
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-080: Home (Utilities) TypeScript Types
- US-082: Meter Reading CRUD Service

## Requirements
- Modal dialog for creating and editing meter readings (PRD §9.6)
- **Fields:**
  1. **Utility** (select, required) — shown only when invoked from Home overview; pre-set and hidden when from utility detail page
  2. **Value** (number, required) — cumulative reading, with unit suffix from selected utility
  3. **Timestamp** (datetime-local, default: now)
  4. **Note** (text, optional) — e.g. "meter replaced, reading reset"
  5. **Attachment** (file, optional) — photo of meter display
- **"Save & Add Another"** (PRD §9): saves, clears form (keeping utility), resets timestamp to now
- **Edit mode**: pre-filled, no "Save & Add Another"
- Validation: value required (non-negative number), utility required if shown

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Reading" | "Edit Reading", isOpen, onClose, maxWidth: "md" }
- `SelectInput` (US-030) — for Utility select
- `NumberInput` (US-030) — for Value with unit suffix
- `DateTimeInput` (US-030) — for Timestamp
- `TextInput` (US-030) — for Note
- `FileUpload` (US-031) — for Attachment
- `Button` (US-013) — Cancel, Save & Add Another, Save

## UI Specification

**Value input with unit suffix:**
```
<div className="relative">
  <input type="number" className="pr-14 font-mono-data ..." />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data">
    {utility.unit}
  </span>
</div>
```

**Dialog footer (create mode):**
```
<footer className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3">
  <Button variant="ghost">Cancel</Button>
  <Button variant="saveAnother">Save & Add Another</Button>
  <Button variant="primary">Save</Button>
</footer>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Add Reading dialog: L429-478 (utility select, meter reading value, datetime, note, attachment, footer with Save & Add Another)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-reading.png`
- `design-artifacts/prototypes/screenshots/home/overview-desktop-add-reading.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-reading.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-reading-drawer.png`

## Acceptance Criteria
- [ ] Create mode: empty form with timestamp defaulting to now
- [ ] Edit mode: pre-filled with existing reading values
- [ ] Utility select shown when from overview, hidden when from detail page
- [ ] Value field shows unit suffix matching selected utility's unit
- [ ] Value is required — validation error if empty or negative
- [ ] Timestamp defaults to now
- [ ] Note is optional
- [ ] Attachment file upload works (photo of meter)
- [ ] "Save & Add Another" saves, clears form (keeping utility), resets timestamp
- [ ] "Save & Add Another" not shown in edit mode
- [ ] Save calls meterReadingService.create() / .update()
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet (optimized for quick entry)
- [ ] PRD §9.6: Meter reading dialog fields match spec
- [ ] PRD §14 criterion 2: User can register meter readings
- [ ] All tests pass and meet coverage target
- [ ] Dialog behavior verified by tests covering create/edit modes, validation, and submission

## Testing Requirements
- **Test file**: `src/components/home/dialogs/MeterReadingDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with mocked services via MSW
- **Coverage target**: 80%+ line coverage
- Test create mode opens with empty form and timestamp defaulting to now
- Test edit mode opens pre-populated with existing reading values
- Test utility select shown when invoked from overview (no utilityId prop), hidden when from detail page (utilityId provided)
- Test value field is required — validation error if empty or negative
- Test value field shows unit suffix matching selected utility's unit
- Test timestamp defaults to current datetime
- Test note field is optional (form submits without it)
- Test attachment file upload works (accepts image files, max 5MB)
- Test "Save & Add Another" saves, clears form (keeping utility), resets timestamp to now
- Test "Save & Add Another" not shown in edit mode
- Test save calls `meterReadingService.create()` / `.update()` with correct data
- Test cancel button closes dialog without saving
- Test error handling when save fails

## Technical Notes
- File: `src/components/home/dialogs/MeterReadingDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; reading?: MeterReading; utilityId?: string }`
- When `utilityId` provided: utility select hidden and pre-set
- Utility list via `useQuery({ queryKey: ['utilities'], queryFn: utilityService.getAll })`
- Use `useMutation` wrapping `meterReadingService.create()` / `.update()`; on success: invalidate `['meterReadings', utilityId]`, show toast
- Attachment via FormData for PocketBase file upload
