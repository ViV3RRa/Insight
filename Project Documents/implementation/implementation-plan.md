# Implementation Plan — Insight Personal Metrics Platform

> Generated 2026-04-02 by a 5-specialist planning team (Product Strategist, Technical Architect, Frontend Architect, Data Layer Specialist, QA Strategist).

---

## 1. Executive Summary

Insight is a personal metrics platform with 3 domain sections (Investment, Home/Utilities, Vehicles) sharing a common component library. The codebase comprises **148 user stories** across **9 phases**, targeting a **20-sprint (~20 week)** delivery timeline for a single developer.

**Key findings from the planning analysis:**

- The phase structure is correct but Phase 9 (PocketBase) must run during Phase 1, not after Phase 8
- One circular dependency found (US-044 ↔ US-051) — resolved by removing US-044 from US-051's dependencies
- 6 missing dependency declarations identified across stories
- MVP = **76 stories** delivering a fully functional Investment section (~10 weeks)
- 4 tech stack gaps must be filled before implementation: `react-hook-form`, `date-fns`, toast library, exchange rate API
- 8 architecture decisions must be made before coding begins
- Dark mode should be baked into components from day one, not deferred
- Component dependency tree is flat (2 tiers) — enables rapid parallel component development
- Top 3 complexity hotspots: XIRR solver (US-048), Month-End Interpolation (US-051), Portfolio Aggregation (US-053)

---

## 2. Validated Phase Structure

### Corrected Phase Ordering

The README numbers PocketBase backend as "Phase 9" but its stories are prerequisites for all service layers. The corrected execution order:

| Execution Order | Phase | Content | Stories | Count |
|:-:|:-:|---------|---------|:-----:|
| 1a | Phase 1 | Foundation & Shared Components | US-001–040, US-148 | 41 |
| 1b | Phase 9 | PocketBase Backend (runs in parallel with Phase 1) | US-143–147 | 5 |
| 2 | Phase 2 | Investment Data Layer | US-041–054 | 14 |
| 3 | Phase 3 | Investment UI | US-055–079 | 25 |
| 4 | Phase 4 | Home Data Layer | US-080–087 | 8 |
| 5 | Phase 5 | Home UI | US-088–106 | 19 |
| 6 | Phase 6 | Vehicles Data Layer | US-107–114 | 8 |
| 7 | Phase 7 | Vehicles UI | US-115–134 | 20 |
| 8 | Phase 8 | Cross-Cutting & Polish | US-135–142 | 8 |
| | | **Total** | | **148** |

### Stories in Wrong Phase or Needing Adjustment

- **US-148 (Test Infrastructure):** Phase 1 is correct for the base infrastructure (Vitest config, MSW, renderWithProviders, settings factory). But domain factories should be created incrementally as each type story is built (US-041, US-080, US-107).
- **Phase 9 stories:** Must start immediately after US-001. US-147 (Bootstrap) has no dependency on US-143 — all domain collections (US-144, US-145, US-146) can build in parallel after US-147, without waiting for US-143.

---

## 3. Dependency Graph — Issues Found & Resolutions

### 3.1 Circular Dependency (Critical)

**US-044 (DataPoint CRUD) ↔ US-051 (Month-End Normalization)**

- US-051 is a **pure utility module** (`src/utils/interpolation.ts`) — it accepts data point arrays and returns interpolated results
- US-044 is a **service** that calls US-051's functions after mutations
- **Resolution:** Remove US-044 from US-051's dependency list. US-051 depends only on US-041 (types). US-044 depends on US-051 (one-directional).

### 3.2 Missing Dependencies

| Story | Missing Dependency | Reason |
|-------|-------------------|--------|
| US-015 (ChangeIndicator) | US-011 (Shared Formatters) | Uses `formatPercent` |
| US-018 (YoYComparisonRow) | US-012 (Time Span Utility) | Uses `getYoYRange` |
| US-025 (DataTable) | US-026 (MobileColumnCycler) | Integrates mobile column cycling |
| US-049 (Monthly Earnings) | US-051 (Month-End Normalization) | Uses month-end boundary values |
| US-105 (Home Mobile) | US-026, US-027 | Uses MobileColumnCycler + MobileDrawer |

### 3.3 Over-Constrained Dependencies

| Story | Remove Dependency On | Reason |
|-------|---------------------|--------|
| US-144 (Investment Collections) | US-143 (Settings Collection) | API rule pattern is a documentation concern, not a code dependency. Removing this allows all domain collections to build in parallel after US-147. |
| US-145 (Home Collections) | US-143 | Same reasoning |
| US-146 (Vehicles Collections) | US-143 | Same reasoning |
| US-051 (Interpolation) | US-044 (DataPoint Service) | Circular — see §3.1 |

### 3.4 Cross-Domain Dependency

**US-114 (EV Home-Charging Crossover)** depends on **US-084 (Monthly Consumption)** from the Home domain. This means US-114 cannot be built until the Home data layer is complete. With sequential domain building (Investment → Home → Vehicles), this is naturally satisfied.

### 3.5 Critical Path

Longest dependency chain from start to delivery (11 steps after removing over-constrained deps):

```
US-001 → US-147 → US-144 → US-046 → US-047 → US-053 → US-056 → US-066 → US-078 → US-138 → US-142
```

---

## 4. MVP Definition

### Rationale

From the anthropologist findings: *"The Investment Portfolio section carries the most pain."* The user's primary frustration is multi-tab spreadsheet coordination for investment tracking. The MVP delivers a **fully functional Investment section**.

### MVP Scope: 76 Stories (~10 weeks)

| Category | Stories | Count |
|----------|---------|:-----:|
| Foundation (subset) | US-001–006, 009, 011, 012, 148 | 10 |
| Shared components (Investment-required) | US-013–025, 028–030, 032–040 | 24 |
| PocketBase | US-147, US-143, US-144 | 3 |
| Investment Data Layer | US-041–054 | 14 |
| Investment UI | US-055–079 | 25 |
| **Total** | | **76** |

### MVP "Done" Criteria

- User can log in and see the Investment section
- Full portfolio CRUD: create/edit/delete portfolios, platforms (including cash), data points, transactions
- Multi-currency works (EUR→DKK conversion with auto-fetched rates)
- Portfolio overview renders: summary cards, YoY, performance charts/tabs, platform tables, allocation
- Platform detail renders: header, charts, performance tabs, data points table, transactions table
- Cash platform detail works with simplified view
- XIRR, gain/loss, earnings, monthly XIRR, portfolio aggregation all verified against Excel
- Mobile responsive and dark mode for Investment section
- 85%+ test coverage for Investment stories

---

## 5. Delivery Milestones

### M1: "It Runs" — End of Sprint 2

| Criteria | Gate |
|----------|------|
| `npm run dev` starts both Vite + PocketBase | Required |
| Login/logout works against PocketBase | Required |
| Router navigates between placeholder pages | Required |
| App shell renders with desktop nav + mobile tab bar | Required |
| Light/dark theme toggle works | Required |
| `npm test` passes with coverage reports | Required |

**Stories complete:** US-001–012, US-143, US-147, US-148

### M2: "Component Library" — End of Sprint 5

| Criteria | Gate |
|----------|------|
| All 28 shared components render correctly in isolation | Required |
| All prop variants, dark mode, responsive tested | Required |
| Design tokens match design-system-audit.md | Required |
| 90%+ coverage on shared components | Required |

**Stories complete:** US-013–040

### M3: "Investment MVP" — End of Sprint 11 (KEY MILESTONE)

| Criteria | Gate |
|----------|------|
| Full Investment section functional end-to-end | Required |
| XIRR matches Excel within 0.01% for all test cases | Required |
| Multi-currency portfolio aggregation in DKK works | Required |
| All Investment dialogs work (create/edit/delete) | Required |
| PRD §14 criteria 10–26 pass | Required |
| Mobile responsive + dark mode for Investment | Required |

**Stories complete:** US-041–079, US-144

### M4: "Home + Vehicles Complete" — End of Sprint 18

| Criteria | Gate |
|----------|------|
| Home section: utilities CRUD, consumption/cost charts, bill amortization | Required |
| Vehicles section: refueling/maintenance CRUD, fuel efficiency, cost tracking | Required |
| PRD §14 criteria 1–9 (Home) and 27–37 (Vehicles) pass | Required |
| Mobile responsive + dark mode for both sections | Required |

**Stories complete:** US-080–134, US-145, US-146

### M5: "Release Candidate" — End of Sprint 20

| Criteria | Gate |
|----------|------|
| All 50 PRD §14 acceptance criteria pass | Required |
| Cross-cutting features: staleness, YoY overlays, file attachments, demo mode | Required |
| axe-core: zero violations | Required |
| Lighthouse performance score ≥ 90 | Required |
| Overall test coverage ≥ 85% | Required |

**Stories complete:** All 148

---

## 6. Sprint-Level Breakdown (20 Sprints × 1 Week)

### Sprint 1: Project Foundation

| Story | Size | Description |
|-------|:----:|-------------|
| US-001 | L | Project scaffolding (Vite, React, TypeScript, Tailwind) |
| US-002 | M | Tailwind config + design tokens |
| US-003 | S | Font loading (DM Sans, DM Mono) |
| US-148 | L | Test infrastructure (base — Vitest, RTL, MSW, settings factory) |
| US-147 | M | PocketBase bootstrap & migration setup |
| US-004 | M | PocketBase client and auth service |

**Parallel tracks:** Frontend (001→002→003) ∥ Backend (147) ∥ Testing (148, after 001); then 004

### Sprint 2: Auth, Shell & Core Utilities

| Story | Size | Description |
|-------|:----:|-------------|
| US-005 | M | Login page |
| US-006 | M | Router setup + protected routes |
| US-007 | M | App shell — desktop sidebar nav |
| US-008 | S | App shell — mobile tab bar |
| US-009 | S | Theme provider (light/dark) |
| US-011 | M | Shared formatters (Danish locale) |
| US-012 | M | Time span utility functions |
| US-143 | S | PocketBase settings collection |

**Parallel:** Auth (005→006) ∥ Shell (007, 008) ∥ Utilities (011, 012) ∥ PB (143)

### Sprint 3: Settings + First Shared Components

| Story | Size | Description |
|-------|:----:|-------------|
| US-010 | L | Settings service and page |
| US-013 | S | Button component (**critical path — unblocks 7 Tier 1 components**) |
| US-014 | M | StatCard component |
| US-015 | S | ChangeIndicator |
| US-016 | S | StalenessIndicator |
| US-017 | S | CurrencyDisplay |
| US-018 | M | YoYComparisonRow |
| US-019 | M | TimeSpanSelector |
| US-020 | S | YoYToggle |

**Note:** US-013 (Button) is the critical path — build first, it unblocks 7 Tier 1 components.

### Sprint 4: Shared Components — Interactive & Containers

| Story | Size | Description |
|-------|:----:|-------------|
| US-021 | S | ChartModeToggle |
| US-022 | M | ChartCard (composite: uses US-019, US-020, US-021) |
| US-023 | S | CollapsibleSection |
| US-024 | S | TabBar |
| US-025 | M | DataTable |
| US-026 | M | MobileColumnCycler |
| US-027 | M | MobileDrawer |
| US-028 | M | DialogShell |
| US-029 | S | DeleteConfirmDialog |

### Sprint 5: Shared Components — Forms, Feedback & Domain-Specific

| Story | Size | Description |
|-------|:----:|-------------|
| US-030 | M | FormInputs (text, number, select, textarea, **add radio**) |
| US-031 | M | FileUpload |
| US-032 | S | DropdownSwitcher |
| US-033 | S | Toast notifications |
| US-034 | S | EmptyState |
| US-035 | S | ErrorState |
| US-036 | S | Skeleton loading |
| US-037 | S | ProportionalBar |
| US-038 | S | TransactionTypeBadge |
| US-039 | S | PlatformIcon |
| US-040 | M | CollapsibleYearTable |

**M2 gate check at end of Sprint 5.**

### Sprint 6: Investment Foundation — Types, Collections & Services

| Story | Size | Description |
|-------|:----:|-------------|
| US-041 | S | Investment Zod schemas + branded types + **test factories** |
| US-144 | M | PocketBase investment collections |
| US-042 | M | Portfolio CRUD service |
| US-043 | M | Platform CRUD service |
| US-044 | M | DataPoint CRUD service |
| US-045 | M | Transaction CRUD service |
| US-046 | M | Exchange rate service |
| US-047 | S | Currency conversion utilities |

**All services can run in parallel** once US-041 + US-144 complete.

### Sprint 7: Investment Calculations

| Story | Size | Description |
|-------|:----:|-------------|
| US-048 | L | XIRR (Newton-Raphson solver) — **XL complexity** |
| US-049 | S | Monthly earnings calculation |
| US-050 | S | Gain/loss calculation |
| US-051 | M | Month-end normalization / interpolation — **XL complexity** |
| US-052 | M | Monthly XIRR (depends on US-048 + US-051) |
| US-054 | S | Portfolio allocation |
| US-053 | L | Portfolio aggregation in DKK — **XL complexity** |

**Build order:** US-048, US-049, US-050, US-051 in parallel → US-052, US-054 → US-053 last.

### Sprint 8: Portfolio Overview Page (Part 1)

| Story | Size | Description |
|-------|:----:|-------------|
| US-055 | M | Portfolio switcher |
| US-056 | M | Portfolio overview summary cards |
| US-057 | M | Portfolio overview YoY comparison |
| US-058 | S | Performance accordion shell |
| US-059 | L | Portfolio value charts |
| US-060 | L | Performance yearly tab |

### Sprint 9: Portfolio Overview Page (Part 2) + Assembly

| Story | Size | Description |
|-------|:----:|-------------|
| US-061 | M | Performance monthly tab |
| US-062 | L | Investment platforms table |
| US-063 | S | Cash accounts table |
| US-064 | S | Closed platforms section |
| US-065 | S | Allocation section |
| US-066 | L | Portfolio overview page assembly |

### Sprint 10: Platform Detail Page

| Story | Size | Description |
|-------|:----:|-------------|
| US-067 | L | Platform detail header + stat cards |
| US-068 | L | Platform detail performance chart |
| US-069 | L | Platform detail performance tabs |
| US-070 | M | Data points table |
| US-071 | M | Transactions table |
| US-072 | M | Platform detail switcher |

### Sprint 11: Cash Detail + Dialogs + Investment Polish

| Story | Size | Description |
|-------|:----:|-------------|
| US-073 | L | Cash platform detail page |
| US-074 | M | Add/edit portfolio dialog |
| US-075 | M | Add/edit platform dialog |
| US-076 | M | Add data point dialog |
| US-077 | M | Add transaction dialog |
| US-078 | XL | Investment mobile responsive polish |
| US-079 | XL | Investment dark mode polish |

**M3 gate check at end of Sprint 11. This is the Investment MVP.**

### Sprint 12: Home Foundation — Types, Collections & Services

| Story | Size | Description |
|-------|:----:|-------------|
| US-080 | M | Utility Zod schemas + branded types + **test factories** |
| US-145 | M | PocketBase home collections |
| US-081 | M | Utility CRUD service |
| US-082 | M | Meter reading CRUD service |
| US-083 | M | Utility bill CRUD service |

### Sprint 13: Home Calculations + Overview Start

| Story | Size | Description |
|-------|:----:|-------------|
| US-084 | L | Monthly consumption interpolation — **L complexity** |
| US-085 | M | Bill amortization |
| US-086 | M | Cost per unit |
| US-087 | M | Utility YoY calculations |
| US-088 | S | Utility icon component |
| US-089 | M | Home overview summary cards |
| US-090 | M | Home overview YoY row |

### Sprint 14: Home Overview + Utility Detail Start

| Story | Size | Description |
|-------|:----:|-------------|
| US-091 | M | Home overview charts |
| US-092 | S | Home overview utility list |
| US-093 | S | Home overview quick actions |
| US-094 | L | Home overview page assembly |
| US-095 | M | Utility detail header + stat cards |
| US-096 | M | Utility detail chart |
| US-097 | M | Utility detail yearly table |

### Sprint 15: Utility Detail Completion + Dialogs + Polish

| Story | Size | Description |
|-------|:----:|-------------|
| US-098 | M | Utility detail readings table |
| US-099 | M | Utility detail bills table |
| US-100 | S | Utility detail switcher |
| US-101 | L | Utility detail page assembly |
| US-102 | M | Add/edit utility dialog |
| US-103 | M | Add meter reading dialog |
| US-104 | M | Add bill dialog |
| US-105 | XL | Home mobile responsive polish |
| US-106 | XL | Home dark mode polish |

**Warning: Sprint 15 is the densest sprint (12 stories, 2 XL).** If it runs long, defer US-105/106 to the start of Sprint 16.

### Sprint 16: Vehicles Foundation — Types, Collections, Services & Calculations

| Story | Size | Description |
|-------|:----:|-------------|
| US-107 | M | Vehicle Zod schemas + branded types + **test factories** |
| US-146 | M | PocketBase vehicles collections |
| US-108 | M | Vehicle CRUD service |
| US-109 | M | Refueling CRUD service |
| US-110 | S | Maintenance CRUD service |
| US-111 | M | Fuel efficiency (weighted average) |
| US-112 | M | Vehicle distance calculations |
| US-113 | M | Vehicle cost calculations |

**Note:** US-114 (EV Crossover) moved to Sprint 19 (Cross-Cutting) per decision §13.3.

### Sprint 17: Vehicles Overview + Detail Start

| Story | Size | Description |
|-------|:----:|-------------|
| US-115 | S | Fuel type badge |
| US-116 | M | Active vehicle cards |
| US-117 | M | Sold vehicle cards |
| US-118 | L | Vehicles overview page assembly |
| US-119 | M | Vehicle detail header |
| US-120 | M | Vehicle detail stat cards |
| US-121 | S | Vehicle detail YoY row |
| US-122 | M | Fuel efficiency chart |

### Sprint 18: Vehicles Detail Completion + Dialogs + Polish

| Story | Size | Description |
|-------|:----:|-------------|
| US-123 | M | Monthly fuel cost chart |
| US-124 | M | Monthly km chart |
| US-125 | M | Maintenance cost timeline |
| US-126 | L | Refueling log table |
| US-127 | M | Maintenance log table |
| US-128 | S | Vehicle detail switcher |
| US-129 | L | Vehicle detail page assembly |
| US-130 | L | Add/edit vehicle dialog |
| US-131 | L | Add refueling dialog |
| US-132 | M | Add maintenance dialog |
| US-133 | XL | Vehicles mobile responsive polish |
| US-134 | XL | Vehicles dark mode polish |

**Warning: Sprint 18 is also dense (12 stories, 2 XL + 3 L).** If needed, shift US-133/134 to Sprint 19.

**M4 gate check at end of Sprint 18.**

### Sprint 19: Cross-Cutting Features

| Story | Size | Description |
|-------|:----:|-------------|
| US-114 | L | EV home-charging crossover (moved from Sprint 16) |
| US-135 | M | Staleness indicators integration |
| US-136 | M | YoY chart overlay integration |
| US-137 | M | File attachments integration |
| US-138 | XL | Demo mode |
| US-139 | M | EV home-charging toggle |

### Sprint 20: Quality Gate — Audit, Optimize & Validate

| Story | Size | Description |
|-------|:----:|-------------|
| US-140 | XL | Accessibility audit and fixes |
| US-141 | XL | Performance optimization |
| US-142 | XL | Final acceptance criteria validation (all 50 PRD §14 criteria) |

**M5 gate check at end of Sprint 20.**

### Sprint Summary

| Sprint | Theme | Count | Milestone |
|:------:|-------|:-----:|-----------|
| 1 | Project Foundation | 6 | |
| 2 | Auth, Shell & Utilities | 8 | **M1: "It Runs"** |
| 3 | Settings + First Components | 9 | |
| 4 | Interactive Components | 9 | |
| 5 | Forms, Feedback & Domain Components | 11 | **M2: "Component Library"** |
| 6 | Investment Types + Services | 8 | |
| 7 | Investment Calculations | 7 | |
| 8 | Portfolio Overview (Part 1) | 6 | |
| 9 | Portfolio Overview (Part 2) | 6 | |
| 10 | Platform Detail | 6 | |
| 11 | Cash + Dialogs + Polish | 7 | **M3: "Investment MVP"** |
| 12 | Home Foundation | 5 | |
| 13 | Home Calculations + Overview Start | 7 | |
| 14 | Home Overview + Detail Start | 7 | |
| 15 | Utility Detail + Dialogs + Polish | 9 | |
| 16 | Vehicles Foundation | 8 | |
| 17 | Vehicles Overview + Detail Start | 8 | |
| 18 | Vehicles Detail + Dialogs + Polish | 12 | **M4: "Home + Vehicles"** |
| 19 | Cross-Cutting Features | 6 | |
| 20 | Quality Gate | 3 | **M5: "Release Candidate"** |
| **Total** | | **148** | |

---

## 7. Architecture Decisions (Pre-Implementation)

These 8 decisions affect multiple stories and must be resolved before Sprint 1 begins.

### ADR-1: Add `react-hook-form` + `@hookform/resolvers/zod`

**Decision:** Add to project dependencies in US-001.
**Rationale:** 10+ dialog forms (US-074–077, US-102–104, US-130–132) with validation, error states, conditional fields. Zod schemas already exist — wire directly as form validators.
**Impact:** All dialog stories. Without this, each dialog hand-rolls form state management.

### ADR-2: Add `date-fns` (v3+)

**Decision:** Add to project dependencies in US-001.
**Rationale:** Date math is pervasive: time spans, month-end detection, interpolation, leap years, ISO parsing, Danish locale formatting. Native `Date` is insufficient.
**Impact:** US-011, US-012, US-048, US-051, US-084, US-085, and many more.
**Rejected alternative:** `dayjs` — smaller API surface makes complex date math harder.

### ADR-3: Add Toast Library (`sonner`)

**Decision:** Add `sonner` to project dependencies. Wire into TanStack Query's `onSuccess`/`onError` callbacks.
**Rationale:** Every CRUD operation needs success/error feedback. US-033 defines the Toast component but no library is specified.
**Impact:** All service-calling components.

### ADR-4: Exchange Rate API — `frankfurter.app`

**Decision:** Use `frankfurter.app` for auto-fetching exchange rates.
**Rationale:** Free, JSON responses, no API key required, built on official ECB data. Simplest integration path.
**Impact:** US-046 (Exchange Rate Service).
**Rate fallback strategy:** If no rate exists for the exact date, use the most recent prior rate (nearest business day).

### ADR-5: Time Span State — Per-Card vs Per-Page

**Context:** PRD §3.1 says "each card manages its own selected time span independently" but Zustand stores define a single `selectedTimeSpan` per section. This is a contradiction.
**Decision:** Per-card via component-local state (`useState`). Zustand stores a global default that new cards initialize from.
**Impact:** US-019 (TimeSpanSelector), all chart card stories.

### ADR-6: Error Boundary Strategy

**Decision:** Per-section error boundaries (Home, Investment, Vehicles) plus a global fallback. A calculation error in one section shouldn't crash the whole app.
**Impact:** US-007/008 (App Shell), all page assembly stories.

### ADR-7: Interpolation Persistence Orchestration

**Decision:** The DataPoint service (US-044) is responsible for triggering interpolation. When `createDataPoint()` is called, the service calls US-051's `onDataPointCreated`, then persists the returned interpolated points.
**Rationale:** Keeps the component layer simple. Ensures interpolation is never skipped.
**Impact:** US-044 (DataPoint CRUD), US-051 (Interpolation Engine).

### ADR-8: No Optimistic Updates for v1

**Decision:** Use TanStack Query's `invalidateQueries` on mutation success. No optimistic updates.
**Rationale:** PocketBase is local (< 10ms latency). Optimistic updates add complexity (rollback, cache reconciliation) with minimal UX benefit.
**Impact:** All CRUD service stories.

---

## 8. Shared Component Build Strategy

### Component Dependency Tiers

The 28 shared components form a flat 2-tier tree:

**Tier 0 — Leaf Components (18):** No shared component dependencies.
US-013 (Button), US-014 (StatCard), US-015 (ChangeIndicator), US-016 (StalenessIndicator), US-017 (CurrencyDisplay), US-019 (TimeSpanSelector), US-020 (YoYToggle), US-021 (ChartModeToggle), US-023 (CollapsibleSection), US-024 (TabBar), US-026 (MobileColumnCycler), US-030 (FormInputs), US-032 (DropdownSwitcher), US-033 (Toast), US-036 (Skeleton), US-037 (ProportionalBar), US-038 (TransactionTypeBadge), US-039 (PlatformIcon)

**Tier 1 — Composed Components (10):** Each depends on 1–3 Tier 0 components.
US-018 (YoYComparisonRow → US-015), US-022 (ChartCard → US-019+020+021), US-025 (DataTable → US-013), US-027 (MobileDrawer → US-013), US-028 (DialogShell → US-013), US-029 (DeleteConfirm → US-013), US-031 (FileUpload → US-013), US-034 (EmptyState → US-013), US-035 (ErrorState → US-013), US-040 (CollapsibleYearTable → US-015)

**Critical path:** US-013 (Button) unblocks 7 of 10 Tier 1 components. Build it first.

### Build Waves

| Wave | Components | Prerequisite |
|:----:|-----------|-------------|
| 0 | Foundation: US-001, US-002, US-011, US-012, US-148 | — |
| 1 | All 18 Tier 0 components (fully parallelizable) | Wave 0 |
| 2 | All 10 Tier 1 components (fully parallelizable) | Wave 1 (specifically US-013 + US-015) |

### Dark Mode Strategy: Bake In From Day One

**Decision:** Every component includes `dark:` variant classes during initial implementation.

**Rationale:** All 28 component stories already specify full dark mode classes. Adding `dark:bg-base-800` while writing `bg-white` costs ~10-15% more per component. The alternative — retrofitting 28 components + all page assemblies in 3 separate polish stories — is far more expensive. With this approach, polish stories (US-079, US-106, US-134) become visual verification audits, not implementation sprints.

### Missing Components to Add

| Component | Issue | Resolution |
|-----------|-------|------------|
| RadioInput / RadioGroup | Not in US-030 (FormInputs) but needed by transaction dialogs | Add to US-030 spec |
| `<Card>` base wrapper | `bg-white dark:bg-base-800 rounded-2xl shadow-card` appears 30+ times independently | Consider extracting a thin `<Card>` wrapper for consistency |

### Design System Gaps to Fix

| Gap | Resolution |
|-----|------------|
| Missing `base-750` color stop | Add `#313313` between base-700 and base-800 to Tailwind config |
| Missing `shadow-card-hover-dark` | Add to Tailwind config to avoid arbitrary values |
| Missing `font-mono-data` utility | Ensure defined in `globals.css` |
| No vehicle section screenshots | Generate before Phase 7 begins (~30 min task) |

---

## 9. Calculation Build Order & Complexity

### Dependency DAG

```
LAYER 0 — FOUNDATIONS (no calculation dependencies)
├── US-041: Investment Types
├── US-080: Home Types
├── US-107: Vehicle Types
├── US-011: Shared Formatters
└── US-012: Time Span Utilities

LAYER 1 — SERVICES (depend on types + PocketBase only)
├── US-042–046: Investment Services
├── US-081–083: Home Services
└── US-108–110: Vehicle Services

LAYER 2 — SIMPLE CALCULATIONS (pure functions)
├── US-048: XIRR ─────────────────┐
├── US-049: Monthly Earnings       │
├── US-050: Gain/Loss              │
├── US-084: Monthly Consumption    │
├── US-085: Bill Amortization      │
├── US-111: Fuel Efficiency        │
└── US-112: Vehicle Distance       │
                                   │
LAYER 3 — COMPOSED CALCULATIONS    │
├── US-047: Currency Conversion ←──┘ (needs US-046)
├── US-051: Interpolation ─────────┐
├── US-052: Monthly XIRR ←────────┤ (needs US-048 + US-051)
├── US-086: Cost Per Unit ←──────── (needs US-084 + US-085)
├── US-087: Utility YoY ←───────── (needs US-084–086)
├── US-113: Vehicle Costs ←──────── (needs US-111 + US-112)
└── US-054: Allocation ←─────────── (needs US-047)

LAYER 4 — AGGREGATION
├── US-053: Portfolio Aggregation ← (needs US-047 + US-048 + US-050)
└── US-114: EV Crossover ←──────── (needs US-084 + US-109)
```

### Complexity Ratings

| Rating | Stories |
|:------:|---------|
| **XL** | US-048 (XIRR), US-051 (Interpolation), US-053 (Portfolio Aggregation) |
| **L** | US-046 (Exchange Rate), US-084 (Consumption), US-114 (EV Crossover) |
| **M** | US-047, US-050, US-052, US-085, US-086, US-087, US-111, US-112, US-113 |
| **S** | US-049, US-054 |

### Top 5 Complexity Hotspots

1. **US-048 XIRR (XL)** — Newton-Raphson solver with edge cases: guard `1+r ≤ 0`, derivative = 0, non-convergence, extreme returns. Must match Excel within 0.01%. Consider Brent's method as fallback for non-convergence cases.

2. **US-051 Month-End Normalization (XL)** — Not just interpolation: it's an event-driven recalculation engine. `onDataPointCreated/Deleted/Updated` functions create a state machine with cascading effects. Override/reversal semantics (user overrides interpolated value → deletion → re-interpolation) are easy to get wrong.

3. **US-053 Portfolio Aggregation (XL)** — Combines every hard problem: multi-currency conversion (async), carry-forward value series (step-function per platform), closed-platform historical cutoff, composite XIRR from aggregated DKK cash flows. Performance-sensitive with 5+ platforms × 7+ years.

4. **US-084 Monthly Consumption (L)** — Cross-month proportional splitting with edge cases: readings spanning 3+ months, multiple readings per month, negative deltas (meter resets), readings on exact month boundaries.

5. **US-114 EV Home-Charging Crossover (L)** — Only cross-domain calculation. Fragile utility identification (don't use `icon === 'bolt'` — use `unit === 'kWh'` or explicit `utilityType` field). Floor-at-zero semantics for adjusted consumption.

### Numerical Testing Strategy

- **Pre-compute XIRR reference values in Excel** to 4+ decimal places before writing tests
- Use `toBeCloseTo(expected, 4)` for all floating-point comparisons (never strict equality)
- **Never round intermediate results** — round only for display in formatters
- Create a "golden test" file with 20+ XIRR scenarios for regression testing
- Use `vi.useFakeTimers()` for all date-dependent tests — provide `withFakeTimers(date, fn)` helper

---

## 10. Test Infrastructure Plan

### US-148 Day-One Deliverables

| Component | Notes |
|-----------|-------|
| Vitest config | `environment: 'jsdom'`, `globals: true`, `css: true` |
| `src/test/setup.ts` | jest-dom matchers, MSW server lifecycle, fake timers helper |
| `src/test/utils.tsx` | `renderWithProviders` with QueryClient, MemoryRouter, ThemeProvider |
| MSW server + handlers | `src/test/mocks/server.ts`, `handlers.ts` |
| Coverage config | Per-directory thresholds |
| `settingsFactory.ts` | Only factory needed day-one |
| Factory base infrastructure | `buildEntity` helper, branded ID generator, `buildList(n)` |

### Gaps to Add to US-148

| Gap | Why Needed |
|-----|-----------|
| `vitest-axe` setup | Enables `toHaveNoViolations()` in shared component tests from day one. Prevents Sprint 20 a11y cliff. |
| `ResizeObserver` mock | Recharts `<ResponsiveContainer>` requires it. jsdom doesn't provide it. |
| `matchMedia` mock | Dark mode detection + responsive hooks. Configurable default (desktop/light). |
| `IntersectionObserver` mock | Potential lazy loading (US-141). |
| `URL.createObjectURL` mock | File upload preview tests (US-031). |
| `withFakeTimers(date, fn)` helper | Reduces boilerplate in 20+ date-dependent test files. |
| `initialEntries` option on `renderWithProviders` | Route-dependent component tests. |

### Factory Creation Strategy: Incremental

| Sprint | Factories Created | Trigger Story |
|:------:|-------------------|---------------|
| 1 | `settingsFactory` + base infrastructure | US-148 |
| 6 | `portfolioFactory`, `platformFactory`, `dataPointFactory`, `transactionFactory`, `exchangeRateFactory` | US-041 |
| 12 | `utilityFactory`, `meterReadingFactory`, `utilityBillFactory` | US-080 |
| 16 | `vehicleFactory`, `refuelingFactory`, `maintenanceFactory` | US-107 |

### Coverage Targets

| Story Type | Target | Notes |
|------------|:------:|-------|
| Utility functions (`src/utils/`) | 100% | Pure functions, deterministic I/O |
| Zod schemas (`src/types/`) | 100% | Accept/reject/brand tests |
| Services (`src/services/`) | 90% | MSW-mocked PocketBase |
| Shared components | 90% | All prop variants, dark mode, interactions |
| Zustand stores | 90% | Initial state, all actions, selectors |
| Domain components | 80% | MSW-mocked service data |
| Page assemblies | 75% | Section presence, ordering, states (adjusted down from 80%) |
| **Overall project** | **85%+** | |

### Testing Anti-Patterns to Avoid

1. **Snapshot over-reliance:** Limit to 1-2 representative snapshots per component. Prefer explicit assertions.
2. **Testing Tailwind classes as behavior:** Test a subset of critical visual states, not every class string.
3. **Incomplete MSW handlers:** Create standard handler sets per collection (getList, getOne, create, update, delete, 404, 401).
4. **Testing implementation details:** Query by role/text, interact with userEvent, assert visible outcomes.
5. **Flaky date tests:** Mandate `vi.useFakeTimers()` for ALL date-dependent tests.
6. **TanStack Query cache leakage:** Fresh QueryClient per test via `renderWithProviders`.
7. **Missing empty/error/loading states:** Make these mandatory test cases for all component stories.
8. **XIRR precision without tolerance:** Use `toBeCloseTo(expected, 4)`, never strict equality.

---

## 11. Risk Register

| # | Risk | L | I | Mitigation |
|:-:|------|:-:|:-:|------------|
| R1 | **No form library** — 10+ dialog forms hand-rolling state/validation | H | H | Add `react-hook-form` + Zod resolver in US-001 (ADR-1) |
| R2 | **No date library** — native Date bugs in month-end, leap year, timezone | H | H | Add `date-fns` in US-001 (ADR-2) |
| R3 | **XIRR non-convergence** for edge cases (crypto, extreme returns) | M | M | Multiple initial guesses, Brent fallback, clear `null` UI |
| R4 | **PocketBase N+1 queries** on portfolio overview — 10+ requests per page | H | M | Parallel `useQueries`, composite indexes (US-147), memoization |
| R5 | **Circular dep US-044 ↔ US-051** blocks sprint planning | H | H | Remove US-044 from US-051 deps (§3.1) |
| R6 | **Time span per-card vs per-page** contradiction | M | M | Resolve per ADR-5 before US-019 |
| R7 | **Exchange rate gaps** (weekends/holidays) break DKK conversion | M | H | "Nearest prior business day" fallback in US-046 |
| R8 | **Interpolation not persisted atomically** | M | M | DataPoint service orchestrates (ADR-7) |
| R9 | **Recharts performance** with 7+ years, 10+ stacked series | M | M | Downsample for long spans; lazy-load charts; profile Sprint 8 |
| R10 | **Sprint 15 + 18 overload** (12 stories each, 2 XL) | H | M | Defer polish stories to next sprint if needed |
| R11 | **Accessibility cliff at Sprint 20** | M | H | Add `vitest-axe` in US-148; basic a11y assertions in every shared component |
| R12 | **MSW handler drift** from PocketBase schema | M | H | Use Zod schemas as source of truth for MSW response bodies |
| R13 | **EV crossover fragile utility ID** (icon-based matching) | L | M | Use `unit === 'kWh'` or explicit `utilityType` field |
| R14 | **Branded ID friction** at serialization boundaries | M | L | Helper functions that re-parse at every entry point |
| R15 | **`z.string().datetime()` rejects PocketBase format** | M | M | Test with real PocketBase responses in US-041; adjust if needed |

**L** = Likelihood, **I** = Impact (H/M/L)

---

## 12. Recommended Changes to User Stories

### Critical (Must Fix Before Implementation)

| # | Story | Change |
|:-:|-------|--------|
| 1 | US-051 | Remove US-044 from dependencies. US-051 is a pure utility — depends only on US-041. |
| 2 | US-044 | Add explicit requirement: after data point CRUD, call US-051's `onDataPoint*` functions and persist returned interpolated points. |
| 3 | US-001 | Add dependencies: `react-hook-form`, `@hookform/resolvers/zod`, `date-fns`, `sonner` (toast). |
| 4 | US-148 | Add to setup.ts: `vitest-axe`, `ResizeObserver` mock, `matchMedia` mock, `IntersectionObserver` mock, `URL.createObjectURL` mock. Add `withFakeTimers` helper and `initialEntries` to `renderWithProviders`. |
| 5 | US-148 | Change factory strategy: only `settingsFactory` + base infrastructure in US-148. Domain factories created in US-041, US-080, US-107. |

### Important (Should Fix)

| # | Story | Change |
|:-:|-------|--------|
| 6 | US-144, 145, 146 | Remove dependency on US-143. All domain collections can build in parallel after US-147. |
| 7 | US-015 | Add dependency: US-011 (uses `formatPercent`). |
| 8 | US-018 | Add dependency: US-012 (uses `getYoYRange`). |
| 9 | US-025 | Add dependency: US-026 (integrates mobile column cycling). |
| 10 | US-049 | Add dependency: US-051 (uses month-end boundary values). |
| 11 | US-030 | Add RadioInput / RadioGroup to the FormInputs spec (needed by transaction dialogs). |
| 12 | US-002 | Add `base-750` color token and `shadow-card-hover-dark` to Tailwind config. |
| 13 | US-048 | Specify XIRR reference values to 4+ decimal places. Add rate-change tolerance (`|r_new - r_old| < 1e-10`). Add Brent's method as fallback. |
| 14 | US-046 | Define rate fallback: "If no rate for exact date, use most recent prior rate." Use `frankfurter.app` as the exchange rate API (confirmed). |
| 15 | US-085 | Add cross-year bill test case (e.g., Nov 2025 – Feb 2026). |
| 16 | US-114 | Change utility identification from `icon === 'bolt'` to `unit === 'kWh'` or explicit `utilityType` field. |
| 17 | US-053 | Add `RateCache` parameter to aggregation functions for exchange rate caching within a calculation pass. |

### Nice to Have

| # | Story | Change |
|:-:|-------|--------|
| 18 | All component stories | Add mandatory testing requirement: "Test loading state, error state, and empty state." |
| 19 | US-066, 094, 118 | Add `data-testid` attributes to section wrappers for assembly test stability. |
| 20 | US-084 | Formalize negative delta handling: return `{ consumption: null, warning: 'negative_delta' }` variant. |
| 21 | US-086 | Make `calculateUtilityMetrics` a thin compositor that delegates to individual functions. |
| 22 | All domain UI | Create `usePortfolioMetrics(portfolioId)`, `useUtilityMetrics(utilityId)`, `useVehicleMetrics(vehicleId)` custom hooks to centralize calculation pipelines. |
| 23 | US-078, 105, 133 | Add viewport size constants to test utils: `VIEWPORT.MOBILE_S = 320`, `VIEWPORT.MOBILE_M = 375`, `VIEWPORT.TABLET = 768`, `VIEWPORT.DESKTOP = 1024`. |

---

## 13. Resolved Decisions

> All open questions resolved 2026-04-03.

| # | Question | Decision |
|:-:|----------|----------|
| 1 | Walking skeleton in Sprint 6? | **No** — build all investment services in parallel. Faster delivery; stack integration validated via tests. |
| 2 | Defer stories from MVP? | **No** — keep full 76-story scope including US-064, US-065, US-026. |
| 3 | Move US-114 (EV Crossover) to Phase 8? | **Yes** — treat as cross-cutting integration story. Unlocks parallel Home/Vehicles development. |
| 4 | Exchange rate API? | **`frankfurter.app`** — free, JSON, no API key, ECB data. |
| 5 | Visual regression testing? | **Yes** — add Playwright visual tests. Setup during Phase 1 (US-148 scope expansion). |

---

## Appendix A: Tech Stack Additions

| Addition | Rationale | Impact |
|----------|-----------|--------|
| `react-hook-form` + `@hookform/resolvers/zod` | 10+ dialog forms with Zod-based validation | All dialog stories |
| `date-fns` v3+ | Date math everywhere; tree-shakeable, locale support | 20+ stories |
| `sonner` | Toast notifications for CRUD feedback | All service-consuming components |
| `vitest-axe` | Accessibility testing from day one | All shared component tests |
| `frankfurter.app` (external API) | Auto-fetch exchange rates (ECB data, free, JSON) | US-046 |
| `@playwright/test` | Visual regression testing (screenshot comparison) | All shared components + pages |

## Appendix B: PocketBase Limitations & Mitigations

| Limitation | Impact | Mitigation |
|-----------|--------|------------|
| No server-side computation | LOW | All calculations client-side in `src/utils/` by design |
| No scheduled jobs / cron | MED | Frontend fetches exchange rates on login if stale |
| No bulk/batch operations | MED | Parallel `useQueries` + composite indexes |
| No full-text search | LOW | Not needed for v1 |
| Migration ordering | LOW | Numbered files (001–004) ensure order |
| No realtime subscriptions | NONE | Single user — not needed |

## Appendix C: Data Flow Scenarios

### Scenario: Portfolio Overview with XIRR

```
Navigate to Investment section
├─ Query: portfolios → select default
├─ Query: platforms[portfolioId]
├─ Per platform:
│   ├─ Query: dataPoints[platformId]
│   ├─ Query: transactions[platformId]
│   └─ Calculate:
│       ├─ interpolateMonthEndValues() → fill gaps
│       ├─ computePlatformXIRR(dataPoints, transactions)
│       ├─ computePlatformGainLoss()
│       └─ computeMonthlyEarnings()
├─ For non-DKK: convertToDKK() via exchange rates
├─ Aggregate: portfolioXIRR, portfolioGainLoss, compositeValueSeries
└─ Render: summary cards, charts, platform table, allocation
```

**Performance note:** Memoize intermediate results (`useMemo` keyed on query data + time span). Consider a `usePortfolioMetrics(portfolioId)` custom hook to centralize the pipeline.

### Scenario: Monthly Utility Cost

```
Navigate to Utility detail
├─ Query: meterReadings[utilityId]
├─ Query: utilityBills[utilityId]
├─ Calculate (all synchronous, pure):
│   ├─ calculateMonthlyConsumption(readings)
│   ├─ amortizeAllBills(bills)
│   ├─ calculateMonthlyCostPerUnit(consumption, costs)
│   └─ calculateYearlySummaries(readings, bills)
└─ Render: summary cards, charts, yearly table
```

### Scenario: Vehicle Fuel Efficiency

```
Navigate to Vehicle detail
├─ Query: refuelings[vehicleId]
├─ Query: maintenanceEvents[vehicleId]
├─ Calculate (all synchronous, pure):
│   ├─ calculateWeightedEfficiency(refuelings)
│   ├─ calculateRolling5Efficiency(refuelings)
│   ├─ calculateTotalKmDriven(refuelings)
│   └─ calculateVehicleCosts(vehicle, refuelings, events)
└─ Render: stat cards, efficiency chart, cost charts, tables
```
