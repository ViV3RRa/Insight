# US-029: DeleteConfirmDialog Component

## Story
As the Insight platform user, I want a clear confirmation dialog before deleting records so that I don't accidentally lose data with a stray tap.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create a `DeleteConfirmDialog` component per PRD §9
- Always a small centered modal on both desktop and mobile (not a bottom sheet)
- Rose-colored trash icon in a circle as visual warning
- Title and descriptive message explaining what will be deleted
- Cancel and Delete action buttons
- z-[60] stacking context to layer above regular dialogs (e.g., when deleting from within an edit dialog)
- Backdrop overlay with semi-transparent black

## Shared Components Used
- US-013: Button (Cancel secondary + Delete destructive)

## UI Specification

```tsx
/* === Backdrop === */
<div
  className="
    fixed inset-0 z-[60]
    bg-black/40 sm:backdrop-blur-sm
  "
  onClick={onCancel}
/>

/* === DeleteConfirmDialog (always centered, both mobile and desktop) === */
<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
  <div
    className="
      w-full max-w-sm
      bg-white dark:bg-base-800
      rounded-2xl shadow-xl
      p-6
      text-center
      animate-dialog-desktop
    "
  >
    {/* Icon */}
    <div
      className="
        mx-auto mb-4
        w-12 h-12 rounded-full
        bg-rose-50 dark:bg-rose-900/30
        flex items-center justify-center
      "
    >
      <svg className="w-6 h-6 text-rose-500">
        {/* Trash2 icon from lucide-react */}
      </svg>
    </div>

    {/* Title */}
    <h3 className="text-base font-semibold text-base-900 dark:text-white mb-1">
      Delete Transaction?
    </h3>

    {/* Description */}
    <p className="text-sm text-base-400 dark:text-base-400 mb-6">
      This action cannot be undone. The transaction record and any attached files will be permanently removed.
    </p>

    {/* Action buttons */}
    <div className="flex gap-2">
      <button
        className="
          flex-1 px-4 py-2.5 text-sm font-medium
          bg-white text-base-700 rounded-lg
          border border-base-200
          hover:bg-base-50
          dark:bg-base-800 dark:text-base-200 dark:border-base-600
          dark:hover:bg-base-700
        "
        onClick={onCancel}
      >
        Cancel
      </button>
      <button
        className="
          flex-1 px-4 py-2.5 text-sm font-medium
          bg-rose-500 text-white rounded-lg
          hover:bg-rose-600 active:bg-rose-700
        "
        onClick={onConfirm}
      >
        Delete
      </button>
    </div>
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L481--508 -- Delete confirmation dialog (centered, rose icon, two buttons)
- `design-artifacts/prototypes/portfolio-overview.html` L1449--1470 -- Delete confirmation (same pattern, with dynamic title/summary)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-delete-confirm.png`

## Acceptance Criteria
- [ ] Dialog is always centered on both mobile and desktop (never a bottom sheet)
- [ ] Max width is max-w-sm
- [ ] Rose trash icon in a 48px circle (w-12 h-12 rounded-full bg-rose-50)
- [ ] Title uses text-base font-semibold
- [ ] Description uses text-sm text-base-400
- [ ] Cancel button uses secondary variant (border, bg-white)
- [ ] Delete button uses bg-rose-500 text-white
- [ ] z-[60] stacking context on both backdrop and dialog (above regular z-50 dialogs)
- [ ] Clicking backdrop calls onCancel
- [ ] Clicking Delete calls onConfirm
- [ ] Scale animation on open (animate-dialog-desktop from US-002)
- [ ] Dark mode: bg-base-800, dark:bg-rose-900/30 for icon circle
- [ ] All tests pass and meet coverage target
- [ ] Accessibility: dialog is keyboard-operable (Escape to cancel, Enter to confirm)

## Testing Requirements
- **Test file**: `src/components/shared/DeleteConfirmDialog.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test warning message (title and description) renders correctly from props
- Test clicking the Confirm/Delete button fires `onConfirm` callback
- Test clicking the Cancel button fires `onCancel` callback
- Test backdrop click fires `onCancel` callback
- Test Escape key fires `onCancel` callback
- Test confirm button has danger styling (`bg-rose-500 text-white`)
- Test rose trash icon is rendered in the dialog
- Test dialog is centered on screen (not a bottom sheet)
- Test `loading` prop disables action buttons when true

## Technical Notes
- File to create: `src/components/shared/DeleteConfirmDialog.tsx`
- Props: `isOpen: boolean`, `onCancel: () => void`, `onConfirm: () => void`, `title: string`, `description: string`, `loading?: boolean`
- The z-[60] ensures this dialog stacks above regular dialogs (z-50) — important when triggering delete from within an edit dialog
- PRD §9 specifies: "Delete confirmations are always small centered modals on both desktop and mobile (too compact for a bottom sheet)"
- Use React Portal to render at document root
- Support Escape key to cancel
- Export as named export: `export { DeleteConfirmDialog }`
