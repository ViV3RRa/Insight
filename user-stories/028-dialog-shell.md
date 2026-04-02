# US-028: Dialog Shell Component

## Story
As the Insight platform user, I want a responsive dialog for creating and editing records so that forms appear as centered modals on desktop and bottom sheets on mobile, matching the platform's responsive design.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create a `Dialog` shell component per PRD §9
- Desktop (sm+): centered modal with backdrop blur, scale animation
- Mobile (<sm): bottom sheet sliding up from bottom, drag handle, rounded-t-2xl
- Max-width sm:max-w-md for desktop modal
- Panel: rounded-2xl on desktop, rounded-t-2xl on mobile
- Backdrop: bg-black/40 with sm:backdrop-blur-sm
- Content scrollable with max-h-[92vh] on mobile, max-h-[90vh] on desktop
- Header with title and close button
- Body area with space-y-4 for form fields
- Footer with Cancel button, optional "Save & Add Another" button, and primary Save button
- "Save & Add Another" for high-frequency data entry dialogs (PRD §9)
- Animations from US-002: desktop scale 0.95->1 + fade, mobile translateY(100%)->0

## Shared Components Used
- US-013: Button (for footer action buttons)

## UI Specification

```tsx
/* === Backdrop === */
<div
  className="
    fixed inset-0 z-50
    bg-black/40 sm:backdrop-blur-sm
  "
  onClick={onClose}
/>

/* === Desktop modal (sm+) === */
<div
  className="
    fixed inset-0 z-50
    hidden sm:flex items-center justify-center
    p-4
  "
>
  <div
    className="
      w-full sm:max-w-md
      bg-white dark:bg-base-800
      rounded-2xl shadow-xl
      max-h-[90vh] overflow-y-auto
      animate-dialog-desktop
    "
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 pt-6 pb-0">
      <h2 className="text-lg font-semibold text-base-900 dark:text-white">
        Add Data Point
      </h2>
      <button
        className="
          p-1.5 rounded-lg
          text-base-400 hover:text-base-600 hover:bg-base-100
          dark:hover:text-base-300 dark:hover:bg-base-700
        "
        onClick={onClose}
      >
        <svg className="w-5 h-5">{/* X icon from lucide-react */}</svg>
      </button>
    </div>

    {/* Body */}
    <div className="px-6 py-5 space-y-4">
      {/* Form fields rendered here via children */}
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-0">
      <button
        className="
          px-4 py-2.5 text-sm font-medium
          bg-white text-base-700 rounded-lg
          border border-base-200
          dark:bg-base-800 dark:text-base-200 dark:border-base-600
        "
      >
        Cancel
      </button>
      {/* Optional: Save & Add Another */}
      <button
        className="
          px-4 py-2.5 text-sm font-medium
          bg-white text-base-700 rounded-lg
          border border-base-200
          dark:bg-base-800 dark:text-base-200 dark:border-base-600
        "
      >
        Save & Add Another
      </button>
      <button
        className="
          px-4 py-2.5 text-sm font-medium
          bg-base-900 text-white rounded-lg
          dark:bg-accent-600
        "
      >
        Save
      </button>
    </div>
  </div>
</div>

/* === Mobile bottom sheet (<sm) === */
<div
  className="
    fixed inset-x-0 bottom-0 z-50
    sm:hidden
  "
>
  <div
    className="
      bg-white dark:bg-base-800
      rounded-t-2xl shadow-xl
      max-h-[92vh] overflow-y-auto
      animate-dialog-mobile
    "
  >
    {/* Drag handle */}
    <div className="flex justify-center pt-3 pb-1">
      <div className="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600" />
    </div>

    {/* Header */}
    <div className="flex items-center justify-between px-5 pb-0 pt-1">
      <h2 className="text-lg font-semibold text-base-900 dark:text-white">
        Add Data Point
      </h2>
      <button
        className="
          p-1.5 rounded-lg
          text-base-400 hover:text-base-600
          dark:hover:text-base-300
        "
        onClick={onClose}
      >
        <svg className="w-5 h-5">{/* X icon */}</svg>
      </button>
    </div>

    {/* Body */}
    <div className="px-5 py-5 space-y-4">
      {/* Form fields rendered here via children */}
    </div>

    {/* Footer */}
    <div className="px-5 pb-5 pt-0 space-y-2">
      {/* Primary actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-white text-base-700 rounded-lg border border-base-200 dark:bg-base-800 dark:text-base-200 dark:border-base-600">
          Cancel
        </button>
        <button className="flex-1 px-4 py-2.5 text-sm font-medium bg-base-900 text-white rounded-lg dark:bg-accent-600">
          Save
        </button>
      </div>
      {/* Optional: Save & Add Another (full width below) */}
      <button className="w-full px-4 py-2.5 text-sm font-medium bg-white text-base-700 rounded-lg border border-base-200 dark:bg-base-800 dark:text-base-200 dark:border-base-600">
        Save & Add Another
      </button>
    </div>
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L429--478 -- Add Reading dialog (full structure: overlay, panel, drag handle, header, form, footer)
- `design-artifacts/prototypes/home-overview.html` L24--31 -- Dialog animation CSS (desktop scale + mobile slide-up)
- `design-artifacts/prototypes/portfolio-overview.html` L1186--1236 -- Add Platform dialog

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-add-reading.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-reading.png`
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-add-platform.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-add-platform.png`

## Acceptance Criteria
- [ ] Desktop: centered modal with sm:max-w-md, rounded-2xl, shadow-xl
- [ ] Desktop: backdrop uses bg-black/40 sm:backdrop-blur-sm
- [ ] Desktop: scale animation (0.95 -> 1 + fade) on open
- [ ] Mobile: bottom sheet with rounded-t-2xl anchored to bottom
- [ ] Mobile: drag handle w-10 h-1 rounded-full bg-base-200 at top
- [ ] Mobile: translateY slide-up animation on open
- [ ] Mobile: max-h-[92vh] with overflow-y-auto for scrollable content
- [ ] Desktop: max-h-[90vh] with overflow-y-auto for scrollable content
- [ ] Header shows title (text-lg font-semibold) and close button (X icon)
- [ ] Body area applies space-y-4 to children
- [ ] Footer shows Cancel + Save buttons, optionally Save & Add Another
- [ ] "Save & Add Another" only appears when `showSaveAndAddAnother` prop is true
- [ ] Clicking backdrop or close button calls onClose
- [ ] z-50 stacking context for the dialog
- [ ] Dark mode styles apply correctly
- [ ] Focus is trapped within the dialog while open (Tab and Shift+Tab cycle through focusable elements inside the dialog only)
- [ ] Pressing Escape closes the dialog
- [ ] On close, focus returns to the element that triggered the dialog
- [ ] Dialog has `role="dialog"` and `aria-modal="true"`
- [ ] Dialog title is associated via `aria-labelledby`
- [ ] All tests pass and meet coverage target
- [ ] Component meets WCAG 2.1 AA dialog accessibility requirements

## Testing Requirements
- **Test file**: `src/components/shared/Dialog.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test dialog opens and closes based on `isOpen` prop
- Test focus trap: Tab cycles through focusable elements inside the dialog only
- Test Escape key triggers `onClose`
- Test focus returns to the trigger element when dialog closes
- Test `role="dialog"` and `aria-modal="true"` attributes are present
- Test `aria-labelledby` links the title to the dialog
- Test backdrop click triggers `onClose`
- Test close button (X icon) triggers `onClose`
- Test "Save & Add Another" button only renders when `showSaveAndAddAnother` is true
- Test Cancel, Save, and Save & Add Another buttons fire their respective callbacks
- Test children render inside the body area

## Technical Notes
- File to create: `src/components/shared/Dialog.tsx`
- Props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode`, `onSave: () => void`, `onSaveAndAddAnother?: () => void`, `showSaveAndAddAnother?: boolean`, `saveLabel?: string` (default: "Save"), `loading?: boolean`
- Use the dialog animation CSS classes defined in US-002 (desktop: scale 0.95->1 + fade; mobile: translateY(100%)->0)
- Consider using React Portal to render the dialog at the document root
- The dialog should trap focus and support Escape key to close
- Export as named export: `export { Dialog }`
