# US-035: ErrorState Component

## Story
As the Insight platform user, I want clear error states when something goes wrong so that I understand the problem and can retry the action without confusion.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create an `ErrorState` component with 2 variants:
  - **Variant A — Card-level error**: For when a specific card or section fails to load. Shows rose warning icon, title, message, and retry button. Fits inside a card container.
  - **Variant B — Full-page server error**: For when the PocketBase backend is unreachable. Shows WifiOff icon, prominent title, URL in monospace, and retry CTA button.

## Shared Components Used
- US-013: Button (for retry button)

## UI Specification

```tsx
/* === Variant A: Card-level error === */
<div className="flex flex-col items-center py-8 px-4 text-center">
  {/* Rose warning icon */}
  <div
    className="
      w-12 h-12 rounded-full
      bg-rose-50 dark:bg-rose-900/30
      flex items-center justify-center
      mb-4
    "
  >
    <svg className="w-6 h-6 text-rose-500">
      {/* AlertTriangle icon from lucide-react */}
    </svg>
  </div>

  {/* Title */}
  <h3 className="text-sm font-semibold text-base-900 dark:text-white mb-1">
    Failed to load data
  </h3>

  {/* Message */}
  <p className="text-sm text-base-400 dark:text-base-400 max-w-xs mb-4">
    Something went wrong while fetching platform data. Please try again.
  </p>

  {/* Retry button */}
  <button
    className="
      inline-flex items-center gap-1.5
      px-3 py-1.5 text-xs font-medium
      bg-white text-base-700 rounded-lg
      border border-base-200
      hover:bg-base-50
      dark:bg-base-800 dark:text-base-200 dark:border-base-600
      dark:hover:bg-base-700
    "
    onClick={onRetry}
  >
    <svg className="w-3.5 h-3.5">{/* RefreshCw icon */}</svg>
    Retry
  </button>
</div>

/* === Variant B: Full-page server error === */
<div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
  {/* WifiOff icon */}
  <div
    className="
      w-16 h-16 rounded-full
      bg-base-100 dark:bg-base-700
      flex items-center justify-center
      mb-6
    "
  >
    <svg className="w-8 h-8 text-base-400 dark:text-base-400">
      {/* WifiOff icon from lucide-react */}
    </svg>
  </div>

  {/* Title */}
  <h2 className="text-lg font-semibold text-base-900 dark:text-white mb-2">
    Can't reach the server
  </h2>

  {/* Server URL in mono */}
  <p className="font-mono-data text-xs text-base-300 dark:text-base-500 mb-1">
    https://pocketbase.example.com
  </p>

  {/* Description */}
  <p className="text-sm text-base-400 dark:text-base-400 max-w-sm mb-6">
    The PocketBase server is not responding. Check that the server is running and try again.
  </p>

  {/* Retry CTA */}
  <button
    className="
      inline-flex items-center gap-2
      px-4 py-2.5 text-sm font-medium
      bg-base-900 text-white rounded-lg
      dark:bg-accent-600
      hover:bg-base-800 dark:hover:bg-accent-700
    "
    onClick={onRetry}
  >
    <svg className="w-4 h-4">{/* RefreshCw icon */}</svg>
    Try Again
  </button>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L222--241 -- Card-level error ("Failed to load transactions" with retry button)
- `design-artifacts/prototypes/ui-states.html` L243--256 -- Full page error ("Can't reach the server" with retry)

## Acceptance Criteria
- [ ] Variant A shows rose AlertTriangle icon in a circle (w-12 h-12 bg-rose-50)
- [ ] Variant A title uses text-sm font-semibold
- [ ] Variant A message uses text-sm text-base-400 max-w-xs
- [ ] Variant A retry button uses secondary (sm) button style
- [ ] Variant B shows WifiOff icon in a larger circle (w-16 h-16 bg-base-100)
- [ ] Variant B title uses text-lg font-semibold
- [ ] Variant B shows server URL in font-mono-data text-xs text-base-300
- [ ] Variant B retry CTA uses primary button style
- [ ] Variant B centers vertically with min-h-[60vh]
- [ ] onRetry callback is called when retry button is clicked
- [ ] Dark mode styles apply correctly
- [ ] All tests pass and meet coverage target
- [ ] Both variant A (card) and variant B (page) have dedicated test coverage

## Testing Requirements
- **Test file**: `src/components/shared/ErrorState.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test error message (title and description) renders correctly from props
- Test retry button fires `onRetry` callback when clicked
- Test custom message text is displayed as provided
- Test card variant renders AlertTriangle icon with rose styling
- Test page variant renders WifiOff icon and server URL in monospace
- Test component renders without retry button when `onRetry` is not provided
- Test page variant centers vertically with min-h-[60vh]

## Technical Notes
- File to create: `src/components/shared/ErrorState.tsx`
- Props: `variant: 'card' | 'page'`, `title: string`, `message: string`, `onRetry?: () => void`, `serverUrl?: string` (for page variant)
- The card variant is used inside ChartCard, CollapsibleSection, or any card that fetches data
- The page variant is used when the PocketBase service layer cannot establish a connection
- Export as named export: `export { ErrorState }`
