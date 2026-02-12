# Anthropological Research — Discovery Findings (Session 2)

## Project: Personal Metrics Platform

**Researcher role**: Anthropologist embedded in product discovery
**Subject**: Single user / sole stakeholder — a software developer building a personal metrics platform
**Method**: Second iterative conversational inquiry, building on Session 1 findings
**Date**: February 2026

---

## 1. Research Objective

To deepen and pressure-test the findings from Session 1 by examining the subject's actual spreadsheet artifacts, uncovering gaps in the initial PRD, and exploring areas that were flagged as open questions. Where Session 1 mapped the landscape, Session 2 excavated the details.

---

## 2. Methodology

The second session followed up on open threads from Session 1 and used the subject's actual spreadsheet screenshots as artifacts for inquiry. The conversation moved between:

1. **Artifact review** — Walking through real spreadsheet tabs to surface implicit requirements.
2. **Gap probing** — Following up on open questions from Session 1 (multi-currency, data migration, vehicles).
3. **Edge case exploration** — What happens when readings are irregular, platforms close, vehicles are sold, electric cars enter the picture.
4. **Priority mapping** — Understanding what matters most and what gets built first.

---

## 3. Key Findings

### 3.1 Finding: Multi-Currency Is a Live Pain Point, Not a Hypothetical

Session 1 flagged multi-currency as an open question. Session 2 revealed it is an active, daily frustration. The subject's primary platforms are denominated in DKK, but several operate in EUR. The subject has built a dedicated EUR exchange rate tab in their spreadsheet with:

- **Monthly snapshots**: The EUR/DKK rate recorded on the 1st of each month (approximately 7.46 DKK/EUR).
- **Transaction-day spot rates**: The exact rate on any day a EUR-denominated transaction occurs.
- **A "live" rate**: Used for computing current DKK values of EUR platforms.

Platform values are stored in their native currency (EUR). DKK equivalents are computed downstream. XIRR is calculated in the native currency of the platform. Portfolio-level aggregation (total value, total XIRR) converts everything to DKK.

The subject expressed a clear cognitive preference: *"I relate better to DKK than EUR."* The display format they want is: `1,000 EUR (7,460 DKK)` — native currency first, with the DKK equivalent always visible.

For the new platform, the subject is comfortable with **automatic exchange rate fetching** (e.g., from the ECB) as long as:
- The fetched rate is **visible** (not hidden behind the scenes).
- The rate is **overridable** (the user can correct it if needed).
- The system is **extensible** beyond EUR — other currencies may appear in the future.

**Implication**: The platform needs a first-class currency subsystem: an exchange rate store (both historical monthly rates and transaction-day rates), automatic fetching with manual override, and a display layer that renders values in native currency with DKK equivalents. This is not a nice-to-have — it's core infrastructure for the investment section.

### 3.2 Finding: The Spreadsheet Pain Is Multi-Tab Coordination

When asked for a specific frustration moment, the subject described the act of adding money to a EUR-denominated investment platform. In the spreadsheet, this requires editing:

1. The **platform tab** — to record the transaction and update value tracking.
2. The **EUR rate tab** — to record the exchange rate on the transaction date.
3. The **total portfolio tab** — to update the combined portfolio value.
4. (Implicitly) The **portfolio composition tab** — to recalculate allocation percentages.

A single real-world action (depositing money) becomes four coordinated edits across four tabs, with manual cross-referencing and the ever-present risk of formula breakage. This is the clearest articulation of the spreadsheet tax from Session 1 — and it intensifies with every new platform or currency added.

The beginning-of-year pain is a variant of the same issue: every tab needs new rows, new chart ranges, and new formula references. The 2026 rows in the utility sheet were pre-filled with zeros and `#DIV/0!` errors — a visible scar of this maintenance burden.

**Implication**: The platform's core value proposition crystallizes here. One action (record a deposit) should trigger all downstream updates automatically — portfolio totals, currency conversion, allocation recalculation, chart updates. The user touches one form; everything else just works.

### 3.3 Finding: Two Classes of Investment Platform — Investment and Cash

The subject tracks not only investment platforms (e.g., Nordnet, Interactive Brokers) but also **cash platforms** — bank accounts and Revolut accounts that hold money earmarked for investment. These cash positions are part of the portfolio because the money is "deployed capital sitting idle."

Key behavioral differences:

- **Investment platforms**: Monthly value recordings, transactions, full XIRR and gain/loss analysis.
- **Cash platforms**: Monthly balance recordings (to compute portfolio total), transaction flow tracking, but **no XIRR or performance analysis** needed. The key metric is simply: how much investment cash is available where?

The subject confirmed that cash platform values should be included in portfolio-level XIRR calculations — idle cash dilutes the portfolio return, and that's the truthful picture. "My investment platforms also include uninvested cash which is included in the XIRR of the platform."

**Implication**: The Platform model needs a `type` field distinguishing `investment` from `cash`. The UI should visually distinguish them (different styling, simpler detail view for cash platforms). Cash platforms contribute to portfolio totals and portfolio-level XIRR but don't need their own performance analysis views.

### 3.4 Finding: Platforms and Vehicles Have Lifecycles

Two lifecycle patterns emerged:

**Closed investment platforms**: The subject has closed platforms in recent years. A closed platform should remain visible (muted) with all historical data, but should not contribute to current portfolio values. The subject wants to add a **closure note** when marking a platform as closed — context for future-self about why.

**Sold vehicles**: The subject has a sold car they want to track historically. Sold vehicles should appear in the vehicle list (muted) with all historical data preserved. The subject wants to see **total cost of ownership** for sold vehicles (lifetime fuel + maintenance costs), with the purchase-to-sale price offset available as secondary information.

**Implication**: Both Platform and Vehicle need a lifecycle status field (active/closed or active/sold), a date field for the lifecycle event, and an optional note. The UI pattern is identical: muted presentation in lists, full historical data on detail pages, excluded from "current" aggregations.

### 3.5 Finding: Monthly Earnings and Monthly XIRR Are First-Class Metrics

Reviewing the subject's platform spreadsheet tab revealed five columns of monthly data:

1. **Date** (monthly, 1st of each month)
2. **Platform Value** (cumulative value at that date)
3. **Monthly Earnings** (value change from previous month, adjusted for transactions)
4. **Cumulative XIRR** (all-time XIRR from inception to that month)
5. **Monthly XIRR** (XIRR for just that one month — performance of that period in isolation)

The subject confirmed that monthly earnings is *"one of the more important metrics"* — and that the monthly XIRR provides the percentage companion to the absolute earnings figure. The cumulative XIRR shows the trajectory; the monthly XIRR shows the moment.

**Implication**: The PRD's monthly analysis and XIRR-over-time charts partially cover this, but monthly earnings and monthly XIRR need to be explicit, first-class metrics — prominent on platform cards, available in tabular form with full history, and visible on the portfolio overview for the aggregate portfolio.

### 3.6 Finding: Portfolio Allocation Is an Awareness Metric

The subject maintains a tab tracking what percentage of the total portfolio each platform represents. They described it as something they look at to *"make sure the balance between platforms is as I expect and want it to be"* — but rarely act on it.

This fits the observatory pattern perfectly: awareness, not action. The subject wants this visible on the portfolio overview page.

**Implication**: Add a portfolio allocation visualization to the portfolio overview — a donut chart, proportional bar, or similar visual showing each platform's share of the total portfolio value. This is a display-only feature with no interaction needed beyond visibility.

### 3.7 Finding: Utility Yearly Summary as Inline Collapsible Rows

The subject's utility spreadsheet uses collapsible year-level rows that expand to show monthly detail — a pattern they've internalized over years of use. When presented with two options (inline collapsible rows vs. a separate yearly view), they chose inline collapsible.

Each year row shows: total consumption, average monthly consumption, annual consumption increase %, total cost, average monthly cost, average cost per unit, and annual cost increase %. The increase percentages are color-coded (red for increases, green for decreases).

**Implication**: The utility detail page's data table should use inline collapsible year rows — year summary as the row, expanding to reveal monthly detail underneath. The year-over-year consumption and cost change percentages are important metrics that the current PRD doesn't explicitly call out.

### 3.8 Finding: Multiple Meter Readings Per Month Are Normal

The subject asked what happens if multiple meter readings are recorded within a single month. The agreed-upon behavior: consumption is always the delta between consecutive readings, regardless of timing. For monthly views, consumption within the month is aggregated. If a reading pair spans a month boundary, linear interpolation splits the consumption across the two months.

**Implication**: The consumption calculation engine must handle arbitrary reading frequencies, not just one-per-month. This was implicit in the Session 1 PRD's interpolation discussion but needed to be made explicit.

### 3.9 Finding: Electric Vehicles Fit the Same Model

The subject may begin tracking an electric car (currently a company car) and a motorcycle. The key insight: gas and electric refueling are *"fundamentally the same thing but with different units."*

- Gas: liters, cost/liter, km/l
- Electric: kWh, cost/kWh, km/kWh

The vehicle's fuel type drives which units the UI displays.

A cross-section interaction emerged: if an EV is charged at home, those kWh also appear in the electricity utility. The subject wants a **"charged at home" flag** on EV charging records, with the option to exclude that consumption from the electricity utility view. This is relevant because the current EV is a company car — the company would reimburse home charging costs, so the user wants their electricity dashboard to reflect only what they personally pay for.

**Implication**: The refueling model generalizes to "energy replenishment" with units driven by fuel type. The home-charging crossover between vehicles and utilities is a real use case that requires a linking mechanism between sections — the first concrete example of cross-section data interaction.

### 3.10 Finding: Locale and Personalization Preferences

The subject has clear formatting preferences rooted in Danish conventions:

- **Number format**: Period as thousands separator, comma as decimal (1.000,00)
- **Currency suffix**: "kr." for DKK
- **Date format**: YYYY-MM-DD preferred, with DD/MM/YYYY available as a setting
- **Theme**: Light/dark mode toggle desired

**Implication**: The platform needs a settings system — at minimum for date format and theme. Number and currency formatting should follow Danish locale by default. These are not cosmetic preferences; they affect legibility and the feeling that the tool is "theirs" (Finding 3.2 from Session 1: sovereignty).

---

## 4. Priority and Scale

### 4.1 Build Priority

When asked which section they'd build first if they could only have one, the answer was immediate: **investment portfolio, by far.** This is where the most pain lives — multi-currency, multi-tab coordination, year-boundary maintenance, and the highest data complexity.

### 4.2 Current Scale

| Section | Entities |
|---|---|
| Investment platforms (active) | 3 investment + 2 cash platforms |
| Investment platforms (closed) | A few, closed in recent years |
| Children's portfolios | Planned: 1 (son), possibly more. 2–3 platforms each. |
| Utilities | Electricity, water, heat |
| Vehicles (active) | 1 car |
| Vehicles (sold) | 1 car |
| Vehicles (potential) | 1 electric car (company), 1 motorcycle |

### 4.3 Historical Data

Data goes back to **January 2019** — seven years of monthly recordings across platforms and utilities. The subject needs this data in the new platform but considers migration a secondary priority: *"If need be, I can input them manually."* The spreadsheet structure (dates in rows, values in columns, one tab per platform) is clean enough that CSV export and import would be feasible when the time comes.

---

## 5. Behavioral Pattern Update

### 5.1 The Transaction Cascade (Refined)

Session 1 identified the monthly ritual. Session 2 refined the pain of mid-month transactions:

1. Decide to deposit money into a EUR platform.
2. Transfer money from bank to Revolut (or directly to platform).
3. Record the deposit as a transaction on the platform tab.
4. Look up today's EUR/DKK rate and record it on the EUR tab.
5. Update the total portfolio tab with the new transaction.
6. Verify nothing broke.

Steps 3–6 are pure spreadsheet tax. In the new platform, step 3 is the only one the user should need to do. The exchange rate is fetched automatically, portfolio totals update automatically, and nothing can break because there are no formulas to maintain.

### 5.2 Refueling at the Pump

The subject currently saves fuel receipts and enters data later at a desk — a concession to the spreadsheet's desktop-bound nature. With a mobile-friendly platform, they'd prefer to register refueling at the pump: enter the numbers, snap photos of the receipt and odometer, done. This requires fast, touch-friendly forms with camera access.

---

## 6. Corrections to Session 1

### 6.1 Multi-Currency: From Open Question to Core Requirement

Session 1 Section 8.3 flagged multi-currency as "worth flagging for a future conversation." Session 2 established it as a core requirement — not a future enhancement.

### 6.2 Yearly Summary View Preference

The initial preference expressed was for a "separate yearly breakdown view," later corrected to **inline collapsible year rows** — matching the subject's existing spreadsheet pattern.

---

## 7. Summary of New Requirements for PRD v2

1. **Currency subsystem**: Exchange rate store, auto-fetching with override, native + DKK display, XIRR in native currency, aggregation in DKK.
2. **Platform types**: Investment vs. cash, with different UI treatment and metrics.
3. **Platform lifecycle**: Active/closed status, closure date, closure note.
4. **Vehicle lifecycle**: Active/sold status, sale date, sale price, sale note.
5. **Monthly earnings and monthly XIRR**: Explicit first-class metrics.
6. **Portfolio allocation view**: Visual breakdown on portfolio overview.
7. **Utility yearly inline rows**: Collapsible year summaries with YoY change percentages.
8. **EV support**: Fuel-type-driven units, home-charging flag with utility crossover.
9. **Locale settings**: Danish number/currency formatting, configurable date format, light/dark mode.
10. **Multiple meter readings per month**: Aggregation and interpolation handling.
11. **Mobile-optimized refueling**: Fast forms, dual camera capture (receipt + odometer).
12. **Build priority**: Investment portfolio first.
