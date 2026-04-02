# US-135: Staleness Indicators Integration (Investment + Home)

## Story
As the Insight platform user, I want staleness badges to appear automatically on investment platforms and utilities when no new data has been recorded for the current month so that I get a passive visual nudge to update my data.

## Dependencies
- US-016: StalenessIndicator Component
- US-044: Data Point CRUD Service
- US-082: Meter Reading CRUD Service

## Requirements
- Implement staleness detection logic (PRD §3.4):
  - **Investment**: per platform, check if a new data point exists for the current month
  - **Home**: per utility, check if a new meter reading exists for the current month
- **Trigger rules:**
  - No new entry by the **2nd** of the month → Amber "Stale" badge
  - No new entry by the **7th** of the month → Red "Stale" badge
  - Entry exists for current month → badge disappears
- **Display locations** (both overview rows AND detail page headers):
  - Portfolio overview: platform table rows
  - Platform detail: header area
  - Home overview: utility summary cards
  - Utility detail: switcher bar header
- Create utility function `src/utils/staleness.ts`:
  - `getStalenessLevel(lastEntryDate: string | null): 'none' | 'warning' | 'critical'`
  - Compares today's date against the 2nd and 7th of the current month
  - Checks if `lastEntryDate` falls within the current month

## Shared Components Used
- `StalenessIndicator` (US-016) — already implemented, this story integrates it

## UI Specification
N/A — integration story using existing component

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L127–131 — Rose stale badge on Electricity card
- `design-artifacts/prototypes/home-overview.html` L225–229 — Amber stale badge on Heat card
- `design-artifacts/prototypes/portfolio-overview.html` L675–679 — Amber stale badge on Nordnet platform row
- `design-artifacts/prototypes/portfolio-overview.html` L718–722 — Rose stale badge on Mintos platform row

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png` — Stale badges on utility cards
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png` — Stale badges on platform rows

## Acceptance Criteria
- [ ] Amber badge appears on platforms without data point for current month after the 2nd
- [ ] Red badge appears after the 7th
- [ ] Badge disappears when current-month entry is added
- [ ] Badge shown on portfolio overview platform rows
- [ ] Badge shown on platform detail header
- [ ] Badge shown on home overview utility cards
- [ ] Badge shown on utility detail header
- [ ] No notifications or prompts — passive visual signal only
- [ ] Staleness recalculated when new data is added
- [ ] PRD §3.4: Staleness indicator rules
- [ ] PRD §14 criterion 42: Staleness indicators on both overview and detail

## Technical Notes
- File: `src/utils/staleness.ts`
- Logic: get current month, check if last entry's month matches. If not, check today's day-of-month against thresholds.
- Consume via: `const level = getStalenessLevel(platform.lastDataPointDate)` in each relevant component
- The function is called with the most recent data point date (investment) or meter reading date (utility)
