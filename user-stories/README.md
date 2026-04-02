# User Stories — Insight Personal Metrics Platform

## Summary

**Total stories: 142**

Organized into 8 implementation phases, each building on the previous.

---

## Stories by Phase

### Phase 1: Foundation & Shared Components (001–040) — 40 stories
Project scaffolding, design tokens, auth, navigation, and all reusable shared components.

| Range | Description | Count |
|-------|-------------|-------|
| 001–006 | Project setup, auth, routing | 6 |
| 007–010 | App shell, theme, settings | 4 |
| 011–012 | Formatters and time utilities | 2 |
| 013–040 | Shared UI components | 28 |

### Phase 2: Investment — Data Layer (041–054) — 14 stories
TypeScript types, CRUD services, and all calculation modules for the investment domain.

| Range | Description | Count |
|-------|-------------|-------|
| 041 | Investment TypeScript types | 1 |
| 042–047 | CRUD services (portfolio, platform, data point, transaction, exchange rate, currency) | 6 |
| 048–054 | Calculations (XIRR, earnings, gain/loss, normalization, monthly XIRR, aggregation, allocation) | 7 |

### Phase 3: Investment — UI (055–079) — 25 stories
Portfolio overview, platform detail, cash detail, dialogs, and polish.

| Range | Description | Count |
|-------|-------------|-------|
| 055–066 | Portfolio overview page sections | 12 |
| 067–072 | Platform detail page sections | 6 |
| 073 | Cash platform detail page | 1 |
| 074–077 | Dialogs (portfolio, platform, data point, transaction) | 4 |
| 078–079 | Mobile responsive + dark mode polish | 2 |

### Phase 4: Home (Utilities) — Data Layer (080–087) — 8 stories
TypeScript types, CRUD services, and calculation modules for the utilities domain.

| Range | Description | Count |
|-------|-------------|-------|
| 080 | Utility TypeScript types | 1 |
| 081–083 | CRUD services (utility, meter reading, bill) | 3 |
| 084–087 | Calculations (consumption interpolation, bill amortization, cost per unit, YoY) | 4 |

### Phase 5: Home (Utilities) — UI (088–106) — 19 stories
Home overview, utility detail, dialogs, and polish.

| Range | Description | Count |
|-------|-------------|-------|
| 088 | Utility icon component | 1 |
| 089–094 | Home overview page sections | 6 |
| 095–101 | Utility detail page sections | 7 |
| 102–104 | Dialogs (utility, meter reading, bill) | 3 |
| 105–106 | Mobile responsive + dark mode polish | 2 |

### Phase 6: Vehicles — Data Layer (107–114) — 8 stories
TypeScript types, CRUD services, and calculation modules for the vehicles domain.

| Range | Description | Count |
|-------|-------------|-------|
| 107 | Vehicle TypeScript types | 1 |
| 108–110 | CRUD services (vehicle, refueling, maintenance) | 3 |
| 111–114 | Calculations (fuel efficiency, distance, costs, EV crossover) | 4 |

### Phase 7: Vehicles — UI (115–134) — 20 stories
Vehicles overview, vehicle detail, dialogs, and polish.

| Range | Description | Count |
|-------|-------------|-------|
| 115 | Fuel type badge component | 1 |
| 116–118 | Vehicles overview page sections | 3 |
| 119–129 | Vehicle detail page sections | 11 |
| 130–132 | Dialogs (vehicle, refueling, maintenance) | 3 |
| 133–134 | Mobile responsive + dark mode polish | 2 |

### Phase 8: Cross-Cutting & Polish (135–142) — 8 stories
Integration, cross-section features, and final validation.

| Range | Description | Count |
|-------|-------------|-------|
| 135 | Staleness indicators integration | 1 |
| 136 | YoY chart overlay integration | 1 |
| 137 | File attachments integration | 1 |
| 138 | Demo mode | 1 |
| 139 | EV home-charging toggle | 1 |
| 140 | Accessibility audit | 1 |
| 141 | Performance optimization | 1 |
| 142 | Final acceptance criteria validation | 1 |

---

## Dependency Graph Summary

```
Phase 1: Foundation & Shared Components
  └─ Phase 2: Investment Data Layer
       └─ Phase 3: Investment UI
  └─ Phase 4: Home Data Layer
       └─ Phase 5: Home UI
  └─ Phase 6: Vehicles Data Layer
       └─ Phase 7: Vehicles UI
  └─────────────────────────────────────── Phase 8: Cross-Cutting & Polish
```

**Key dependency chains:**

- **Shared components** (013–040) are prerequisites for ALL UI stories
- **TypeScript types** (041, 080, 107) are prerequisites for their section's services and calculations
- **Services** depend on types + PocketBase client (004)
- **Calculations** depend on types (pure functions, no service dependencies)
- **UI page sections** depend on shared components + section services/calculations
- **Page assemblies** depend on all their section components
- **Dialogs** depend on dialog shell (028) + form inputs (030) + services
- **Polish stories** (mobile, dark mode) depend on page assemblies
- **Cross-cutting stories** (135–142) depend on all section UI being complete

**Phases 2–3, 4–5, and 6–7 can be developed in parallel** once Phase 1 is complete.

---

## Complexity Breakdown

| Size | Definition | Count | Stories |
|------|-----------|-------|---------|
| **S** | Single component or function, < 2 hours | 52 | Simple components, badges, toggles, individual service CRUD, utility functions |
| **M** | Multiple functions or moderate UI, 2–4 hours | 48 | Complex components, calculation modules, dialog forms, chart components |
| **L** | Full page section or complex logic, 4–8 hours | 32 | Page assemblies, XIRR solver, consumption interpolation, demo mode, overview pages |
| **XL** | Major integration or audit, 1–2 days | 10 | Mobile responsive polish, dark mode polish, accessibility audit, performance optimization, acceptance validation |

---

## Design References and Component Reuse

**The HTML prototypes and screenshots are the definitive source of truth for all UI/UX.** Every component — shared or single-use — must reproduce the prototype's visual output 1:1. Tailwind classes, spacing, colors, typography, responsive breakpoints, dark mode, and interactions shown in prototypes are the spec.

Each UI story has three key sections that work together:

- **`## Design Reference`** — Points to exact prototype lines and screenshots. **This is the target.** The rendered output of your implementation must match these references exactly.
- **`## Shared Components Used`** — The implementation contract. Lists every shared component the story must use. Build shared components that produce output identical to the prototypes, then compose pages from them.
- **`## UI Specification`** — Component props, layout classes, and Tailwind patterns specific to this story.

**The prototypes contain raw HTML with no component abstraction** — the same stat card markup appears separately in `portfolio-overview.html`, `home-overview.html`, and `vehicle-detail.html`. In the implementation, these must all go through the same `StatCard` component (US-014) that produces identical output. If the prototype shows a pattern that maps to a shared component, **use the shared component**. Never copy raw HTML from a prototype when a shared component exists.

This ensures consistency across Home, Investment, and Vehicles — a change to a shared component automatically propagates to all sections. When in doubt, the prototype wins: if a story's text conflicts with what the prototype shows, follow the prototype.

---

## Reuse Matrix

Rows = shared components, columns = pages that use them.

| Component | Portfolio Overview | Platform Detail | Cash Detail | Home Overview | Utility Detail | Vehicles Overview | Vehicle Detail |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Button (013) | x | x | x | x | x | x | x |
| StatCard (014) | x | x | x | x | x | | x |
| ChangeIndicator (015) | x | x | | x | x | x | x |
| StalenessIndicator (016) | x | x | | x | x | | |
| CurrencyDisplay (017) | x | x | x | | | | |
| YoYComparisonRow (018) | x | | | x | | | x |
| TimeSpanSelector (019) | x | x | | x | x | | x |
| YoYToggle (020) | x | x | | x | x | | x |
| ChartModeToggle (021) | x | x | | x | x | | |
| ChartCard (022) | x | x | x | x | x | | x |
| CollapsibleSection (023) | x | x | x | | x | x | x |
| TabBar (024) | x | x | | | x | | |
| DataTable (025) | x | x | x | | x | | x |
| MobileColumnCycler (026) | x | x | | | x | | |
| MobileDrawer (027) | | x | | | x | | |
| DialogShell (028) | x | x | x | x | x | x | x |
| DeleteConfirm (029) | x | x | x | x | x | x | x |
| FormInputs (030) | x | x | x | x | x | x | x |
| FileUpload (031) | | x | | | x | | x |
| DropdownSwitcher (032) | x | x | x | | x | | x |
| Toast (033) | x | x | x | x | x | x | x |
| EmptyState (034) | x | x | x | x | x | x | x |
| ProportionalBar (037) | x | | | | | | |
| TransactionTypeBadge (038) | | x | x | | | | |
| PlatformIcon (039) | x | x | x | | | | |
| CollapsibleYearTable (040) | | x | | | x | | |
| UtilityIcon (088) | | | | x | x | | |
| FuelTypeBadge (115) | | | | | | x | x |
