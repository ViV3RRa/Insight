# US-075: Add/Edit Platform Dialog

## Story
As the Insight platform user, I want a dialog to create and edit investment and cash platforms so that I can manage each financial entity's metadata and lifecycle within a portfolio.

## Dependencies
- US-013: Button Component
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-041: Investment TypeScript Types
- US-043: Platform CRUD Service

## Requirements
- Modal dialog for creating and editing platforms (PRD §9.2)
- **Create mode fields:**
  1. **Icon** (image upload, required) — circular preview, clickable to replace
  2. **Name** (text, required) — e.g. "Nordnet", "Interactive Brokers"
  3. **Type** (select: Investment / Cash, required) — only on creation
  4. **Currency** (select: DKK, EUR, etc., required) — only on creation
- **Edit mode fields:**
  1. **Icon** (image upload, required) — shows current icon, clickable to replace
  2. **Name** (text, required)
  3. **Type** — displayed as read-only badge (immutable after creation, PRD §9.2)
  4. **Currency** — displayed as read-only badge (immutable after creation, PRD §9.2)
  5. **Close Platform** section (danger zone):
     - Expandable section with rose-colored border/background
     - "Close Platform" trigger button (danger-trigger style)
     - When expanded: Closure date (date, required), Closure note (text, optional)
     - Confirm closure button
- For already-closed platforms in edit mode: show closure info and "Reopen Platform" option
- Form validation:
  - Icon is required — show error if missing on submit
  - Name is required — show error if empty on submit
  - Type is required on creation — show error if not selected
  - Currency is required on creation — show error if not selected
- On successful save: close dialog, refresh platform list

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Platform" | "Edit Platform", isOpen, onClose, maxWidth: "md" }
- `TextInput` (US-030) — for Name field
- `SelectInput` (US-030) — for Type and Currency fields
- `DateInput` (US-030) — for Closure date
- `FileUpload` (US-031) — for Icon upload with circular preview
- `Button` (US-013) — Cancel, Save, Close Platform actions

## UI Specification

**Icon upload area (top of form):**
```
<div className="flex justify-center mb-4">
  <button className="relative w-16 h-16 rounded-full overflow-hidden bg-base-100 dark:bg-base-700 border-2 border-dashed border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500 transition-colors">
    {iconPreview ? (
      <img src={iconPreview} className="w-full h-full object-cover" />
    ) : (
      <Upload className="w-5 h-5 text-base-300 mx-auto" />
    )}
  </button>
</div>
```

**Close Platform danger zone (edit mode only, active platforms only):**
```
<div className="mt-4 pt-4 border-t border-base-100 dark:border-base-700">
  <button className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors">
    Close Platform
  </button>
  {showCloseFields && (
    <div className="mt-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 space-y-3">
      <DateInput label="Closure Date" required />
      <TextInput label="Closure Note" optional placeholder="Reason for closing" />
      <Button variant="destructive">Confirm Close</Button>
    </div>
  )}
</div>
```

**Type and Currency fields (create mode):**
Type select options: Investment, Cash
Currency select options: DKK, EUR (extensible)

**Type and Currency display (edit mode):**
Read-only badges showing current type and currency.

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L1186–1236 — Add Platform dialog (icon upload + name + type/currency selects)
- `design-artifacts/prototypes/platform-detail.html` L1884–1950 — Edit Platform dialog (icon + name + read-only type/currency + close/reopen platform danger zone)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-add-platform.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-add-platform.png`
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-edit-platform.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-edit-platform.png`

## Acceptance Criteria
- [ ] Create mode shows icon upload, name, type select, and currency select
- [ ] Edit mode shows icon upload, name, and read-only type/currency badges
- [ ] Icon upload shows circular preview of selected image
- [ ] Icon is required — validation error if missing
- [ ] Name is required — validation error if empty
- [ ] Type is required on creation — validation error if not selected
- [ ] Currency is required on creation — validation error if not selected
- [ ] Type and currency are not editable after creation (displayed as read-only)
- [ ] Edit mode for active platforms shows "Close Platform" danger section
- [ ] Close Platform section expands to show closure date and note fields
- [ ] Closure date is required when closing
- [ ] Already-closed platforms show closure info and "Reopen Platform" option
- [ ] Save calls platformService.create() or platformService.update()
- [ ] Close action calls platformService.closePlatform()
- [ ] Reopen action calls platformService.reopenPlatform()
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet
- [ ] PRD §9.2: Platform dialog fields match spec
- [ ] PRD §14 criteria 12-14: Platform CRUD, type/currency lock, and closure
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/dialogs/PlatformDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with mocked services via MSW
- **Coverage target**: 80%+ line coverage
- Test create mode: empty form with icon upload, name, type select (Investment/Cash), and currency selector; successful submission calls platformService.create()
- Test edit mode: pre-populated fields with icon preview, name editable, type and currency displayed as read-only badges; updates via platformService.update()
- Test cancellation: dialog closes, no service calls, no side effects
- Test error handling: service failure shows error toast, dialog stays open
- Test form validation: Icon required, Name required, Type required on creation, Currency required on creation
- Test loading state on submit button during mutation
- Test that Type and Currency are not editable after creation (displayed as read-only)
- Test that "Close Platform" danger section appears in edit mode for active platforms
- Test that Close Platform section expands to show closure date and note fields
- Test that closure date is required when closing
- Test that already-closed platforms show closure info and "Reopen Platform" option
- Test photo/icon upload with circular preview

## Technical Notes
- File: `src/components/portfolio/dialogs/PlatformDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; platform?: Platform; portfolioId: string }`
- Use `useMutation` for create/update/close/reopen; on success: `queryClient.invalidateQueries({ queryKey: ['platforms', portfolioId] })`, show toast, close dialog
- Icon upload uses FormData for PocketBase file field
- Type and currency immutability enforced both in UI (read-only display) and service layer (US-043)
- Dialog width: `sm:max-w-md`
- The dialog is triggered from:
  - Portfolio overview "+ Add Platform" link (US-066)
  - Platform detail switcher "Edit Platform" button (US-072)
  - Platform detail header edit action
