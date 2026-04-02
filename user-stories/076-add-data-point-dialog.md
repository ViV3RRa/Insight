# US-076: Add Data Point Dialog

## Story
As the Insight platform user, I want a dialog to record data points (value observations) for my investment platforms so that I can track platform values over time with minimal friction.

## Dependencies
- US-013: Button Component
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-041: Investment TypeScript Types
- US-044: Data Point CRUD Service
- US-043: Platform CRUD Service

## Requirements
- Modal dialog for creating and editing data points (PRD §9.3)
- **Fields:**
  1. **Platform** (select, required) — shown only when invoked from portfolio overview; pre-set and hidden when invoked from a platform detail page
  2. **Value** (number, required) — in platform's native currency. Input has currency suffix (e.g. "DKK" or "EUR")
  3. **Timestamp** (datetime-local, default: now)
  4. **Note** (text, optional)
- **"Save & Add Another"** button alongside primary Save (PRD §9):
  - Saves the current record, clears the form (except platform selection), and keeps the dialog open
  - Timestamp resets to now
- **Edit mode**: Title "Edit Data Point", pre-filled with existing values. No "Save & Add Another" in edit mode.
- **Edit mode — interpolated data points**: When editing an interpolated (system-generated) data point, show an amber info banner at the top of the form body:
  - Banner: `flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg`
  - Icon: Info circle (w-4 h-4 text-amber-500 shrink-0 mt-0.5)
  - Text: `text-xs text-amber-700 dark:text-amber-300` — "This is an interpolated (estimated) value. Saving will replace it with your actual observed value."
  - Banner is hidden by default and shown only when the data point being edited has `isInterpolated: true`
- Form validation:
  - Value is required and must be a non-negative number
  - Platform is required (if field is shown)
  - Timestamp is required
- Platform select shows only platforms from the active portfolio, grouped by type (Investment / Cash)

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Data Point" | "Edit Data Point", isOpen, onClose, maxWidth: "md" }
- `SelectInput` (US-030) — for Platform select (with option groups)
- `NumberInput` (US-030) — for Value with currency suffix
- `DateTimeInput` (US-030) — for Timestamp
- `TextInput` (US-030) — for Note
- `Button` (US-013) — Cancel (ghost), Save & Add Another (secondary), Save (primary)

## UI Specification

**Dialog footer (create mode):**
```
<footer className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button variant="saveAnother" onClick={handleSaveAndAddAnother}>Save & Add Another</Button>
  <Button variant="primary" onClick={handleSave}>Save</Button>
</footer>
```

**Dialog footer (edit mode):**
```
<footer className="px-5 sm:px-6 py-4 flex items-center justify-end gap-3">
  <Button variant="ghost" onClick={onClose}>Cancel</Button>
  <Button variant="primary" onClick={handleSave}>Save</Button>
</footer>
```

**Value input with currency suffix:**
```
<div className="relative">
  <input type="number" className="pr-14 font-mono-data ..." />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-base-300 dark:text-base-500 font-mono-data">
    {platform.currency}
  </span>
</div>
```

**Platform select (grouped):**
- Group 1: "Investment" — investment platforms
- Group 2: "Cash" — cash platforms

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L1238–1293 — Add Data Point from overview (with platform selector)
- `design-artifacts/prototypes/platform-detail.html` L1684–1720 — Add Data Point from detail (no platform selector, value + datetime + note fields)
- `design-artifacts/prototypes/platform-detail.html` L1842–1882 — Edit Data Point dialog (with interpolation banner L1852–1856)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-dp-drawer.png`

## Acceptance Criteria
- [ ] Dialog opens in create mode with default timestamp of now
- [ ] Dialog opens in edit mode pre-filled with existing data point values
- [ ] Platform select shown when invoked from overview, hidden when from detail page
- [ ] Platform options grouped by type (Investment / Cash)
- [ ] Value field shows currency suffix matching selected platform's currency
- [ ] Value is required — validation error if empty or negative
- [ ] Timestamp defaults to now and is required
- [ ] Note field is optional
- [ ] "Save & Add Another" saves, clears form (keeping platform), resets timestamp to now
- [ ] "Save & Add Another" not shown in edit mode
- [ ] Edit mode for interpolated data points shows amber info banner explaining the value is estimated
- [ ] Banner hidden for non-interpolated data points in edit mode
- [ ] Save calls dataPointService.create() for new, dataPointService.update() for edit
- [ ] Dialog closes and data refreshes on successful Save
- [ ] Dialog stays open after "Save & Add Another" with cleared form
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet with drag handle
- [ ] PRD §9.3: Data point dialog fields match spec
- [ ] PRD §9: "Save & Add Another" for high-frequency data entry
- [ ] PRD §14 criterion 15: User can register data points
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/dialogs/DataPointDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with mocked services via MSW
- **Coverage target**: 80%+ line coverage
- Test create mode: empty form with timestamp defaulting to now (use `vi.useFakeTimers()`), successful submission calls dataPointService.create()
- Test edit mode: pre-populated fields, updates via dataPointService.update()
- Test cancellation: dialog closes, no service calls, no side effects
- Test error handling: service failure shows error toast, dialog stays open
- Test form validation: Value required and must be non-negative (non-numeric error shown), Platform required (when field is shown), Timestamp required
- Test loading state on submit button during mutation
- Test that platform select is shown when invoked from overview, hidden when from detail page
- Test that platform options are grouped by type (Investment / Cash)
- Test that value field shows currency suffix matching selected platform's currency
- Test "Save & Add Another": saves, clears form (keeping platform), resets timestamp to now, dialog stays open
- Test that "Save & Add Another" is not shown in edit mode
- Test that edit mode for interpolated data points shows amber info banner
- Test that banner is hidden for non-interpolated data points

## Technical Notes
- File: `src/components/portfolio/dialogs/DataPointDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; dataPoint?: DataPoint; platformId?: string; portfolioId: string }`
- When `platformId` is provided, the platform select is hidden and pre-set
- When invoked from overview, `platformId` is undefined and the select is shown
- Platform list fetched via `useQuery({ queryKey: ['platforms', portfolioId], ... })`
- Use `useMutation` wrapping `dataPointService.create()` / `dataPointService.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['dataPoints', platformId] })`, show toast
- On "Save & Add Another": mutation success, show toast (US-033), clear value/note/timestamp, keep platform selected
