# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Insight is a **personal metrics platform** — currently in the **discovery phase** with no code written yet. Only planning documents exist. The project follows a phased process defined in `Project Documents/process-doc.md`:

- **Phase 1** (complete): Anthropological research (2 sessions) + PRD v2
- **Phase 2** (not started): UX/UI design
- **Phase 3** (not started): Software architecture validation
- **Phase 4** (not started): Product manager build plan
- **Phase 5** (not started): Implementation
- **Phase 6** (not started): Review & iteration

Each phase builds on the outputs of the previous one. Do not skip ahead to implementation without the prerequisite design and architecture decisions.

## Key Documents

- `Project Documents/metrics-dashboard-prd-v2.md` — The complete PRD (v2): data models, calculations, UI structure, acceptance criteria. **This is the source of truth for what to build.**
- `Project Documents/metrics-dashboard-prd-v1.md` — Original PRD (v1), superseded by v2. Kept for reference.
- `Project Documents/anthropologist-findings.md` — User research session 1: behavioral patterns, motivations, and design principles.
- `Project Documents/anthropologist-findings-session-2.md` — User research session 2: multi-currency, platform types, lifecycle states, locale preferences, and priority mapping.
- `Project Documents/process-doc.md` — Development methodology and phase definitions.

## Planned Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (functional components, hooks), TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| Backend | PocketBase (self-hosted) |
| Auth | PocketBase email/password |

## Architecture

Three domain sections sharing common platform capabilities:

- **Home (Utilities)** — meter readings, bills, consumption/cost tracking
- **Investment Portfolio** — platforms, data points, transactions, XIRR calculations
- **Vehicles** — refuelings, maintenance events, fuel efficiency tracking

All PocketBase calls go through a `services/` layer — UI components never call PocketBase directly. Each section has its own data models, service functions, and views but shares common components (time span selector, YoY toggle, staleness indicators, collapsible tables, charts, file attachments).

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
