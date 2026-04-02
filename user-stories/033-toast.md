# US-033: Toast Component and ToastProvider

## Story
As the Insight platform user, I want brief, non-intrusive toast notifications after actions (save, delete, error) so that I get confirmation feedback without interrupting my workflow.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `Toast` component and a `useToastStore` Zustand store for the toast queue
- 4 variants: success (emerald), info (blue), error (rose), undo (base-600 + undo link)
- Dark-inverted design: bg-base-900 in light mode, bg-base-100 in dark mode
- Bottom-center positioning
- Slide-up entry animation (toast-in from US-002, 0.25s ease-out)
- Auto-dismiss after 4 seconds
- Close button on each toast
- Undo variant includes a clickable "Undo" link with callback
- A `ToastRenderer` component (rendered once in `App.tsx`) subscribes to the Zustand store and renders the toast queue

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Toast container (bottom-center) === */
<div
  className="
    fixed bottom-6 left-1/2 -translate-x-1/2
    z-[70]
    flex flex-col items-center gap-2
    pointer-events-none
  "
>
  {/* Each toast is pointer-events-auto */}

  {/* === Success toast === */}
  <div
    className="
      pointer-events-auto
      flex items-center gap-3
      px-4 py-3
      bg-base-900 dark:bg-base-100
      text-white dark:text-base-900
      rounded-xl shadow-lg
      min-w-[280px] max-w-sm
      animate-toast-in
    "
  >
    <svg className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0">
      {/* CheckCircle icon */}
    </svg>
    <span className="text-sm font-medium flex-1">
      Data point saved
    </span>
    <button className="p-0.5 text-base-400 hover:text-white dark:hover:text-base-900 flex-shrink-0">
      <svg className="w-3.5 h-3.5">{/* X icon */}</svg>
    </button>
  </div>

  {/* === Info toast === */}
  <div
    className="
      pointer-events-auto
      flex items-center gap-3
      px-4 py-3
      bg-base-900 dark:bg-base-100
      text-white dark:text-base-900
      rounded-xl shadow-lg
      min-w-[280px] max-w-sm
      animate-toast-in
    "
  >
    <svg className="w-4 h-4 text-blue-400 dark:text-blue-600 flex-shrink-0">
      {/* Info icon */}
    </svg>
    <span className="text-sm font-medium flex-1">
      Exchange rate updated
    </span>
    <button className="p-0.5 text-base-400 hover:text-white dark:hover:text-base-900 flex-shrink-0">
      <svg className="w-3.5 h-3.5">{/* X icon */}</svg>
    </button>
  </div>

  {/* === Error toast === */}
  <div
    className="
      pointer-events-auto
      flex items-center gap-3
      px-4 py-3
      bg-base-900 dark:bg-base-100
      text-white dark:text-base-900
      rounded-xl shadow-lg
      min-w-[280px] max-w-sm
      animate-toast-in
    "
  >
    <svg className="w-4 h-4 text-rose-400 dark:text-rose-600 flex-shrink-0">
      {/* AlertCircle icon */}
    </svg>
    <span className="text-sm font-medium flex-1">
      Failed to save. Please try again.
    </span>
    <button className="p-0.5 text-base-400 hover:text-white dark:hover:text-base-900 flex-shrink-0">
      <svg className="w-3.5 h-3.5">{/* X icon */}</svg>
    </button>
  </div>

  {/* === Undo toast === */}
  <div
    className="
      pointer-events-auto
      flex items-center gap-3
      px-4 py-3
      bg-base-900 dark:bg-base-100
      text-white dark:text-base-900
      rounded-xl shadow-lg
      min-w-[280px] max-w-sm
      animate-toast-in
    "
  >
    <svg className="w-4 h-4 text-base-400 flex-shrink-0">
      {/* Trash2 icon */}
    </svg>
    <span className="text-sm font-medium flex-1">
      Transaction deleted
    </span>
    <button
      className="
        text-sm font-semibold
        text-accent-400 dark:text-accent-600
        hover:text-accent-300 dark:hover:text-accent-700
        flex-shrink-0
      "
    >
      Undo
    </button>
    <button className="p-0.5 text-base-400 hover:text-white dark:hover:text-base-900 flex-shrink-0">
      <svg className="w-3.5 h-3.5">{/* X icon */}</svg>
    </button>
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L392--444 -- Toast variants: success (emerald), info (blue), error (rose), undo (with Undo button)
- `design-artifacts/prototypes/ui-states.html` L447--478 -- Toast positioning mockup (bottom-center, 4s auto-dismiss)
- `design-artifacts/prototypes/ui-states.html` L32--37 -- Toast slide-in CSS animation

## Acceptance Criteria
- [ ] Success variant shows emerald CheckCircle icon
- [ ] Info variant shows blue Info icon
- [ ] Error variant shows rose AlertCircle icon
- [ ] Undo variant shows Trash2 icon + clickable "Undo" link in accent color
- [ ] All toasts use bg-base-900 text-white in light mode
- [ ] All toasts use dark:bg-base-100 dark:text-base-900 in dark mode (inverted)
- [ ] Bottom-center positioning with fixed bottom-6 left-1/2 -translate-x-1/2
- [ ] Entry animation uses animate-toast-in (slide up 0.25s from US-002)
- [ ] Auto-dismiss after 4 seconds
- [ ] Close button dismisses the toast immediately
- [ ] Undo button calls the onUndo callback before dismissing
- [ ] Multiple toasts stack vertically with gap-2
- [ ] z-[70] stacking context (above dialogs)
- [ ] `useToastStore` exposes `toast.success()`, `toast.info()`, `toast.error()`, `toast.undo()` callable from anywhere without context
- [ ] All tests pass and meet coverage target
- [ ] Timer-based auto-dismiss is tested with fake timers

## Testing Requirements
- **Test file**: `src/components/shared/Toast.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test success variant renders with emerald CheckCircle icon
- Test error variant renders with rose AlertCircle icon
- Test info variant renders with blue Info icon
- Test undo variant renders with Trash2 icon and clickable "Undo" link
- Test auto-dismiss after 4 seconds using `vi.useFakeTimers()` and `vi.advanceTimersByTime(4000)`
- Test manual dismiss via close button removes the toast immediately
- Test undo button calls the `onUndo` callback before dismissing
- Test multiple toasts stack vertically (render multiple, verify all are present)
- Test `useToastStore` methods (`toast.success()`, `toast.error()`, etc.) add toasts to the queue

## Technical Notes
- Files to create: `src/components/shared/Toast.tsx`, `src/stores/toastStore.ts`
- `useToastStore` exposes: `toast.success(message)`, `toast.info(message)`, `toast.error(message)`, `toast.undo(message, onUndo)` — callable from anywhere (components, mutation callbacks, etc.) without a context provider
- `ToastRenderer` component (in `App.tsx`) subscribes to the store with `useToastStore` and renders the queue
- Each toast gets a unique ID for managing the queue
- Auto-dismiss uses `setTimeout(4000)` — clear on manual dismiss or undo
- The `animate-toast-in` animation class is defined in US-002's global CSS
- Export: `export { Toast }` from Toast.tsx, `export { useToastStore }` from toastStore.ts
