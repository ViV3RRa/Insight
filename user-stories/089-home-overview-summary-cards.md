# US-089: Home Overview — Utility Summary Cards

## Story
As the Insight platform user, I want summary cards for each utility on the Home overview so that I can see current consumption, cost, and trends at a glance.

## Dependencies
- US-014: StatCard Component
- US-015: ChangeIndicator Component
- US-016: StalenessIndicator Component
- US-017: CurrencyDisplay Component
- US-088: Utility Icon Component
- US-086: Cost Per Unit Calculation
- US-087: Utility YoY Calculations
- US-081: Utility CRUD Service

## Requirements
- One clickable card per utility (PRD §5.3 item 2)
- Each card shows:
  - Utility icon (colored, via UtilityIcon) and name + unit
  - Staleness badge (if stale, per PRD §3.4)
  - Chevron-right indicator (indicating card is clickable)
  - 2-column metric grid:
    - **Consumption**: current month consumption, with ChangeIndicator vs last month
    - **Cost**: current month cost
  - 3-column footer stats:
    - **YTD Cost**: year-to-date total cost
    - **Cost/Unit**: current month cost per unit
    - **Updated**: date of most recent meter reading
- Card is clickable → navigates to utility detail page
- Grid: `grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8`

## Shared Components Used
- `UtilityIcon` (US-088) — props: { icon: utility.icon, color: utility.color, size: "lg" }
- `ChangeIndicator` (US-015) — for consumption change vs last month
- `StalenessIndicator` (US-016) — for stale utility badge
- `CurrencyDisplay` (US-017) — for cost values

## UI Specification

**Card container:**
```
<a href={`/home/utility/${utility.id}`}
   className="bg-white dark:bg-base-800 rounded-2xl p-5 shadow-card dark:shadow-card-dark
              block hover:shadow-lg transition-shadow cursor-pointer group relative">
```

**Card layout (from ui-analysis §2.1):**
```
{/* Header row: icon + name + stale badge + chevron */}
<div className="flex items-start justify-between mb-4">
  <div className="flex items-center gap-3">
    <UtilityIcon icon={utility.icon} color={utility.color} size="lg" />
    <div>
      <div className="text-sm font-semibold">{utility.name}</div>
      <div className="text-xs text-base-400">{utility.unit}</div>
    </div>
    {isStale && <StalenessIndicator level={stalenessLevel} size="sm" />}
  </div>
  <ChevronRight className="w-4 h-4 text-base-300 group-hover:text-base-500 transition-colors" />
</div>

{/* 2-col metric grid: Consumption + Cost */}
<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500">Consumption</div>
    <div className="font-mono-data text-xl font-medium">{formattedConsumption}</div>
    <ChangeIndicator value={consumptionChange} unit="%" />
  </div>
  <div>
    <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500">Cost</div>
    <div className="font-mono-data text-xl font-medium">{formattedCost} <span className="text-xs text-base-300">DKK</span></div>
  </div>
</div>

{/* 3-col footer stats */}
<div className="grid grid-cols-3 gap-2 pt-3 border-t border-base-100 dark:border-base-700">
  <div>
    <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500">YTD Cost</div>
    <div className="font-mono-data text-sm font-medium">{formattedYtdCost}</div>
  </div>
  <div>
    <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500">Cost/Unit</div>
    <div className="font-mono-data text-sm font-medium">{formattedCostPerUnit}</div>
  </div>
  <div>
    <div className="text-[10px] uppercase tracking-wider text-base-300 dark:text-base-500">Updated</div>
    <div className="text-sm text-base-400">{formattedLastUpdate}</div>
  </div>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Utility Summary Cards grid: L111-264 (3-column grid with Electricity L114-164, Water L166-210, Heat L212-263)
- Each card: icon + name + unit, consumption/cost grid, change indicator, footer with YTD/cost-per-unit/updated

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-top.png`

## Acceptance Criteria
- [ ] One card rendered per utility
- [ ] Cards show icon, name, unit, staleness badge (when applicable)
- [ ] Current month consumption displayed with change indicator vs last month
- [ ] Current month cost displayed in DKK
- [ ] Footer shows YTD Cost, Cost/Unit, and Updated date
- [ ] Cards are clickable and navigate to utility detail page
- [ ] Grid layout: single column on mobile, 3 columns on sm+
- [ ] Hover effect: shadow-lg transition
- [ ] Staleness badge appears when no reading exists for current month
- [ ] ChangeIndicator shows % change for consumption (green for decrease, red for increase)
- [ ] Uses shared UtilityIcon, ChangeIndicator, StalenessIndicator, CurrencyDisplay
- [ ] PRD §5.3 item 2: Summary cards per utility with required metrics
- [ ] PRD §14 criterion 7: Home overview shows summary cards per utility

## Technical Notes
- File: `src/components/home/UtilitySummaryCards.tsx`
- Data: utility list from `utilityService.getAll()`, metrics from `calculateUtilityMetrics()`
- Staleness: check if most recent reading timestamp is before 2nd of current month (amber) or 7th (red)
- ChangeIndicator for consumption: compare current month to previous month. For utilities, decrease = green, increase = red (opposite of investment returns)
- Updated date formatted as "MMM DD" (e.g. "Feb 14") per PRD §3.7
