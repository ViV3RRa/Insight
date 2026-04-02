# US-138: Demo Mode

## Story
As the Insight platform user, I want a demo mode that displays realistic synthetic data across all sections so that I can demonstrate the platform to others without revealing personal financial, utility, or vehicle information.

## Dependencies
- US-010: Settings Service and Page
- US-094: Home Overview — Page Assembly
- US-066: Portfolio Overview — Page Assembly
- US-118: Vehicles Overview — Page Assembly

## Requirements
- Toggle in settings page (PRD §3.9)
- When demo mode is enabled:
  - **All sections** display realistic but synthetic data
  - **No real data** is accessible or visible
  - A **visible indicator** (banner) makes it clear demo mode is active
  - Toggling off returns to real data immediately
  - **Display-layer switch** — does not modify, delete, or interfere with real data

**Synthetic data scope (comprehensive enough to demonstrate all features):**
- **Investment**: Multiple portfolios; platforms in DKK and EUR (investment and cash); active and closed platforms; data points spanning 2+ years; transactions (deposits/withdrawals); interpolated data points
- **Home**: 3 utilities (Electricity, Water, Heat); meter readings spanning 2+ years; bills with single and multi-month periods; staleness on one utility
- **Vehicles**: 2 active vehicles (petrol car, motorcycle) + 1 sold vehicle; refueling history with varying efficiency; maintenance events; home-charging data for potential EV demo

**Demo mode banner:**
- Persistent banner at top of page or in navigation area
- Clear visual indicator (e.g. yellow/amber background)
- Text: "Demo Mode — Showing sample data"

## Shared Components Used
- `Button` (US-013) — toggle in settings

## UI Specification

**Demo mode banner:**
```
{settings.demoMode && (
  <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-2 text-center">
    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
      Demo Mode — Showing sample data
    </span>
  </div>
)}
```

## Design Reference
**Prototype (visual targets for demo data):**
- `design-artifacts/prototypes/home-overview.html` — Home section with 3 utilities (Electricity, Water, Heat)
- `design-artifacts/prototypes/portfolio-overview.html` — Investment section with 3 platforms + 2 cash + 1 closed
- `design-artifacts/prototypes/vehicles-overview.html` — Vehicles section with active + sold vehicles
- `design-artifacts/prototypes/platform-detail.html` — Platform detail with full data
- `design-artifacts/prototypes/utility-detail.html` — Utility detail with readings + bills
- `design-artifacts/prototypes/vehicle-detail.html` — Vehicle detail with refuelings + maintenance

## Acceptance Criteria
- [ ] Demo mode toggle in settings page
- [ ] When ON: all sections show synthetic data
- [ ] When OFF: real data shown immediately
- [ ] Demo banner visible at all times when active
- [ ] No real data accessible in demo mode
- [ ] Synthetic data comprehensive: multiple platforms, utilities, vehicles
- [ ] Synthetic data includes multi-currency platforms (DKK + EUR)
- [ ] Synthetic data includes closed/sold entities
- [ ] Synthetic data includes interpolated data points
- [ ] Synthetic data includes file attachments (placeholder images)
- [ ] Demo mode does NOT modify real data in any way
- [ ] Demo data includes at least: 2 portfolios (1 default), 4 investment platforms (2 investment + 1 cash in DKK, 1 investment in EUR), 24+ months of data point history with month-end boundaries
- [ ] Demo data includes at least: 2 utilities (e.g., Electricity + Water) with 24+ months of meter readings and 6+ bills each
- [ ] Demo data includes at least: 2 vehicles (1 active petrol/diesel, 1 sold electric) with 20+ refueling records and 5+ maintenance events
- [ ] Demo data includes interpolated data points (isInterpolated=true) to demonstrate month-end normalization
- [ ] Demo data includes YoY-comparable data (data spanning at least 2 calendar years)
- [ ] Demo data includes a closed investment platform with historical data up to closure date
- [ ] Demo data includes an EV vehicle with `chargedAtHome=true` refueling records
- [ ] PRD §3.9: Demo mode specification
- [ ] PRD §14 criterion 50: Demo mode displays realistic mock data
- [ ] All tests pass and meet coverage target
- [ ] Integration tests verify demo mode toggle and data completeness

## Testing Requirements
- **Test file**: `src/test/integration/demo-mode.test.tsx`
- **Approach**: Integration tests verifying cross-component behavior
- Test demo mode toggle loads demo data across all sections when enabled
- Test demo mode indicator/banner is visible when demo mode is active
- Test disabling demo mode restores real data (no demo data visible)
- Test demo data meets minimum requirements: at least 2 portfolios, 4 investment platforms (2 investment + 1 cash in DKK, 1 investment in EUR), 24+ months of data point history
- Test demo data meets minimum requirements: at least 2 utilities with 24+ months of meter readings and 6+ bills each
- Test demo data meets minimum requirements: at least 2 vehicles (1 active, 1 sold) with 20+ refueling records and 5+ maintenance events
- Test demo data includes interpolated data points (`isInterpolated=true`)
- Test demo data includes YoY-comparable data spanning at least 2 calendar years
- Test demo data includes an EV vehicle with `chargedAtHome=true` refueling records
- Test real data is not modified or deleted when toggling demo mode on/off
- Use factory-generated demo fixtures for deterministic test data

## Technical Notes
- File: `src/utils/demoData.ts` for synthetic data generation
- The demo mode switch intercepts service layer calls: when `settings.demoMode === true`, services return demo data instead of PocketBase data
- Alternative: a `useDemoData()` hook that wraps each data-fetching hook
- Synthetic data should be deterministic (not random) so the demo looks consistent
- Banner renders in the AppShell layout (US-007) above the main content area
