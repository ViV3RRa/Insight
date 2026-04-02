# US-034: EmptyState Component

## Story
As the Insight platform user, I want clear empty states when a section or table has no data yet so that I understand what to do next and don't confuse an empty page with a loading or error state.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create an `EmptyState` component with 2 variants:
  - **Variant A — First-run full-page**: For when a section has zero entities (e.g., no platforms, no utilities, no vehicles). Shows accent-colored icon in circle, heading, description, and primary CTA button.
  - **Variant B — Section in-card**: For empty collapsible sections or empty tables (e.g., no transactions yet). Shows gray icon, smaller text, no CTA button.

## Shared Components Used
- US-013: Button (for CTA in Variant A)

## UI Specification

```tsx
/* === Variant A: First-run full-page empty state === */
<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
  {/* Icon circle */}
  <div
    className="
      w-16 h-16 rounded-full
      bg-accent-50 dark:bg-accent-900/30
      flex items-center justify-center
      mb-5
    "
  >
    <svg className="w-8 h-8 text-accent-600 dark:text-accent-400">
      {/* Section-appropriate icon from lucide-react (e.g., TrendingUp, Zap, Car) */}
    </svg>
  </div>

  {/* Heading */}
  <h2 className="text-lg font-semibold text-base-900 dark:text-white mb-2">
    No platforms yet
  </h2>

  {/* Description */}
  <p className="text-sm text-base-400 dark:text-base-400 max-w-xs mb-6">
    Add your first investment or cash platform to start tracking your portfolio performance.
  </p>

  {/* CTA button (primary) */}
  <button
    className="
      inline-flex items-center gap-2
      px-4 py-2.5 text-sm font-medium
      bg-base-900 text-white rounded-lg
      dark:bg-accent-600
      hover:bg-base-800 dark:hover:bg-accent-700
    "
  >
    <svg className="w-4 h-4">{/* Plus icon */}</svg>
    Add Platform
  </button>
</div>

/* === Variant B: Section in-card empty state === */
<div className="flex flex-col items-center py-8 px-4 text-center">
  {/* Gray icon (no circle) */}
  <svg className="w-6 h-6 text-base-300 dark:text-base-500 mb-3">
    {/* Relevant icon (e.g., Receipt, FileText, Fuel) */}
  </svg>

  {/* Message */}
  <p className="text-sm text-base-300 dark:text-base-500">
    No transactions recorded yet
  </p>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L306--319 -- "No investment platforms yet" (first run, with CTA button)
- `design-artifacts/prototypes/ui-states.html` L321--340 -- "No transactions recorded" (card-level, subtle)
- `design-artifacts/prototypes/ui-states.html` L342--361 -- "No data points recorded" (card-level)
- `design-artifacts/prototypes/ui-states.html` L363--376 -- Chart insufficient data (dashed border placeholder)

## Acceptance Criteria
- [ ] Variant A shows icon in accent-colored circle (w-16 h-16 rounded-full bg-accent-50)
- [ ] Variant A icon uses text-accent-600 at w-8 h-8
- [ ] Variant A heading uses text-lg font-semibold text-base-900
- [ ] Variant A description uses text-sm text-base-400 max-w-xs
- [ ] Variant A includes a primary CTA button matching US-013 primary variant
- [ ] Variant B shows a gray icon without circle (w-6 h-6 text-base-300)
- [ ] Variant B shows a single line message in text-sm text-base-300
- [ ] Variant B has no CTA button
- [ ] Both variants are centered with appropriate vertical padding
- [ ] Dark mode styles apply correctly (accent-900/30 bg, accent-400 text)
- [ ] Component accepts icon, heading, description, and optional onAction callback

## Technical Notes
- File to create: `src/components/shared/EmptyState.tsx`
- Props: `variant: 'page' | 'section'`, `icon: LucideIcon`, `heading?: string` (required for page variant), `description?: string`, `actionLabel?: string`, `onAction?: () => void`
- The icon prop accepts a lucide-react icon component — the EmptyState renders it at the appropriate size
- For Variant A, if `actionLabel` and `onAction` are provided, the CTA button renders
- Export as named export: `export { EmptyState }`
