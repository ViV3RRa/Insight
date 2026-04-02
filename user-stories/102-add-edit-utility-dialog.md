# US-102: Add/Edit Utility Dialog

## Story
As the Insight platform user, I want a dialog to create and edit utilities so that I can manage which household services I track with their icons and colors.

## Dependencies
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-080: Home (Utilities) TypeScript Types
- US-081: Utility CRUD Service

## Requirements
- Modal dialog for creating and editing utilities (PRD §9.5)
- **Fields:**
  1. **Icon** (icon picker, required) — curated set of 8 icons: bolt (Zap), droplet (Droplet), flame (Flame), sun (Sun), wind (Wind), thermometer (Thermometer), wifi (Wifi), trash (Trash2)
  2. **Color** (color palette, required) — 8 preset swatches: amber, blue, orange, emerald, violet, rose, cyan, slate
  3. **Name** (text, required) — e.g. "Electricity", "Water"
  4. **Unit** (text, required) — e.g. "kWh", "m³", "MWh"
- Icon picker: grid of icon buttons, selected one has accent border
- Color picker: grid of color swatches, selected one has ring indicator
- Form validation: all 4 fields required

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Utility" | "Edit Utility", isOpen, onClose, maxWidth: "md" }
- `TextInput` (US-030) — for Name and Unit fields
- `Button` (US-013) — Cancel (ghost) and Save (primary)

## UI Specification

**Icon picker grid:**
```
<div className="grid grid-cols-4 gap-2">
  {icons.map(({ key, Icon }) => (
    <button
      key={key}
      onClick={() => setSelectedIcon(key)}
      className={`p-3 rounded-xl border-2 transition-colors flex items-center justify-center
        ${selectedIcon === key
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
          : 'border-base-200 dark:border-base-600 hover:border-base-300 dark:hover:border-base-500'}`}
    >
      <Icon className="w-5 h-5 text-base-600 dark:text-base-300" />
    </button>
  ))}
</div>
```

**Color picker grid:**
```
<div className="flex flex-wrap gap-2">
  {colors.map(color => (
    <button
      key={color}
      onClick={() => setSelectedColor(color)}
      className={`w-8 h-8 rounded-full ${colorBgClass(color)}
        ${selectedColor === color ? 'ring-2 ring-offset-2 ring-accent-500 dark:ring-offset-base-800' : ''}`}
    />
  ))}
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Add Utility dialog: L610-702 (icon + name row L623-635, icon picker L637-688, color picker L675-687, unit field L690-693)

**Screenshots:** (no dedicated utility dialog screenshot exists)

## Acceptance Criteria
- [ ] Dialog opens in create mode with empty fields
- [ ] Dialog opens in edit mode pre-filled with current utility values
- [ ] Icon picker shows 8 icons in a 4×2 grid
- [ ] Selected icon has accent border
- [ ] Color picker shows 8 color swatches
- [ ] Selected color has ring indicator
- [ ] Name field is required
- [ ] Unit field is required
- [ ] Icon is required — validation error if none selected
- [ ] Color is required — validation error if none selected
- [ ] Save calls utilityService.create() or utilityService.update()
- [ ] Dialog closes and data refreshes on save
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet
- [ ] PRD §9.5: Utility dialog fields match spec

## Technical Notes
- File: `src/components/home/dialogs/UtilityDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; utility?: Utility }`
- Use `useMutation` wrapping `utilityService.create()` / `utilityService.update()`; on success: `queryClient.invalidateQueries({ queryKey: ['utilities'] })`, show toast, close dialog
- Icon mapping: key string to lucide-react component (same as UtilityIcon US-088)
- Color mapping: key string to Tailwind bg class for the swatch
- Triggered from: Home overview "+ Add Utility" link, utility detail switcher "Edit Utility"
