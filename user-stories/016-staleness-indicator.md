# US-016: StalenessIndicator Component

## Story
As the Insight platform user, I want a visual staleness badge on platforms and utilities that haven't been updated this month so that I know at a glance which data sources need fresh entries.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `StalenessIndicator` badge component per PRD §3.4
- 2 severity levels:
  - **warning** (amber): No new entry by the 2nd of the month
  - **critical** (rose): No new entry by the 7th of the month
- 3 sizes:
  - **sm**: For dropdown switchers and compact lists
  - **md**: For overview cards and table rows
  - **lg**: For mobile detail page headers
- All sizes include an animated pulsing dot
- Badge disappears once a data point or meter reading is added for the current month
- Shown on: investment platform overview rows, platform detail headers, utility overview cards, utility detail headers

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Warning (amber) — sm size (dropdown) === */
<span
  className="
    inline-flex items-center gap-1
    text-[10px] font-medium
    px-1.5 py-0.5 rounded-full
    bg-amber-50 text-amber-700 border border-amber-200
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700
  "
>
  <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
  Stale
</span>

/* === Warning (amber) — md size (cards) === */
<span
  className="
    inline-flex items-center gap-1.5
    text-xs font-medium
    px-2 py-0.5 rounded-full
    bg-amber-50 text-amber-700 border border-amber-200
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700
  "
>
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
  Stale
</span>

/* === Warning (amber) — lg size (mobile headers) === */
<span
  className="
    inline-flex items-center gap-2
    text-sm font-semibold
    px-3.5 py-1 rounded-full
    bg-amber-50 text-amber-700 border border-amber-200
    dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700
  "
>
  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
  Stale
</span>

/* === Critical (rose) — sm size (dropdown) === */
<span
  className="
    inline-flex items-center gap-1
    text-[10px] font-medium
    px-1.5 py-0.5 rounded-full
    bg-rose-50 text-rose-700 border border-rose-200
    dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700
  "
>
  <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
  Stale
</span>

/* === Critical (rose) — md size (cards) === */
<span
  className="
    inline-flex items-center gap-1.5
    text-xs font-medium
    px-2 py-0.5 rounded-full
    bg-rose-50 text-rose-700 border border-rose-200
    dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700
  "
>
  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
  Stale
</span>

/* === Critical (rose) — lg size (mobile headers) === */
<span
  className="
    inline-flex items-center gap-2
    text-sm font-semibold
    px-3.5 py-1 rounded-full
    bg-rose-50 text-rose-700 border border-rose-200
    dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-700
  "
>
  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
  Stale
</span>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L127--131 -- Rose (red) stale badge with pulsing dot
- `design-artifacts/prototypes/home-overview.html` L225--229 -- Amber stale badge with pulsing dot
- `design-artifacts/prototypes/portfolio-overview.html` L675--679 -- Amber stale badge on Nordnet row
- `design-artifacts/prototypes/portfolio-overview.html` L718--722 -- Rose stale badge on Mintos row

## Acceptance Criteria
- [ ] Warning severity uses amber color palette (bg-amber-50, text-amber-700, border-amber-200)
- [ ] Critical severity uses rose color palette (bg-rose-50, text-rose-700, border-rose-200)
- [ ] sm size uses text-[10px] px-1.5 and w-1 h-1 dot
- [ ] md size uses text-xs px-2 and w-1.5 h-1.5 dot
- [ ] lg size uses text-sm font-semibold px-3.5 and w-2 h-2 dot
- [ ] Dot has animate-pulse class for pulsing animation
- [ ] All sizes have rounded-full and border
- [ ] Dark mode applies correct dark variants (dark:bg-amber-900/30 etc.)
- [ ] Component accepts `severity` (warning | critical) and `size` (sm | md | lg) props
- [ ] Component renders nothing when data is not stale (null return)
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/StalenessIndicator.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Render warning severity: verify amber color palette (`bg-amber-50`, `text-amber-700`, `border-amber-200`)
  - Render critical severity: verify rose color palette (`bg-rose-50`, `text-rose-700`, `border-rose-200`)
  - Render sm size: verify `text-[10px]`, `px-1.5`, and dot is `w-1 h-1`
  - Render md size (default): verify `text-xs`, `px-2`, and dot is `w-1.5 h-1.5`
  - Render lg size: verify `text-sm font-semibold`, `px-3.5`, and dot is `w-2 h-2`
  - Verify pulsing dot has `animate-pulse` class across all sizes
  - Verify all sizes have `rounded-full` and `border` classes
  - Verify dark mode classes: `dark:bg-amber-900/30`, `dark:text-amber-400`, `dark:border-amber-700` for warning; corresponding rose values for critical
  - Verify label text reads "Stale"
  - Test all 6 combinations (2 severities x 3 sizes) render correct class sets
  - Snapshot test for each severity + size combination

## Technical Notes
- File to create: `src/components/shared/StalenessIndicator.tsx`
- Props: `severity: 'warning' | 'critical'`, `size?: 'sm' | 'md' | 'lg'` (default: md)
- The staleness logic itself (determining warning vs critical) lives outside this component — in the service or page layer. This component is purely presentational.
- PRD §3.4 rules: amber by 2nd of month, rose by 7th of month. The parent component computes which severity to pass (or omits the component entirely when not stale).
- Export as named export: `export { StalenessIndicator }`
