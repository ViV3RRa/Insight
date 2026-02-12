# Personal Metrics Platform — Product Requirements Document (v2)

## Changelog from v1

- **Currency subsystem**: Added exchange rate model, auto-fetching, native + DKK display, per-platform currency field.
- **Platform types**: Added `type` field (investment/cash) with differentiated UI and metrics.
- **Platform lifecycle**: Added active/closed status, closure date, closure note.
- **Vehicle lifecycle**: Added active/sold status, sale date, sale price, sale note. Total cost of ownership metric.
- **Monthly earnings and monthly XIRR**: Elevated to first-class metrics throughout the investment section.
- **Portfolio allocation view**: Added allocation visualization to portfolio overview.
- **Utility yearly view**: Changed to inline collapsible year rows with YoY change percentages.
- **Electric vehicle support**: Fuel-type-driven units on refueling, home-charging flag with electricity utility crossover.
- **Locale and settings**: Added settings system for date format, theme (light/dark mode), and locale-aware formatting.
- **Multiple meter readings per month**: Explicit handling documented.
- **Build priority**: Investment portfolio identified as the first section to build.

---

## 1. Vision

A personal observatory for the systems in your life. The platform lets a single power user record real-world observations — meter readings, portfolio values, fuel receipts, maintenance events — and automatically produces the charts, comparisons, and metrics that would otherwise require manual formula and chart maintenance in a spreadsheet.

The platform is **not** a decision-support tool in the traditional sense. Its value lies in **awareness, legibility, and sovereignty**: the user sees exactly how every number is calculated, controls what time frames and comparisons are shown, and trusts the output because the system is theirs.

### 1.1 Design Principles

- **Record and forget**: Data entry should be fast and intentional. Everything downstream — calculations, charts, comparisons — happens automatically.
- **Efficiency over discoverability**: The sole user is a power user. Optimize for minimal clicks and information density. No tooltips explaining what XIRR means.
- **Progressive disclosure**: All data is accessible, but detail lives behind folds, accordions, and toggles so the default view stays clean. Full data tables appear on dedicated detail pages (e.g. a specific platform, a specific utility).
- **Pluggable sections**: The architecture treats each life domain (Home, Portfolio, Vehicles) as a section with its own data models and views, but sharing common platform capabilities (time-series charts, file attachments, year-over-year comparison). New sections (subscriptions, budgeting, shared expenses) should be addable without rearchitecting.
- **Transparency**: Where a calculation is non-obvious (e.g. XIRR), the user should be able to understand the inputs. No black boxes.

### 1.2 Build Priority

The **Investment Portfolio** section is the highest priority — it carries the most pain (multi-currency, multi-entity coordination, year-boundary maintenance) and the most data complexity. It should be built first.

---

## 2. Architecture & Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (functional components, hooks), TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | lucide-react |
| Backend | PocketBase (self-hosted) |
| File Storage | PocketBase file fields |
| Authentication | PocketBase built-in auth (email/password) |
| Notifications | Web Push API (PWA) — future phase, see §12 |

### 2.1 PocketBase Service Layer

Create a `services/` module that wraps the PocketBase JS SDK. All UI components interact with this layer, never with PocketBase directly. This keeps the codebase testable and allows the backend to be swapped if needed.

Each section defines its own service functions. Common patterns:

```
collection.getList(page, perPage, { filter, sort })
collection.getOne(id)
collection.create(data)
collection.update(id, data)
collection.delete(id)
```

File uploads use PocketBase's `FormData`-based file fields.

### 2.2 Authentication

- Email/password login via PocketBase auth.
- Single user — no roles or permissions model needed.
- Session persists via PocketBase SDK token handling.
- The platform opens to a login screen. After authentication, the user lands on the Home section.

---

## 3. Universal Platform Capabilities

These features are available across all sections and should be implemented as shared components/utilities.

### 3.1 Time Span Selector

A button group that filters all charts, tables, and summary metrics in the current view.

| Label | Logic |
|---|---|
| 3M | Last 3 calendar months from today |
| 6M | Last 6 calendar months |
| 1Y | Last 12 months |
| 3Y | Last 36 months |
| 5Y | Last 60 months |
| YTD | January 1 of current year → today |
| All | Earliest data point → today |

Default: **All**. Selecting a time span recalculates everything in the current view.

### 3.2 Year-over-Year Comparison

A toggle (not enabled by default) that overlays the equivalent prior-year data on charts. When enabled:

- Bar charts show a second, semi-transparent bar set behind the current data.
- Line charts show a dashed or ghost line for the prior year.

This is a **lens** the user activates, not a permanent fixture.

### 3.3 File Attachments

Any record type across the platform can have files attached (images, PDFs, documents). Implementation uses PocketBase file fields. The UI provides:

- An "Attach file" button on relevant forms.
- Thumbnail previews for images.
- Download links for non-image files.
- Ability to delete attachments.

### 3.4 Staleness Indicators

Each section's overview page shows a subtle "Last updated X days ago" indicator derived from the most recent data entry in that section. Visual treatment:

- **< 7 days**: Neutral/muted text.
- **7–30 days**: Amber text.
- **> 30 days**: Red text.

No notifications or prompts — just the data telling the user it's aging.

### 3.5 Universal Notes

Every data entry across the platform — meter readings, data points, transactions, refuelings, maintenance events, bills — has an **optional note field**. This free-text field allows the user to attach context to any observation (e.g. "meter was replaced, reading reset", "bonus deposited", "long road trip").

Notes are displayed alongside the data point in tables and are searchable within a section.

### 3.6 Expandable Data Tables

Where raw data is relevant (readings, data points, transactions, maintenance events), it is shown in collapsible accordion tables. These are:

- **Collapsed by default** on overview pages.
- **Expanded and prominent** on detail pages (e.g. a specific investment platform page or a specific utility page).
- Sortable by date.
- Include delete/edit actions per row.
- Display the note field (if populated) for each row.

### 3.7 Locale and Formatting

The platform uses **Danish locale** conventions by default:

- **Number format**: Period as thousands separator, comma as decimal separator (e.g. `1.000,00`).
- **Currency**: DKK displayed with "kr." suffix (e.g. `1.000,00 kr.`). EUR displayed with "EUR" prefix or suffix as appropriate.
- **Percentages**: Comma as decimal separator, 2 decimal places + `%` (e.g. `5,48%`).
- **Date format**: `YYYY-MM-DD` by default (configurable to `DD/MM/YYYY` via settings).

### 3.8 Settings

A settings page accessible from the main navigation, providing:

- **Date format**: Toggle between `YYYY-MM-DD` and `DD/MM/YYYY`.
- **Theme**: Toggle between light mode and dark mode.
- **Home currency**: DKK (displayed for reference; drives portfolio aggregation currency).

Settings are stored per user in PocketBase.

---

## 4. Currency Subsystem

The platform operates in a **multi-currency** environment. The user's home currency is DKK. Investment platforms may be denominated in other currencies (currently EUR, extensible to others).

### 4.1 Exchange Rate Data Model

#### 4.1.1 ExchangeRate

| Field | Type | Notes |
|---|---|---|
| `id` | string | PocketBase auto-generated |
| `fromCurrency` | string | e.g. "EUR" |
| `toCurrency` | string | Always "DKK" (home currency) |
| `rate` | number | e.g. 7.46 (1 EUR = 7.46 DKK) |
| `date` | date | The date this rate applies to |
| `source` | string | "auto" (fetched) or "manual" (user override) |
| `created` | datetime | |

### 4.2 Rate Fetching

- Exchange rates are **automatically fetched** from a public API (e.g. ECB or similar) for the relevant currencies.
- Monthly rates are fetched on or near the 1st of each month.
- Transaction-day rates are fetched when a transaction is recorded on a non-DKK platform.
- All fetched rates are **visible** to the user and **overridable** — the user can edit any rate.
- The `source` field tracks whether a rate was auto-fetched or manually entered/overridden.

### 4.3 Currency Display Rules

- **DKK-denominated platforms**: Values shown in DKK only (e.g. `5.057,80 kr.`).
- **Non-DKK platforms**: Values shown in native currency with DKK equivalent (e.g. `1.000 EUR (7.460 kr.)`).
- **Portfolio totals**: Always in DKK (the aggregation currency).
- **XIRR**: Calculated in the **native currency** of the platform. Portfolio-level XIRR uses DKK-converted values.
- **Transactions on non-DKK platforms**: Stored in native currency with the exchange rate at the time of the transaction recorded. Display shows both native and DKK amounts.

### 4.4 Supported Currencies

Currently: **DKK** (home) and **EUR**. The system should be designed to support additional currencies in the future by adding new exchange rate entries — no structural changes required.

---

## 5. Section: Home (Utilities)

**This is the default landing section after login.**

### 5.1 Data Model

#### 5.1.1 Utility

| Field | Type | Notes |
|---|---|---|
| `id` | string | PocketBase auto-generated |
| `name` | string | e.g. "Electricity", "Water", "Heat" |
| `unit` | string | e.g. "kWh", "m³", "MWh" |
| `created` | datetime | |

#### 5.1.2 MeterReading

A point-in-time observation of a utility meter's cumulative value.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `utilityId` | string | FK → Utility |
| `value` | number | Cumulative meter reading |
| `timestamp` | datetime | Defaults to now |
| `note` | string (optional) | e.g. "meter replaced, reading reset" |

Consumption for a period = current reading − previous reading. The platform computes this automatically.

**Multiple readings per month**: If multiple readings exist within a single month, consumption is the delta between each consecutive pair. Monthly consumption is the sum of all deltas whose reading pairs fall within (or are interpolated into) that month. If a reading pair spans a month boundary, linear interpolation splits the consumption proportionally across the two months.

#### 5.1.3 UtilityBill

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `utilityId` | string | FK → Utility |
| `amount` | number | Total billed amount (currency) |
| `periodStart` | date | First day the bill covers |
| `periodEnd` | date | Last day the bill covers |
| `attachment` | file (optional) | Scanned bill / PDF |
| `note` | string (optional) | |
| `timestamp` | datetime | Date bill was received/registered |

**Amortization**: When a bill covers multiple months, the platform distributes the cost equally across the covered months for per-month cost views. For example, a yearly bill of 12,000 covering Jan–Dec is shown as 1,000/month.

### 5.2 Calculated Metrics

For each utility:

- **Monthly consumption**: Derived from meter readings (delta between consecutive readings). If readings don't align to month boundaries, interpolate linearly. Multiple readings per month are aggregated.
- **Monthly cost**: From amortized bills.
- **Cost per unit**: `amortized monthly cost / monthly consumption`.
- **Year-to-date consumption and cost**.
- **Year-over-year comparison** (when toggled on): Same month/period last year.
- **Average monthly cost** (for selected time span).
- **Cost trend**: Is the rolling average going up or down vs. the prior equivalent period?
- **Annual consumption change %**: Year-over-year consumption change as a percentage.
- **Annual cost change %**: Year-over-year cost change as a percentage.

### 5.3 Home Overview Page

The first thing the user sees after login.

**Layout:**

1. **Section heading** with staleness indicator.
2. **Summary cards** — one per utility, each showing:
   - Current month consumption (and delta vs. last month).
   - Current month cost.
   - YTD total cost.
   - Cost per unit (current month).
3. **Charts area** with time span selector:
   - Bar chart of monthly consumption per utility (stacked or grouped, user choice).
   - Bar chart of monthly cost per utility.
   - Mode toggle: consumption vs. cost.
   - YoY overlay toggle.
4. **Utility list** — clickable cards/rows to navigate to individual utility detail pages.
5. **Quick actions**: "Add Reading", "Add Bill" buttons accessible from the overview.

### 5.4 Utility Detail Page

Navigated to by clicking a utility from the overview. Full-width view with back button.

**Content:**

- Utility name and metadata.
- Summary stat cards (same metrics, scoped to this utility).
- Time span selector.
- Charts: monthly consumption, monthly cost, cost per unit over time.
- YoY toggle.
- **Inline collapsible year rows**: A data table where each row represents a year, showing:
  - Total consumption for the year.
  - Average monthly consumption.
  - Annual consumption change % (vs. previous year), color-coded: red for increase, green for decrease.
  - Total cost for the year.
  - Average monthly cost.
  - Average cost per unit.
  - Annual cost change % (vs. previous year), color-coded: red for increase, green for decrease.
  - **Expanding a year row** reveals the monthly detail rows for that year:
    - Date, cumulative meter reading, computed period consumption, amortized cost, cost per unit, note, edit/delete.
- **Bills table** (collapsible): date, amount, period covered, note, attachment link, edit/delete.
- "Add Reading" and "Add Bill" buttons.

---

## 6. Section: Investment Portfolio

### 6.1 Data Model

#### 6.1.1 Portfolio

A portfolio is a named grouping of investment platforms. The user can have multiple portfolios (e.g. their own, one for a child). This is **not** multi-user — the logged-in user manages all portfolios as a custodian.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | e.g. "My Portfolio", "Erik's Portfolio" |
| `ownerName` | string | Who the portfolio is for, e.g. "Me", "Erik" |
| `isDefault` | boolean | The portfolio shown when navigating to the section. Exactly one portfolio is default. |
| `created` | datetime | |

#### 6.1.2 Platform

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `portfolioId` | string | FK → Portfolio |
| `name` | string | e.g. "Nordnet", "Interactive Brokers", "Revolut" |
| `type` | `"investment"` \| `"cash"` | Determines UI treatment and available metrics |
| `currency` | string | e.g. "DKK", "EUR". Drives display formatting and currency conversion. |
| `status` | `"active"` \| `"closed"` | Closed platforms are muted and excluded from current totals |
| `closedDate` | date (optional) | Date the platform was closed |
| `closureNote` | string (optional) | Reason or context for closing |
| `created` | datetime | |

#### 6.1.3 DataPoint

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `platformId` | string | FK → Platform |
| `value` | number | Total platform value at this moment, in the platform's native currency |
| `timestamp` | datetime | Defaults to now |
| `isInterpolated` | boolean | Default: false. True if this value was generated by month-end interpolation rather than directly observed. |
| `note` | string (optional) | |

#### 6.1.4 Transaction

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `platformId` | string | FK → Platform |
| `type` | `"deposit"` \| `"withdrawal"` | |
| `amount` | number | In platform's native currency. Always positive; sign derived from type. |
| `exchangeRate` | number (optional) | The exchange rate at the time of transaction, if platform currency ≠ DKK |
| `timestamp` | datetime | |
| `note` | string (optional) | |
| `attachment` | file (optional) | Statement, confirmation, etc. |

### 6.2 Calculations

#### 6.2.1 XIRR

Cash-flow construction for a time window `[start, end]`:

1. **Starting value**: Nearest data point at or before `start` → negative cash flow at `start` (capital already deployed).
2. **Deposits** within window → negative cash flows (money leaving investor's pocket).
3. **Withdrawals** within window → positive cash flows (money returning).
4. **Ending value**: Latest data point at or before `end` → positive cash flow at its timestamp.

Solve via Newton-Raphson. Edge cases: fewer than 2 cash flows → `null`; non-convergence → `null`.

**Currency note**: XIRR for individual platforms is calculated in the platform's **native currency**. Portfolio-level XIRR uses DKK-converted values.

#### 6.2.2 Gain / Loss

```
gain = endingValue - startingValue - netDeposits
netDeposits = Σ deposits - Σ withdrawals  (within window)
gainPercent = gain / (startingValue + Σ deposits) × 100
```

#### 6.2.3 Month-End Normalization

All period calculations (monthly earnings, monthly XIRR, yearly summaries) use **month-end boundary values** — the platform value on the last day of each month (e.g. Jan 31, Feb 28, Mar 31).

When the user records a data point:

- **On the last day of the month** (e.g. Jan 31): The value is used directly as that month's boundary value.
- **After the month boundary** (e.g. Feb 5 for January's end): The system creates an **interpolated** Jan 31 data point using linear interpolation between the previous month-end value (Dec 31) and the Feb 5 recording. The interpolated data point is marked as `isInterpolated: true`.
- **Multiple recordings within a month**: The last recording in the month is used. Additional mid-month recordings enrich value-over-time charts but do not affect month-end boundary calculations.

Interpolated data points are:
- **Marked in the data** (`isInterpolated: true`) so the system always knows which values are observed vs. estimated.
- **Visually distinguished** in the UI (e.g. a subtle indicator or different styling in tables/charts) so the user can see where interpolation was applied.
- **Overridable**: The user can replace an interpolated value by entering the actual month-end value. This sets `isInterpolated` to false.
- **Reversible**: If the user wants to undo an override, they delete the data point. The system detects the missing month-end boundary and recomputes the interpolation automatically, creating a new `isInterpolated: true` data point.

Linear interpolation is a reasonable approximation for the user's monthly observation cadence. In cases where it would be significantly wrong (e.g. a market crash mid-month), the user can look up and enter the actual value.

#### 6.2.4 Monthly Earnings

```
monthlyEarnings = endingValue - startingValue - netDeposits  (for that month)
```

Where `startingValue` is the month-end boundary value of the previous month, and `endingValue` is the month-end boundary value of the current month (both actual or interpolated per §6.2.3). Net deposits are transactions within the month.

This is a first-class metric displayed on platform cards and in monthly analysis views.

#### 6.2.5 Monthly XIRR

XIRR calculated for a single month in isolation: the previous month-end boundary value as the starting cash flow, transactions within the month, and the current month-end boundary value as the ending cash flow. This shows the annualized return for that specific month.

#### 6.2.6 Required Resolutions

For each platform **and** for the total portfolio:

- All time (since first data point).
- Each calendar year historically, including current YTD.
- Each calendar month historically, including current MTD.

#### 6.2.7 Portfolio-Level Aggregation

- Composite value series: sum all platform values (converted to DKK) at each timestamp.
- Merge all transactions across platforms within the selected portfolio (converted to DKK).
- Run XIRR and gain/loss on aggregated DKK data.
- **Cash platform values are included** in portfolio totals and portfolio-level XIRR. Idle cash dilutes the portfolio return, which is the truthful picture.

#### 6.2.8 Portfolio Allocation

For each platform: `platformValue (DKK) / totalPortfolioValue (DKK) × 100`.

Computed for the current point in time. Used for the allocation visualization on the portfolio overview.

### 6.3 Portfolio Overview Page

**Portfolio Switcher**: A dropdown or selector at the top of the section showing the current portfolio name and owner. The default portfolio is pre-selected when navigating to the section. The user can switch to any other portfolio. An "Add Portfolio" action is accessible from the switcher. Edit/delete actions available for non-default portfolios (default can be reassigned).

All summary cards, charts, and platform lists below are scoped to the selected portfolio.

**Layout:**

1. **Summary cards** — total portfolio:
   - Total current value (DKK).
   - All-time gain/loss (absolute + %).
   - All-time XIRR.
   - YTD gain/loss.
   - YTD XIRR.
   - Current month earnings.
2. **Portfolio allocation** — visual breakdown (donut chart, proportional bar, or similar) showing each platform's share of total portfolio value. Cash platforms and investment platforms visually distinguishable.
3. **Charts area** (expandable via toggle) with time span selector:
   - Yearly bar chart (toggle: XIRR % / Earnings).
   - Monthly bar chart (same toggle).
   - XIRR line chart over time.
   - YoY overlay toggle.
4. **Platform list** — organized with visual distinction between investment platforms and cash platforms:
   - **Investment platforms** (cards/rows), each showing:
     - Platform name.
     - Currency indicator (if non-DKK).
     - Current value (native currency + DKK equivalent if applicable).
     - Current month earnings.
     - All-time gain/loss (absolute + %).
     - All-time XIRR.
     - Clickable → platform detail page.
     - Edit/delete actions.
   - **Cash platforms** (cards/rows, visually distinct), each showing:
     - Platform name.
     - Currency indicator (if non-DKK).
     - Current balance (native currency + DKK equivalent if applicable).
     - Clickable → cash platform detail page.
     - Edit/delete actions.
   - **Closed platforms** (muted), each showing:
     - Platform name with "Closed" indicator.
     - Final value at closure.
     - All-time gain/loss.
     - Clickable → platform detail page (historical view).
5. **"Add Platform"** button (with type selection: investment or cash).

### 6.4 Platform Detail Page (Investment)

Full-width view with back button. The portfolio context (name) is shown in the header for orientation.

**Header:** Platform name (editable), currency badge, summary stat cards:
- Current value (native + DKK if applicable).
- Current month earnings.
- All-time gain/loss (absolute + %).
- All-time XIRR.
- YTD gain/loss.
- YTD XIRR.

**Time span selector** above all content.

**Tabbed content:**

| Tab | Content |
|---|---|
| **Yearly Analysis** | Bar chart — toggle between XIRR (%) and Earnings (currency/%). Green bars positive, red negative, values on bars. Below the chart: yearly summary table with exact earnings and XIRR per year, with totals row. |
| **Monthly Analysis** | Same as yearly, monthly granularity, filtered to selected time span. Includes monthly earnings (absolute) and monthly XIRR columns. |
| **XIRR Over Time** | Smooth blue line chart showing cumulative XIRR evolving over time. |
| **Gain/Loss Table** | Columns: Period, Starting Value, Ending Value, Net Deposits, Gain/Loss, XIRR. Totals row. |
| **Transactions** | Collapsible table: date, type badge (green/red), amount (native + DKK if applicable), exchange rate (if applicable), note, attachment, delete. "Add Transaction" button. |
| **Data Points** | Collapsible table: date, value (native + DKK if applicable), note, delete. "Add Data Point" button. |

### 6.5 Platform Detail Page (Cash)

Simplified version of the investment platform detail. No XIRR, gain/loss, or performance analysis.

**Header:** Platform name (editable), currency badge.

**Content:**
- Current balance (native + DKK if applicable).
- **Balance history**: Line chart showing balance over time.
- **Transactions table**: date, type badge, amount (native + DKK if applicable), note, attachment, edit/delete. "Add Transaction" button.
- **Data Points table**: date, value (native + DKK if applicable), note, edit/delete. "Add Data Point" button.

### 6.6 Closed Platform Behavior

- Closed platforms appear **muted** in the platform list on the portfolio overview.
- They are **excluded** from current portfolio totals and current allocation calculations.
- Their detail pages show all historical data, charts, and metrics up to the closure date.
- The closure date and closure note are displayed in the detail page header.

### 6.7 Chart Design Language (applies to all sections)

- **Bar charts**: Solid green (`#22c55e`) positive, solid red (`#ef4444`) negative. Value labels on/above bars. Minimal grid lines.
- **Line charts**: Smooth blue (`#3b82f6`) line with subtle area fill.
- **YoY overlay**: Semi-transparent bars or dashed ghost lines.
- **Typography**: Sans-serif. Currency: period-separated thousands, comma decimal, 2 decimal places. Percentages: 2 decimals + `%`.
- **Mode toggles** on bar charts where applicable (XIRR vs. Earnings, Consumption vs. Cost).

---

## 7. Section: Vehicles

### 7.1 Data Model

#### 7.1.1 Vehicle

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | User-defined label, e.g. "Family Car" |
| `type` | string | e.g. "Car", "Motorcycle" |
| `make` | string | |
| `model` | string | |
| `year` | number | Model year |
| `licensePlate` | string | |
| `fuelType` | string | e.g. "Petrol", "Diesel", "Electric", "Hybrid" |
| `status` | `"active"` \| `"sold"` | Sold vehicles are muted in the list |
| `purchaseDate` | date (optional) | |
| `purchasePrice` | number (optional) | |
| `saleDate` | date (optional) | Date the vehicle was sold |
| `salePrice` | number (optional) | |
| `saleNote` | string (optional) | Context about the sale |
| `photo` | file (optional) | Vehicle image |
| `created` | datetime | |

#### 7.1.2 Refueling

A generalized "energy replenishment" event. The vehicle's `fuelType` determines which units are displayed.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `vehicleId` | string | FK → Vehicle |
| `date` | date | |
| `fuelAmount` | number | Liters (petrol/diesel) or kWh (electric) |
| `costPerUnit` | number | Cost per liter or cost per kWh |
| `totalCost` | number | Computed or entered |
| `odometerReading` | number | Total km at this refueling |
| `station` | string (optional) | Service station name/location |
| `chargedAtHome` | boolean | Default: false. Only relevant for electric vehicles. If true, the kWh can be cross-referenced with the electricity utility. |
| `note` | string (optional) | |
| `receipt` | file (optional) | Photo of receipt or pump screen |
| `tripCounterPhoto` | file (optional) | Photo of odometer/trip counter |

#### 7.1.3 MaintenanceEvent

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `vehicleId` | string | FK → Vehicle |
| `date` | date | |
| `description` | string | What was done |
| `cost` | number | |
| `note` | string (optional) | |
| `receipt` | file (optional) | Receipt image |

### 7.2 Calculated Metrics

For each vehicle:

- **Fuel efficiency**:
  - Unit depends on fuel type: **km/l** (petrol/diesel) or **km/kWh** (electric).
  - All-time weighted average: `total km driven / total fuel consumed`.
  - Current year weighted average.
  - Rolling window: last 5 refuelings weighted average.
  - The weighted average weights each stint's efficiency by the fuel consumed in that stint, which is mathematically equivalent to total km ÷ total fuel.
- **Distance**:
  - Total km driven each year.
  - Km driven this year so far.
- **Fuel costs**:
  - Total fuel cost (for selected time span).
  - Average fuel cost per month.
  - Average fuel cost per day.
  - Average cost per unit (liter or kWh) over time.
- **Maintenance costs**:
  - Total maintenance cost (for selected time span).
  - Per-year breakdown.
- **Total vehicle cost**: Fuel + maintenance combined.
- **Total cost of ownership** (especially relevant for sold vehicles): Lifetime fuel + maintenance costs, with purchase price to sale price offset available as secondary information.

**Important**: All averages involving efficiency must be **weighted** (total km ÷ total fuel), not arithmetic means of per-refueling ratios.

### 7.3 EV Home Charging Crossover

When a refueling record for an electric vehicle has `chargedAtHome = true`:

- The kWh consumed is flagged as vehicle-related electricity consumption.
- On the **electricity utility detail page**, a toggle allows the user to **exclude home-charging kWh** from the utility's consumption view. This is useful when a third party (e.g. employer for a company car) reimburses home charging costs.
- The total kWh used for home charging is displayed as a supplementary metric on the electricity utility page when relevant.

### 7.4 Vehicles Overview Page

**Layout:**

1. **Active vehicle cards** — one per vehicle, showing:
   - Vehicle photo (or placeholder by type).
   - Name, make/model/year.
   - Current year fuel efficiency (weighted avg), with unit matching fuel type.
   - YTD fuel cost.
   - YTD total cost (fuel + maintenance).
   - Clickable → vehicle detail page.
2. **Sold vehicles** (muted) — same card layout but visually muted, with "Sold" indicator. Shows:
   - Vehicle photo.
   - Name, make/model/year.
   - Total cost of ownership.
   - Sale date.
   - Clickable → vehicle detail page (historical view).
3. **"Add Vehicle"** button.
4. Staleness indicator.

### 7.5 Vehicle Detail Page

Full-width view with back button.

**Header:** Vehicle photo, name, metadata (make, model, year, plate, fuel type). For sold vehicles: sale date, sale price, sale note.

**Summary stat cards:**
- All-time weighted efficiency (km/l or km/kWh).
- Current year weighted efficiency.
- Last 5 refuelings weighted efficiency.
- YTD km driven.
- YTD fuel cost.
- Average fuel cost/month.
- Average fuel cost/day.
- For sold vehicles: Total cost of ownership, with purchase-to-sale offset as secondary stat.

**Time span selector.**

**Charts:**
- Fuel efficiency over time (line chart, per-refueling data points).
- Monthly fuel cost (bar chart).
- Monthly km driven (bar chart or line).
- Maintenance cost timeline.
- YoY toggle on all charts.

**Data tables (collapsible, expanded on this page):**
- Refueling log: date, fuel amount (liters or kWh), cost/unit, total cost, odometer, station, charged-at-home indicator (for EVs), note, receipt thumbnail, edit/delete.
- Maintenance log: date, description, cost, note, receipt thumbnail, edit/delete.

---

## 8. Navigation & Layout

### 8.1 Top-Level Structure

- **Tab bar / sidebar** with sections: **Home**, **Portfolio**, **Vehicles**.
- **Settings** accessible from the navigation (gear icon or similar).
- Additional sections can be added in the future (Subscriptions, Budget, Shared Expenses).
- Each section has its own overview page as the landing view for that tab.
- **Home is the default section after login.**

### 8.2 Navigation Pattern

- Section tabs → section overview page.
- Clicking an entity card (utility, platform, vehicle) → full-width detail page with back button.
- Dialogs/modals for create/edit actions (not full page navigations).

### 8.3 Responsive Design

- **Desktop**: Primary target. Information-dense layouts, multi-column grids.
- **Mobile**: Fully functional. Single-column layouts, touch-friendly inputs, collapsible sections. Charts scale down gracefully. **Especially important for refueling entry at the pump** — fast forms with camera access.
- **Pure web** — no native app. PWA-capable for future push notifications.

### 8.4 Theme

The platform supports **light mode** and **dark mode**, toggled via a setting. The default theme is light mode. Both themes must maintain sufficient color contrast and readability.

---

## 9. Dialogs / Forms

All dialogs are modal overlays with backdrop blur. Forms validate before submission.

### 9.1 Portfolio Dialog (Add / Edit)
- Name (text, required).
- Owner name (text, required — who is this portfolio for).
- Is default (checkbox — only when editing; at least one must remain default).

### 9.2 Platform Dialog (Add / Edit)
- Name (text, required).
- Type (select: Investment / Cash, required — only on creation, not editable after).
- Currency (select: DKK, EUR, etc., required — only on creation, not editable after).
- When editing: option to **close** the platform (sets status to closed, prompts for closure date and optional closure note).

### 9.3 Data Point Dialog
- Value (number, required — in platform's native currency).
- Timestamp (datetime-local, default: now).
- Note (text, optional).

### 9.4 Transaction Dialog
- Type: Deposit / Withdrawal (radio, required).
- Amount (number, positive, required — in platform's native currency).
- Exchange rate (number, auto-populated for non-DKK platforms, editable).
- Timestamp (datetime-local, default: now).
- Note (text, optional).
- Attachment (file, optional).

### 9.5 Utility Dialog (Add / Edit)
- Name (text, required).
- Unit (text, required — e.g. "kWh").

### 9.6 Meter Reading Dialog
- Value (number, required — cumulative reading).
- Timestamp (datetime-local, default: now).
- Note (text, optional).

### 9.7 Bill Dialog
- Amount (number, required).
- Period start (date, required).
- Period end (date, required).
- Note (text, optional).
- Attachment (file, optional).

### 9.8 Vehicle Dialog (Add / Edit)
- Name (text, required).
- Type (select: Car, Motorcycle, etc.).
- Make (text).
- Model (text).
- Year (number).
- License plate (text).
- Fuel type (select: Petrol, Diesel, Electric, Hybrid, etc.).
- Purchase date (date, optional).
- Purchase price (number, optional).
- Photo (file, optional).
- When editing: option to **mark as sold** (sets status to sold, prompts for sale date, sale price, and optional sale note).

### 9.9 Refueling Dialog
- Date (date, required, default: today).
- Fuel amount (number, required — label shows "Liters" or "kWh" based on vehicle fuel type).
- Cost per unit (number, required — label shows "kr./liter" or "kr./kWh" based on vehicle fuel type).
- Total cost (number, auto-computed, editable).
- Odometer reading (number, required).
- Station (text, optional).
- Charged at home (checkbox, only shown for electric vehicles, default: false).
- Note (text, optional).
- Receipt (file, optional).
- Trip counter photo (file, optional).

### 9.10 Maintenance Event Dialog
- Date (date, required, default: today).
- Description (text, required).
- Cost (number, required).
- Note (text, optional).
- Receipt (file, optional).

---

## 10. PocketBase Collections

| Collection | Fields | Notes |
|---|---|---|
| `users` | Built-in PocketBase auth | Email/password |
| `settings` | userId (relation), dateFormat, theme | Per-user settings |
| `exchange_rates` | fromCurrency, toCurrency, rate, date, source | Historical exchange rates |
| `portfolios` | name, ownerName, isDefault | One default per user |
| `platforms` | portfolio (relation), name, type, currency, status, closedDate, closureNote | Investment or cash, active or closed |
| `data_points` | platform (relation), value, timestamp, isInterpolated, note | Value in platform's native currency. isInterpolated marks system-generated month-end values. |
| `transactions` | platform (relation), type, amount, exchangeRate, timestamp, note, attachment | Amount in platform's native currency |
| `utilities` | name, unit | |
| `meter_readings` | utility (relation), value, timestamp, note | |
| `utility_bills` | utility (relation), amount, periodStart, periodEnd, note, attachment, timestamp | |
| `vehicles` | name, type, make, model, year, licensePlate, fuelType, status, purchaseDate, purchasePrice, saleDate, salePrice, saleNote, photo | |
| `refuelings` | vehicle (relation), date, fuelAmount, costPerUnit, totalCost, odometerReading, station, chargedAtHome, note, receipt, tripCounterPhoto | |
| `maintenance_events` | vehicle (relation), date, description, cost, note, receipt | |

All collections should have an `owner` field (relation to `users`) for data isolation, even though there's currently a single user.

---

## 11. File / Module Structure (Suggested)

```
src/
├── App.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           # Auth wrapper, tab navigation
│   │   ├── TabBar.tsx
│   │   ├── Login.tsx
│   │   └── Settings.tsx           # Settings page
│   ├── shared/
│   │   ├── TimeSpanSelector.tsx
│   │   ├── YoYToggle.tsx
│   │   ├── StalenessIndicator.tsx
│   │   ├── CollapsibleTable.tsx
│   │   ├── CollapsibleYearTable.tsx  # Inline year rows with expandable months
│   │   ├── FileAttachment.tsx
│   │   ├── StatCard.tsx
│   │   ├── Dialog.tsx
│   │   ├── CurrencyDisplay.tsx    # Handles native + DKK rendering
│   │   └── charts/
│   │       ├── BarChart.tsx        # Reusable green/red bar chart
│   │       ├── LineChart.tsx       # Reusable smooth line chart
│   │       ├── AllocationChart.tsx # Donut/proportional chart
│   │       └── ChartModeToggle.tsx
│   ├── home/
│   │   ├── HomeOverview.tsx
│   │   ├── UtilityDetail.tsx
│   │   ├── UtilityCard.tsx
│   │   └── dialogs/
│   │       ├── UtilityDialog.tsx
│   │       ├── MeterReadingDialog.tsx
│   │       └── BillDialog.tsx
│   ├── portfolio/
│   │   ├── PortfolioOverview.tsx
│   │   ├── PortfolioSwitcher.tsx
│   │   ├── PlatformDetail.tsx        # Investment platform detail
│   │   ├── CashPlatformDetail.tsx    # Cash platform detail (simplified)
│   │   ├── PlatformCard.tsx          # Investment platform card
│   │   ├── CashPlatformCard.tsx      # Cash platform card
│   │   └── dialogs/
│   │       ├── PortfolioDialog.tsx
│   │       ├── PlatformDialog.tsx
│   │       ├── DataPointDialog.tsx
│   │       └── TransactionDialog.tsx
│   └── vehicles/
│       ├── VehiclesOverview.tsx
│       ├── VehicleDetail.tsx
│       ├── VehicleCard.tsx
│       └── dialogs/
│           ├── VehicleDialog.tsx
│           ├── RefuelingDialog.tsx
│           └── MaintenanceDialog.tsx
├── services/
│   ├── pb.ts                      # PocketBase client instance
│   ├── auth.ts                    # Login/logout/session
│   ├── settings.ts                # User settings
│   ├── exchangeRates.ts           # Rate fetching, storage, lookup
│   ├── portfolios.ts
│   ├── platforms.ts
│   ├── dataPoints.ts
│   ├── transactions.ts
│   ├── utilities.ts
│   ├── meterReadings.ts
│   ├── utilityBills.ts
│   ├── vehicles.ts
│   ├── refuelings.ts
│   └── maintenanceEvents.ts
├── utils/
│   ├── xirr.ts                    # Newton-Raphson XIRR solver
│   ├── calculations.ts            # Gain/loss, fuel efficiency, consumption deltas, monthly earnings
│   ├── currency.ts                # Currency conversion, display formatting
│   ├── formatters.ts              # Number, %, date formatting (Danish locale)
│   ├── timeSpan.ts                # Time span filtering logic
│   └── amortization.ts            # Bill amortization across months
└── types/
    └── index.ts
```

---

## 12. Future Phases (Out of Scope for v1)

These are acknowledged directions but are **not** part of the initial build:

- **Push notifications / reminders**: PWA-based web push. User can enable/disable per section, configure reminder schedules (e.g. "remind me on the 1st of each month to do readings"). Requires service worker and notification permission flow.
- **Subscriptions section**: Track recurring subscriptions, costs, renewal dates.
- **Budget tool**: Income vs. expenses, category-based tracking.
- **Shared expenses calculator**: Split fixed household costs between people.
- **Additional utility types**: Internet, insurance, property tax — addable via the existing utility model.
- **Data import**: CSV import mechanism for migrating historical data from Google Sheets. The subject has data going back to January 2019 across all sections. The spreadsheet structure (dates in rows, values in columns, one tab per entity) is CSV-exportable. This is not priority one but would prevent weeks of manual re-entry.

---

## 13. Non-Functional Requirements

- **Responsive**: Desktop-first, fully functional on mobile. Refueling forms specifically optimized for mobile use at the pump.
- **Performance**: Charts render smoothly with 7+ years of monthly data across multiple entities.
- **Accessibility**: ARIA labels on interactive elements, sufficient color contrast in both light and dark themes, keyboard-navigable dialogs and forms.
- **Data ownership**: All data stored in the user's own PocketBase instance. No third-party analytics or data sharing.
- **Extensibility**: Adding a new section should follow the established pattern (data model, service, overview page, detail page) without modifying core platform code.
- **Locale**: Danish number and currency formatting throughout. Configurable date format.

---

## 14. Acceptance Criteria

### Home (Utilities)
1. User can create, edit, and delete utilities with name and unit.
2. User can register meter readings with cumulative value, timestamp, and optional note.
3. User can register bills with amount, period range, optional note, and optional attachment.
4. Monthly consumption is correctly derived from consecutive meter readings, including when multiple readings exist within a month.
5. Multi-month bills are amortized correctly across covered months.
6. Cost per unit is calculated and displayed.
7. Home overview shows summary cards per utility and combined charts.
8. Utility detail page shows inline collapsible year rows with yearly totals, averages, and YoY change percentages, expandable to monthly detail.
9. Annual consumption change % and annual cost change % are calculated and color-coded.

### Investment Portfolio
10. User can create, edit, and delete portfolios with name and owner.
11. Default portfolio is pre-selected; user can switch between portfolios.
12. User can create investment and cash platforms with name, type, and currency.
13. User can close a platform with a closure date and optional note.
14. Closed platforms appear muted and are excluded from current portfolio totals.
15. User can register data points (value + timestamp + optional note) in platform's native currency.
16. User can register deposit/withdrawal transactions with optional exchange rate, notes, and attachments.
17. XIRR correctly incorporates data points and transactions as cash flows, calculated in native currency.
18. Gain/loss correctly accounts for net deposits.
19. Monthly earnings and monthly XIRR are computed and displayed as first-class metrics.
20. Portfolio allocation visualization shows each platform's share of total value.
21. All metrics computed at platform level and aggregate portfolio level (in DKK).
22. Cash platforms show balance and balance history; no XIRR/gain-loss analysis.
23. Portfolio overview shows summary cards, allocation chart, expandable charts, and platform list with visual distinction between investment, cash, and closed platforms.
24. Platform detail page shows tabbed analysis with all chart types and yearly summary with exact earnings and XIRR.
25. Exchange rates are auto-fetched for non-DKK platforms, visible, and overridable.
26. Non-DKK values display in native currency with DKK equivalent.

### Vehicles
27. User can create, edit, and delete vehicles with full metadata and photo.
28. User can mark a vehicle as sold with sale date, sale price, and optional note.
29. Sold vehicles appear muted in the list with total cost of ownership displayed.
30. User can register refueling events with fuel-type-appropriate units (liters/kWh, cost per unit).
31. Electric vehicle refueling includes a "charged at home" flag.
32. User can register maintenance events with description, cost, optional note, and receipt.
33. Fuel efficiency uses weighted average (total km ÷ total fuel), not arithmetic mean.
34. Rolling 5-refueling weighted average is calculated correctly.
35. Yearly and YTD km driven are derived from odometer readings.
36. Vehicle detail page shows all charts and expanded data tables.
37. Total cost of ownership is calculated for sold vehicles (fuel + maintenance, with purchase-to-sale offset as secondary).

### Cross-Cutting
38. All data entries across the platform support optional notes.
39. Time span selector filters all content in current view for all sections.
40. Year-over-year comparison toggle overlays prior year data on charts.
41. File attachments work on all applicable record types.
42. Staleness indicators appear on all section overview pages.
43. Collapsible data tables are collapsed on overviews, expanded on detail pages.
44. Authentication via PocketBase works; data is scoped to the logged-in user.
45. Application is fully functional on both desktop and mobile browsers.
46. Light mode and dark mode are both functional and togglable.
47. Danish locale formatting is applied throughout (numbers, currency, percentages).
48. Date format is configurable between YYYY-MM-DD and DD/MM/YYYY.
49. EV home-charging kWh can be excluded from electricity utility consumption via toggle.
