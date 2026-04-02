# US-095: Utility Detail — Header + Stat Cards

## Story
As the Insight platform user, I want a detail page header for each utility showing key stat cards so that I can see the most important metrics at a glance.

## Dependencies
- US-014: StatCard Component
- US-015: ChangeIndicator Component
- US-016: StalenessIndicator Component
- US-088: Utility Icon Component
- US-032: DropdownSwitcher Component
- US-086: Cost Per Unit Calculation
- US-087: Utility YoY Calculations

## Requirements
- Utility detail page header with switcher bar and stat cards (PRD §5.4)
- **Switcher bar:** Back button + DropdownSwitcher showing utility icon, name, staleness badge, and "Updated" date
- **Desktop action buttons:** "+ Add Reading" (secondary) and "+ Add Bill" (primary) in header row
- **Mobile action buttons:** Full-width pair below the nav bar
- **Summary KPI cards** — 6 cards in grid (PRD §5.4):
  1. **This Month** — current month consumption (with unit suffix, e.g. "kWh")
  2. **This Month Cost** — current month cost (DKK)
  3. **vs Last Month** — consumption change % vs previous month (ChangeIndicator), sublabel showing "previousValue → currentValue unit" (e.g., "312 → 285 kWh")
  4. **YTD Consumption** — year-to-date consumption
  5. **YTD Cost** — year-to-date cost (DKK)
  6. **Cost per Unit** — current month cost per unit (DKK/unit)
- Grid: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8`

## Shared Components Used
- `StatCard` (US-014) — for each of the 6 KPI cards
- `ChangeIndicator` (US-015) — for "vs Last Month" card
- `StalenessIndicator` (US-016) — in switcher bar
- `UtilityIcon` (US-088) — in switcher trigger
- `DropdownSwitcher` (US-032) — utility switcher in header
- `Button` (US-013) — action buttons

## UI Specification

**Switcher bar (from ui-analysis §2.2):**
```
<div className="flex items-center justify-between mb-6 lg:mb-8">
  <DropdownSwitcher
    triggerContent={
      <div className="flex items-center gap-2.5">
        <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-base-100 dark:hover:bg-base-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <UtilityIcon icon={utility.icon} color={utility.color} size="md" />
        <div>
          <div className="text-sm font-bold tracking-tight">{utility.name}</div>
          <div className="text-[11px] text-base-400">Updated {lastReadingDate}</div>
        </div>
        {isStale && <StalenessIndicator level={stalenessLevel} size="md" />}
      </div>
    }
    items={allUtilities}
    currentId={utility.id}
  />
  {/* Desktop action buttons */}
  <div className="hidden lg:flex items-center gap-2">
    <Button variant="secondary" size="sm">+ Add Reading</Button>
    <Button variant="primary" size="sm">+ Add Bill</Button>
  </div>
</div>
```

**Stat cards grid:**
```
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
  <StatCard label="This Month" value={currentConsumption} suffix={utility.unit} />
  <StatCard label="This Month Cost" value={currentCost} suffix="DKK" />
  <StatCard label="vs Last Month" value={changePercent} changeIndicator sublabel={`${prevConsumption} → ${currentConsumption} ${utility.unit}`} />
  <StatCard label="YTD Consumption" value={ytdConsumption} suffix={utility.unit} />
  <StatCard label="YTD Cost" value={ytdCost} suffix="DKK" />
  <StatCard label="Cost per Unit" value={costPerUnit} suffix={`DKK/${utility.unit}`} />
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Desktop switcher bar with back button, icon, name, stale badge, dropdown: L140-199
- Desktop action buttons ("+ Add Reading" secondary, "+ Add Bill" primary): L200-204
- Mobile nav with back button + utility name + icon: L62-77
- Mobile stale badge (right-aligned in nav): L79-82
- Summary KPI cards grid (6 cards): L207-239

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-top.png`

## Acceptance Criteria
- [ ] Utility switcher bar shows back button, icon, name, updated date, and stale badge
- [ ] Switching utilities via dropdown navigates to the selected utility's detail page
- [ ] Desktop action buttons in header: "+ Add Reading" (secondary), "+ Add Bill" (primary)
- [ ] Mobile: action buttons full-width below header
- [ ] 6 stat cards render with correct values and labels
- [ ] "vs Last Month" card uses ChangeIndicator (green for decrease, red for increase) with sublabel showing "previousValue → currentValue unit" (e.g., "312 → 285 kWh")
- [ ] Cost per unit shows DKK/unit suffix
- [ ] Grid responsive: 2 cols on mobile, 3 on sm, 6 on lg
- [ ] Staleness badge visible in switcher when utility is stale
- [ ] Uses shared StatCard, ChangeIndicator, StalenessIndicator, UtilityIcon, DropdownSwitcher
- [ ] PRD §5.4: Utility detail header and stat cards match spec
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering header, stat cards, and interactions

## Testing Requirements
- **Test file**: `src/components/home/UtilityDetailHeader.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test switcher bar shows utility name, icon, color, and updated date
- Test staleness badge appears when utility is stale
- Test desktop action buttons render: "+ Add Reading" (secondary) and "+ Add Bill" (primary)
- Test 6 stat cards render with correct labels and values (This Month, This Month Cost, vs Last Month, YTD Consumption, YTD Cost, Cost per Unit)
- Test "vs Last Month" card uses ChangeIndicator with correct color (green for decrease, red for increase)
- Test grid responsive classes: 2 cols on mobile, 3 on sm, 6 on lg
- Test loading state renders skeleton placeholders
- Test with missing/null metric data (e.g., no readings yet)

## Technical Notes
- File: `src/components/home/UtilityDetail.tsx` (header section)
- Data from `calculateUtilityMetrics()` (US-086)
- Change indicator for consumption: decrease = green, increase = red (inverse of investment)
- Utility switcher: items from `utilityService.getAll()`, navigate via `navigate('/home/utility/{id}')`
- "Updated" date: most recent meter reading timestamp, formatted as "MMM DD"
