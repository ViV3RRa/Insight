# Insight Implementation Breakdown — Team Instructions

## Goal

Break down the entire Insight platform into a series of **self-contained User Stories**, each written to its own markdown file in the `user-stories/` folder. Each story must be small enough that a single agent can implement it with a high success rate — no story should require understanding the full system to execute. The stories collectively cover every pixel in the prototypes and every rule in the PRD.

### Component Reuse — The Primary Design Consistency Strategy

The biggest risk to visual consistency is similar UI patterns being re-implemented from scratch across sections. When an agent builds "stat cards for Investment" and later another agent builds "stat cards for Home", small deviations accumulate — different padding, slightly different font weights, inconsistent hover states — and the app looks like it was built by five different people.

**The antidote is aggressive shared component extraction.** The breakdown must:

1. **Identify every recurring visual pattern** across all three sections (Home, Investment, Vehicles) and across overview vs detail pages. If a pattern appears more than once, it becomes a shared component.
2. **Build shared components FIRST** (Phase 1), fully specified with all variants, props, and states, before any page-level story is written.
3. **Page-level stories compose shared components** — they never re-implement markup that already exists in a shared component. Each page story's UI Specification section must reference the shared component by name and specify only the props/data it passes in.
4. **No inline one-off styling** for patterns that match a shared component. If a page needs a stat card, it uses `<StatCard>` — it does not copy-paste Tailwind classes from the prototype into a local div.

This means the visual-analyst and design-system-analyst must explicitly map which prototype patterns are the **same component with different data** vs genuinely distinct components. The architect then uses this mapping to decide what's shared vs page-specific.

---

## Team: `insight-breakdown`

### Step 1 — Create the team

```
TeamCreate:
  team_name: "insight-breakdown"
  description: "Analyze all design artifacts, prototypes, screenshots, and PRD to produce self-contained user stories in user-stories/."
```

### Step 2 — Create tasks (TodoWrite)

```
1. Analyze all screenshots and HTML prototypes — extract every UI detail
2. Deep-read PRD, anthropologist findings, and process doc — extract every requirement
3. Audit design system and map tokens to prototype usage
4. Cross-reference all analyses and produce user stories in user-stories/
```

### Step 3 — Spawn 4 teammates

---

#### Teammate 1: `visual-analyst`

**Agent type:** `general-purpose`

**Prompt:**

```
You are the Visual Analyst on the "insight-breakdown" team. Your job is to examine
EVERY design artifact in this project and produce an exhaustive UI specification.
You are a forensic UI detective — no detail is too small.

## YOUR TASK

Analyze all screenshots and HTML prototypes. Produce a structured document capturing
every visual and interaction detail needed to faithfully reproduce this UI in React +
Tailwind CSS.

## ASSETS TO ANALYZE

### HTML Prototypes (read every line of every file):
- design-artifacts/prototypes/home-overview.html
- design-artifacts/prototypes/utility-detail.html
- design-artifacts/prototypes/portfolio-overview.html
- design-artifacts/prototypes/platform-detail.html
- design-artifacts/prototypes/vehicles-overview.html
- design-artifacts/prototypes/vehicle-detail.html
- design-artifacts/prototypes/ui-states.html

### Screenshots (view every image file):

**Home section** (design-artifacts/prototypes/screenshots/home/):
- overview-desktop-top.png, overview-desktop-dark.png
- overview-desktop-add-reading.png, overview-desktop-add-bill.png
- overview-mobile-top.png, overview-mobile-add-reading.png, overview-mobile-add-bill.png
- detail-desktop-top.png, detail-desktop-bills.png, detail-desktop-yearly.png
- detail-desktop-switcher.png, detail-desktop-edit-reading.png
- detail-desktop-edit-bill.png, detail-desktop-delete-confirm.png
- detail-mobile-top.png, detail-mobile-tables.png, detail-mobile-switcher.png
- detail-mobile-month-drawer.png, detail-mobile-reading-drawer.png
- detail-mobile-bill-drawer.png

**Investment section** (design-artifacts/prototypes/screenshots/investment/):
- overview-desktop-top.png, overview-desktop-tables.png
- overview-desktop-add-platform.png, overview-desktop-portfolio-switcher.png
- overview-desktop-performance-expanded.png
- overview-mobile-top.png, overview-mobile-tables.png
- overview-mobile-add-platform.png, overview-mobile-performance-expanded.png
- detail-desktop-top.png, detail-desktop-dark.png
- detail-desktop-yearly.png, detail-desktop-transactions.png
- detail-desktop-switcher.png, detail-desktop-edit-platform.png
- detail-mobile-top.png, detail-mobile-tables.png
- detail-mobile-switcher.png, detail-mobile-edit-platform.png
- detail-mobile-dp-drawer.png, detail-mobile-perf-drawer.png
- detail-mobile-tx-drawer.png, detail-mobile-transactions.png

### Icons (design-artifacts/prototypes/icons/):
- icon_danske-bank.png, icon_kameo.png, icon_mintos.webp
- icon_nordnet.webp, icon_revolut.webp, icon_saxo.png

## WHAT TO EXTRACT

For each page/view, document:

1. **Layout structure**: Grid system, max-width, padding, column counts at each breakpoint
2. **Navigation**: Desktop top nav vs mobile bottom tab bar, active states, section switching
3. **Component inventory**: Every distinct component (cards, tables, charts, badges, buttons,
   dialogs, drawers, selectors, toggles) — with exact Tailwind classes from the HTML
4. **Typography**: Font families (DM Sans, DM Mono), sizes, weights, line-heights,
   where monospace vs sans-serif is used
5. **Color tokens**: Exact hex values from tailwind.config, the accent/base/semantic palette,
   dark mode variants
6. **Spacing patterns**: Padding, margins, gaps — extract the actual Tailwind values used
7. **Responsive behavior**: What changes between desktop (lg:) and mobile — column stacking,
   hidden elements, bottom sheets vs modals, mobile column cycling pattern
8. **Interaction states**: Hover, focus, active, disabled, expanded/collapsed, selected
9. **Dialog/form patterns**: Desktop centered modal vs mobile bottom sheet, backdrop blur,
   animations (scale on desktop, slideY on mobile), drag handle, form field styling
10. **Chart specifications**: Chart types per view, axis labels, colors, toggle behaviors
11. **Table patterns**: Header styling, row hover, cell alignment, expand/collapse chevrons,
    mobile cyclable column with dot indicators
12. **Data formatting**: How numbers, currencies, percentages, and dates are formatted
    in the actual prototypes
13. **Dark mode**: Document every dark: variant used, color mapping from light to dark
14. **Animations/transitions**: CSS transitions, durations, easing functions
15. **Staleness indicators**: Badge colors, placement, icon usage
16. **Empty states / edge cases**: What does ui-states.html show?

## OUTPUT FORMAT

Write your findings to: Project Documents/implementation/ui-analysis.md

Structure it as:
- Global patterns (nav, layout, theme, typography, color tokens, shared components)
- Per-page breakdown (home overview, utility detail, portfolio overview, platform detail,
  vehicles overview, vehicle detail)
- Component catalog (every unique component with its exact markup pattern)
- Responsive adaptation map (what changes at each breakpoint)
- Interaction & animation spec

## CRITICAL: COMPONENT REUSE ANALYSIS

After cataloging all components, produce a **Reuse Map** — a dedicated section that:

1. Groups every visual pattern that appears across multiple pages or sections into a
   single canonical component. For example:
   - "Summary stat card" appears on: home overview, utility detail, portfolio overview,
     platform detail, vehicle detail — same component, different data.
   - "Collapsible data table" appears on: utility detail (readings, bills), platform
     detail (transactions, data points), vehicle detail (refueling, maintenance) — same
     component, different columns.
   - "Add/edit dialog" shares the same shell (backdrop, animation, header, footer buttons)
     across all 10+ dialogs — only the form fields differ.

2. For each canonical component, list:
   - Every page/section where it appears
   - What varies between usages (props: data, labels, column config, color)
   - What is IDENTICAL between usages (structure, spacing, typography, interactions)

3. Flag any cases where two visually similar elements have SUBTLE DIFFERENCES across
   pages. These are the most dangerous — document whether the difference is intentional
   (genuinely different component) or incidental (same component, should be unified).

This reuse map is the architect's primary input for deciding the shared component library.

Be EXHAUSTIVE. If you can read it from the HTML or see it in a screenshot, document it.
The implementation team will rely on this to build pixel-perfect UI without looking at the
prototypes themselves.

When done, send your findings summary to the team lead "architect".
```

---

#### Teammate 2: `requirements-analyst`

**Agent type:** `general-purpose`

**Prompt:**

```
You are the Requirements Analyst on the "insight-breakdown" team. Your job is to
extract every requirement, business rule, calculation, data model relationship, edge case,
and acceptance criterion from the project documentation.

## YOUR TASK

Deep-read every project document and produce a structured requirements map that captures
the COMPLETE functional specification — both the "what" and the "why".

## DOCUMENTS TO READ (read every line):

1. Project Documents/metrics-dashboard-prd-v2.md — THE source of truth. ~1000 lines.
   Read it ALL.
2. Project Documents/anthropologist-findings.md — Session 1: behavioral patterns,
   motivations, design principles.
3. Project Documents/anthropologist-findings-session-2.md — Session 2: multi-currency,
   platform types, lifecycle states, locale, priorities.
4. Project Documents/process-doc.md — Phase definitions, what's done, what's next.
5. CLAUDE.md — Critical calculation details and architecture notes.

## WHAT TO EXTRACT

### A. Data Models (PRD §5.1, §6.1, §7.1, §10)
For every entity: fields, types, relationships, constraints, nullable fields,
computed vs stored fields. Map the PocketBase collections to the data model.

### B. Calculations (PRD §5.2, §6.2, §7.2) — BE PRECISE
- XIRR: Cash flow construction rules, Newton-Raphson, native currency vs DKK,
  edge cases (null for <2 flows, non-convergence)
- Monthly XIRR: Single-month isolation calculation
- Monthly earnings formula
- Gain/loss formula and percent denominator
- Month-end normalization and interpolation rules (§6.2.3)
- Meter reading interpolation for monthly consumption
- Bill amortization across months
- Fuel efficiency: weighted average (total km ÷ total fuel), NOT arithmetic mean
- Rolling 5-refueling weighted average
- Portfolio-level aggregation in DKK
- Portfolio allocation percentages
- Cost per unit for utilities
- YoY comparison logic (§3.2)

### C. Business Rules & Edge Cases
- Currency subsystem (§4): auto-fetch, manual override, display rules,
  native + DKK dual display
- Platform lifecycle: active/closed, closure behavior, exclusion from totals
- Vehicle lifecycle: active/sold, total cost of ownership
- Staleness indicators: amber by 2nd, red by 7th, per-section triggers
- Multiple meter readings per month handling
- Interpolated data points: marked, visually distinguished, overridable, reversible
- EV home-charging crossover with electricity utility
- Demo mode: synthetic data, visible indicator, display-layer only
- Portfolio switcher: default portfolio, multi-portfolio management
- Cash vs investment platform differentiation

### D. User Flows & Intentions (from anthropologist findings)
- The "record and forget" ritual — fast data entry, automatic downstream
- Monthly observation cadence — what the user actually does each month
- The pain is downstream computation, not data entry
- Personal observatory, not decision engine — awareness is the value
- Transparency and sovereignty: no black boxes
- Power user optimization: minimal clicks, information density

### E. Acceptance Criteria (PRD §14)
- All 50 acceptance criteria, grouped by section
- Map each criterion to the relevant data model, calculation, and UI component

### F. Non-Functional Requirements (PRD §13)
- Performance, accessibility, responsiveness, data ownership, extensibility, locale

### G. Build Priority
- Investment portfolio FIRST (most complexity, most pain)
- Cross-cutting features (time span selector, YoY, file attachments, staleness)
- Home (utilities) second
- Vehicles third

## OUTPUT FORMAT

Write your findings to: Project Documents/implementation/requirements-map.md

Structure it as:
- Data model reference (entity relationship summary)
- Calculation specifications (exact formulas, edge cases, currency rules)
- Business rules catalog (every rule with PRD section reference)
- User intention map (the "why" behind key decisions)
- Acceptance criteria matrix (criterion → component → calculation → data model)
- Build priority and dependency graph

When done, send your findings summary to the team lead "architect".
```

---

#### Teammate 3: `design-system-analyst`

**Agent type:** `general-purpose`

**Prompt:**

```
You are the Design System Analyst on the "insight-breakdown" team. Your job is to
bridge the design system specification with the actual HTML prototypes, producing
a complete component library specification ready for React + Tailwind implementation.

## YOUR TASK

Read the design system spec AND all HTML prototypes. Cross-reference them to produce
a definitive component library specification that resolves any discrepancies between
the spec doc and the actual prototypes (prototypes win when they conflict — they
represent the latest design decisions).

## DOCUMENTS TO READ:

1. design-artifacts/specs/design-system.md — The design system specification
2. ALL 7 HTML prototypes (read the full source of each):
   - design-artifacts/prototypes/home-overview.html
   - design-artifacts/prototypes/utility-detail.html
   - design-artifacts/prototypes/portfolio-overview.html
   - design-artifacts/prototypes/platform-detail.html
   - design-artifacts/prototypes/vehicles-overview.html
   - design-artifacts/prototypes/vehicle-detail.html
   - design-artifacts/prototypes/ui-states.html

## WHAT TO EXTRACT

### A. Design Token Audit
- Compare design-system.md tokens with actual tailwind.config in HTML files
- Document EVERY discrepancy (the spec says Inter/JetBrains Mono but prototypes
  use DM Sans/DM Mono — which wins?)
- Produce the DEFINITIVE token set: colors, typography, spacing, shadows, borders
- Document the dark mode color mapping completely

### B. Tailwind Configuration
- Extract the exact tailwind.config from the prototypes
- Document all custom colors (accent, base, white overrides)
- Document custom shadows (card, card-dark)
- Note any Tailwind plugins or extensions needed

### C. Component Library Specification
For EVERY reusable component found across prototypes, document:
- Component name and purpose
- Props/variants it needs
- Exact HTML structure and Tailwind classes
- Responsive behavior (desktop vs mobile variant)
- States (default, hover, active, disabled, expanded, selected)
- Dark mode variant classes

Components to catalog (at minimum):
- Navigation (desktop top nav, mobile bottom tab bar)
- StatCard (summary metric cards — multiple variants)
- DataTable (sortable, collapsible, with mobile column cycling)
- CollapsibleYearTable (year rows with expandable monthly detail)
- Dialog/Modal (desktop centered vs mobile bottom sheet)
- BottomDrawer (mobile record detail drawer)
- TimeSpanSelector (button group: 1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All)
- ChartCard (chart with embedded controls)
- ChartModeToggle (Earnings/XIRR, Consumption/Cost)
- YoYToggle
- Badge/Pill (status badges: Active, Inactive, Pending, Closed, Stale)
- StalenessIndicator (amber/red with icon)
- CurrencyDisplay (native + DKK dual line)
- FormInput, FormSelect, FormTextarea
- FileAttachment (upload, thumbnail, download)
- Button (primary, secondary, destructive, ghost)
- PlatformCard / UtilityCard / VehicleCard
- PortfolioSwitcher / DetailPageSwitcher
- DeleteConfirmDialog
- AllocationChart placeholder
- MobileColumnCycler (dot indicator + cyclable header)

### D. Cross-Section Component Consistency Audit

This is the MOST IMPORTANT section of your analysis. For each component in the catalog:

1. **Extract the exact markup from EVERY prototype where it appears.**
2. **Diff them.** Are the Tailwind classes identical? Are there subtle differences in
   padding, font size, border radius, shadow, color between sections?
3. **Classify each difference**:
   - **Intentional variant**: The component genuinely needs a prop to handle this
     (e.g., StatCard has a "trend" variant with an arrow icon and a "simple" variant without).
   - **Incidental drift**: The prototypes are slightly inconsistent — pick the canonical
     version (most common or most recent prototype) and document it as THE standard.
4. **Produce a Canonical Markup** for each component — the single source of truth that
   all page-level stories will reference. This prevents implementing agents from copying
   slightly different markup from different prototypes.

Example of what to catch:
- A stat card on the home overview uses `p-5` but the same pattern on portfolio uses `p-4`
- A table header uses `text-xs` in one prototype but `text-sm` in another
- A dialog uses `rounded-lg` in one place but `rounded-xl` in another
- A badge uses `font-medium` on one page but `font-semibold` on another

These micro-inconsistencies in prototypes are EXPECTED (they were built at different times).
Your job is to resolve them into a single canonical component specification.

### E. Design Discrepancies Report
- Spec says sharp corners, no shadows, no rounded — do prototypes agree?
- Spec says teal accent (#0f766e) — prototypes use green accent (#15803d) — document this
- Spec says Inter/JetBrains Mono — prototypes use DM Sans/DM Mono — document this
- Any other drift between spec and prototypes

### F. Animation & Transition Spec
- Dialog open/close animations (scale on desktop, slideY on mobile)
- Collapsible section transitions
- Hover transitions
- Theme toggle transitions

## OUTPUT FORMAT

Write your findings to: Project Documents/implementation/design-system-audit.md

Structure it as:
- Definitive design tokens (resolved from spec + prototypes, prototypes win)
- Tailwind configuration (copy-paste ready)
- Component catalog with CANONICAL MARKUP per component (the single source of truth)
- Cross-section consistency audit (diffs found, resolutions chosen)
- Discrepancy log (spec vs prototype, with resolution)
- Animation/transition spec

When done, send your findings summary to the team lead "architect".
```

---

#### Teammate 4: `architect` (Team Lead)

**Agent type:** `general-purpose`

**Prompt:**

```
You are the Architect and Team Lead on the "insight-breakdown" team. You will receive
analysis from three teammates, then produce the FINAL deliverable: a folder of
self-contained User Story files that collectively describe the full implementation
of the Insight platform.

## YOUR ROLE

1. FIRST: Read these documents yourself for context:
   - CLAUDE.md (project overview)
   - Project Documents/process-doc.md (phase definitions)
   - Project Documents/metrics-dashboard-prd-v2.md (full PRD — read all of it)

2. WAIT for all three teammates to send you their findings:
   - visual-analyst → UI analysis
   - requirements-analyst → Requirements map
   - design-system-analyst → Design system audit

3. THEN read their output files:
   - Project Documents/implementation/ui-analysis.md
   - Project Documents/implementation/requirements-map.md
   - Project Documents/implementation/design-system-audit.md

4. **Build the Component Reuse Map** — this is your most important preparatory step:
   - From the visual-analyst's Reuse Map and the design-system-analyst's Cross-Section
     Consistency Audit, compile the DEFINITIVE list of shared components.
   - For each shared component, document: canonical markup, all variants/props, and
     every page that will consume it.
   - Any pattern that appears on 2+ pages MUST be a shared component — no exceptions.
   - Resolve any disagreements between the two analysts' findings.

5. Cross-reference all three analyses to identify:
   - UI elements that exist in prototypes but aren't in the PRD (and vice versa)
   - Calculations referenced in the UI that need specific implementation
   - Any gaps or ambiguities

6. Produce User Stories as individual files in the `user-stories/` folder, using the
   component reuse map to ensure page-level stories COMPOSE shared components rather
   than re-implementing markup.

## OUTPUT: User Story Files

Create the folder `user-stories/` in the project root. Write each user story as its
own markdown file. Stories MUST be ordered by dependency — an implementing agent should
be able to execute them roughly in filename order.

### File Naming Convention

```
user-stories/
  001-project-scaffolding.md
  002-tailwind-design-tokens.md
  003-pocketbase-client-and-auth.md
  004-app-shell-and-routing.md
  ...
  NNN-final-acceptance-validation.md
```

Use zero-padded 3-digit sequential numbering. The filename should be a short kebab-case
slug of the story title.

### User Story File Format

Every file MUST follow this exact template:

```markdown
# US-{NNN}: {Title}

## Story
As the Insight platform user, I want {goal} so that {benefit}.

## Dependencies
- US-{NNN}: {title} (must be completed first)
- US-{NNN}: {title}
(or "None" for stories with no dependencies)

## Requirements
{Precise, complete description of what this story delivers. Include:}
- Functional behavior (what it does, step by step)
- Business rules (from the PRD — cite section numbers)
- Calculation formulas (exact, with edge cases — if applicable)
- Data model fields and types (if this story creates or modifies a model)

## Shared Components Used
{List every shared component this story consumes, with the props/data it passes.
This section enforces reuse — the implementing agent must import these components,
NOT re-implement their markup.}
- `ComponentName` — props: { variant: "x", data: ... }
- `ComponentName` — props: { ... }
(Write "None — this story IS a shared component" for shared component stories)
(Write "N/A" for backend-only stories)

## UI Specification
{Exact visual specification from the prototypes. Include:}
- Which prototype pages / screenshots to match
- Layout structure (grid, spacing, breakpoints)
- ONLY page-level layout markup (how shared components are arranged on the page).
  Do NOT include the internal markup of shared components — reference them by name.
- Any page-specific styling that is NOT covered by a shared component
- Responsive behavior (what changes on mobile)
- Dark mode behavior
- Interaction states (hover, focus, expanded, etc.)
- Animations/transitions with durations and easing
(Write "N/A" for backend-only stories)

For SHARED COMPONENT stories (Phase 1), this section contains the CANONICAL MARKUP —
the single source of truth for this component's Tailwind classes, HTML structure,
all variants, all states, responsive behavior, and dark mode. This is the only place
this markup lives. All page-level stories that use this component reference it by name.

## Acceptance Criteria
- [ ] {Specific, testable criterion}
- [ ] {Another criterion}
- [ ] {Map to PRD §14 acceptance criteria where applicable, citing the number}
- [ ] Visual output matches prototype screenshots: {list specific screenshot files}
- [ ] Works in both light and dark mode (if UI story)
- [ ] Responsive: works on desktop (>1024px) and mobile (<640px)

## Technical Notes
{Implementation guidance, gotchas, or architectural decisions. Include:}
- Which files to create or modify (reference PRD §11 file structure)
- Which services or utilities to use
- Performance considerations
- Edge cases to handle
```

### Story Sizing Rules

Each story must be **small enough for high implementation success**. Apply these rules:

1. **One concern per story**. A story does ONE thing: creates one component, implements
   one calculation, builds one page section, adds one dialog. Never combine unrelated work.

2. **Maximum scope indicators** — if a story has more than ANY of these, split it:
   - More than 3 new files created
   - More than 2 components built
   - More than 1 page/view
   - More than 1 complex calculation
   - Both frontend AND backend work (split into separate stories)

3. **Split by layer**:
   - Data model + service layer = one story
   - Calculation/utility function = one story
   - UI component (shared) = one story
   - Page section (e.g., "portfolio overview summary cards") = one story
   - Dialog/form = one story
   - Mobile adaptation (if non-trivial) = separate story
   - Dark mode (if non-trivial) = separate story

4. **Split large pages into sections**. For example, "Portfolio Overview" becomes:
   - Summary cards section
   - YoY comparison card
   - Performance charts (collapsed accordion)
   - Investment platform table
   - Cash platform table
   - Closed platform rows
   - Allocation chart
   - Quick-add buttons
   Each is its own story.

5. **Shared components are their own stories**, built before the pages that use them.

### Component Reuse Rules (MANDATORY)

These rules prevent design drift and ensure visual consistency across all sections:

1. **Shared component stories own the markup.** A shared component story (Phase 1)
   contains the CANONICAL Tailwind classes and HTML structure. This is the single
   source of truth. No other story may redefine or override this markup.

2. **Page-level stories COMPOSE, never re-implement.** When a page story uses a stat
   card, it writes `<StatCard label="..." value="..." trend="..." />` — it does NOT
   copy-paste the stat card's internal div/span/class structure. The UI Specification
   section of a page story describes layout (how components are arranged in a grid)
   and passes props to shared components. It never contains raw Tailwind classes for
   patterns that are covered by a shared component.

3. **If you're writing Tailwind classes in a page story, ask: does a shared component
   already handle this?** If yes, use the component. If no, either:
   - Create a new shared component story (insert it in Phase 1), OR
   - Confirm it's truly page-specific one-off layout (e.g., a grid arrangement).

4. **Component variants over component forks.** If the same component needs to look
   slightly different in two sections (e.g., a stat card with/without a trend arrow),
   add a VARIANT PROP to the shared component — do not create two separate components.
   The shared component story must document all variants.

5. **Dialog shell is shared; form content is per-dialog.** All dialogs share the same
   Dialog component (backdrop, animation, header, close button, footer with Save/Cancel,
   mobile bottom-sheet behavior). Each specific dialog story (e.g., "Add Transaction
   Dialog") composes the shared Dialog and only specifies the form fields inside.

6. **Table shell is shared; column config is per-table.** All data tables share the
   same DataTable component (header styling, row hover, collapse behavior, mobile column
   cycling, edit/delete actions). Each table usage passes a column configuration and
   row data — it does not rebuild the table markup.

7. **Chart shell is shared; data/config is per-chart.** All charts use the shared
   ChartCard (embedded time span selector, mode toggle, YoY toggle). The chart type
   (bar/line/area) and data are passed as props.

8. **Cross-section consistency check.** Before finalizing stories, verify: if you
   removed all section-specific labels and data from two page stories in different
   sections, would the remaining markup reference the SAME shared components with the
   SAME props structure? If not, something is being re-implemented that shouldn't be.

### Story Ordering & Dependencies

Stories must be ordered so that dependencies come first. Follow this general order:

**Phase 0: Foundation** (~stories 001-015)
- Project scaffolding (Vite + React + TS)
- Tailwind config with definitive design tokens
- Font loading (DM Sans, DM Mono)
- PocketBase client instance
- Auth service + login page
- Router setup
- App shell: desktop top nav
- App shell: mobile bottom tab bar
- Theme provider (light/dark toggle)
- Settings page
- Shared formatters (Danish locale: numbers, currency, percentages, dates)

**Phase 1: Shared Components** (~stories 016-040)
- Each shared component as its own story: StatCard, TimeSpanSelector, Badge,
  StalenessIndicator, CurrencyDisplay, CollapsibleTable, Dialog/Modal,
  BottomDrawer, ChartCard, BarChart, LineChart, YoYToggle, FileAttachment,
  FormInput, FormSelect, MobileColumnCycler, DeleteConfirmDialog,
  CollapsibleYearTable, ChartModeToggle, etc.

**Phase 2: Investment — Data Layer** (~stories 041-055)
- TypeScript types for Portfolio, Platform, DataPoint, Transaction, ExchangeRate
- PocketBase collection schemas
- Service functions (portfolios, platforms, dataPoints, transactions, exchangeRates)
- XIRR calculation (Newton-Raphson solver)
- Monthly earnings calculation
- Gain/loss calculation
- Month-end normalization / interpolation
- Portfolio-level aggregation (DKK)
- Portfolio allocation calculation
- Currency conversion utilities

**Phase 3: Investment — UI** (~stories 056-090)
- Portfolio switcher component
- Portfolio overview: summary cards
- Portfolio overview: YoY comparison card
- Portfolio overview: performance charts accordion
- Portfolio overview: performance analysis tabs (yearly/monthly)
- Portfolio overview: investment platform table (desktop)
- Portfolio overview: investment platform table (mobile column cycling)
- Portfolio overview: cash platform table
- Portfolio overview: closed platform rows
- Portfolio overview: allocation chart
- Portfolio overview: quick-add buttons
- Platform detail: header + stat cards
- Platform detail: performance overview chart
- Platform detail: performance analysis tabs
- Platform detail: transactions table
- Platform detail: data points table
- Platform detail: detail-page switcher
- Cash platform detail page
- Add/edit portfolio dialog
- Add/edit platform dialog
- Add data point dialog (with "Save & Add Another")
- Add transaction dialog (with "Save & Add Another")
- Investment section: mobile responsive polish
- Investment section: dark mode polish

**Phase 4: Home (Utilities) — Data Layer** (~stories 091-100)
- TypeScript types for Utility, MeterReading, UtilityBill
- Service functions
- Monthly consumption calculation (interpolation)
- Bill amortization calculation
- Cost per unit calculation
- YoY comparison calculations for utilities

**Phase 5: Home (Utilities) — UI** (~stories 101-120)
- Home overview: summary cards per utility
- Home overview: charts area with mode toggle
- Home overview: utility list
- Home overview: quick actions
- Utility detail: header + stat cards
- Utility detail: chart with consumption/cost/cost-per-unit toggle
- Utility detail: collapsible year table with monthly expansion
- Utility detail: meter readings table
- Utility detail: bills table
- Utility detail: detail-page switcher
- Add/edit utility dialog
- Add meter reading dialog
- Add bill dialog
- Home section: mobile responsive polish
- Home section: dark mode polish

**Phase 6: Vehicles — Data Layer** (~stories 121-130)
- TypeScript types for Vehicle, Refueling, MaintenanceEvent
- Service functions
- Fuel efficiency calculation (weighted average)
- Rolling 5-refueling efficiency
- Distance calculations
- Cost calculations
- Total cost of ownership
- EV home-charging crossover logic

**Phase 7: Vehicles — UI** (~stories 131-150)
- Vehicles overview: active vehicle cards
- Vehicles overview: sold vehicle cards (muted)
- Vehicle detail: header + metadata
- Vehicle detail: stat cards
- Vehicle detail: fuel efficiency chart
- Vehicle detail: monthly fuel cost chart
- Vehicle detail: monthly km chart
- Vehicle detail: maintenance cost timeline
- Vehicle detail: refueling log table
- Vehicle detail: maintenance log table
- Vehicle detail: detail-page switcher
- Add/edit vehicle dialog
- Add refueling dialog
- Add maintenance event dialog
- Vehicles section: mobile responsive polish
- Vehicles section: dark mode polish

**Phase 8: Cross-Cutting & Polish** (~stories 151-165)
- Staleness indicators integration (investment + home)
- YoY chart overlay integration
- File attachments integration across all record types
- Demo mode (synthetic data + indicator banner)
- EV home-charging toggle on electricity utility
- Accessibility audit and fixes
- Performance optimization (charts with 7+ years of data)
- Final acceptance criteria validation (all 50 from PRD §14)

### CRITICAL PRINCIPLES

- **Reuse is the #1 design consistency tool.** Every recurring visual pattern is a
  shared component. Page stories compose components — they never duplicate markup.
  If an implementing agent finds themselves writing Tailwind classes that look like
  an existing shared component, they should use the component instead. The shared
  component story is the SINGLE SOURCE OF TRUTH for that pattern's markup.
- **Pixel-perfect**: Every UI story must reference the exact prototype screenshots to
  match. The implementing agent should be able to open the screenshot and compare.
- **Self-contained**: An agent reading ONLY that story file must have everything needed
  to implement it. No implicit knowledge. For shared component stories: include the
  canonical Tailwind markup. For page stories: reference shared components by name
  with their props, plus include any page-specific layout markup.
- **Small is better**: When in doubt, split. A story that takes 30 minutes to implement
  is better than one that takes 3 hours and might fail halfway.
- **PRD formulas verbatim**: When a story involves a calculation, copy the formula from
  the PRD into the story. Don't paraphrase or summarize.
- **Prototype markup only in component stories**: The canonical Tailwind classes for a
  shared component live in that component's story file — nowhere else. Page stories
  reference the component by name and describe layout composition only.
- **Dependencies are explicit**: Every story lists exactly which other stories must be
  done first. An implementing agent can verify prerequisites are met. Every page story
  must depend on the shared component stories it consumes.
- **Acceptance criteria are testable**: Each criterion is a yes/no check, not a vague
  description. "XIRR returns null for fewer than 2 cash flows" not "XIRR handles edge cases".
- **Acceptance criteria for page stories include reuse checks**: e.g.,
  "[ ] Summary cards use the shared StatCard component — no inline stat card markup".

### WHAT TO DO AFTER WRITING ALL STORIES

After writing all user story files to `user-stories/`:

1. Create `user-stories/README.md` with:
   - Total story count
   - Stories per phase (with count)
   - Dependency graph summary (which phases depend on which)
   - Estimated total complexity breakdown (S/M/L/XL counts)

2. Verify completeness:
   - Every PRD §14 acceptance criterion (all 50) is covered by at least one story
   - Every page in the prototypes has stories covering all its sections
   - Every calculation in the PRD has a dedicated story
   - Every dialog in PRD §9 has a dedicated story
   - Every shared component is its own story

3. Verify reuse coverage:
   - Every visual pattern that appears on 2+ pages has a shared component story
   - Every page-level story lists which shared components it uses
   - NO page-level story contains raw Tailwind markup for patterns covered by a
     shared component — it must reference the component by name instead
   - The Dialog, DataTable, ChartCard, and StatCard components are used consistently
     across ALL three sections (Investment, Home, Vehicles)
   - Produce a **Reuse Matrix** in the README: rows = shared components,
     columns = pages that use them, cells = checkmark. This makes it visually obvious
     that components are reused across sections rather than reimplemented

3. Send a summary to the user listing total story count, phase breakdown, and any
   gaps or ambiguities discovered.
```

---

## How to run it

1. `TeamCreate` with `team_name: "insight-breakdown"`
2. `TodoWrite` with the 4 tasks listed above
3. Spawn all 4 agents via `Agent` tool with `team_name: "insight-breakdown"` and their respective `name` values
4. The three analysts work in parallel, each writing their output file to `Project Documents/implementation/`
5. Each analyst sends findings to `architect` via `SendMessage`
6. `architect` reads all three outputs, cross-references, and writes individual user story files to `user-stories/`

The result is a `user-stories/` folder containing sequentially numbered, self-contained markdown files — each one small enough for an agent to implement independently with a high success rate. Together they cover every pixel in the prototypes, every formula in the PRD, and every acceptance criterion.
