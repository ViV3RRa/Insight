# US-014: StatCard (KPI Card) Component

## Story
As the Insight platform user, I want consistent stat cards displaying key metrics so that I can quickly scan important values across all detail and overview pages.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-011: Shared Formatters (Danish Locale)

## Requirements
- Create a `StatCard` component with 4 variants:
  - **Variant A — Simple value**: Label + value (e.g., "Current Value" / "5.057,80 DKK")
  - **Variant B — Colored value**: Label + value colored emerald (positive) or rose (negative) (e.g., gain/loss)
  - **Variant C — Value with percent badge**: Label + value + inline percentage badge (e.g., "All-Time Gain" / "+182.914 DKK" / "+12,5%")
  - **Variant D — Value with unit suffix**: Label + value with a unit suffix rendered in muted text (e.g., "XIRR" / "8,42" / "%")
- All values use `font-mono-data` for tabular number alignment
- Optional sublabel below the value for secondary context (e.g., "≈ 7.460 DKK")
- Used on every detail page (6-7 cards per page) and overview pages
- Cards arrange in responsive grids (typically grid-cols-2 sm:grid-cols-3 lg:grid-cols-4)

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Card shell (all variants) === */
<div
  className="
    bg-white dark:bg-base-800
    rounded-2xl p-5
    shadow-card dark:shadow-card-dark
  "
>
  {/* Label */}
  <p className="text-xs text-base-400 dark:text-base-400 mb-1">
    Current Value
  </p>

  {/* === Variant A: Simple value === */}
  <p className="font-mono-data text-xl font-medium text-base-900 dark:text-white">
    5.057,80 DKK
  </p>

  {/* === Variant B: Colored value (positive) === */}
  <p className="font-mono-data text-xl font-medium text-emerald-600 dark:text-emerald-400">
    +182.914 DKK
  </p>

  {/* === Variant B: Colored value (negative) === */}
  <p className="font-mono-data text-xl font-medium text-rose-600 dark:text-rose-400">
    -1.842 DKK
  </p>

  {/* === Variant C: Value with percent badge === */}
  <div className="flex items-baseline gap-2">
    <p className="font-mono-data text-xl font-medium text-emerald-600 dark:text-emerald-400">
      +182.914 DKK
    </p>
    <span
      className="
        font-mono-data text-xs font-medium
        px-1.5 py-0.5 rounded-full
        bg-emerald-50 text-emerald-700
        dark:bg-emerald-900/30 dark:text-emerald-400
      "
    >
      +12,5%
    </span>
  </div>

  {/* === Variant D: Value with unit suffix === */}
  <div className="flex items-baseline gap-1">
    <p className="font-mono-data text-xl font-medium text-base-900 dark:text-white">
      8,42
    </p>
    <span className="text-sm text-base-400">%</span>
  </div>

  {/* === Optional sublabel (all variants) === */}
  <p className="text-xs text-base-300 dark:text-base-500 mt-0.5">
    ≈ 7.460 DKK
  </p>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L184--216 -- 6 KPI stat cards (all variants: simple, colored+badge, unit suffix)
- `design-artifacts/prototypes/home-overview.html` L111--264 -- Utility summary cards (different card pattern, but uses stat display)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`

## Acceptance Criteria
- [ ] Card shell uses bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card
- [ ] Label renders as text-xs text-base-400
- [ ] Value renders with font-mono-data text-xl font-medium
- [ ] Variant A shows plain value in base-900 / white (dark)
- [ ] Variant B shows emerald-600 for positive values, rose-600 for negative values
- [ ] Variant C shows colored value with an inline percentage badge (rounded-full, emerald or rose bg)
- [ ] Variant D shows value with a muted unit suffix (text-sm text-base-400)
- [ ] Optional sublabel renders as text-xs text-base-300 below the value
- [ ] Dark mode colors apply correctly (emerald-400 / rose-400 for colored values)
- [ ] All numeric values use font-mono-data for tabular alignment
- [ ] Component works in responsive grid layouts (grid-cols-2 sm:grid-cols-3 lg:grid-cols-4)
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/StatCard.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Render Variant A (simple): verify label, value in base-900 text, and `font-mono-data` class
  - Render Variant B (colored): verify emerald-600 class for positive trend, rose-600 for negative trend
  - Render Variant C (withBadge): verify colored value + inline percentage badge with `rounded-full` and correct bg color
  - Render Variant C with negative badge: verify rose color palette on badge
  - Render Variant D (withUnit): verify value + muted unit suffix in `text-sm text-base-400`
  - Verify sublabel renders as `text-xs text-base-300` when provided, and is absent when omitted
  - Verify all numeric values have the `font-mono-data` class for tabular alignment
  - Verify card shell has `bg-white rounded-2xl p-5 shadow-card` classes
  - Verify dark mode classes: `dark:bg-base-800`, `dark:text-white`, `dark:text-emerald-400`, `dark:text-rose-400`
  - Verify neutral trend renders in base-900 (no colored styling)
  - Snapshot test for each variant to catch unintended style regressions

## Technical Notes
- File to create: `src/components/shared/StatCard.tsx`
- Props: `label`, `value`, `variant` (simple | colored | withBadge | withUnit), `badgeValue?`, `unitSuffix?`, `sublabel?`, `trend?` (positive | negative | neutral)
- The `trend` prop determines color: positive = emerald, negative = rose, neutral = base
- For Variant C, the badge should also support rose colors for negative percentages
- Export as named export: `export { StatCard }`
