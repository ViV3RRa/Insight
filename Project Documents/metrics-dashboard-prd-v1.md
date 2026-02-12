# Personal Metrics Platform — Product Requirements Document

## 1. Vision

A personal observatory for the systems in your life. The platform lets a single power user record real-world observations — meter readings, portfolio values, fuel receipts, maintenance events — and automatically produces the charts, comparisons, and metrics that would otherwise require manual formula and chart maintenance in a spreadsheet.

The platform is **not** a decision-support tool in the traditional sense. Its value lies in **awareness, legibility, and sovereignty**: the user sees exactly how every number is calculated, controls what time frames and comparisons are shown, and trusts the output because the system is theirs.

### 1.1 Design Principles

- **Record and forget**: Data entry should be fast and intentional. Everything downstream — calculations, charts, comparisons — happens automatically.
- **Efficiency over discoverability**: The sole user is a power user. Optimize for minimal clicks and information density. No tooltips explaining what XIRR means.
- **Progressive disclosure**: All data is accessible, but detail lives behind folds, accordions, and toggles so the default view stays clean. Full data tables appear on dedicated detail pages (e.g. a specific platform, a specific utility).
- **Pluggable sections**: The architecture treats each life domain (Home, Portfolio, Vehicles) as a section with its own data models and views, but sharing common platform capabilities (time-series charts, file attachments, year-over-year comparison). New sections (subscriptions, budgeting, shared expenses) should be addable without rearchitecting.
- **Transparency**: Where a calculation is non-obvious (e.g. XIRR), the user should be able to understand the inputs. No black boxes.

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
| Notifications | Web Push API (PWA) — future phase, see §11 |

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

---

## 4. Section: Home (Utilities)

**This is the default landing section after login.**

### 4.1 Data Model

#### 4.1.1 Utility

| Field | Type | Notes |
|---|---|---|
| `id` | string | PocketBase auto-generated |
| `name` | string | e.g. "Electricity", "Water", "Heat" |
| `unit` | string | e.g. "kWh", "m³", "MWh" |
| `created` | datetime | |

#### 4.1.2 MeterReading

A point-in-time observation of a utility meter's cumulative value.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `utilityId` | string | FK → Utility |
| `value` | number | Cumulative meter reading |
| `timestamp` | datetime | Defaults to now |
| `note` | string (optional) | e.g. "meter replaced, reading reset" |

Consumption for a period = current reading − previous reading. The platform computes this automatically.

#### 4.1.3 UtilityBill

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

### 4.2 Calculated Metrics

For each utility:

- **Monthly consumption**: Derived from meter readings (delta between consecutive readings). If readings don't align to month boundaries, interpolate linearly.
- **Monthly cost**: From amortized bills.
- **Cost per unit**: `amortized monthly cost / monthly consumption`.
- **Year-to-date consumption and cost**.
- **Year-over-year comparison** (when toggled on): Same month/period last year.
- **Average monthly cost** (for selected time span).
- **Cost trend**: Is the rolling average going up or down vs. the prior equivalent period?

### 4.3 Home Overview Page

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

### 4.4 Utility Detail Page

Navigated to by clicking a utility from the overview. Full-width view with back button.

**Content:**

- Utility name and metadata.
- Summary stat cards (same metrics, scoped to this utility).
- Time span selector.
- Charts: monthly consumption, monthly cost, cost per unit over time.
- YoY toggle.
- **Expanded data tables**:
  - Meter readings (date, cumulative value, computed period consumption, note, edit/delete).
  - Bills (date, amount, period covered, note, attachment link, edit/delete).
- "Add Reading" and "Add Bill" buttons.

---

## 5. Section: Investment Portfolio

### 5.1 Data Model

#### 5.1.1 Portfolio

A portfolio is a named grouping of investment platforms. The user can have multiple portfolios (e.g. their own, one for a child). This is **not** multi-user — the logged-in user manages all portfolios as a custodian.

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | e.g. "My Portfolio", "Erik's Portfolio" |
| `ownerName` | string | Who the portfolio is for, e.g. "Me", "Erik" |
| `isDefault` | boolean | The portfolio shown when navigating to the section. Exactly one portfolio is default. |
| `created` | datetime | |

#### 5.1.2 Platform

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `portfolioId` | string | FK → Portfolio |
| `name` | string | e.g. "Interactive Brokers" |
| `created` | datetime | |

#### 5.1.3 DataPoint

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `platformId` | string | FK → Platform |
| `value` | number | Total platform value at this moment |
| `timestamp` | datetime | Defaults to now |
| `note` | string (optional) | |

#### 5.1.4 Transaction

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `platformId` | string | FK → Platform |
| `type` | `"deposit"` \| `"withdrawal"` | |
| `amount` | number | Always positive; sign derived from type |
| `timestamp` | datetime | |
| `note` | string (optional) | |
| `attachment` | file (optional) | Statement, confirmation, etc. |

### 5.2 Calculations

#### 5.2.1 XIRR

Cash-flow construction for a time window `[start, end]`:

1. **Starting value**: Nearest data point at or before `start` → negative cash flow at `start` (capital already deployed).
2. **Deposits** within window → negative cash flows (money leaving investor's pocket).
3. **Withdrawals** within window → positive cash flows (money returning).
4. **Ending value**: Latest data point at or before `end` → positive cash flow at its timestamp.

Solve via Newton-Raphson. Edge cases: fewer than 2 cash flows → `null`; non-convergence → `null`.

#### 5.2.2 Gain / Loss

```
gain = endingValue - startingValue - netDeposits
netDeposits = Σ deposits - Σ withdrawals  (within window)
gainPercent = gain / (startingValue + Σ deposits) × 100
```

#### 5.2.3 Required Resolutions

For each platform **and** for the total portfolio:

- All time (since first data point).
- Each calendar year historically, including current YTD.
- Each calendar month historically, including current MTD.

#### 5.2.4 Portfolio-Level Aggregation

- Composite value series: sum all platform values at each timestamp.
- Merge all transactions across platforms within the selected portfolio.
- Run XIRR and gain/loss on aggregated data.

### 5.3 Portfolio Overview Page

**Portfolio Switcher**: A dropdown or selector at the top of the section showing the current portfolio name and owner. The default portfolio is pre-selected when navigating to the section. The user can switch to any other portfolio. An "Add Portfolio" action is accessible from the switcher. Edit/delete actions available for non-default portfolios (default can be reassigned).

All summary cards, charts, and platform lists below are scoped to the selected portfolio.

**Layout:**

1. **Summary cards** — total portfolio:
   - Total current value.
   - All-time gain/loss (absolute + %).
   - All-time XIRR.
   - YTD gain/loss.
   - YTD XIRR.
2. **Charts area** (expandable via toggle) with time span selector:
   - Yearly bar chart (toggle: XIRR % / Earnings).
   - Monthly bar chart (same toggle).
   - XIRR line chart over time.
   - YoY overlay toggle.
3. **Platform list** — grid of cards, each showing:
   - Platform name.
   - Current value.
   - All-time gain/loss (absolute + %).
   - All-time XIRR.
   - Clickable → platform detail page.
   - Edit/delete actions.
4. **"Add Platform"** button.

### 5.4 Platform Detail Page

Full-width view with back button. The portfolio context (name) is shown in the header for orientation.

**Header:** Platform name (editable), summary stat cards.

**Time span selector** above all content.

**Tabbed content:**

| Tab | Content |
|---|---|
| **Yearly Analysis** | Bar chart — toggle between XIRR (%) and Earnings (currency/%). Green bars positive, red negative, values on bars. |
| **Monthly Analysis** | Same as yearly, monthly granularity, filtered to selected time span. |
| **XIRR Over Time** | Smooth blue line chart showing rolling XIRR. |
| **Gain/Loss Table** | Columns: Period, Starting Value, Ending Value, Net Deposits, Gain/Loss, XIRR. Totals row. |
| **Transactions** | Collapsible table: date, type badge (green/red), amount, note, attachment, delete. "Add Transaction" button. |
| **Data Points** | Collapsible table: date, value, note, delete. "Add Data Point" button. |

### 5.5 Chart Design Language (applies to all sections)

- **Bar charts**: Solid green (`#22c55e`) positive, solid red (`#ef4444`) negative. Value labels on/above bars. Minimal grid lines.
- **Line charts**: Smooth blue (`#3b82f6`) line with subtle area fill.
- **YoY overlay**: Semi-transparent bars or dashed ghost lines.
- **Typography**: Sans-serif. Currency: comma-separated, 2 decimals. Percentages: 2 decimals + `%`.
- **Mode toggles** on bar charts where applicable (XIRR vs. Earnings, Consumption vs. Cost).

---

## 6. Section: Vehicles

### 6.1 Data Model

#### 6.1.1 Vehicle

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `name` | string | User-defined label, e.g. "Family Car" |
| `type` | string | e.g. "Car", "Motorcycle" |
| `make` | string | |
| `model` | string | |
| `year` | number | Model year |
| `licensePlate` | string | |
| `fuelType` | string | e.g. "Petrol", "Diesel", "Electric" |
| `purchaseDate` | date (optional) | |
| `purchasePrice` | number (optional) | |
| `photo` | file (optional) | Vehicle image |
| `created` | datetime | |

#### 6.1.2 Refueling

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `vehicleId` | string | FK → Vehicle |
| `date` | date | |
| `fuelAmount` | number | Liters (or relevant unit) |
| `costPerLiter` | number | |
| `totalCost` | number | Computed or entered |
| `odometerReading` | number | Total km at this refueling |
| `station` | string (optional) | Service station name/location |
| `note` | string (optional) | |
| `receipt` | file (optional) | Photo of receipt |
| `tripCounterPhoto` | file (optional) | Photo of trip counter |

#### 6.1.3 MaintenanceEvent

| Field | Type | Notes |
|---|---|---|
| `id` | string | |
| `vehicleId` | string | FK → Vehicle |
| `date` | date | |
| `description` | string | What was done |
| `cost` | number | |
| `note` | string (optional) | |
| `receipt` | file (optional) | Receipt image |

### 6.2 Calculated Metrics

For each vehicle:

- **Fuel efficiency (km/l)**:
  - All-time weighted average: `total km driven / total fuel consumed`.
  - Current year weighted average.
  - Rolling window: last 5 refuelings weighted average.
- **Distance**:
  - Total km driven each year.
  - Km driven this year so far.
- **Fuel costs**:
  - Total fuel cost (for selected time span).
  - Average fuel cost per month.
  - Average fuel cost per day.
  - Average cost per liter over time.
- **Maintenance costs**:
  - Total maintenance cost (for selected time span).
  - Per-year breakdown.
- **Total vehicle cost**: Fuel + maintenance combined.

**Important**: All averages involving km/l must be **weighted** (total km ÷ total liters), not arithmetic means of per-refueling ratios.

### 6.3 Vehicles Overview Page

**Layout:**

1. **Vehicle cards** — one per vehicle, showing:
   - Vehicle photo (or placeholder by type).
   - Name, make/model/year.
   - Current year fuel efficiency (weighted avg).
   - YTD fuel cost.
   - YTD total cost (fuel + maintenance).
   - Clickable → vehicle detail page.
2. **"Add Vehicle"** button.
3. Staleness indicator.

### 6.4 Vehicle Detail Page

Full-width view with back button.

**Header:** Vehicle photo, name, metadata (make, model, year, plate, fuel type).

**Summary stat cards:**
- All-time weighted km/l.
- Current year weighted km/l.
- Last 5 refuelings weighted km/l.
- YTD km driven.
- YTD fuel cost.
- Average fuel cost/month.
- Average fuel cost/day.

**Time span selector.**

**Charts:**
- Fuel efficiency over time (line chart, per-refueling data points).
- Monthly fuel cost (bar chart).
- Monthly km driven (bar chart or line).
- Maintenance cost timeline.
- YoY toggle on all charts.

**Data tables (collapsible, expanded on this page):**
- Refueling log: date, liters, cost/liter, total cost, odometer, station, note, receipt thumbnail, edit/delete.
- Maintenance log: date, description, cost, note, receipt thumbnail, edit/delete.

---

## 7. Navigation & Layout

### 7.1 Top-Level Structure

- **Tab bar / sidebar** with sections: **Home**, **Portfolio**, **Vehicles**.
- Additional sections can be added in the future (Subscriptions, Budget, Shared Expenses).
- Each section has its own overview page as the landing view for that tab.
- **Home is the default section after login.**

### 7.2 Navigation Pattern

- Section tabs → section overview page.
- Clicking an entity card (utility, platform, vehicle) → full-width detail page with back button.
- Dialogs/modals for create/edit actions (not full page navigations).

### 7.3 Responsive Design

- **Desktop**: Primary target. Information-dense layouts, multi-column grids.
- **Mobile**: Fully functional. Single-column layouts, touch-friendly inputs, collapsible sections. Charts scale down gracefully.
- **Pure web** — no native app. PWA-capable for future push notifications.

---

## 8. Dialogs / Forms

All dialogs are modal overlays with backdrop blur. Forms validate before submission.

### 8.1 Portfolio Dialog (Add / Edit)
- Name (text, required).
- Owner name (text, required — who is this portfolio for).
- Is default (checkbox — only when editing; at least one must remain default).

### 8.2 Platform Dialog (Add / Edit)
- Name (text, required).

### 8.3 Data Point Dialog
- Value (number, required).
- Timestamp (datetime-local, default: now).
- Note (text, optional).

### 8.4 Transaction Dialog
- Type: Deposit / Withdrawal (radio, required).
- Amount (number, positive, required).
- Timestamp (datetime-local, default: now).
- Note (text, optional).
- Attachment (file, optional).

### 8.5 Utility Dialog (Add / Edit)
- Name (text, required).
- Unit (text, required — e.g. "kWh").

### 8.6 Meter Reading Dialog
- Value (number, required — cumulative reading).
- Timestamp (datetime-local, default: now).
- Note (text, optional).

### 8.7 Bill Dialog
- Amount (number, required).
- Period start (date, required).
- Period end (date, required).
- Note (text, optional).
- Attachment (file, optional).

### 8.8 Vehicle Dialog (Add / Edit)
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

### 8.9 Refueling Dialog
- Date (date, required, default: today).
- Fuel amount in liters (number, required).
- Cost per liter (number, required).
- Total cost (number, auto-computed, editable).
- Odometer reading (number, required).
- Station (text, optional).
- Note (text, optional).
- Receipt (file, optional).
- Trip counter photo (file, optional).

### 8.10 Maintenance Event Dialog
- Date (date, required, default: today).
- Description (text, required).
- Cost (number, required).
- Note (text, optional).
- Receipt (file, optional).

---

## 9. PocketBase Collections

| Collection | Fields | Notes |
|---|---|---|
| `users` | Built-in PocketBase auth | Email/password |
| `portfolios` | name, ownerName, isDefault | One default per user |
| `platforms` | portfolio (relation), name | |
| `data_points` | platform (relation), value, timestamp, note | |
| `transactions` | platform (relation), type, amount, timestamp, note, attachment | |
| `utilities` | name, unit | |
| `meter_readings` | utility (relation), value, timestamp, note | |
| `utility_bills` | utility (relation), amount, periodStart, periodEnd, note, attachment, timestamp | |
| `vehicles` | name, type, make, model, year, licensePlate, fuelType, purchaseDate, purchasePrice, photo | |
| `refuelings` | vehicle (relation), date, fuelAmount, costPerLiter, totalCost, odometerReading, station, note, receipt, tripCounterPhoto | |
| `maintenance_events` | vehicle (relation), date, description, cost, note, receipt | |

All collections should have an `owner` field (relation to `users`) for data isolation, even though there's currently a single user.

---

## 10. File / Module Structure (Suggested)

```
src/
├── App.tsx
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx           # Auth wrapper, tab navigation
│   │   ├── TabBar.tsx
│   │   └── Login.tsx
│   ├── shared/
│   │   ├── TimeSpanSelector.tsx
│   │   ├── YoYToggle.tsx
│   │   ├── StalenessIndicator.tsx
│   │   ├── CollapsibleTable.tsx
│   │   ├── FileAttachment.tsx
│   │   ├── StatCard.tsx
│   │   ├── Dialog.tsx
│   │   └── charts/
│   │       ├── BarChart.tsx        # Reusable green/red bar chart
│   │       ├── LineChart.tsx       # Reusable smooth line chart
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
│   │   ├── PlatformDetail.tsx
│   │   ├── PlatformCard.tsx
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
│   ├── calculations.ts            # Gain/loss, fuel efficiency, consumption deltas
│   ├── formatters.ts              # Currency, %, date, km/l formatting
│   ├── timeSpan.ts                # Time span filtering logic
│   └── amortization.ts            # Bill amortization across months
└── types/
    └── index.ts
```

---

## 11. Future Phases (Out of Scope for v1)

These are acknowledged directions but are **not** part of the initial build:

- **Push notifications / reminders**: PWA-based web push. User can enable/disable per section, configure reminder schedules (e.g. "remind me on the 1st of each month to do readings"). Requires service worker and notification permission flow.
- **Subscriptions section**: Track recurring subscriptions, costs, renewal dates.
- **Budget tool**: Income vs. expenses, category-based tracking.
- **Shared expenses calculator**: Split fixed household costs between people.
- **Additional utility types**: Internet, insurance, property tax — addable via the existing utility model.

---

## 12. Non-Functional Requirements

- **Responsive**: Desktop-first, fully functional on mobile.
- **Performance**: Charts render smoothly with 5+ years of monthly data across multiple entities.
- **Accessibility**: ARIA labels on interactive elements, sufficient color contrast, keyboard-navigable dialogs and forms.
- **Data ownership**: All data stored in the user's own PocketBase instance. No third-party analytics or data sharing.
- **Extensibility**: Adding a new section should follow the established pattern (data model, service, overview page, detail page) without modifying core platform code.

---

## 13. Acceptance Criteria

### Home (Utilities)
1. User can create, edit, and delete utilities with name and unit.
2. User can register meter readings with cumulative value, timestamp, and optional note.
3. User can register bills with amount, period range, optional note, and optional attachment.
4. Monthly consumption is correctly derived from consecutive meter readings.
5. Multi-month bills are amortized correctly across covered months.
6. Cost per unit is calculated and displayed.
7. Home overview shows summary cards per utility and combined charts.
8. Utility detail page shows full data tables and charts.

### Investment Portfolio
9. User can create, edit, and delete portfolios with name and owner.
10. Default portfolio is pre-selected; user can switch between portfolios.
11. User can create, edit, and delete investment platforms within a portfolio.
12. User can register data points (value + timestamp + optional note).
13. User can register deposit/withdrawal transactions with optional notes and attachments.
14. XIRR correctly incorporates data points and transactions as cash flows.
15. Gain/loss correctly accounts for net deposits.
16. All metrics computed at platform level and aggregate portfolio level.
17. Portfolio overview shows summary cards, expandable charts, and platform grid.
18. Platform detail page shows tabbed analysis with all chart types.

### Vehicles
19. User can create, edit, and delete vehicles with full metadata and photo.
20. User can register refueling events with all fields, optional note, and file attachments.
21. User can register maintenance events with description, cost, optional note, and receipt.
22. Fuel efficiency uses weighted average (total km ÷ total liters), not arithmetic mean.
23. Rolling 5-refueling weighted average is calculated correctly.
24. Yearly and YTD km driven are derived from odometer readings.
25. Vehicle detail page shows all charts and expanded data tables.

### Cross-Cutting
26. All data entries across the platform support optional notes.
27. Time span selector filters all content in current view for all sections.
28. Year-over-year comparison toggle overlays prior year data on charts.
29. File attachments work on all applicable record types.
30. Staleness indicators appear on all section overview pages.
31. Collapsible data tables are collapsed on overviews, expanded on detail pages.
32. Authentication via PocketBase works; data is scoped to the logged-in user.
33. Application is fully functional on both desktop and mobile browsers.
