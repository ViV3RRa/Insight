# US-025: DataTable Component

## Story
As the Insight platform user, I want a consistent data table for displaying raw records (transactions, data points, readings, bills) so that I can browse, sort, and manage my data across all sections.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-013: Button Component

## Requirements
- Create a `DataTable` component per PRD §3.6
- Container with overflow-x-auto for horizontal scrolling when needed
- Table header: text-xs font-medium text-base-300, border-b
- Table body rows: border-b border-base-100, hover highlight
- Optional totals row with distinct background
- Cells: consistent padding px-4 py-3
- Numbers right-aligned with font-mono-data
- Features:
  - **Sortable columns**: Click header to sort, visual indicator for sort direction
  - **Expand/collapse**: Table collapsed by default per PRD §3.6 (handled by wrapping in CollapsibleSection)
  - **Show-more toggle**: When rows exceed a threshold, show a "Show all N" / "Show less" toggle
  - **Edit/delete actions**: Per-row action buttons (desktop only — mobile uses drawer per US-027)
- Responsive: secondary columns hidden on mobile (replaced by MobileColumnCycler per US-026)

## Shared Components Used
- US-013: Button (for action buttons and show-more toggle)

## UI Specification

```tsx
/* === DataTable === */
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table header */}
    <thead>
      <tr className="border-b border-base-200 dark:border-base-700">
        {/* Sortable column header */}
        <th
          className="
            px-4 py-2.5 text-left
            text-xs font-medium text-base-300 dark:text-base-400
            cursor-pointer select-none
            hover:text-base-500
          "
        >
          <div className="flex items-center gap-1">
            Date
            {/* Sort indicator */}
            <svg className="w-3 h-3 text-base-300">
              {/* ChevronDown or ChevronUp from lucide-react */}
            </svg>
          </div>
        </th>

        {/* Right-aligned numeric header */}
        <th
          className="
            px-4 py-2.5 text-right
            text-xs font-medium text-base-300 dark:text-base-400
          "
        >
          Amount
        </th>

        {/* Actions column header (desktop only) */}
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 w-20 hidden sm:table-cell">
          {/* Empty or "Actions" */}
        </th>
      </tr>
    </thead>

    {/* Table body */}
    <tbody>
      {/* Standard row */}
      <tr
        className="
          border-b border-base-100 dark:border-base-700/50
          hover:bg-accent-50/20 dark:hover:bg-accent-900/10
          transition-colors duration-100
        "
      >
        <td className="px-4 py-3 text-sm text-base-700 dark:text-base-300">
          2026-02-14
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          5.057,80 DKK
        </td>

        {/* Actions (desktop only) */}
        <td className="px-4 py-3 text-right hidden sm:table-cell">
          <div className="flex items-center justify-end gap-1">
            <button className="p-1 text-base-300 hover:text-base-600 dark:hover:text-base-200 rounded">
              <svg className="w-3.5 h-3.5">{/* Pencil icon */}</svg>
            </button>
            <button className="p-1 text-base-300 hover:text-rose-500 rounded">
              <svg className="w-3.5 h-3.5">{/* Trash2 icon */}</svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Row with note */}
      <tr className="border-b border-base-100 dark:border-base-700/50 hover:bg-accent-50/20 dark:hover:bg-accent-900/10">
        <td className="px-4 py-3">
          <span className="text-sm text-base-700 dark:text-base-300">2026-01-31</span>
          <p className="text-xs text-base-300 dark:text-base-500 mt-0.5 italic">
            Bonus deposited
          </p>
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          10.000,00 DKK
        </td>
        <td className="px-4 py-3 text-right hidden sm:table-cell">
          {/* action buttons */}
        </td>
      </tr>
    </tbody>

    {/* Optional totals row */}
    <tfoot>
      <tr className="bg-base-50/60 dark:bg-base-700/30">
        <td className="px-4 py-3 text-sm font-medium text-base-700 dark:text-base-300">
          Total
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data font-medium text-base-900 dark:text-white">
          15.057,80 DKK
        </td>
        <td className="hidden sm:table-cell" />
      </tr>
    </tfoot>
  </table>
</div>

/* === Show more / Show less toggle === */
<div className="px-4 py-2 border-t border-base-100 dark:border-base-700">
  <button className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300">
    Show all 48 records
  </button>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L613--778 -- Investment Platforms table (with icons, currency, stale badges)
- `design-artifacts/prototypes/portfolio-overview.html` L780--831 -- Cash Accounts table (simpler variant)
- `design-artifacts/prototypes/portfolio-overview.html` L833--897 -- Closed Platforms table (dimmed rows)
- `design-artifacts/prototypes/ui-states.html` L144--190 -- Table skeleton loading

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-tables.png`

## Acceptance Criteria
- [ ] Container uses overflow-x-auto for horizontal scroll on narrow screens
- [ ] Header row uses text-xs font-medium text-base-300 with border-b border-base-200
- [ ] Body rows use border-b border-base-100 with hover:bg-accent-50/20
- [ ] Cell padding is px-4 py-3
- [ ] Numeric cells are right-aligned with font-mono-data
- [ ] Sortable columns show a sort direction indicator (chevron) on click
- [ ] Clicking a sortable header toggles sort direction and re-orders rows
- [ ] Totals row uses bg-base-50/60 with font-medium
- [ ] Edit/delete action buttons appear per row on desktop (hidden sm:table-cell)
- [ ] Action buttons are hidden on mobile (mobile uses MobileDrawer per US-027)
- [ ] Notes display as italic text-xs text-base-300 below the primary cell value
- [ ] Show-more toggle appears when rows exceed the default display limit
- [ ] Dark mode styles apply correctly
- [ ] All tests pass and meet coverage target
- [ ] Accessibility audit passes (axe-core or equivalent)

## Testing Requirements
- **Test file**: `src/components/shared/DataTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied (dark: prefix variants)
- **Component-specific test cases:**
  - Verify column headers render with correct labels from `columns` prop
  - Verify all data rows render with correct cell content from `data` prop
  - Verify empty state: no rows rendered when `data` is an empty array (no crash)
  - Verify header row uses `text-xs font-medium text-base-300` with `border-b border-base-200`
  - Verify body rows use `border-b border-base-100` with `hover:bg-accent-50/20`
  - Verify numeric cells are right-aligned with `font-mono-data` class when `align: 'right'` is set
  - Verify sortable column headers show sort direction indicator (chevron icon)
  - Verify clicking a sortable header toggles sort direction and re-orders rows
  - Verify totals row renders with `bg-base-50/60 font-medium` when `totals` prop is provided
  - Verify totals row is absent when `totals` prop is omitted
  - Verify edit/delete action buttons appear per row on desktop (`hidden sm:table-cell`)
  - Verify `onEdit` callback fires when edit button is clicked
  - Verify `onDelete` callback fires when delete button is clicked
  - Verify `onRowClick` callback fires when a row is clicked (for mobile drawer trigger)
  - Verify notes display as italic `text-xs text-base-300` below the primary cell value
  - Verify show-more toggle appears when rows exceed `showMoreThreshold` (default: 10)
  - Verify show-more toggle text reads "Show all N records" and toggles to "Show less"
  - Verify custom `format` function on `ColumnDef` is called and rendered
  - Verify dark mode classes: `dark:border-base-700`, `dark:hover:bg-accent-900/10`, `dark:bg-base-700/30` for totals
  - Snapshot test for basic table, table with totals, and empty state

## Technical Notes
- File to create: `src/components/shared/DataTable.tsx`
- Props: `columns: Array<ColumnDef>`, `data: Array<Record>`, `sortable?: boolean`, `defaultSort?: { key: string, direction: 'asc' | 'desc' }`, `totals?: Record`, `showMoreThreshold?: number` (default: 10), `onEdit?: (record) => void`, `onDelete?: (record) => void`, `onRowClick?: (record) => void` (for mobile drawer trigger)
- `ColumnDef` type: `{ key: string, label: string, align?: 'left' | 'right', format?: (value) => ReactNode, sortable?: boolean, hideOnMobile?: boolean }`
- The edit/delete handlers trigger dialog opening in the parent component
- On mobile, the entire row should be tappable (triggers `onRowClick` which opens MobileDrawer)
- Export as named export: `export { DataTable }`
