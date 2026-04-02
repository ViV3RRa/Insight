# Requirements Map — Personal Metrics Platform (Insight)

> Extracted from PRD v2, Anthropologist Findings (Sessions 1 & 2), Process Doc, and CLAUDE.md.
> This document is the structured reference for all downstream implementation work.

---

## 1. Data Model Reference

### 1.1 Entity Relationship Summary

```
users (PocketBase auth)
  └─ settings (1:1 — dateFormat, theme, demoMode)
  └─ portfolios (1:N)
       └─ platforms (1:N — type: investment|cash, currency, status: active|closed)
            ├─ data_points (1:N — value snapshots, isInterpolated flag)
            └─ transactions (1:N — deposit|withdrawal, exchangeRate)
  └─ utilities (1:N — name, unit, icon, color)
       ├─ meter_readings (1:N — cumulative value, timestamp)
       └─ utility_bills (1:N — amount, periodStart, periodEnd)
  └─ vehicles (1:N — fuelType, status: active|sold)
       ├─ refuelings (1:N — fuelAmount, costPerUnit, odometerReading, chargedAtHome)
       └─ maintenance_events (1:N — description, cost)
  └─ exchange_rates (standalone — fromCurrency, toCurrency, rate, date, source)
```

All collections carry an `owner` field (FK → users) for data isolation.

### 1.2 Entity Details

#### ExchangeRate (PRD §4.1)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| fromCurrency | string | e.g. "EUR" |
| toCurrency | string | Always "DKK" |
| rate | number | e.g. 7.46 |
| date | date | Date the rate applies to |
| source | string | "auto" or "manual" |
| created | datetime | |

#### Portfolio (PRD §6.1.1)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| name | string | Required |
| ownerName | string | Required — who the portfolio is for |
| isDefault | boolean | Exactly one per user must be true |
| created | datetime | |

#### Platform (PRD §6.1.2)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| portfolioId | FK → Portfolio | Required |
| name | string | Required |
| icon | file (image) | Required — displayed as circular thumbnail |
| type | "investment" \| "cash" | Required, immutable after creation |
| currency | string | Required (DKK, EUR, etc.), immutable after creation |
| status | "active" \| "closed" | Default: active |
| closedDate | date | Optional — set when closing |
| closureNote | string | Optional — context for closure |
| created | datetime | |

#### DataPoint (PRD §6.1.3)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| platformId | FK → Platform | Required |
| value | number | In platform's native currency |
| timestamp | datetime | Default: now |
| isInterpolated | boolean | Default: false |
| note | string | Optional |

#### Transaction (PRD §6.1.4)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| platformId | FK → Platform | Required |
| type | "deposit" \| "withdrawal" | Required |
| amount | number | Always positive; sign derived from type. Native currency. |
| exchangeRate | number | Optional — only if platform currency ≠ DKK |
| timestamp | datetime | Required |
| note | string | Optional |
| attachment | file | Optional |

#### Utility (PRD §5.1.1)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| name | string | Required (e.g. "Electricity") |
| unit | string | Required (e.g. "kWh", "m³", "MWh") |
| icon | string | Required — from curated set: bolt, droplet, flame, sun, wind, thermometer, wifi, trash |
| color | string | Required — preset palette: amber, blue, orange, emerald, violet, rose, cyan, slate |
| created | datetime | |

#### MeterReading (PRD §5.1.2)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| utilityId | FK → Utility | Required |
| value | number | Cumulative meter reading |
| timestamp | datetime | Default: now |
| note | string | Optional |
| attachment | file | Optional |

#### UtilityBill (PRD §5.1.3)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| utilityId | FK → Utility | Required |
| amount | number | Total billed amount |
| periodStart | date | Required |
| periodEnd | date | Required |
| timestamp | datetime | Date received/registered, default: now |
| note | string | Optional |
| attachment | file | Optional |

#### Vehicle (PRD §7.1.1)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| name | string | Required |
| type | string | e.g. "Car", "Motorcycle" |
| make | string | |
| model | string | |
| year | number | Model year |
| licensePlate | string | |
| fuelType | string | Petrol, Diesel, Electric, Hybrid |
| status | "active" \| "sold" | Default: active |
| purchaseDate | date | Optional |
| purchasePrice | number | Optional |
| saleDate | date | Optional |
| salePrice | number | Optional |
| saleNote | string | Optional |
| photo | file | Optional |
| created | datetime | |

#### Refueling (PRD §7.1.2)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| vehicleId | FK → Vehicle | Required |
| date | date | Required |
| fuelAmount | number | Liters or kWh (driven by vehicle fuelType) |
| costPerUnit | number | Cost per liter or per kWh |
| totalCost | number | Computed or entered |
| odometerReading | number | Total km |
| station | string | Optional |
| chargedAtHome | boolean | Default: false. Only relevant for EVs. |
| note | string | Optional |
| receipt | file | Optional |
| tripCounterPhoto | file | Optional |

#### MaintenanceEvent (PRD §7.1.3)
| Field | Type | Constraints |
|---|---|---|
| id | string | PocketBase auto |
| vehicleId | FK → Vehicle | Required |
| date | date | Required |
| description | string | Required |
| cost | number | Required |
| note | string | Optional |
| receipt | file | Optional |

#### Settings (PRD §3.8, §10)
| Field | Type | Constraints |
|---|---|---|
| userId | FK → users | Required |
| dateFormat | string | "YYYY-MM-DD" or "DD/MM/YYYY" |
| theme | string | "light" or "dark" |
| demoMode | boolean | Default: false |

---

## 2. Calculation Specifications

### 2.1 XIRR (PRD §6.2.1)

**Algorithm**: Newton-Raphson solver on the XIRR equation (net present value = 0).

**Cash flow construction for window [start, end]**:
1. **Starting value** → nearest data point at or before `start` → **negative** cash flow at `start` date (capital already deployed)
2. **Deposits** within window → **negative** cash flows (money leaving investor)
3. **Withdrawals** within window → **positive** cash flows (money returning)
4. **Ending value** → latest data point at or before `end` → **positive** cash flow at its timestamp

**Edge cases**:
- Fewer than 2 cash flows → return `null`
- Non-convergence of Newton-Raphson → return `null`
- Display "N/A" in the UI for null results

**Currency rules**:
- Per-platform XIRR: calculated in platform's **native currency**
- Portfolio-level XIRR: all values converted to **DKK** first

### 2.2 Monthly XIRR (PRD §6.2.5)

XIRR for a single month in isolation:
- Starting cash flow: previous month-end boundary value (negative)
- Transactions within the month as cash flows
- Ending cash flow: current month-end boundary value (positive)
- Annualized return for that specific month
- First-class metric alongside monthly earnings

### 2.3 Monthly Earnings (PRD §6.2.4)

```
monthlyEarnings = endingValue - startingValue - netDeposits
```

Where:
- `startingValue` = previous month-end boundary value (actual or interpolated per §6.2.3)
- `endingValue` = current month-end boundary value (actual or interpolated)
- `netDeposits` = Σ deposits - Σ withdrawals within the month

First-class metric: displayed on platform cards, monthly analysis views, and portfolio overview.

### 2.4 Gain/Loss (PRD §6.2.2)

```
gain = endingValue - startingValue - netDeposits
netDeposits = Σ deposits - Σ withdrawals (within window)
gainPercent = gain / (startingValue + Σ deposits) × 100
```

**Denominator**: `startingValue + Σ deposits` (total capital at risk in the period).

### 2.5 Month-End Normalization (PRD §6.2.3)

All period calculations use **month-end boundary values** (last day: Jan 31, Feb 28, Mar 31, etc.).

**Interpolation rules**:
- Data point on last day of month → used directly
- Data point after month boundary (e.g. Feb 5 for Jan end) → system creates interpolated Jan 31 data point using linear interpolation between previous month-end and the recording
- Multiple recordings within a month → last recording is used for month-end; mid-month recordings enrich charts only

**Interpolated data points**:
- Marked: `isInterpolated: true`
- Visually distinguished in UI (different styling in tables/charts)
- Overridable: user enters actual value → sets `isInterpolated: false`
- Reversible: user deletes override → system recomputes interpolation automatically

### 2.6 Required Resolutions (PRD §6.2.6)

For each platform AND for total portfolio:
- All time (since first data point)
- Each calendar year historically + current YTD
- Each calendar month historically + current MTD

### 2.7 Portfolio-Level Aggregation (PRD §6.2.7)

- Composite value series: sum all platform values (converted to DKK) at each timestamp
- Merge all transactions across platforms within selected portfolio (converted to DKK)
- Run XIRR and gain/loss on aggregated DKK data
- **Cash platform values ARE included** in portfolio totals and portfolio-level XIRR (idle cash dilutes return — truthful picture)

### 2.8 Portfolio Allocation (PRD §6.2.8)

```
allocationPercent = platformValue(DKK) / totalPortfolioValue(DKK) × 100
```

Computed at current point in time. Visualization on portfolio overview (donut/proportional bar).

### 2.9 Meter Reading Interpolation (PRD §5.1.2, §5.2)

- Consumption = current reading − previous reading (delta between consecutive readings)
- **Multiple readings per month**: consumption is the delta between each consecutive pair, aggregated for the month
- **Month boundary spanning**: if a reading pair spans a month boundary, linear interpolation splits consumption proportionally across months
- Readings don't align to month boundaries — always use linear interpolation for monthly views

### 2.10 Bill Amortization (PRD §5.1.3)

Multi-month bills distributed **equally** across covered months.
- Example: yearly bill of 12,000 covering Jan–Dec → 1,000/month
- Amortized cost feeds into monthly cost views and cost-per-unit calculations

### 2.11 Utility Calculated Metrics (PRD §5.2)

Per utility:
- Monthly consumption (from meter reading deltas + interpolation)
- Monthly cost (from amortized bills)
- Cost per unit: `amortized monthly cost / monthly consumption`
- YTD consumption and cost
- YoY comparison (same month/period last year)
- Average monthly cost (for selected time span)
- Cost trend: rolling average direction vs prior equivalent period
- Annual consumption change %: YoY consumption change
- Annual cost change %: YoY cost change

### 2.12 Fuel Efficiency (PRD §7.2)

**CRITICAL**: Always **weighted average**, NEVER arithmetic mean.

```
weightedEfficiency = totalKmDriven / totalFuelConsumed
```

Unit depends on fuelType:
- Petrol/Diesel → km/l
- Electric → km/kWh

**Resolutions**:
- All-time weighted average
- Current year weighted average
- Rolling last 5 refuelings weighted average

The weighted average weights each stint's efficiency by fuel consumed, which is mathematically equivalent to `total km ÷ total fuel`.

### 2.13 Vehicle Cost Metrics (PRD §7.2)

- Total fuel cost (for selected time span)
- Average fuel cost per month
- Average fuel cost per day
- Average cost per unit (liter or kWh) over time
- Total maintenance cost (for selected time span), per-year breakdown
- Total vehicle cost: fuel + maintenance combined
- **Total cost of ownership** (sold vehicles): lifetime fuel + maintenance, purchase-to-sale offset as secondary

### 2.14 YoY Comparison Logic (PRD §3.2)

**Two mechanisms**:

1. **YoY Comparison Summary** — always-visible card on overview pages:
   - Comparison period auto-derived (e.g. same YTD window last year)
   - Section-specific metrics with percentage change
   - Home: YTD Total Cost, Current Month Cost, Avg Monthly Cost
   - Portfolio: YTD Earnings, YTD XIRR (change in percentage points), Current Month Earnings

2. **YoY Chart Overlay** — toggle (off by default):
   - Bar charts: second semi-transparent bar set behind current data
   - Line charts: dashed/ghost line for prior year
   - A lens the user activates, not permanent

---

## 3. Business Rules Catalog

### 3.1 Currency Subsystem (PRD §4)

| Rule | PRD Ref | Detail |
|---|---|---|
| Home currency is DKK | §4 | All portfolio aggregation in DKK |
| Supported currencies: DKK, EUR | §4.4 | Extensible to others without structural changes |
| Auto-fetch exchange rates | §4.2 | From public API (ECB or similar) |
| Monthly rates fetched on ~1st | §4.2 | Monthly snapshot |
| Transaction-day rates fetched on recording | §4.2 | When recording non-DKK transaction |
| All fetched rates visible | §4.2 | User can see what rate was used |
| All rates overridable | §4.2 | User can edit any rate; source changes to "manual" |
| DKK platforms: values shown in DKK only | §4.3 | e.g. `5.057,80 DKK` |
| Non-DKK platforms: native primary, DKK secondary | §4.3 | Primary line: `1.000 EUR` / Muted line: `≈ 7.460 DKK` |
| Portfolio totals always in DKK | §4.3 | Aggregation currency |
| XIRR per platform: native currency | §4.3 | |
| XIRR portfolio-level: DKK | §4.3 | |
| Transactions stored in native currency | §4.3 | With exchange rate at time of transaction |

### 3.2 Platform Lifecycle (PRD §6.1.2, §6.6)

| Rule | Detail |
|---|---|
| Platforms have status: active \| closed | |
| Closing sets closedDate and optional closureNote | |
| Closed platforms appear muted in list | |
| Closed platforms excluded from current portfolio totals | |
| Closed platforms excluded from current allocation calculation | |
| Closed platforms retain all historical data | |
| Detail pages show data up to closure date | |
| Closure date and note displayed in detail page header | |
| Type (investment/cash) is immutable after creation | §9.2 |
| Currency is immutable after creation | §9.2 |

### 3.3 Vehicle Lifecycle (PRD §7.1.1, Session 2 §3.4)

| Rule | Detail |
|---|---|
| Vehicles have status: active \| sold | |
| Selling sets saleDate, salePrice, optional saleNote | |
| Sold vehicles appear muted in list with "Sold" indicator | |
| Sold vehicles show total cost of ownership | |
| All historical data preserved for sold vehicles | |
| Detail page shows sale date, sale price, sale note in header | |

### 3.4 Staleness Indicators (PRD §3.4)

| Rule | Detail |
|---|---|
| Applies to: Investment (per platform), Home (per utility) | |
| Trigger: no new data point / meter reading for current month | |
| Amber badge: no entry by 2nd of month | |
| Red badge: no entry by 7th of month | |
| Badge disappears when current-month entry added | |
| Badge shown on overview row AND detail page header | |
| No notifications or prompts — passive visual signal only | |

### 3.5 Multiple Meter Readings Per Month (PRD §5.1.2, Session 2 §3.8)

| Rule | Detail |
|---|---|
| Consumption = delta between consecutive readings | Regardless of timing |
| Monthly view: aggregate all deltas within month | |
| Month-boundary spanning: linear interpolation splits consumption | |
| Must handle arbitrary reading frequencies, not just one-per-month | |

### 3.6 Interpolated Data Points (PRD §6.2.3)

| Rule | Detail |
|---|---|
| Marked with `isInterpolated: true` | |
| Visually distinguished in UI | Subtle indicator / different styling |
| User can override by entering actual value | Sets `isInterpolated: false` |
| User can undo override by deleting | System recomputes interpolation |
| Linear interpolation between previous month-end and next recording | |

### 3.7 EV Home-Charging Crossover (PRD §7.3)

| Rule | Detail |
|---|---|
| Refueling with `chargedAtHome = true` flags kWh as vehicle-related electricity | |
| Electricity utility detail page: toggle to exclude home-charging kWh | |
| Useful when employer reimburses home charging (company car) | |
| Total home-charging kWh displayed as supplementary metric on electricity page | |

### 3.8 Demo Mode (PRD §3.9)

| Rule | Detail |
|---|---|
| Toggle in settings | |
| Switches ALL sections to synthetic mock data | |
| No real data visible while demo mode is on | |
| Visible indicator (banner/badge) when active | |
| Toggling off returns to real data immediately | |
| Display-layer switch ONLY — no modification of real data | |
| Mock data must be comprehensive: multiple platforms, utilities, vehicles, all features | |

### 3.9 Portfolio Switcher (PRD §6.3, Session 1 §4.9)

| Rule | Detail |
|---|---|
| Dropdown at top of Investment section | |
| Shows current portfolio name and owner | |
| Default portfolio pre-selected on navigation | |
| User can switch to any portfolio | |
| "Add Portfolio" action accessible from switcher | |
| Edit/delete available for non-default portfolios | |
| Default can be reassigned | |
| Exactly one portfolio is default at all times | |
| All views scoped to selected portfolio | |

### 3.10 Cash vs Investment Platform (PRD §6.1.2, Session 2 §3.3)

| Rule | Detail |
|---|---|
| Cash platforms: bank accounts, Revolut — holding idle investment capital | |
| Investment platforms: Nordnet, Interactive Brokers — active investments | |
| Cash platforms: balance recording + transactions, NO XIRR/gain-loss analysis | |
| Cash platforms contribute to portfolio totals and portfolio-level XIRR | |
| Visually distinct in overview (different styling, simpler detail view) | |
| Type immutable after creation | |

### 3.11 File Attachments (PRD §3.3)

| Rule | Detail |
|---|---|
| Available on: transactions, bills, meter readings, refuelings, maintenance events | |
| PocketBase file fields for storage | |
| UI: "Attach file" button, thumbnail previews for images, download links for others | |
| Delete capability for attachments | |

### 3.12 Data Tables (PRD §3.6)

| Rule | Detail |
|---|---|
| Raw data tables: collapsed by default on ALL pages | |
| Sortable by date | |
| Edit/delete actions per row | |
| Note field displayed if populated | |
| Charts and performance sections: always visible (not collapsible) | |
| Mobile: cyclable column replaces hidden columns (tap header to cycle) | |
| Mobile: dot indicator for cyclable columns | |
| Mobile: row-tap opens bottom drawer with full details + Edit/Delete | |

### 3.13 Navigation (PRD §8)

| Rule | Detail |
|---|---|
| Desktop: horizontal top nav (Home, Investment, Vehicles, Settings icon) | |
| Mobile: fixed bottom tab bar (Home, Investment, Vehicles, Settings) | |
| Home is default section after login | |
| Detail pages: entity name acts as dropdown switcher to siblings | |
| Dialogs/modals for create/edit — not full page navigations | |
| Detail pages have back button | |

### 3.14 Dialog / Form Rules (PRD §9)

| Rule | Detail |
|---|---|
| Desktop: centered modal with backdrop blur, max-w-md | |
| Mobile: bottom sheet, sliding up, drag handle, max ~92vh | |
| Delete confirmations: small centered modal on both platforms | |
| Forms validate before submission | |
| "Save & Add Another" on: Data Points, Transactions, Meter Readings, Bills, Refuelings | |

### 3.15 Locale and Formatting (PRD §3.7)

| Rule | Detail |
|---|---|
| Number format: period = thousands separator, comma = decimal (1.000,00) | |
| Currency: DKK suffix (e.g. `1.000,00 DKK`) | |
| Percentages: comma decimal, 2 decimal places + % (e.g. `5,48%`) | |
| Record dates: `YYYY-MM-DD` (configurable to `DD/MM/YYYY`) | |
| Human-readable timestamps: `MMM DD, YYYY` | |
| Monthly period labels: `MMM YYYY` | |
| Recent update indicators: `MMM DD` | |
| Yearly labels: `YYYY` or `YYYY (YTD)` | |

### 3.16 Chart Design Language (PRD §6.7)

| Rule | Detail |
|---|---|
| Bar charts: solid green (#22c55e) positive, solid red (#ef4444) negative | |
| Value labels on/above bars | |
| Minimal grid lines | |
| Line charts: smooth blue (#3b82f6) line with subtle area fill | |
| YoY overlay: semi-transparent bars or dashed ghost lines | |
| Typography: sans-serif | |
| Mode toggles on bar charts (XIRR vs. Earnings, Consumption vs. Cost) | |

### 3.17 Time Span Selector (PRD §3.1)

| Option | Logic |
|---|---|
| 1M | Last 1 calendar month from today |
| 3M | Last 3 calendar months |
| 6M | Last 6 calendar months |
| MTD | 1st of current month → today |
| YTD | January 1 of current year → today |
| 1Y | Last 12 months |
| 3Y | Last 36 months |
| 5Y | Last 60 months |
| All | Earliest data point → today |

- Default: **YTD**
- Embedded within each chart card
- Each card manages its own selected time span independently
- Selecting recalculates chart and associated table within that card

---

## 4. User Intention Map

### 4.1 "Record and Forget" (Anthropologist Session 1, §4.2)

**The ritual**: On ~1st of each month, the user performs a circuit: read meters → record readings → log into investment platforms → record values → enter fuel receipts. This is a batch operation.

**The pain**: Not data entry — it's everything downstream. Updating formulas, extending chart ranges, adding rows for new months, fixing breakages. The "spreadsheet tax."

**The dream**: "I dream of an easier tool to just add data and everything just updates."

**Implication for implementation**: Data entry forms must be fast. The system computes ALL derived metrics automatically. No manual formula maintenance. Quick-add buttons. Default timestamps to "now." "Save & Add Another" for batch entry.

### 4.2 Personal Observatory (Anthropologist Session 1, §4.3)

**Not a decision engine**. The user doesn't change behavior based on metrics. The tool provides ambient awareness — like a pilot's instrument panel for their life's systems.

**But with a telescope**: The user values ability to dive into historical data when curiosity or concern arises.

**Implication**: Default views = summary cards, clean charts, key metrics (at-a-glance legibility). Full dataset accessible underneath via progressive disclosure (accordions, tabs, detail pages).

### 4.3 Transparency and Sovereignty (Anthropologist Session 1, §4.4)

**Frustration**: "On platform web pages I never know how they calculate the different values."

**Values**: Own the means of interpretation. Every formula visible and authored by the user (conceptually). No hidden decisions about time windows or methodology.

**Implication**: Gain/loss table shows starting value, ending value, net deposits, resulting gain — not just a final number. XIRR inputs are inspectable. Exchange rates are visible and overridable.

### 4.4 Efficiency for a Power User (Anthropologist Session 1, §6.1)

**Solo operator**: No onboarding, no role-based views, no shared access patterns. Optimize for a single user's mental model.

**Implication**: Efficiency over discoverability. No tooltips explaining what XIRR means. Minimal clicks. Information density. Touch-friendly for mobile refueling entry.

### 4.5 The Tool Is a Hobby (Anthropologist Session 1, §6.2)

The subject is a programmer learning new tools. Building the platform is itself a source of satisfaction.

**Implication**: Code quality and clarity matter. Architecture must be extensible — new sections, experiments. The platform will evolve.

### 4.6 Multi-Tab Coordination Pain (Anthropologist Session 2, §3.2)

A single deposit into a EUR platform requires editing 4 spreadsheet tabs. Beginning of year requires pre-filling rows across all tabs.

**Implication**: One form submission must trigger all downstream updates — portfolio totals, currency conversion, allocation recalculation, chart updates. The user touches one form; everything else just works.

---

## 5. Acceptance Criteria Matrix

### 5.1 Home (Utilities) — Criteria 1–9

| # | Criterion | Components | Calculations | Data Model |
|---|---|---|---|---|
| 1 | CRUD utilities with name and unit | UtilityDialog, HomeOverview | — | Utility |
| 2 | Register meter readings (value, timestamp, note) | MeterReadingDialog, UtilityDetail | — | MeterReading |
| 3 | Register bills (amount, period, note, attachment) | BillDialog, UtilityDetail | — | UtilityBill |
| 4 | Monthly consumption from consecutive readings + multi-reading months | UtilityDetail, year table | §2.9 Meter reading interpolation | MeterReading |
| 5 | Multi-month bills amortized correctly | UtilityDetail, year table | §2.10 Bill amortization | UtilityBill |
| 6 | Cost per unit calculated and displayed | UtilityDetail, stat cards | §2.11 cost per unit | MeterReading, UtilityBill |
| 7 | Home overview: summary cards + combined charts | HomeOverview | All utility metrics | Utility, MeterReading, UtilityBill |
| 8 | Utility detail: inline collapsible year rows + YoY % | CollapsibleYearTable, UtilityDetail | Annual change % | MeterReading, UtilityBill |
| 9 | Annual consumption/cost change % color-coded | CollapsibleYearTable | YoY change % | MeterReading, UtilityBill |

### 5.2 Investment Portfolio — Criteria 10–26

| # | Criterion | Components | Calculations | Data Model |
|---|---|---|---|---|
| 10 | CRUD portfolios with name and owner | PortfolioDialog, PortfolioSwitcher | — | Portfolio |
| 11 | Default portfolio pre-selected, switchable | PortfolioSwitcher | — | Portfolio.isDefault |
| 12 | Create investment/cash platforms with icon, name, type, currency | PlatformDialog | — | Platform |
| 13 | Close platform with date and note | PlatformDialog (edit mode) | — | Platform.status, closedDate, closureNote |
| 14 | Closed platforms muted, excluded from totals | PortfolioOverview, PlatformCard | Portfolio aggregation excludes closed | Platform.status |
| 15 | Register data points (value, timestamp, note) in native currency | DataPointDialog | — | DataPoint |
| 16 | Register transactions with exchange rate, notes, attachments | TransactionDialog | Auto-fetch exchange rate | Transaction, ExchangeRate |
| 17 | XIRR correctly uses data points + transactions as cash flows | PlatformDetail, stat cards | §2.1 XIRR | DataPoint, Transaction |
| 18 | Gain/loss accounts for net deposits | PlatformDetail, stat cards | §2.4 Gain/Loss | DataPoint, Transaction |
| 19 | Monthly earnings + monthly XIRR as first-class metrics | PlatformDetail, PlatformCard, PortfolioOverview | §2.2, §2.3 | DataPoint, Transaction |
| 20 | Portfolio allocation visualization | AllocationChart, PortfolioOverview | §2.8 Allocation | Platform, DataPoint |
| 21 | All metrics at platform level AND portfolio aggregate (DKK) | PortfolioOverview, PlatformDetail | §2.7 Portfolio aggregation | All investment entities |
| 22 | Cash platforms: balance + history, no XIRR/gain-loss | CashPlatformDetail, CashPlatformCard | — | Platform (type=cash), DataPoint |
| 23 | Portfolio overview: summary, allocation, charts, platform list | PortfolioOverview | All portfolio metrics | All investment entities |
| 24 | Platform detail: tabbed analysis, all charts, yearly summary | PlatformDetail | XIRR, earnings, gain/loss | DataPoint, Transaction |
| 25 | Exchange rates auto-fetched, visible, overridable | exchangeRates service, TransactionDialog | — | ExchangeRate |
| 26 | Non-DKK: native currency + DKK equivalent | CurrencyDisplay | Currency conversion | ExchangeRate, Platform.currency |

### 5.3 Vehicles — Criteria 27–37

| # | Criterion | Components | Calculations | Data Model |
|---|---|---|---|---|
| 27 | CRUD vehicles with full metadata + photo | VehicleDialog | — | Vehicle |
| 28 | Mark vehicle as sold with date, price, note | VehicleDialog (edit mode) | — | Vehicle.status, saleDate, salePrice |
| 29 | Sold vehicles muted, show total cost of ownership | VehiclesOverview, VehicleCard | §2.13 Total cost | Vehicle, Refueling, MaintenanceEvent |
| 30 | Register refueling with fuel-type-appropriate units | RefuelingDialog | — | Refueling |
| 31 | EV refueling: "charged at home" flag | RefuelingDialog | — | Refueling.chargedAtHome |
| 32 | Register maintenance events | MaintenanceDialog | — | MaintenanceEvent |
| 33 | Fuel efficiency: weighted average, not arithmetic | VehicleDetail, stat cards | §2.12 Weighted efficiency | Refueling |
| 34 | Rolling 5-refueling weighted average | VehicleDetail, stat cards | §2.12 Rolling window | Refueling |
| 35 | Yearly/YTD km from odometer readings | VehicleDetail, stat cards | Odometer deltas | Refueling.odometerReading |
| 36 | Vehicle detail: all charts + collapsible data tables | VehicleDetail | All vehicle metrics | Vehicle, Refueling, MaintenanceEvent |
| 37 | Total cost of ownership for sold vehicles | VehicleDetail, VehicleCard | §2.13 | Vehicle, Refueling, MaintenanceEvent |

### 5.4 Cross-Cutting — Criteria 38–50

| # | Criterion | Components | Calculations | Data Model |
|---|---|---|---|---|
| 38 | Optional notes on all data entries | All dialogs | — | note field on all entities |
| 39 | Per-card time span selector | TimeSpanSelector | §3.17 | — |
| 40 | YoY overlay toggle on charts | YoYToggle, chart components | §2.14 YoY logic | — |
| 41 | File attachments on applicable records | FileAttachment, dialogs | — | file fields |
| 42 | Staleness indicators (amber 2nd, red 7th) | StalenessIndicator | Date comparison | DataPoint, MeterReading |
| 43 | Collapsible data tables collapsed by default | CollapsibleTable | — | — |
| 44 | PocketBase auth; data scoped to user | auth service, owner field | — | users, owner FK |
| 45 | Fully functional on desktop AND mobile | All components (responsive) | — | — |
| 46 | Light + dark mode togglable | Settings, theme system | — | Settings.theme |
| 47 | Danish locale formatting | formatters utility | — | — |
| 48 | Configurable date format | Settings, formatters | — | Settings.dateFormat |
| 49 | EV home-charging kWh excludable from electricity utility | UtilityDetail toggle | Cross-section query | Refueling.chargedAtHome |
| 50 | Demo mode: synthetic data, indicator, hides real data | Settings, demo data layer | — | Settings.demoMode |

---

## 6. Build Priority and Dependency Graph

### 6.1 Build Order (from PRD §1.2, Anthropologist Session 2 §4.1)

```
Phase A: Investment Portfolio (highest priority — most pain, most complexity)
  ├─ Foundation: Auth, PocketBase setup, service layer pattern
  ├─ Currency subsystem (exchange rates, auto-fetch, display)
  ├─ Portfolio CRUD + switcher
  ├─ Platform CRUD (investment + cash types)
  ├─ Data points + transactions CRUD
  ├─ XIRR solver + gain/loss + monthly earnings + monthly XIRR
  ├─ Month-end normalization / interpolation engine
  ├─ Portfolio-level aggregation (DKK)
  ├─ Portfolio allocation
  ├─ Platform detail pages (investment + cash variants)
  ├─ Portfolio overview page
  └─ Closed platform behavior

Phase B: Cross-Cutting Features (shared infrastructure)
  ├─ Time span selector component
  ├─ YoY comparison (summary card + chart overlay)
  ├─ File attachment component
  ├─ Staleness indicator component
  ├─ Collapsible table component (with mobile cycling)
  ├─ Chart components (bar, line, allocation)
  ├─ Currency display component
  ├─ Locale/formatting utilities
  ├─ Settings page (date format, theme, demo mode)
  └─ Navigation shell (top nav desktop, bottom tab mobile)

Phase C: Home (Utilities) — second priority
  ├─ Utility CRUD
  ├─ Meter reading CRUD + consumption calculation engine
  ├─ Bill CRUD + amortization engine
  ├─ Cost per unit calculation
  ├─ Home overview page
  ├─ Utility detail page + collapsible year rows
  └─ EV home-charging toggle on electricity utility

Phase D: Vehicles — third priority
  ├─ Vehicle CRUD + lifecycle (sold)
  ├─ Refueling CRUD + weighted efficiency calculations
  ├─ Maintenance event CRUD
  ├─ Vehicle overview page
  ├─ Vehicle detail page
  └─ Total cost of ownership
```

### 6.2 Dependency Graph

```
Auth + PocketBase setup
  ↓
Service layer pattern (services/)
  ↓
Navigation shell + Settings
  ↓
Currency subsystem ──────────────────┐
  ↓                                  │
Locale/formatting utilities          │
  ↓                                  │
Shared components (TimeSpan, YoY,    │
  Charts, Tables, Staleness,         │
  FileAttachment, CurrencyDisplay)   │
  ↓                                  │
Portfolio section ←──────────────────┘
  ↓
Home (Utilities) section ←── EV crossover link
  ↓
Vehicles section ──── EV crossover link ──→ Home
  ↓
Demo mode (needs all sections to generate mock data)
```

### 6.3 Critical Path Items

1. **XIRR solver** — mathematically complex, must be correct. Needs thorough testing.
2. **Month-end normalization engine** — interpolation, override/revert logic. Core to all investment metrics.
3. **Currency subsystem** — exchange rate fetching, storage, display. Blocks all non-DKK platform work.
4. **Meter reading interpolation** — arbitrary reading frequencies, month-boundary splitting. Core to utility metrics.
5. **Bill amortization** — multi-month distribution. Core to utility cost metrics.
6. **Weighted average efficiency** — must be correct (total km ÷ total fuel), not arithmetic mean.

---

## 7. Non-Functional Requirements (PRD §13)

| Requirement | Detail |
|---|---|
| Responsive | Desktop-first, fully functional on mobile. Refueling forms optimized for mobile at the pump. |
| Performance | Charts render smoothly with 7+ years of monthly data across multiple entities |
| Accessibility | ARIA labels, sufficient color contrast (both themes), keyboard-navigable dialogs/forms |
| Data ownership | All data in user's own PocketBase instance. No third-party analytics or sharing. |
| Extensibility | New section = data model + service + overview + detail. No core code changes. |
| Locale | Danish number/currency formatting throughout. Configurable date format. |
| Theme | Light + dark mode, both with sufficient contrast |
| PWA-capable | For future push notifications (not v1) |

---

## 8. Future Phases / Out of Scope (PRD §12)

Acknowledged but NOT in v1:
- Push notifications / reminders (PWA web push)
- Subscriptions section
- Budget tool
- Shared expenses calculator
- Additional utility types (Internet, insurance, property tax)
- Data import (CSV from Google Sheets — historical data back to Jan 2019)

---

## 9. Current Scale Context (Session 2 §4.2)

| Section | Count |
|---|---|
| Investment platforms (active) | 3 investment + 2 cash |
| Investment platforms (closed) | A few |
| Children's portfolios | Planned: 1 (son), possibly more, 2–3 platforms each |
| Utilities | 3 (electricity, water, heat) |
| Vehicles (active) | 1 car |
| Vehicles (sold) | 1 car |
| Vehicles (potential) | 1 EV (company), 1 motorcycle |
| Historical data | Back to January 2019 (7 years) |
