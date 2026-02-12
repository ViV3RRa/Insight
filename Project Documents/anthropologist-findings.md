# Anthropological Research — Discovery Findings

## Project: Personal Metrics Platform

**Researcher role**: Anthropologist embedded in product discovery  
**Subject**: Single user / sole stakeholder — a software developer building a personal metrics platform  
**Method**: Iterative conversational inquiry across one extended session  
**Date**: February 2026  

---

## 1. Research Objective

To understand the human context, motivations, rituals, and meaning-making behind a personal metrics tracking platform — before committing to a technical specification. The goal was not to ask "what features do you want?" but to understand "what is this tool *for* in your life, and how does it need to feel?"

---

## 2. Methodology

The discovery followed an iterative cycle:

1. **Origin inquiry** — Why build this? What's broken?
2. **Ritual mapping** — Walk me through what you actually do today.
3. **Emotional landscape** — What does the data mean to you? What do you do with it?
4. **Social context** — Who else is involved?
5. **Expansion mapping** — Where could this grow?
6. **Interface intuition** — What should it feel like?

Each answer opened new threads. Rather than working from a questionnaire, the conversation followed the subject's language and let their priorities surface organically. Questions were asked two at a time to maintain conversational flow without overwhelming.

---

## 3. The Subject

### 3.1 Profile

A software developer by profession. Lives in a multi-person household but is the sole operator of the tracking system — both data entry and data consumption. This is unlikely to change. The platform is partly a practical tool and partly a hobby project: the subject is actively learning to integrate AI-assisted development ("vibe coding") into their workflow.

### 3.2 Key Characteristic: The Instrument Builder

The subject does not consume tools — they build them. Their current tracking system is a self-built Google Sheets workbook covering investment portfolios, home utilities, and vehicle metrics. They have not searched for existing products. When asked why, the answer was clear: "I always wanted to build it myself... to use it as an exercise and to have full control."

This is a person for whom the *construction* of the system is part of the value. The tool is not just something they use; it's something they made. This has profound implications for the product:

- **Transparency is non-negotiable.** Every calculation must be understandable. No black boxes.
- **Sovereignty matters more than convenience.** They'd rather have full control over a rougher tool than use a polished product that makes decisions for them.
- **The tool should feel like theirs**, not like a product built for a generic user.

---

## 4. Core Findings

### 4.1 Finding: The Universal Gesture

Across all three domains the subject tracks (investments, utilities, vehicles), the fundamental action is identical:

> **Observe a real-world value at a point in time, and record it.**

A meter reading. A portfolio balance. An odometer number. The surrounding metadata varies — a fuel receipt has liters and price, a utility bill has a coverage period — but the core gesture is always: *timestamp + measurement*.

**Implication**: The platform's architecture should recognize this shared primitive. Each section decorates the observation with domain-specific context, but the underlying data model and interaction pattern should feel consistent. This also means new sections (subscriptions, budget) can be added by defining "what does an observation look like in this domain?" rather than building from scratch.

### 4.2 Finding: The Pain Is Downstream, Not Upstream

The subject does not mind data entry. Going to each brokerage, reading the meter, saving a receipt — these are ritualized actions they've done for years. The ritual itself is valued; it creates a sense of engagement with the systems in their life.

**The pain is everything that happens after the data is recorded**: updating formulas, extending chart ranges, adding new rows and columns for a new month or year, fixing things that broke when the structure changed. This is the "spreadsheet tax" — the maintenance cost of a self-built system.

> "I dream of an easier tool to just add data and everything just updates."

**Implication**: The platform's primary job is to make data entry fast and then **do everything else automatically**. Charts, calculations, period comparisons, year rollovers — all of this must be derived from the raw data without manual intervention. The "record and forget" principle emerged directly from this finding.

### 4.3 Finding: Personal Observatory, Not Decision Engine

When asked what they do with the charts and metrics — whether they change behavior based on what they see — the subject's answer was revealing:

> "I think it's more of a personal observatory with the value being in the awareness itself."

They don't see a high electricity reading and immediately take action. They don't sell a platform because its XIRR dropped. The tool provides **ambient awareness** of the systems in their life. It's the difference between a financial advisor's dashboard (optimized for decisions) and a pilot's instrument panel (optimized for situational awareness).

However, they added an important qualification: they value the ability to **dive into historical data** when they want to investigate. The observatory has a telescope.

**Implication**: The default view should prioritize at-a-glance legibility — summary cards, clean charts, key metrics. But underneath, the full dataset must be accessible for when curiosity or concern drives a deeper look. This led directly to the "progressive disclosure" principle: clean surfaces with expandable detail underneath.

### 4.4 Finding: Legibility and Sovereignty Over Convenience

The subject articulated a clear frustration with existing investment platforms:

> "On the platform web pages I never know how they calculate the different values, and I can't change the time frames or the way data, or what data is presented to me."

This isn't a feature request. It's a values statement. They want to **own the means of interpretation**. A brokerage showing you a return percentage is making decisions on your behalf about time windows, cash flow treatment, and methodology — and hiding those decisions. The spreadsheet was trusted precisely because every formula was visible and authored by the subject.

**Implication**: Where a calculation is non-obvious (XIRR being the prime example), the system should make the inputs inspectable. The gain/loss table with columns for starting value, ending value, net deposits, and resulting gain exists because of this finding — it shows the user exactly what went into the number. Transparency is a first-class design principle, not an afterthought.

### 4.5 Finding: Two Data Streams in Utilities (Consumption vs. Cost)

Through inquiry about the utility tracking, a structural insight emerged that the subject's spreadsheet had conflated: **meter readings and bills are fundamentally different data streams with different rhythms.**

- Meter readings happen monthly (roughly on the 1st, but not always exactly).
- Bills arrive at irregular intervals — some monthly, some quarterly, some annually.
- The subject wants to see a per-month cost view even when a bill covers a full year.

The spreadsheet handled this through manual effort. The platform needs to handle it automatically: accept both data streams independently, then compute derived metrics (cost per unit, monthly cost) by amortizing bills across their coverage periods and computing consumption deltas from consecutive readings.

**Implication**: The data model must separate `MeterReading` from `UtilityBill` as distinct entities with independent entry flows. The platform must handle linear interpolation for consumption (when readings don't land on month boundaries) and amortization for bills (when a single bill covers multiple months). This was one of the most architecturally significant findings.

### 4.6 Finding: Weighted Averages Matter

In discussing vehicle fuel efficiency, the subject specified that averages must be **weighted** (total km ÷ total liters), not arithmetic means of per-refueling km/l ratios. This is mathematically correct — an arithmetic mean would give misleading results when refueling amounts vary — but it's a detail that many tools get wrong.

This reinforces Finding 4.4: the subject cares about the *correctness* of calculations, not just their existence. They know the difference between a weighted and arithmetic mean and have an opinion about which one belongs here.

**Implication**: Every calculation in the platform needs to be the *right* calculation, not the easy one. Document the methodology. When in doubt, ask.

### 4.7 Finding: The Home Is Home Base

When asked what the landing page should be after login, the subject chose the Home (utilities) section — not the investment portfolio, despite the portfolio being the most complex and data-rich section.

This suggests that the utility tracking is the most **frequent** interaction. It's the section tied to the monthly ritual of meter readings. The portfolio is updated on the 1st of the month too, but the home utilities feel like the starting point — the hearth of the household dashboard.

**Implication**: The Home section isn't a placeholder; it's the front door. Its overview page needs to communicate the current state of the household immediately and efficiently. It earns its position by being the first thing the user engages with.

### 4.8 Finding: Observations Need Context

Late in the discovery, the subject requested that all data points across the platform carry an optional note field. This wasn't about structured metadata — it was about **narrative context**. A meter reading that says "meter was replaced, reading reset" transforms from a confusing anomaly into an understandable event six months later.

This reveals something about how the subject relates to their data: it's not purely quantitative. The numbers tell a story, and sometimes that story needs a footnote. Without it, future-self has to reconstruct context from memory, which is exactly the kind of cognitive maintenance this tool is meant to eliminate.

**Implication**: Every data entry point in the platform should have an optional free-text note. Notes should be visible in data tables and ideally searchable, so the subject can find "when did the meter get replaced?" without scrolling through hundreds of rows.

### 4.9 Finding: Custodial Tracking — Portfolios as a Grouping Concept

The subject also requested the ability to manage multiple investment portfolios — for example, tracking a child's portfolio alongside their own. Critically, this is **not** multi-user. The subject remains the sole operator. They are acting as a custodian: managing another person's financial picture within their own system.

This reframes the portfolio from a flat list of platforms to a **hierarchical grouping**: Portfolio → Platforms → Data Points / Transactions. The subject's own portfolio is the default, but they need to be able to switch context to view and manage others.

**Implication**: The portfolio becomes a first-class entity with a name and an owner label. The UI needs a portfolio switcher that defaults to the primary portfolio but allows navigation to others. All metrics, charts, and summaries are scoped to the selected portfolio. This is an early signal that the platform may grow to support custodial tracking in other sections too (e.g. a vehicle belonging to a family member).

---

## 5. Behavioral Patterns

### 5.1 The Monthly Ritual

On or around the 1st of each month, the subject performs a circuit:

1. Read the utility meters → record readings.
2. Log into each investment platform → record current values.
3. (When applicable) Enter any fuel receipts accumulated during the month.

This is a **batch operation** — a dedicated session, not a trickle of inputs throughout the month. The tool should optimize for this pattern: fast sequential data entry across multiple entities and sections.

Occasionally, the subject checks investment platforms mid-month to gauge progress. This is a secondary, lighter interaction — more viewing than entering.

### 5.2 Data Entry Moment Analysis

| Domain | When data is captured | Source of truth | Entry friction |
|---|---|---|---|
| Utilities (readings) | Monthly, at the meter | Physical gauge | Low — single number |
| Utilities (bills) | When bill arrives (irregular) | Paper/digital bill | Medium — amount + period + optional scan |
| Investments | 1st of month + ad-hoc | Brokerage website/app | Low — single number per platform |
| Fuel | At time of refueling or shortly after | Receipt + trip counter | Medium — multiple fields |
| Maintenance | When event occurs | Receipt | Medium — description + cost + receipt photo |

**Implication**: The platform should make it easy to enter data in the **context** where it happens. Quick-add buttons on overview pages. Default timestamps to "now." Pre-computed fields where possible (e.g. total fuel cost = liters × price per liter). Mobile-friendly forms for fuel and maintenance events that might be entered away from the desk.

### 5.3 Notification Tolerance

The subject explicitly does not want prompts or reminders within the platform. However, they expressed interest in optional push notifications on their phone — with the critical caveat that they must be fully controllable (enable/disable, edit schedules).

This maps to a person who resists being nagged but acknowledges they sometimes forget. They want the *option* of a reminder, not the imposition of one. Within the app itself, the compromise is a passive staleness indicator ("last updated 45 days ago") that turns visually warmer as data ages — nudging without demanding.

---

## 6. Social and Emotional Context

### 6.1 Solo Operator

Other people live in the household, but this is a one-person tool. No one else inputs data or views the dashboard. The subject is confident this won't change.

**Implication**: The interface can be optimized for a single user's mental model. No onboarding flows, no role-based views, no shared access patterns. Efficiency over discoverability. That said, the PocketBase backend should still scope data to the authenticated user (via an owner field) as a low-cost safeguard.

### 6.2 The Hobby Dimension

This is not just a utility; it's a hobby project. The subject is a programmer learning new tools (vibe coding, PocketBase). The act of building the platform is itself a source of satisfaction. This means:

- The platform will evolve. New sections, new ideas, new experiments.
- Architectural extensibility isn't just nice-to-have — it's essential for sustained engagement.
- The subject will be reading the codebase. Code quality and clarity matter more than they would for a pure consumer product.

### 6.3 Emotional Register

When asked whether the interface should feel like a "cockpit or a calm control room," the subject leaned toward information density but with progressive disclosure — everything visible, but only on demand. The default state should be clean. Clutter is hidden behind toggles, accordions, and tabs.

This maps to a personality that values **control without overwhelm**. The information is there when you want it, invisible when you don't.

---

## 7. Architectural Principles Derived from Findings

These principles were not stated by the subject but emerged from the patterns observed:

1. **The observation primitive**: Every section is built around the act of recording a time-stamped observation. The platform should have a consistent conceptual model for this, even as each section adds domain-specific fields.

2. **Automatic downstream computation**: The user's only job is data entry. Every chart, metric, comparison, and derived value is computed from raw observations without manual intervention.

3. **Progressive disclosure**: Overview pages show summary metrics and clean charts. Detail pages show full data tables and deeper analysis. The user controls the depth.

4. **Temporal flexibility**: The time span selector and year-over-year toggle exist because the subject's core frustration with other tools is being locked into someone else's time frames. The user chooses the window.

5. **Pluggable sections**: The platform will grow. New life domains should be addable by following an established pattern (data model → service → overview → detail) without modifying core code.

6. **File attachment as a first-class concept**: Receipts, bills, photos, and documents appear across all sections. This is a platform capability, not a per-section feature.

---

## 8. Risks and Open Questions

### 8.1 Interpolation Accuracy

Meter readings won't always land exactly on month boundaries. The platform will need to interpolate to derive monthly consumption. Linear interpolation is the simplest approach but may not reflect actual usage patterns (e.g., heat consumption spikes in winter). This is a known simplification the subject should be aware of.

### 8.2 XIRR Edge Cases

XIRR calculations can fail to converge or produce misleading results with sparse data, very short time windows, or unusual cash flow patterns. The platform needs graceful handling (display "N/A" rather than a wrong number) and should make it clear when a calculation couldn't be performed.

### 8.3 Multi-Currency

The subject did not mention multiple currencies. If any investment platforms are denominated in different currencies, the current model has no way to account for this. Worth flagging for a future conversation.

### 8.4 Notification System Complexity

Push notifications (desired for mobile reminders) require a service worker, PWA manifest, and notification permission flow. This is a non-trivial addition that should be deferred to a later phase to avoid delaying the core platform.

### 8.5 Data Migration

The subject has years of data in Google Sheets. No import mechanism is currently specified. If the historical data is valuable (it likely is), a one-time import tool or at minimum a documented CSV import process would significantly improve the initial experience.

---

## 9. Summary

The subject is not building a dashboard. They are building a **personal instrument panel** — a place where the systems of their life become legible on their own terms. The tool's value is not in telling them what to do but in showing them what is. The pain it solves is not lack of tracking (they already track) but the maintenance tax of doing so in a medium (spreadsheets) that requires constant manual upkeep.

The platform should feel like a natural extension of their existing discipline: same ritual, same data, same awareness — but with the machinery hidden. They put the numbers in. Everything else just works.
