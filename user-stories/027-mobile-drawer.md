# US-027: MobileDrawer (Bottom Sheet for Row Inspection)

## Story
As the Insight platform user, I want to tap a table row on mobile to see full record details in a bottom drawer so that I can view all fields and access edit/delete actions without cramming icons into narrow rows.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create a `MobileDrawer` component per PRD §3.6
- Fixed to the bottom of the viewport, slides up with translateY animation
- Drag handle at top for visual affordance
- Title bar with prev/next navigation arrows to step through records
- Content area for displaying all record fields
- Footer with Edit and Delete action buttons
- Only shown on mobile — desktop uses inline row actions
- Backdrop overlay to dismiss on tap-outside

## Shared Components Used
- US-013: Button (for Edit and Delete footer buttons)

## UI Specification

```tsx
/* === Backdrop === */
<div
  className="
    fixed inset-0 z-40
    bg-black/40
    sm:hidden
  "
  onClick={onClose}
/>

/* === MobileDrawer === */
<div
  className="
    fixed inset-x-0 bottom-0 z-50
    bg-white dark:bg-base-800
    rounded-t-2xl
    shadow-xl
    transform transition-transform duration-300 ease-out
    sm:hidden
  "
  style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
>
  {/* Drag handle */}
  <div className="flex justify-center pt-3 pb-2">
    <div className="w-10 h-1 rounded-full bg-base-200 dark:bg-base-600" />
  </div>

  {/* Header with title and navigation */}
  <div className="flex items-center justify-between px-5 pb-3">
    {/* Previous arrow */}
    <button
      className="
        p-1.5 rounded-lg
        text-base-400 hover:text-base-600
        dark:hover:text-base-300
        disabled:opacity-30 disabled:pointer-events-none
      "
      disabled={!hasPrev}
    >
      <svg className="w-5 h-5">{/* ChevronLeft icon */}</svg>
    </button>

    {/* Title */}
    <h3 className="text-sm font-semibold text-base-900 dark:text-white">
      Transaction Details
    </h3>

    {/* Next arrow */}
    <button
      className="
        p-1.5 rounded-lg
        text-base-400 hover:text-base-600
        dark:hover:text-base-300
        disabled:opacity-30 disabled:pointer-events-none
      "
      disabled={!hasNext}
    >
      <svg className="w-5 h-5">{/* ChevronRight icon */}</svg>
    </button>
  </div>

  {/* Content area */}
  <div className="px-5 pb-4 max-h-[60vh] overflow-y-auto">
    {/* Record fields rendered as label/value pairs */}
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-xs text-base-400">Date</span>
        <span className="text-sm font-mono-data text-base-900 dark:text-white">
          2026-02-14
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-base-400">Amount</span>
        <span className="text-sm font-mono-data text-base-900 dark:text-white">
          5.057,80 DKK
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-base-400">Type</span>
        <span className="text-sm text-base-900 dark:text-white">
          Deposit
        </span>
      </div>
      {/* Note (if present) */}
      <div>
        <span className="text-xs text-base-400 block mb-0.5">Note</span>
        <p className="text-sm text-base-700 dark:text-base-300 italic">
          Bonus deposited
        </p>
      </div>
    </div>
  </div>

  {/* Footer with action buttons */}
  <div className="px-5 pb-5 pt-3 border-t border-base-100 dark:border-base-700">
    <div className="flex gap-2">
      <button
        className="
          flex-1 inline-flex items-center justify-center gap-2
          px-4 py-2.5 text-sm font-medium
          bg-white text-base-700 rounded-lg
          border border-base-200
          dark:bg-base-800 dark:text-base-200 dark:border-base-600
        "
      >
        <svg className="w-4 h-4">{/* Pencil icon */}</svg>
        Edit
      </button>
      <button
        className="
          flex-1 inline-flex items-center justify-center gap-2
          px-4 py-2.5 text-sm font-medium
          bg-rose-500 text-white rounded-lg
        "
      >
        <svg className="w-4 h-4">{/* Trash2 icon */}</svg>
        Delete
      </button>
    </div>
  </div>
</div>
```

## Design Reference
**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-mobile-reading-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-bill-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-month-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-dp-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-tx-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-perf-drawer.png`

## Acceptance Criteria
- [ ] Drawer is only visible on mobile (sm:hidden on all elements)
- [ ] Fixed to bottom of viewport with rounded-t-2xl
- [ ] Slides up with translateY animation (duration-300 ease-out)
- [ ] Drag handle: w-10 h-1 rounded-full bg-base-200 centered at top
- [ ] Title bar shows record title with prev/next navigation arrows
- [ ] Prev/next arrows are disabled (opacity-30) when at bounds
- [ ] Content area displays record fields as label/value pairs
- [ ] Content area scrolls vertically with max-h-[60vh] overflow-y-auto
- [ ] Footer shows Edit and Delete buttons in a flex gap-2 row (mobile action pair from US-013)
- [ ] Backdrop overlay (bg-black/40) dismisses drawer on tap
- [ ] Edit button triggers onEdit callback
- [ ] Delete button triggers onDelete callback
- [ ] Dark mode styles apply correctly
- [ ] All tests pass and meet coverage target
- [ ] Accessibility: drawer content is reachable via keyboard

## Testing Requirements
- **Test file**: `src/components/shared/MobileDrawer.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test drawer opens when `isOpen` is true (translateY(0)) and hides when false (translateY(100%))
- Test backdrop click triggers `onClose` callback
- Test content (fields as label/value pairs) renders correctly inside the drawer
- Test prev/next navigation buttons call `onPrev`/`onNext` callbacks
- Test prev button is disabled (opacity-30) when `hasPrev` is false
- Test next button is disabled (opacity-30) when `hasNext` is false
- Test Edit button triggers `onEdit` callback
- Test Delete button triggers `onDelete` callback
- Test drag handle element is present

## Technical Notes
- File to create: `src/components/shared/MobileDrawer.tsx`
- Props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `fields: Array<{ label: string, value: ReactNode }>`, `onEdit: () => void`, `onDelete: () => void`, `onPrev?: () => void`, `onNext?: () => void`, `hasPrev?: boolean`, `hasNext?: boolean`
- The prev/next navigation allows stepping through table rows without closing the drawer
- Touch gesture support (swipe down to dismiss) is a nice-to-have but not required for initial implementation
- The drawer uses z-50 for the panel and z-40 for the backdrop
- Export as named export: `export { MobileDrawer }`
