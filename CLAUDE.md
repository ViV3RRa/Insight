# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Insight is a **personal metrics platform** — ready for **implementation** (Phase 5). All prerequisite phases are complete. The project follows a phased process defined in `Project Documents/process-doc.md`:

- **Phase 1** (complete): Anthropological research (2 sessions) + PRD v2
- **Phase 2** (complete): UX/UI design — HTML prototypes, screenshots, design system audit
- **Phase 3** (complete): Software architecture validation — 8 ADRs, risk register, tech assessment
- **Phase 4** (complete): Product manager build plan — 148 user stories, 20-sprint plan, 5 milestones
- **Phase 5** (in progress): Implementation — 20 sprints, starting with Sprint 1
- **Phase 6** (not started): Review & iteration

The implementation plan is at `Project Documents/implementation/implementation-plan.md`. It defines sprint-by-sprint story assignments, delivery milestones, and all architecture decisions.

## Key Documents

- `Project Documents/metrics-dashboard-prd-v2.md` — The complete PRD (v2): data models, calculations, UI structure, acceptance criteria. **This is the source of truth for what to build.**
- `Project Documents/implementation/implementation-plan.md` — The implementation plan: 20-sprint breakdown, milestones, ADRs, risk register, recommended story changes. **This is the source of truth for how to build.**
- `Project Documents/implementation/design-system-audit.md` — Canonical design tokens extracted from prototypes. Overrides any older design-system.md references.
- `Project Documents/implementation/ui-analysis.md` — UI analysis: component patterns, responsive behavior, cross-section consistency.
- `user-stories/README.md` — All 148 stories organized by phase, with dependency graph and reuse matrix.
- `Project Documents/process-doc.md` — Development methodology and phase definitions.
- `Project Documents/anthropologist-findings.md` — User research session 1.
- `Project Documents/anthropologist-findings-session-2.md` — User research session 2.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (functional components, hooks), TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | lucide-react |
| Schema & validation | Zod (type definitions, branded IDs, PocketBase response parsing) |
| Forms | react-hook-form + @hookform/resolvers/zod (ADR-1) |
| Date utilities | date-fns v3+ (ADR-2) |
| Toast notifications | sonner (ADR-3) |
| Data fetching | TanStack Query (server state, caching, background refetch) |
| State management | Zustand (client/UI state) |
| Backend | PocketBase (self-hosted) |
| Auth | PocketBase email/password |
| Exchange rates | frankfurter.app — free, JSON, ECB data (ADR-4) |
| Testing | Vitest, React Testing Library, MSW (Mock Service Worker), vitest-axe |
| Visual regression | Playwright (@playwright/test) |

## Architecture

Three domain sections sharing common platform capabilities:

- **Home (Utilities)** — meter readings, bills, consumption/cost tracking
- **Investment Portfolio** — platforms, data points, transactions, XIRR calculations
- **Vehicles** — refuelings, maintenance events, fuel efficiency tracking

All PocketBase calls go through a `services/` layer — UI components never call PocketBase directly. TanStack Query wraps service calls for caching, background refetch, and loading/error states. Zustand manages client-side UI state (selected time span, YoY toggle, active filters, etc.). Each section has its own data models, service functions, and views but shares common components (time span selector, YoY toggle, staleness indicators, collapsible tables, charts, file attachments).

## Type System

All application types are defined as **Zod schemas** in `src/types/`. Zod serves three roles: type definition, runtime validation, and PocketBase response parsing.

**Branded ID types** prevent accidentally passing one entity's ID where another is expected:
```ts
const PortfolioId = z.string().brand<'PortfolioId'>();
const PlatformId = z.string().brand<'PlatformId'>();
// platform.id is PlatformId, not string
// platform.portfolioId is PortfolioId, not string
```

**PocketBase field names and TypeScript property names are identical.** Relation fields use `Id` suffix for clarity (e.g., `platformId`, `portfolioId`, `ownerId`). No mapping layer — the Zod schema parses PocketBase responses directly:
```
PocketBase response → Zod schema.parse() → typed object with branded IDs
```

**Schema hierarchy per entity:**
- `platformSchema` — full record shape (what you read)
- `platformCreateSchema` — omits `id`, `created`, `ownerId` (what you write)
- `type Platform = z.infer<typeof platformSchema>`
- `type PlatformCreate = z.infer<typeof platformCreateSchema>`

Every service function parses its PocketBase response through the appropriate Zod schema before returning. This catches schema mismatches at runtime rather than silently passing malformed data.

## TanStack Query Conventions

All PocketBase service calls are wrapped in TanStack Query for caching, background refetch, and loading/error states.

**Query key pattern** — standardized across all services:

| Pattern | Structure | Example |
|---------|-----------|---------|
| List (top-level) | `['entity']` | `['portfolios']` |
| List (by parent) | `['entity', parentId]` | `['platforms', portfolioId]` |
| Single record | `['entity', parentId, id]` | `['platforms', portfolioId, platformId]` |
| Filtered list | `['entity', parentId, filters]` | `['dataPoints', platformId, { start, end }]` |

**Mutation invalidation** — on successful create/update/delete, invalidate the parent list key:
- Creating a platform → invalidate `['platforms', portfolioId]`
- Updating a data point → invalidate `['dataPoints', platformId]`
- Deleting a transaction → invalidate `['transactions', platformId]`

**Read functions** are `queryFn` candidates. **Write functions** (`create`, `update`, `delete`) are `mutationFn` candidates.

## Zustand Store Architecture

Zustand manages **client-side UI state only** — transient selections, toggles, and filters that don't belong in the URL or server. TanStack Query owns all server/data state.

**What lives in Zustand:**
- `useSettingsStore` — user preferences (date format, theme, demo mode), hydrated from PocketBase on app init
- `useInvestmentUIStore` — selected portfolio ID, selected time span, YoY toggle state, chart mode
- `useHomeUIStore` — selected time span, YoY toggle state
- `useVehicleUIStore` — selected time span, YoY toggle state

**What lives in TanStack Query (NOT Zustand):**
- All entity data (portfolios, platforms, data points, transactions, utilities, vehicles, etc.)
- Loading/error states for data fetches
- Cache invalidation and background refetch

**Rule of thumb:** If it comes from PocketBase, it goes in TanStack Query. If it's a UI toggle or selection that resets on page navigation, it goes in Zustand.

## Architecture Decisions (ADRs)

These were resolved during the Phase 3-4 planning process. See `implementation-plan.md` §7 for full rationale.

| ADR | Decision | Key Detail |
|-----|----------|------------|
| ADR-1 | **react-hook-form + Zod resolver** | All 10+ dialog forms use Zod schemas as form validators |
| ADR-2 | **date-fns v3+** | All date math uses date-fns, not native Date |
| ADR-3 | **sonner for toasts** | Wired into TanStack Query onSuccess/onError |
| ADR-4 | **frankfurter.app for exchange rates** | Free, JSON, ECB data. Fallback: nearest prior business day rate |
| ADR-5 | **Time span is per-card** | Component-local `useState`, not Zustand. Zustand stores the page-level default. |
| ADR-6 | **Per-section error boundaries** | Home, Investment, Vehicles each get an error boundary + global fallback |
| ADR-7 | **DataPoint service orchestrates interpolation** | After CRUD, service calls US-051's functions and persists returned interpolated points |
| ADR-8 | **No optimistic updates for v1** | Use `invalidateQueries` on mutation success. PocketBase is local (< 10ms). |

**Additional implementation decisions:**
- **Dark mode baked in from day one** — every component includes `dark:` variants during initial implementation. Polish stories (US-079, US-106, US-134) are visual verification audits, not implementation sprints.
- **Test data factories created incrementally** — base infrastructure + settings factory in US-148; domain factories created alongside type stories (US-041, US-080, US-107).
- **EV crossover (US-114) is a Phase 8 cross-cutting story**, not Phase 6 — decouples Home and Vehicles phases.

## Testing Conventions

**Testing is baked into every user story.** Each story that produces testable code includes a `## Testing Requirements` section specifying the test file, approach, and key test cases. A story is not done until its tests pass. There are no separate "testing phase" stories — tests are written alongside the implementation.

**Test framework:** Vitest + React Testing Library + MSW (Mock Service Worker)

**Test infrastructure** (US-148) provides the foundation: Vitest config, custom render with providers (`renderWithProviders` with `initialEntries` support), test data factory base infrastructure + settings factory, PocketBase mock via MSW, vitest-axe for a11y testing, browser API mocks (ResizeObserver, matchMedia, IntersectionObserver, URL.createObjectURL), `withFakeTimers` helper, viewport constants, and coverage configuration. This is a Phase 1 story — set up before any feature work begins. Domain-specific factories are added incrementally in type stories (US-041, US-080, US-107).

**File structure — co-located tests next to source:**
- `src/utils/xirr.ts` → `src/utils/xirr.test.ts`
- `src/components/shared/StatCard.tsx` → `src/components/shared/StatCard.test.tsx`
- `src/services/portfolios.ts` → `src/services/portfolios.test.ts`

**Test infrastructure in `src/test/`:**
- `setup.ts` — global test setup (jsdom, Testing Library matchers, MSW server)
- `utils.tsx` — custom `renderWithProviders` (QueryClient, Router, ThemeProvider)
- `factories/` — test data factories using Zod schemas (one per entity)
- `mocks/` — PocketBase client mock, MSW handlers

**Testing approach per story type:**

| Story type | Test approach | Coverage target |
|------------|--------------|-----------------|
| **Utility functions** (`src/utils/`) | Pure function unit tests — no mocking. All AC input→output examples become test cases. | 100% |
| **Zod type schemas** (`src/types/`) | Schema acceptance tests (valid data parses) + rejection tests (invalid data throws) + branded ID tests. | 100% |
| **Services** (`src/services/`) | Mock PocketBase via MSW. Test CRUD, ownership filtering, Zod parsing, error handling. | 90%+ |
| **Zustand stores** (`src/stores/`) | Test initial state, all actions, selectors, state transitions, store isolation. | 90%+ |
| **Shared components** (`src/components/shared/`) | React Testing Library with `renderWithProviders`. All prop variants, interactions, accessibility, dark mode. | 90%+ |
| **Domain components** (`src/components/{domain}/`) | RTL with mocked service data via MSW. Data rendering, loading/empty/error states. | 80%+ |
| **Dialogs** | RTL. Create/edit modes, form validation, submission, cancellation, error handling. | 80%+ |
| **Page assemblies** | RTL. All sub-sections compose, data flows, loading/empty/error states. Use `data-testid` for section selectors. | 75%+ |
| **Cross-cutting** | Integration tests — cross-layer data flows, settings propagation, EV crossover. | Functional |
| **Overall project** | — | **85%+** |

**Testing principles:**
- **Pure functions in utils, tested without mocks.** All business logic, calculations, formatters, and data transformations live in `src/utils/` as pure functions. Tested with direct input/output assertions.
- **Services tested with mocked PocketBase.** Mock via MSW. Verify API calls, ownership filtering, Zod parsing, error handling.
- **Components tested with React Testing Library.** Test user-visible behavior, not implementation details. Use `getByRole`, `getByText`. Use `userEvent` for interactions.
- **Every AC with a specific input → output example** (e.g., "`calculateGain(10000, 12000, 1000, 0)` returns 1000") becomes a direct test case.
- **Test data factories** produce valid, typed objects from Zod schemas. Never construct test data manually.

**Extractability rule:** If a function in a service file does computation or transformation that doesn't require PocketBase or external state, extract it to `src/utils/` and test it as a pure function. Services should be thin orchestration layers — fetch data, call pure utils, persist results.

## Critical Calculation Details

These are easy to get wrong — refer to PRD v2 §6.2 and §7.2 for full specs:

- **XIRR**: Newton-Raphson solver on cash flows. Starting value is negative cash flow; deposits are negative; withdrawals and ending value are positive. Return `null` for <2 cash flows or non-convergence. Per-platform XIRR uses native currency; portfolio-level XIRR uses DKK.
- **Monthly XIRR**: XIRR for a single month in isolation — a first-class metric alongside monthly earnings.
- **Gain/Loss**: `gain = endingValue - startingValue - netDeposits`. Percent uses `startingValue + Σdeposits` as denominator.
- **Fuel efficiency**: Always **weighted average** (total km ÷ total fuel), never arithmetic mean of per-refueling ratios. Unit depends on fuel type (km/l or km/kWh).
- **Bill amortization**: Multi-month bills distributed equally across covered months.
- **Meter reading interpolation**: Readings don't align to month boundaries — use linear interpolation for monthly consumption. Multiple readings per month are aggregated.
- **Currency**: Non-DKK platforms display values as native currency with DKK equivalent. Exchange rates auto-fetched, visible, and overridable.

## Design Principles

- **Record and forget**: Fast data entry, automatic downstream computation
- **Efficiency over discoverability**: Single power user, optimize for minimal clicks
- **Progressive disclosure**: Clean defaults, detail behind folds/accordions/toggles
- **Transparency**: All calculations visible and understandable, no black boxes
- **Pluggable sections**: New domains addable without rearchitecting core
- **Home is the default landing section** after login

## UI Implementation: Prototypes Are the Source of Truth

The HTML prototypes in `design-artifacts/prototypes/` and their screenshots in `design-artifacts/prototypes/screenshots/` are the **definitive source of truth** for all UI/UX. Every component — shared or single-use — must reproduce the prototype's visual output **1:1**. Tailwind classes, spacing, colors, typography, responsive breakpoints, dark mode styling, and interaction patterns in the prototypes are the spec.

When implementing UI:

1. **Pixel-match the prototypes.** The `## Design Reference` section in each user story points to the exact prototype lines and screenshots. The rendered output of your implementation must match these references exactly.
2. **Implement through shared components** (US-013–040) rather than copying raw HTML. The prototypes contain raw HTML with no component abstraction — your job is to build shared components that produce identical output, then compose pages from those components.
3. **The `## Shared Components Used` section in each user story is the implementation contract.** Every component listed there must be used — do not inline equivalent markup.
4. **Cross-section consistency is mandatory.** A StatCard on Investment must render identically to a StatCard on Home or Vehicles. Same for DataTable, DialogShell, ChartCard, TimeSpanSelector, YoYToggle, etc. The Reuse Matrix in `user-stories/README.md` maps which components appear on which pages.
5. **If a pattern appears in multiple sections, it must be a shared component.** If you find yourself duplicating similar markup across Home, Investment, and Vehicles, extract it into a shared component first.
6. **When in doubt, the prototype wins.** If a user story's text description conflicts with what the prototype shows, follow the prototype.
