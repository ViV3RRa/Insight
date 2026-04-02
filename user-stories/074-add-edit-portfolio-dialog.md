# US-074: Add/Edit Portfolio Dialog

## Story
As the Insight platform user, I want a dialog to create and edit portfolios so that I can manage multiple named portfolios with different owners.

## Dependencies
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-042: Portfolio CRUD Service
- US-041: Investment TypeScript Types

## Requirements
- Modal dialog for creating and editing portfolios (PRD §9.1)
- **Fields:**
  1. **Name** (text, required) — e.g. "My Portfolio", "Erik's Portfolio"
  2. **Owner name** (text, required) — who this portfolio is for, e.g. "Me", "Erik"
  3. **Is default** (checkbox) — only shown when editing; at least one portfolio must remain default
- **Create mode**: Title "Add Portfolio", empty form, Save button
- **Edit mode**: Title "Edit Portfolio", pre-filled with current values, Save button
  - "Is default" checkbox visible only in edit mode
  - If this is currently the only default portfolio, the checkbox is checked and disabled (cannot uncheck — exactly one must be default)
  - If another portfolio is already default, checking this one automatically unchecks the other
- Form validation:
  - Name is required — show error if empty on submit
  - Owner name is required — show error if empty on submit
- On successful save: close dialog, refresh portfolio list
- Desktop: centered modal (sm:max-w-md)
- Mobile: bottom sheet with drag handle

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Portfolio" | "Edit Portfolio", isOpen, onClose, maxWidth: "md" }
- `TextInput` (US-030) — props: { label: "Name", required: true, value, onChange, error }
- `TextInput` (US-030) — props: { label: "Owner", required: true, value, onChange, error }
- `Button` (US-013) — Cancel (ghost) and Save (primary)

## UI Specification

**Dialog content:**
```
<DialogShell title={isEdit ? "Edit Portfolio" : "Add Portfolio"}>
  <div className="space-y-4">
    <TextInput label="Name" required value={name} placeholder="e.g. My Portfolio" />
    <TextInput label="Owner" required value={ownerName} placeholder="e.g. Me, Erik" />
    {isEdit && (
      <label className="flex items-center gap-2 text-sm text-base-600 dark:text-base-300">
        <input type="checkbox" checked={isDefault} disabled={isOnlyDefault} />
        Set as default portfolio
      </label>
    )}
  </div>
  <footer className="flex items-center justify-end gap-3">
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </footer>
</DialogShell>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Add Portfolio dialog: L1381–1406 (name + owner fields)
- Edit Portfolio dialog: L1408–1447 (pre-filled fields + default checkbox + delete danger zone)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-portfolio-switcher.png`

## Acceptance Criteria
- [ ] Dialog opens in create mode with empty fields when triggered from PortfolioSwitcher "Add Portfolio"
- [ ] Dialog opens in edit mode with pre-filled values when triggered from PortfolioSwitcher edit action
- [ ] Name field is required — validation error shown if empty on submit
- [ ] Owner name field is required — validation error shown if empty on submit
- [ ] "Is default" checkbox shown only in edit mode
- [ ] Cannot uncheck "Is default" if this is the only default portfolio
- [ ] Saving a new portfolio calls portfolioService.create()
- [ ] Saving an edit calls portfolioService.update()
- [ ] Dialog closes and portfolio list refreshes on successful save
- [ ] Desktop: centered modal with backdrop blur
- [ ] Mobile: bottom sheet anchored to bottom
- [ ] PRD §9.1: Portfolio dialog fields match spec
- [ ] PRD §14 criterion 10: User can create, edit, and delete portfolios with name and owner

## Technical Notes
- File: `src/components/portfolio/dialogs/PortfolioDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; portfolio?: Portfolio }` — presence of `portfolio` prop determines edit vs create mode
- Use `useMutation` wrapping `portfolioService.create()` / `portfolioService.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['portfolios'] })`, show success toast, close dialog
- When setting a new default, the service layer handles unsetting the previous default
- The dialog is triggered from the PortfolioSwitcher dropdown (US-055)
