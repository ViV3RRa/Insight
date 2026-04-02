# US-142: Final Acceptance Criteria Validation

## Story
As the Insight platform user, I want all 50 acceptance criteria from the PRD validated so that I can be confident the platform meets every documented requirement.

## Dependencies
- All stories US-001 through US-141 completed

## Requirements
- Systematic validation of all 50 acceptance criteria from PRD §14
- Each criterion tested and verified individually
- Create a validation checklist/report documenting pass/fail status

**Full acceptance criteria list (PRD §14):**

### Home (Utilities)
1. User can create, edit, and delete utilities with name and unit
2. User can register meter readings with cumulative value, timestamp, and optional note
3. User can register bills with amount, period range, optional note, and optional attachment
4. Monthly consumption correctly derived from consecutive meter readings, including multiple per month
5. Multi-month bills amortized correctly across covered months
6. Cost per unit calculated and displayed
7. Home overview shows summary cards per utility and combined charts
8. Utility detail shows inline collapsible year rows with yearly totals, averages, and YoY change, expandable to monthly
9. Annual consumption change % and cost change % calculated and color-coded

### Investment Portfolio
10. User can create, edit, and delete portfolios with name and owner
11. Default portfolio pre-selected; user can switch between portfolios
12. User can create investment and cash platforms with icon, name, type, currency
13. User can close a platform with closure date and optional note
14. Closed platforms appear muted and excluded from current portfolio totals
15. User can register data points in platform's native currency
16. User can register transactions with optional exchange rate, notes, attachments
17. XIRR correctly incorporates data points and transactions as cash flows
18. Gain/loss correctly accounts for net deposits
19. Monthly earnings and monthly XIRR computed and displayed as first-class metrics
20. Portfolio allocation visualization shows each platform's share
21. All metrics computed at platform level and aggregate portfolio level (DKK)
22. Cash platforms show balance and balance history; no XIRR/gain-loss
23. Portfolio overview shows all required elements
24. Platform detail shows tabbed analysis with all chart types
25. Exchange rates auto-fetched, visible, and overridable
26. Non-DKK values display in native currency with DKK equivalent

### Vehicles
27. User can create, edit, delete vehicles with full metadata and photo
28. User can mark vehicle as sold with sale date, price, note
29. Sold vehicles muted with total cost of ownership
30. User can register refueling with fuel-type-appropriate units
31. EV refueling includes charged-at-home flag
32. User can register maintenance events
33. Fuel efficiency uses weighted average
34. Rolling 5-refueling weighted average calculated correctly
35. Yearly and YTD km derived from odometer readings
36. Vehicle detail shows all charts and collapsible data tables
37. Total cost of ownership calculated for sold vehicles

### Cross-Cutting
38. All data entries support optional notes
39. Per-card time span selector recalculates chart and associated table
40. YoY toggle overlays prior year data on charts
41. File attachments on all applicable record types
42. Staleness indicators on investment platforms and utilities
43. Collapsible data tables collapsed by default
44. Authentication works; data scoped to logged-in user
45. Fully functional on desktop and mobile
46. Light and dark mode both functional
47. Danish locale formatting throughout
48. Date format configurable
49. EV home-charging kWh excludable from electricity utility
50. Demo mode with realistic mock data and visible indicator

## Shared Components Used
N/A — validation story

## UI Specification
N/A — validation story

## Design Reference
**All prototype files serve as visual acceptance targets:**
- `design-artifacts/prototypes/ui-states.html` — Loading, error, empty, toast, confirm patterns
- `design-artifacts/prototypes/home-overview.html` — Home section
- `design-artifacts/prototypes/portfolio-overview.html` — Investment section
- `design-artifacts/prototypes/platform-detail.html` — Platform detail
- `design-artifacts/prototypes/utility-detail.html` — Utility detail
- `design-artifacts/prototypes/vehicles-overview.html` — Vehicles overview
- `design-artifacts/prototypes/vehicle-detail.html` — Vehicle detail

**Screenshot directories for visual comparison:**
- `design-artifacts/prototypes/screenshots/home/` — 20 screenshots
- `design-artifacts/prototypes/screenshots/investment/` — 23 screenshots

## Acceptance Criteria
- [ ] All 50 acceptance criteria from PRD §14 individually verified
- [ ] Each criterion documented as pass/fail with evidence
- [ ] Any failures have associated bug tickets or fix stories created
- [ ] Validation covers all three sections: Home, Investment, Vehicles
- [ ] Cross-cutting features verified across all sections

## Technical Notes
- This is a manual testing/verification story, not implementation
- Create a checklist document at `docs/acceptance-validation.md`
- Test each criterion systematically with real and demo data
- Include edge case verification (empty states, first-time use, maximum data)
- Take screenshots as evidence for pass criteria
