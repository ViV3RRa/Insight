# US-023: CollapsibleSection (Accordion) Component

## Story
As the Insight platform user, I want collapsible sections for raw data tables so that detail pages stay clean by default while giving me full access to underlying data when I need it.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `CollapsibleSection` accordion component per PRD §3.6
- Toggle button: full-width flex row with icon, title, count badge, and chevron
- Chevron rotates 180 degrees on expand with a smooth transition
- Content area toggles between visible and hidden
- Collapsed by default for raw data tables (meter readings, bills, transactions, data points)
- Support for optional icon (lucide-react) before the title
- Support for optional count badge showing number of records
- Multiple CollapsibleSections can be used on the same page, each independent

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Collapsed state === */
<div className="border border-base-150 dark:border-base-700 rounded-2xl overflow-hidden">
  <button
    className="
      w-full flex items-center gap-3
      px-4 py-3 sm:px-5 sm:py-4
      text-left
      bg-white dark:bg-base-800
      hover:bg-base-50 dark:hover:bg-base-750
      transition-colors duration-150
    "
    aria-expanded="false"
  >
    {/* Optional icon */}
    <svg className="w-4 h-4 text-base-400 flex-shrink-0">
      {/* e.g., Database icon from lucide-react */}
    </svg>

    {/* Title */}
    <span className="text-sm font-semibold text-base-900 dark:text-white flex-1">
      Meter Readings
    </span>

    {/* Count badge */}
    <span
      className="
        text-xs font-medium
        px-2 py-0.5 rounded-full
        bg-base-100 dark:bg-base-700
        text-base-400
      "
    >
      24
    </span>

    {/* Chevron (collapsed: pointing right/down) */}
    <svg
      className="
        w-4 h-4 text-base-400 flex-shrink-0
        transition-transform duration-200
      "
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
</div>

/* === Expanded state === */
<div className="border border-base-150 dark:border-base-700 rounded-2xl overflow-hidden">
  <button
    className="
      w-full flex items-center gap-3
      px-4 py-3 sm:px-5 sm:py-4
      text-left
      bg-white dark:bg-base-800
      hover:bg-base-50 dark:hover:bg-base-750
      transition-colors duration-150
    "
    aria-expanded="true"
  >
    {/* Optional icon */}
    <svg className="w-4 h-4 text-base-400 flex-shrink-0">
      {/* e.g., Database icon */}
    </svg>

    {/* Title */}
    <span className="text-sm font-semibold text-base-900 dark:text-white flex-1">
      Meter Readings
    </span>

    {/* Count badge */}
    <span
      className="
        text-xs font-medium
        px-2 py-0.5 rounded-full
        bg-base-100 dark:bg-base-700
        text-base-400
      "
    >
      24
    </span>

    {/* Chevron (expanded: rotated 180°) */}
    <svg
      className="
        w-4 h-4 text-base-400 flex-shrink-0
        transition-transform duration-200
        rotate-180
      "
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>

  {/* Content area */}
  <div className="bg-white dark:bg-base-800">
    {/* Children rendered here (e.g., DataTable) */}
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L264--272 -- Collapsible "Performance Charts & Analysis" toggle with chevron

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] Toggle button spans full width with flex layout
- [ ] Button shows optional icon (w-4 h-4 text-base-400), title, count badge, and chevron
- [ ] Title uses text-sm font-semibold text-base-900
- [ ] Count badge uses text-xs px-2 py-0.5 rounded-full bg-base-100 text-base-400
- [ ] Chevron rotates 180 degrees on expand with transition-transform duration-200
- [ ] Content area is hidden when collapsed, visible when expanded
- [ ] aria-expanded attribute toggles between "true" and "false"
- [ ] Default state is collapsed
- [ ] Component supports controlled mode (expanded prop + onChange) and uncontrolled mode
- [ ] Multiple instances on the same page operate independently
- [ ] Dark mode styles apply correctly

## Technical Notes
- File to create: `src/components/shared/CollapsibleSection.tsx`
- Props: `title: string`, `children: ReactNode`, `icon?: LucideIcon`, `count?: number`, `defaultExpanded?: boolean`, `expanded?: boolean`, `onToggle?: (expanded: boolean) => void`
- If `expanded` and `onToggle` are provided, component is controlled; otherwise it manages its own state
- PRD §3.6: raw data tables are collapsed by default. Charts and performance sections are NOT collapsible.
- Export as named export: `export { CollapsibleSection }`
