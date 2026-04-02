# US-040: CollapsibleYearTable Component

## Story
As the Insight platform user, I want a yearly summary table for utilities where each year row expands to show monthly breakdowns so that I can see consumption and cost trends at both annual and monthly granularity.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-011: Shared Formatters (Danish Locale)
- US-015: ChangeIndicator Component

## Requirements
- Create a `CollapsibleYearTable` component per PRD §5.4
- Each row represents a year with aggregate totals
- Clicking a year row expands to show computed monthly summary rows
- Year row columns: year label, total consumption, avg monthly consumption, consumption change %, total cost, avg cost, avg cost/unit, cost change %
- Monthly row columns: month label, consumption, consumption change % (vs same month prior year), amortized cost, cost/unit, cost change % (vs same month prior year)
- Change percentages are color-coded: red for increase, green for decrease (inverted — increase = bad for cost/consumption)
- Monthly rows are derived aggregations, not raw data records
- Current year row shows "(YTD)" label

## Shared Components Used
- US-015: ChangeIndicator (with invertColor for cost/consumption metrics)

## UI Specification

```tsx
/* === CollapsibleYearTable === */
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-base-200 dark:border-base-700">
        <th className="px-4 py-2.5 text-left text-xs font-medium text-base-300 dark:text-base-400 w-24">
          Period
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
          Consumption
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
          Avg/Month
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16">
          {/* Change % */}
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
          Cost
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
          Avg Cost
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400">
          Cost/Unit
        </th>
        <th className="px-4 py-2.5 text-right text-xs font-medium text-base-300 dark:text-base-400 w-16">
          {/* Change % */}
        </th>
      </tr>
    </thead>

    <tbody>
      {/* === Year row (collapsed) === */}
      <tr
        className="
          border-b border-base-100 dark:border-base-700/50
          hover:bg-base-50/50 dark:hover:bg-base-700/30
          cursor-pointer
          transition-colors duration-100
        "
        onClick={toggleExpand}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <svg
              className="
                w-3.5 h-3.5 text-base-400
                transition-transform duration-200
              "
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              {/* ChevronRight icon */}
            </svg>
            <span className="text-sm font-semibold text-base-900 dark:text-white">
              2026 (YTD)
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          1.842 kWh
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          614 kWh
        </td>
        <td className="px-4 py-3 text-right">
          {/* ChangeIndicator (invertColor: increase = red) */}
          <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
            <svg className="w-3 h-3"><path d="M6 9V3M6 3L3 6M6 3L9 6" /></svg>
            <span className="font-mono-data text-xs font-medium">+3,2%</span>
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-900 dark:text-white">
          4.200 DKK
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          1.400 DKK
        </td>
        <td className="px-4 py-3 text-sm text-right font-mono-data text-base-700 dark:text-base-300">
          2,28 DKK
        </td>
        <td className="px-4 py-3 text-right">
          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
            <svg className="w-3 h-3"><path d="M6 3V9M6 9L3 6M6 9L9 6" /></svg>
            <span className="font-mono-data text-xs font-medium">-1,5%</span>
          </span>
        </td>
      </tr>

      {/* === Monthly rows (expanded, indented) === */}
      <tr
        className="
          border-b border-base-50 dark:border-base-700/30
          bg-base-50/40 dark:bg-base-800/50
        "
      >
        <td className="px-4 py-2.5 pl-10">
          <span className="text-xs text-base-500 dark:text-base-400">
            Mar 2026
          </span>
        </td>
        <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
          598 kWh
        </td>
        {/* Avg/Month column empty for monthly rows */}
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5 text-right">
          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
            <svg className="w-3 h-3"><path d="M6 3V9M6 9L3 6M6 9L9 6" /></svg>
            <span className="font-mono-data text-[11px] font-medium">-5,1%</span>
          </span>
        </td>
        <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
          1.350 DKK
        </td>
        {/* Avg Cost column empty for monthly rows */}
        <td className="px-4 py-2.5" />
        <td className="px-4 py-2.5 text-xs text-right font-mono-data text-base-700 dark:text-base-300">
          2,26 DKK
        </td>
        <td className="px-4 py-2.5 text-right">
          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
            <svg className="w-3 h-3"><path d="M6 3V9M6 9L3 6M6 9L9 6" /></svg>
            <span className="font-mono-data text-[11px] font-medium">-2,8%</span>
          </span>
        </td>
      </tr>

      {/* Additional monthly rows... */}

      {/* === Previous year row (collapsed) === */}
      <tr
        className="
          border-b border-base-100 dark:border-base-700/50
          hover:bg-base-50/50 dark:hover:bg-base-700/30
          cursor-pointer
        "
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-base-400">
              {/* ChevronRight (collapsed) */}
            </svg>
            <span className="text-sm font-semibold text-base-900 dark:text-white">
              2025
            </span>
          </div>
        </td>
        {/* ... year totals ... */}
      </tr>
    </tbody>
  </table>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L370--481 -- Yearly summary table with expandable rows pattern

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-yearly.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-yearly.png`

## Acceptance Criteria
- [ ] Each year renders as a clickable row with a chevron indicator
- [ ] Chevron rotates 90 degrees when expanded (transition-transform duration-200)
- [ ] Year rows show: year label, total consumption, avg monthly, consumption change %, total cost, avg cost, cost/unit, cost change %
- [ ] Current year shows "(YTD)" suffix via formatYearLabel from US-011
- [ ] Clicking a year row expands to show monthly summary rows below it
- [ ] Monthly rows are visually indented (pl-10) with lighter background (bg-base-50/40)
- [ ] Monthly rows show: month label, consumption, consumption change %, amortized cost, cost/unit, cost change %
- [ ] Change percentages are color-coded with invertColor logic: increase = red (rose), decrease = green (emerald)
- [ ] All numeric values use font-mono-data
- [ ] Year row values use text-sm, monthly row values use text-xs
- [ ] Multiple year rows can be expanded simultaneously
- [ ] Years are sorted descending (most recent first)
- [ ] Dark mode styles apply correctly

## Technical Notes
- File to create: `src/components/shared/CollapsibleYearTable.tsx`
- Props: `years: Array<YearData>`, `unit: string` (e.g., "kWh", "m3"), `currency?: string` (default: "DKK")
- `YearData` type: `{ year: number, isCurrentYear: boolean, totalConsumption: number, avgMonthly: number, consumptionChange: number | null, totalCost: number, avgCost: number, avgCostPerUnit: number, costChange: number | null, months: Array<MonthData> }`
- `MonthData` type: `{ month: Date, consumption: number, consumptionChange: number | null, cost: number, costPerUnit: number, costChange: number | null }`
- Change values can be `null` for the first year/month with no prior comparison
- The monthly data is computed by the utility service layer — this component is purely presentational
- Uses ChangeIndicator (US-015) with `invertColor={true}` since for utilities, both cost and consumption increases are negative
- Export as named export: `export { CollapsibleYearTable }`
