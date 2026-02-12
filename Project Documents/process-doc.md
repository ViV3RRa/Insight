# Product Development Process

## Project: Personal Metrics Platform

This document describes the expert-driven discovery and design process used to take this project from idea to implementation. Each phase involves a conversation with a different specialist, and each builds on the outputs of the previous one.

---

## Phase 1: Anthropologist ✅

**Purpose**: Understand the human context — who the user is, what they do today, why they do it, what frustrates them, and what the tool means in their life. Establish design principles grounded in observed behavior rather than assumed requirements.

**Method**: Iterative conversational inquiry. No feature lists or wireframes. The anthropologist asks open-ended questions about rituals, motivations, emotional relationships with data, and social context. Findings are synthesized into patterns and principles.

**Inputs**: The user's initial idea and a rough feature spec from a prior design session (Figma Make).

**Outputs**:
- `anthropologist.md` — Detailed research findings, behavioral patterns, and derived design principles. Written for a fellow researcher who needs to understand the *why* behind every product decision.
- `PRD.md` (v1) — Product Requirements Document translated from the findings. Covers data models, calculations, UI structure, and acceptance criteria.

**Key findings that shaped the project**:
- The core gesture across all domains is identical: observe a real-world value at a point in time and record it.
- The pain is not data entry — it's everything downstream (formulas, charts, year rollovers). The platform's job is to automate the downstream.
- The tool is a personal observatory, not a decision engine. Awareness is the value.
- Transparency and sovereignty matter more than convenience. No black-box calculations.
- Progressive disclosure: clean surfaces with full data accessible underneath.

---

## Phase 2: UX/UI Designer ⬜

**Purpose**: Translate the anthropological findings and PRD into a visual and interaction design. Define how the platform looks, feels, and behaves — not just what's on each page, but how the user moves through it.

**Inputs**:
- `anthropologist.md` — For understanding the user's personality, rituals, and emotional register.
- `PRD.md` — For the complete feature spec, data models, and page structures.

**Expected outputs**:
- Wireframes or mockups for all key views (overview pages, detail pages, dialogs).
- Interaction patterns (how accordions expand, how the portfolio switcher works, how charts respond to time span changes).
- Visual design language (theme, color palette, typography, spacing, component styles).
- Responsive behavior (how layouts adapt from desktop to mobile).

**Key questions for the designer**:
- How to achieve information density without clutter (the "cockpit vs. calm control room" tension).
- How progressive disclosure should feel in practice (accordion behavior, toggle placement, default states).
- How to make the monthly data entry ritual feel fast and intentional.
- Dark theme, light theme, or toggle?

---

## Phase 3: Software Architect ⬜

**Purpose**: Validate and refine the technical architecture before implementation begins. Pressure-test the data model, query patterns, performance assumptions, and system boundaries.

**Inputs**:
- `PRD.md` — Data models, PocketBase collections, service layer structure, calculation specs.
- Designer outputs — To understand what the frontend needs to render and how.

**Expected outputs**:
- Validated (or revised) PocketBase schema with indexing and query strategy.
- Decision on client-side vs. server-side computation (especially XIRR with large datasets).
- File upload and storage strategy.
- Performance assessment for 5+ years of data rendered in Recharts.
- Any architectural changes needed to support the pluggable section model.

**Key questions for the architect**:
- Is the PocketBase schema optimized for the access patterns the UI requires?
- Should heavy calculations (XIRR, aggregations) be cached or computed on every render?
- How should the service layer handle error states, loading states, and optimistic updates?
- Are there scalability concerns with the current approach?

---

## Phase 4: Product Manager ⬜

**Purpose**: Define build order, scope boundaries, and delivery phases. Turn the PRD into an actionable implementation plan with clear milestones and definitions of done.

**Inputs**:
- `PRD.md` — The full feature spec.
- Architect outputs — Any technical constraints or sequencing dependencies.
- Designer outputs — To understand which views are designed and ready for build.

**Expected outputs**:
- Phased build plan (e.g. Phase A: Portfolio, Phase B: Home/Utilities, Phase C: Vehicles).
- Scope definition for each phase — what's in, what's deferred.
- Acceptance criteria per phase (derived from the PRD's acceptance criteria, grouped by milestone).
- Prioritized backlog or task breakdown suitable for Claude Code.

**Key questions for the PM**:
- What's the minimum viable first delivery — one full section or a thin pass across all three?
- How to handle cross-cutting features (time span selector, YoY toggle, file attachments) — build once upfront or extract after the first section?
- What's the testing strategy? Manual validation against the acceptance criteria, or something more structured?

---

## Phase 5: Implementation ⬜

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
| `process.md` | This file — the overall development process | ✅ Active |
| `anthropologist.md` | Research findings and design principles | ✅ Complete |
| `PRD.md` | Product requirements document | ✅ Complete (will evolve) |
| Design mockups | Visual and interaction design | ⬜ Not started |
| Architecture decisions | Technical validation and refinements | ⬜ Not started |
| Build plan | Phased implementation roadmap | ⬜ Not started |
