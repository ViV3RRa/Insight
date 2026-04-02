# US-013: Button Component

## Story
As the Insight platform user, I want a consistent button component with multiple variants so that all interactive actions have a unified, predictable appearance across the platform.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a reusable `Button` component with the following variants:
  - **primary**: Main action buttons (save, submit, add)
  - **secondary**: Secondary actions (cancel, back)
  - **ghost**: Minimal text-only actions (inline links, subtle toggles)
  - **destructive**: Dangerous actions (delete, remove)
  - **loading**: Any variant in a loading state (spinner overlay + reduced opacity)
- Support sizes: `sm`, `md` (default), `lg`
- Support `disabled` state across all variants
- Support `fullWidth` prop for mobile layouts
- Mobile action pair variant: two buttons side-by-side in a flex row with gap-2, each flex-1
- Accept standard button HTML attributes (onClick, type, etc.)
- Support rendering as a button or as a link (via `as` prop or similar pattern)

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Primary === */
<button
  className="
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 text-sm font-medium
    bg-base-900 text-white rounded-lg
    hover:bg-base-800 active:bg-base-700
    dark:bg-accent-600 dark:hover:bg-accent-700 dark:active:bg-accent-800
    transition-colors duration-150
    disabled:opacity-50 disabled:pointer-events-none
  "
>
  Save
</button>

/* === Secondary === */
<button
  className="
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 text-sm font-medium
    bg-white text-base-700 rounded-lg
    border border-base-200
    hover:bg-base-50 active:bg-base-100
    dark:bg-base-800 dark:text-base-200 dark:border-base-600
    dark:hover:bg-base-700 dark:active:bg-base-600
    transition-colors duration-150
    disabled:opacity-50 disabled:pointer-events-none
  "
>
  Cancel
</button>

/* === Ghost === */
<button
  className="
    inline-flex items-center justify-center gap-2
    px-3 py-2 text-sm font-medium
    text-base-500 rounded-lg
    hover:text-base-700 hover:bg-base-100
    dark:text-base-400 dark:hover:text-base-200 dark:hover:bg-base-700
    transition-colors duration-150
    disabled:opacity-50 disabled:pointer-events-none
  "
>
  View all
</button>

/* === Destructive === */
<button
  className="
    inline-flex items-center justify-center gap-2
    px-4 py-2.5 text-sm font-medium
    bg-rose-500 text-white rounded-lg
    hover:bg-rose-600 active:bg-rose-700
    transition-colors duration-150
    disabled:opacity-50 disabled:pointer-events-none
  "
>
  Delete
</button>

/* === Loading state (applied to any variant) === */
<button
  className="... opacity-75 pointer-events-none"
  disabled
>
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
    {/* spinner icon */}
  </svg>
  Saving...
</button>

/* === Mobile action pair === */
<div className="flex gap-2">
  <button className="flex-1 ... {secondary classes}">Cancel</button>
  <button className="flex-1 ... {primary classes}">Save</button>
</div>

/* === Size variants === */
/* sm:  px-3 py-1.5 text-xs */
/* md:  px-4 py-2.5 text-sm (default) */
/* lg:  px-5 py-3   text-base */
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L192--211 -- Button loading states (primary + secondary with spinner)
- `design-artifacts/prototypes/ui-states.html` L207--211 -- Normal button comparison (primary + secondary)
- `design-artifacts/prototypes/home-overview.html` L100--101 -- Desktop action buttons (secondary + primary pair)
- `design-artifacts/prototypes/home-overview.html` L106--109 -- Mobile action button pair (flex-1 layout)
- `design-artifacts/prototypes/home-overview.html` L471--475 -- Dialog footer buttons (Cancel ghost + Save & Add Another + Save primary)

## Acceptance Criteria
- [ ] Primary variant renders with bg-base-900 light / bg-accent-600 dark, white text, rounded-lg
- [ ] Secondary variant renders with border border-base-200, rounded-lg, transparent/white bg
- [ ] Ghost variant renders with no background, text-base-500, hover adds bg-base-100
- [ ] Destructive variant renders with bg-rose-500, white text
- [ ] Loading state shows spinner SVG animation and applies opacity-75
- [ ] Loading state disables pointer events
- [ ] Disabled state applies opacity-50 and pointer-events-none on all variants
- [ ] Mobile action pair layout renders two flex-1 buttons in a flex gap-2 row
- [ ] All variants support sm, md, lg sizes
- [ ] Dark mode styles apply correctly for all variants
- [ ] Component accepts and forwards standard button HTML attributes

## Technical Notes
- File to create: `src/components/shared/Button.tsx`
- Use the `spin` keyframe animation from US-002 for the loading spinner
- Consider using `cva` (class-variance-authority) or a simple variant map for class management
- The component should accept a `variant` prop, `size` prop, `loading` prop, and `fullWidth` prop
- Export as named export: `export { Button }`
- The spinner should use the custom `@keyframes spin` (0.7s linear infinite) defined in US-002
