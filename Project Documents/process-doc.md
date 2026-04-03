# Product Development Process

## Project: Personal Metrics Platform

This document describes the expert-driven discovery and design process used to take this project from idea to implementation. Each phase involves a conversation with a different specialist, and each builds on the outputs of the previous one.

---

## Phase 1: Anthropologist ✅

**Purpose**: Understand the human context — who the user is, what they do today, why they do it, what frustrates them, and what the tool means in their life. Establish design principles grounded in observed behavior rather than assumed requirements.

**Method**: Iterative conversational inquiry across two sessions. No feature lists or wireframes. The anthropologist asks open-ended questions about rituals, motivations, emotional relationships with data, and social context. Findings are synthesized into patterns and principles.

**Inputs**: The user's initial idea, a rough feature spec from a prior design session (Figma Make), and spreadsheet artifacts from the user's existing tracking system.

**Outputs**:
- `anthropologist-findings.md` — Session 1: Detailed research findings, behavioral patterns, and derived design principles.
- `anthropologist-findings-session-2.md` — Session 2: Deeper investigation using spreadsheet artifacts. Uncovered multi-currency requirements, platform types (investment/cash), lifecycle states (closed platforms, sold vehicles), monthly earnings as a first-class metric, EV support, locale preferences, and build priorities.
- `metrics-dashboard-prd-v1.md` — Original PRD from Session 1 findings. Superseded by v2.
- `metrics-dashboard-prd-v2.md` — Updated PRD incorporating all findings from both sessions. **This is the current source of truth.**

**Key findings that shaped the project**:
- The core gesture across all domains is identical: observe a real-world value at a point in time and record it.
- The pain is not data entry — it's everything downstream (formulas, charts, year rollovers). The platform's job is to automate the downstream.
- The tool is a personal observatory, not a decision engine. Awareness is the value.
- Transparency and sovereignty matter more than convenience. No black-box calculations.
- Progressive disclosure: clean surfaces with full data accessible underneath.
- Multi-currency is a core requirement, not a future enhancement. DKK is the home currency; EUR platforms need automatic exchange rate handling.
- Investment platforms and cash platforms are structurally distinct and need different UI treatment.
- Platforms and vehicles have lifecycles (closed/sold) that must be tracked with historical data preserved.
- Investment portfolio is the highest-priority section to build first.

---

## Phase 2: UX/UI Designer ✅

**Purpose**: Translate the anthropological findings and PRD into a visual and interaction design. Define how the platform looks, feels, and behaves — not just what's on each page, but how the user moves through it.

**Method**: HTML prototypes built for every page and state, with full Tailwind CSS styling for both light and dark mode. Screenshots generated for visual reference. Design system tokens extracted and audited.

**Outputs**:
- `design-artifacts/prototypes/` — Full HTML prototypes: `portfolio-overview.html`, `platform-detail.html`, `home-overview.html`, `utility-detail.html`, `vehicles-overview.html`, `vehicle-detail.html`, `ui-states.html`
- `design-artifacts/prototypes/screenshots/` — Visual reference screenshots for Investment and Home sections
- `Project Documents/implementation/design-system-audit.md` — Canonical design tokens: green accent palette, DM Sans/DM Mono fonts, warm-gray base scale, rounded-2xl cards, shadow-card. **This overrides any older design-system.md references.**
- `Project Documents/implementation/ui-analysis.md` — Component patterns, responsive breakpoints, cross-section consistency analysis

**Key decisions made**:
- Toggle between dark and light theme (not one-or-the-other)
- Information density achieved via progressive disclosure: accordions, collapsible sections, tab bars
- Mobile-first responsive design with `sm` (640px) and `lg` (1024px) breakpoints
- Dark mode built into every component from day one

---

## Phase 3: Software Architect ✅

**Purpose**: Validate and refine the technical architecture before implementation begins. Pressure-test the data model, query patterns, performance assumptions, and system boundaries.

**Method**: 5-specialist planning team analyzed all 148 user stories, the PRD, prototypes, and design artifacts in parallel. Produced architecture assessment, risk register, and 8 architecture decision records (ADRs).

**Outputs**:
- 8 ADRs documented in `implementation-plan.md` §7 (form library, date library, toast, exchange rate API, time span state, error boundaries, interpolation orchestration, optimistic updates)
- Risk register with 15 identified risks and mitigations
- Tech stack additions: react-hook-form, date-fns, sonner, @playwright/test, vitest-axe
- Calculation complexity analysis: XIRR, interpolation, portfolio aggregation identified as top hotspots
- PocketBase limitations documented with mitigations (no cron → frontend fetch on login, no batch → parallel useQueries)

**Key decisions made**:
- All computation is client-side in `src/utils/` (PocketBase is a dumb data store)
- Exchange rates fetched from `frankfurter.app` (free, JSON, ECB data)
- No optimistic updates for v1 (PocketBase is local, < 10ms latency)
- Per-section error boundaries (Home, Investment, Vehicles) + global fallback
- XIRR solver: Newton-Raphson with Brent's method fallback
- DataPoint service orchestrates interpolation persistence (ADR-7)

---

## Phase 4: Product Manager ✅

**Purpose**: Define build order, scope boundaries, and delivery phases. Turn the PRD into an actionable implementation plan with clear milestones and definitions of done.

**Method**: 5-specialist planning team (Product Strategist, Technical Architect, Frontend Architect, Data Layer Specialist, QA Strategist) analyzed all 148 stories in parallel, then findings were synthesized into a comprehensive implementation plan.

**Outputs**:
- `Project Documents/implementation/implementation-plan.md` — The complete implementation plan
- `user-stories/` — 148 user stories with dependencies, acceptance criteria, testing requirements
- `user-stories/README.md` — Phase overview, dependency graph, complexity breakdown, reuse matrix
- `Project Documents/implementation/requirements-map.md` — PRD requirements mapped to user stories

**Key decisions made**:
- MVP = Investment section (76 stories, ~11 sprints) — user's highest-priority domain
- 20-sprint plan with 5 delivery milestones (M1: "It Runs", M2: "Component Library", M3: "Investment MVP", M4: "Home + Vehicles", M5: "Release Candidate")
- Shared components built first (Phase 1), then domain sections sequentially
- PocketBase backend runs in parallel with Phase 1 (not sequentially as Phase 9)
- Cross-cutting features (US-114 EV Crossover, US-135–142) deferred to Phase 8
- Dependency graph audited: 1 circular dep fixed, 6 missing deps added, 3 over-constrained deps removed
- 23 recommended changes applied to user story files

---

## Phase 5: Implementation 🔄

**Purpose**: Build the platform.

**Inputs**:
- All prior outputs: `anthropologist.md`, `PRD.md`, design mockups, architectural decisions, phased build plan.

**Method**: Claude Code, guided by the PRD and build plan. Implementation follows the phased approach defined by the PM.

**Key principles for implementation**:
- Follow the service layer abstraction — all PocketBase calls go through `services/`.
- Follow the designer's visual spec — don't improvise UI decisions.
- Follow the architect's technical guidance — especially around performance and schema.
- Each phase ends with validation against the acceptance criteria.

---

## Phase 6: Review & Iteration ⬜

**Purpose**: After each implementation phase, review the result against the original findings and design intent. Catch drift between what was envisioned and what was built.

**Method**: The user tests the platform against their actual monthly ritual. Does data entry feel fast? Do the charts show what they expect? Does the tool earn trust? Feedback loops back into the next implementation phase.

---

## Document Index

| Document | Purpose | Status |
|---|---|---|
| `process-doc.md` | This file — the overall development process | ✅ Active |
| `anthropologist-findings.md` | Session 1 research findings and design principles | ✅ Complete |
| `anthropologist-findings-session-2.md` | Session 2 research findings — currency, platform types, lifecycles, priorities | ✅ Complete |
| `metrics-dashboard-prd-v1.md` | Original PRD from Session 1 | ✅ Superseded by v2 |
| `metrics-dashboard-prd-v2.md` | Current PRD — source of truth for what to build | ✅ Complete |
| `design-artifacts/prototypes/` | HTML prototypes — source of truth for UI | ✅ Complete |
| `implementation/design-system-audit.md` | Canonical design tokens from prototypes | ✅ Complete |
| `implementation/ui-analysis.md` | UI component patterns and analysis | ✅ Complete |
| `implementation/implementation-plan.md` | 20-sprint plan, ADRs, risk register, milestones | ✅ Complete |
| `implementation/requirements-map.md` | PRD requirements mapped to user stories | ✅ Complete |
| `user-stories/` | 148 user stories with AC and testing requirements | ✅ Complete |
