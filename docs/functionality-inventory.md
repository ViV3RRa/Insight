# Insight Platform — User-Facing Functionality Inventory

> Every piece of functionality the user sees and interacts with, derived from the PRD. Organized for E2E test coverage.

---

## 1. Authentication

### 1.1 Login
- Unauthenticated users see a login screen
- User can enter email and password and submit
- Invalid credentials show an error message
- Successful login redirects to the Home section (`/home`)
- Session persists across page reloads (PocketBase token)

### 1.2 Route Protection
- All routes except `/login` require authentication
- Unauthenticated access to any protected route redirects to `/login`
- After login, the user lands on `/home` (Home is the default section)

---

## 2. Navigation

### 2.1 Desktop Navigation
- Sticky top navigation bar is visible on desktop
- Bar contains: "Insight" brand text, section links (Home, Investment, Vehicles), settings gear icon
- Clicking a section link navigates to that section's overview page
- Active section link is visually highlighted
- Clicking settings gear navigates to `/settings`

### 2.2 Mobile Navigation
- Top navigation bar is hidden on mobile
- Fixed bottom tab bar is visible with 4 tabs: Home, Investment, Vehicles, Settings
- Each tab has an icon and label
- Tapping a tab navigates to that section
- Active tab is visually highlighted
- Bottom tab bar is always visible (even when scrolling)

### 2.3 Detail Page Navigation
- Detail pages (utility, platform, vehicle) have a back button that returns to the section overview
- Detail pages have a dropdown switcher in the header — tapping the entity name reveals a list of all sibling entities (e.g., all platforms in the portfolio) for direct switching without going back to the overview
- The dropdown switcher includes a link back to the overview page

---

## 3. Settings

### 3.1 Date Format
- User can toggle between `YYYY-MM-DD` and `DD/MM/YYYY`
- Change applies to record dates in tables throughout the app
- Human-readable labels (e.g., "Feb 14, 2026") are not affected by this setting

### 3.2 Theme
- User can toggle between light mode and dark mode
- Theme change applies immediately across the entire app
- Theme persists across sessions

### 3.3 Home Currency
- "DKK" is displayed as read-only — not configurable

### 3.4 Demo Mode
- User can toggle demo mode on/off
- When on: a visible banner/badge indicates demo mode is active
- When on: all sections display realistic synthetic data (fake platforms, utilities, vehicles)
- When on: no real data is visible
- Toggling off returns to the user's real data immediately
- Demo mode does not modify the user's actual data

---

## 4. Formatting & Locale (applies everywhere)

### 4.1 Numbers
- Period as thousands separator, comma as decimal (e.g., `1.000,00`) — Danish locale

### 4.2 Currency
- DKK: value + "DKK" suffix (e.g., `1.000,00 DKK`)
- Non-DKK values: native currency on primary line, DKK equivalent below in smaller muted text prefixed with `≈`

### 4.3 Percentages
- Comma decimal, 2 places + `%` (e.g., `5,48%`)

### 4.4 Dates
- Record dates in tables: per settings (`YYYY-MM-DD` or `DD/MM/YYYY`)
- Human-readable timestamps: `MMM DD, YYYY` (e.g., `Feb 14, 2026`)
- Monthly period labels: `MMM YYYY` (e.g., `Feb 2026`)
- Recent update indicators: `MMM DD` (e.g., `Feb 14`)
- Yearly labels: `YYYY` or `YYYY (YTD)` for the current year

---

## 5. Cross-Cutting Features (apply across all sections)

### 5.1 Time Span Selector
- Available on every chart card
- Options: 1M, 3M, 6M, MTD, YTD, 1Y, 3Y, 5Y, All
- Default: YTD
- Each card manages its own time span independently
- Changing time span recalculates the chart and any associated table within that card
- Desktop: rendered as pill button group
- Mobile (narrow): rendered as native `<select>` dropdown

### 5.2 Year-over-Year Comparison Summary
- Always-visible card on overview pages (Home, Investment)
- Shows key metrics vs equivalent prior-year period
- Comparison period is derived automatically (e.g., "Jan 1 – Feb 17, 2025")
- Home metrics: YTD Total Cost, Current Month Cost, Avg Monthly Cost — all with % change
- Investment metrics: YTD Earnings, YTD XIRR (percentage points), Current Month Earnings — all with % change

### 5.3 YoY Chart Overlay
- Toggle button on chart cards (not enabled by default)
- When enabled on bar charts: semi-transparent second bar set for prior year
- When enabled on line charts: dashed/ghost line for prior year
- Toggling off removes the overlay

### 5.4 File Attachments
- Available on: transactions, meter readings, bills, refuelings (receipt + trip counter photo), maintenance events
- User can attach files (images, PDFs) via file upload in forms
- Image attachments show thumbnail previews
- Non-image attachments show download links
- User can delete attachments

### 5.5 Staleness Indicators
- Applies to: investment platforms (per data point) and utilities (per meter reading)
- No entry by 2nd of month → amber "Stale" badge
- No entry by 7th of month → red "Stale" badge
- Adding an entry for the current month makes the badge disappear
- Badge shown on both overview row/card AND detail page header

### 5.6 Notes
- Every data entry type has an optional note field
- Notes are displayed alongside the record in tables

### 5.7 Truncated Data Tables
- Raw data tables (readings, bills, transactions, data points, refueling log, maintenance log) are always visible but show only the first 5 rows by default
- Rows beyond 5 are hidden behind a "Show N older [records]" toggle at the bottom of the table
- Clicking the toggle reveals all rows; a "Show less" link appears to re-collapse
- Charts and performance analysis on detail pages are always visible (not collapsible)
- Tables are sortable by date
- Tables include edit/delete actions per row (desktop: inline icons; mobile: via row-tap drawer)
- Notes display in the table row when populated

### 5.8 Mobile Table Behavior
- Columns that don't fit are replaced by a single cyclable column — tap the header to cycle through hidden values
- Dot indicator shows which value is displayed and how many are available
- All rows update simultaneously when cycling
- Tapping a table row opens a bottom drawer showing full record details + Edit and Delete buttons
- Drawer includes prev/next navigation to browse records

### 5.9 Dialogs
- Desktop: centered modal with backdrop blur
- Mobile: bottom sheet sliding up from bottom, drag handle at top
- Delete confirmations: always small centered modal (never bottom sheet)
- High-frequency entry dialogs (Data Points, Transactions, Meter Readings, Bills, Refuelings, Maintenance) include "Save & Add Another" — saves, clears form, keeps dialog open

---

## 6. Home (Utilities) — Overview Page

### 6.1 Page Layout
- This is the default landing page after login
- Desktop: section heading + subtitle showing utility count and last reading date
- Quick action buttons: "Add Reading" and "Add Bill"
  - Desktop: in header area, normal size
  - Mobile: full-width button pair

### 6.2 Utility Summary Cards
- One card per utility, displayed in a grid (1 col mobile → 3 cols desktop)
- Each card shows:
  - Utility icon and name
  - Current month consumption (with unit) and delta vs last month
  - Current month cost
  - YTD total cost
  - Cost per unit (current month)
  - Staleness badge (if stale)
  - Last updated timestamp
- Cards are clickable — navigate to utility detail page

### 6.3 YoY Comparison Row
- Always visible on overview (when prior year data exists)
- Shows 3 metrics: YTD Total Cost, Current Month Cost, Avg Monthly Cost
- Each with current vs prior year value + percentage change
- Cost decreases shown in green, increases in red (inverted color)

### 6.4 Monthly Overview Chart
- Bar chart showing monthly data per utility (one color per utility)
- Mode toggle: Consumption vs Cost
- Layout toggle: Grouped vs Stacked bars
- Time span selector (default: YTD)
- YoY overlay toggle
- Legend showing each utility with color dot + name

### 6.5 Add Utility
- "Add Utility" link/button at bottom of overview
- Opens Utility Dialog

### 6.6 Utility CRUD
- User can **create** a utility (name, unit, icon, color)
- User can **edit** a utility
- User can **delete** a utility

---

## 7. Home (Utilities) — Utility Detail Page

### 7.1 Header
- Back button → returns to Home overview
- Utility icon and name as dropdown switcher (can switch to other utilities directly)
- Staleness badge (if stale)
- Action buttons: "Add Reading", "Add Bill"
  - Desktop: normal size in header
  - Mobile: full-width pair

### 7.2 Summary Stat Cards
- Grid of stat cards (2 cols mobile → 6 cols desktop) showing:
  - Current month consumption (with unit)
  - Current month cost (DKK)
  - Change vs last month (% — green for decrease, red for increase)
  - YTD consumption
  - YTD cost
  - Cost per unit

### 7.3 EV Home Charging Metric (conditional)
- Only shown for electricity utilities when EV home-charging data exists
- Displays total kWh used for EV home charging (YTD)
- Toggle: "Exclude EV charging" — when checked, adjusts consumption data to remove home-charging kWh

### 7.4 Consumption & Cost Chart
- Always visible (not collapsible)
- Mode toggle: Consumption / Cost / Cost per Unit
- Time span selector
- YoY overlay toggle
- Consumption/Cost modes: bar chart
- Cost per Unit mode: line chart

### 7.5 Yearly Summary Table
- Inline collapsible year rows
- Each year row shows: total consumption, avg monthly consumption, consumption change % (color-coded), total cost, avg monthly cost, avg cost per unit, cost change % (color-coded)
- Color coding: red for increase, green for decrease
- Clicking a year row expands to show monthly sub-rows with: month, consumption, consumption change %, amortized cost, cost per unit, cost change %

### 7.6 Meter Readings Table
- Always visible; first 5 rows shown, older rows behind "Show N older readings" toggle
- Header shows: "Meter Readings" title, record count badge, "+ Add Reading" button
- Columns: date, meter value, note, attachment link, edit/delete actions
- Sortable by date
- Mobile: row-tap opens drawer with full details + Edit/Delete

### 7.7 Bills Table
- Always visible; first 5 rows shown, older rows behind "Show N older bills" toggle
- Header shows: "Bills" title, record count badge, "+ Add Bill" button
- Columns: period (start–end), amount, date received, note, attachment link, edit/delete actions
- Sortable by date
- Mobile: row-tap opens drawer with full details + Edit/Delete

### 7.8 Meter Reading CRUD
- User can **create** a reading: value (cumulative), timestamp (default: now), note (optional), attachment (optional)
- When opened from overview: utility selector shown; from detail: utility pre-set
- "Save & Add Another" keeps dialog open for next entry
- User can **edit** a reading
- User can **delete** a reading (with confirmation dialog)

### 7.9 Bill CRUD
- User can **create** a bill: amount, period start, period end, date received, note (optional), attachment (optional)
- Period end must be >= period start
- When opened from overview: utility selector shown; from detail: utility pre-set
- "Save & Add Another" available
- User can **edit** a bill
- User can **delete** a bill (with confirmation dialog)

### 7.10 Calculated Metrics (verified by displayed values)
- Monthly consumption derived from consecutive meter readings (including interpolation for readings not aligned to month boundaries)
- Multiple readings per month: deltas summed; cross-boundary readings split proportionally
- Multi-month bills amortized equally across covered months
- Cost per unit = amortized monthly cost / monthly consumption
- Cost trend: rolling average direction vs prior equivalent period
- Annual consumption/cost change % calculated and color-coded

---

## 8. Investment Portfolio — Overview Page

### 8.1 Portfolio Switcher
- Dropdown showing current portfolio name and owner
- Default portfolio pre-selected when navigating to section
- User can switch to any other portfolio
- "Add Portfolio" action accessible from the switcher
- Edit and delete actions available per portfolio (non-default portfolios can be deleted; default can be reassigned)

### 8.2 Summary Cards
- 6 stat cards scoped to the selected portfolio (2 cols mobile → 6 cols desktop):
  - Total current value (DKK)
  - All-time gain/loss (absolute + %)
  - All-time XIRR
  - YTD gain/loss
  - YTD XIRR
  - Current month earnings

### 8.3 YoY Comparison Row
- Always visible
- 3 metrics: YTD Earnings, YTD XIRR (percentage points), Month Earnings — each with current, previous, change %

### 8.4 Performance Charts & Analysis (accordion)
- Collapsible section (collapsed by default on overview)
- Contains:

#### 8.4.1 Portfolio Value Over Time
- Stacked area chart showing per-platform value breakdown
- Time span selector + YoY overlay toggle

#### 8.4.2 Performance Bar Chart
- Toggle between Earnings and XIRR %
- Green bars for positive, red for negative
- YoY overlay toggle
- Time span selector

#### 8.4.3 Performance Analysis (tabbed)
- Yearly tab: bar chart + summary table (Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR) + totals row
- Monthly tab: bar chart + summary table (Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR) + totals row
- Mode toggle: Earnings vs XIRR on each tab

### 8.5 Investment Platforms Table
- One row per active investment platform showing: icon, name, currency, current value (native + DKK), month earnings, all-time gain/loss (absolute + %), all-time XIRR, last updated, staleness badge
- Desktop header: "+ Add Data Point" and "+ Add Transaction" buttons
- Rows are clickable → navigate to platform detail page
- Mobile: cyclable column for hidden columns (XIRR, Month Earnings, All-Time Gain/Loss, Updated)

### 8.6 Cash Accounts Table
- One row per cash platform showing: icon, name, currency, current balance (native + DKK), last updated
- Rows are clickable → navigate to cash platform detail
- Visually distinct from investment platforms

### 8.7 Closed Platforms Section
- Only visible if closed platforms exist
- Muted/dimmed appearance
- Shows: icon, name, closure date, final value, all-time gain/loss
- Rows clickable → platform detail (historical view)
- Closed platforms are excluded from current portfolio totals and allocation

### 8.8 Portfolio Allocation
- Visual breakdown showing each platform's share of total portfolio value
- Cash and investment platforms visually distinguishable

### 8.9 Quick Actions
- "Add Data Point" and "Add Transaction" in the platforms table header on desktop
- Mobile: full-width button row above summary cards
- "Add Platform" as full-width text link below platform tables

### 8.10 Portfolio CRUD
- User can **create** a portfolio: name, owner name
- User can **edit** a portfolio: name, owner name, set as default
- User can **delete** a non-default portfolio
- At least one portfolio must remain as default

### 8.11 Platform CRUD
- User can **create** a platform: icon (image, required), name, type (investment/cash — immutable after creation), currency (DKK/EUR — immutable after creation)
- User can **edit** a platform: icon, name
- User can **close** an active platform: sets status to closed, prompts for closure date + optional closure note
- User can **reopen** a closed platform

---

## 9. Investment Portfolio — Platform Detail Page (Investment)

### 9.1 Header
- Back button → portfolio overview
- Platform icon and name as dropdown switcher (switch between all platforms in portfolio)
- Dropdown shows: overview link with total portfolio value, platforms grouped by type (Active, Cash, Closed), each with icon/name/value
- Currency badge
- Staleness badge (if stale)
- For closed platforms: closure date and closure note displayed in header

### 9.2 Summary Stat Cards
- 6 stat cards (2 cols mobile → 6 cols desktop):
  - Current value (native currency + DKK equivalent)
  - Current month earnings
  - All-time gain/loss (absolute + %)
  - All-time XIRR
  - YTD gain/loss
  - YTD XIRR

### 9.3 Performance Chart (always visible)
- Toggle between Earnings (bar chart: green/red) and XIRR % (line chart with area fill)
- Time span selector + YoY overlay toggle

### 9.4 Performance Analysis (always visible, tabbed)
- Yearly tab: bar chart (Earnings/XIRR toggle, values on bars) + summary table (Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR) + totals row "All Time"
- Monthly tab: bar chart + summary table (Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR) + totals row
- Mobile: cyclable columns for yearly (Earnings %, XIRR, Starting Value, Ending Value, Net Deposits) and monthly (Monthly XIRR, Start Value, End Value, Net Deposits)

### 9.5 Transactions Table
- Always visible; first 5 rows shown, older rows behind "Show N older" toggle
- Header: title, count badge, "+ Add Transaction" button
- Columns: date, type badge (deposit=green, withdrawal=red), amount (native + DKK), exchange rate (if non-DKK), note, attachment link, edit/delete
- Mobile: row-tap drawer

### 9.6 Data Points Table
- Always visible; first 5 rows shown, older rows behind "Show N older" toggle
- Header: title, count badge, "+ Add Data Point" button
- Columns: date, value (native + DKK), source indicator (manual vs interpolated — interpolated visually distinguished), note, edit/delete
- Mobile: row-tap drawer

### 9.7 Closed Platform Behavior
- Detail page shows all historical data, charts, and metrics up to the closure date
- Closure date and closure note visible in header

### 9.8 Data Point CRUD
- User can **create** a data point: platform (select, or pre-set from detail), value (in native currency), timestamp (default: now), note (optional)
- "Save & Add Another" available
- When editing an interpolated data point: banner explains it's an estimated value, saving replaces it with actual
- User can **edit** a data point
- User can **delete** a data point (with confirmation)
- Deleting an overridden interpolated point: system auto-recomputes interpolation

### 9.9 Transaction CRUD
- User can **create** a transaction: platform (select, or pre-set from detail), type (deposit/withdrawal), amount (positive, in native currency), exchange rate (auto-populated for non-DKK, editable), timestamp (default: now), note (optional), attachment (optional)
- Display shows DKK equivalent when exchange rate and amount are both filled
- "Save & Add Another" available
- User can **edit** a transaction
- User can **delete** a transaction (with confirmation)

### 9.10 Calculated Metrics (verified by displayed values)
- XIRR: Newton-Raphson on cash flows (starting value negative, deposits negative, withdrawals positive, ending value positive). Platform-level in native currency; portfolio-level in DKK. Returns null for <2 cash flows or non-convergence
- Gain/loss: ending value − starting value − net deposits. Percent uses starting value + Σdeposits as denominator
- Monthly earnings: ending boundary value − starting boundary value − net deposits for that month
- Monthly XIRR: XIRR for single month in isolation
- Month-end normalization: interpolated data points created at month boundaries, marked `isInterpolated`, visually distinguished, overridable, reversible

---

## 10. Investment Portfolio — Cash Platform Detail Page

### 10.1 Header
- Back button, platform icon and name, currency badge
- Same dropdown switcher as investment platforms

### 10.2 Content
- Current balance (native + DKK equivalent)
- Balance history line chart (always visible)
- Transactions table (always visible, first 5 rows shown, older behind toggle): date, type badge, amount (native + DKK), note, attachment, edit/delete. "+ Add Transaction" button
- Data Points table (always visible, first 5 rows shown, older behind toggle): date, value (native + DKK), note, edit/delete. "+ Add Data Point" button

### 10.3 Cash Platform Metrics
- No XIRR, gain/loss, or performance analysis (simplified vs investment)
- Balance and balance history only

---

## 11. Investment Portfolio — Currency & Exchange Rates

### 11.1 Display Rules
- DKK platforms: values in DKK only
- Non-DKK platforms: primary line in native currency, secondary line with "≈ X DKK" below
- Portfolio totals: always in DKK
- Transactions on non-DKK platforms: display both native and DKK amounts

### 11.2 Exchange Rate Behavior
- Rates auto-fetched from public API (frankfurter.app / ECB)
- Monthly rates fetched on/near 1st of each month
- Transaction-day rates fetched when recording a transaction on non-DKK platform
- All fetched rates are visible to the user
- User can override/edit any rate
- Source tracked: "auto" (fetched) vs "manual" (user override)

---

## 12. Vehicles — Overview Page

### 12.1 Page Layout
- Section heading + subtitle showing active/sold count and last refueled date
- Action buttons: "Add Refueling", "Add Maintenance", "Add Vehicle"
  - Desktop: all three in header
  - Mobile: "Add Refueling" + "Add Vehicle" as 2-col pair

### 12.2 Active Vehicle Cards
- Grid of cards (1 col mobile → 3 cols desktop), one per active vehicle
- Each card shows:
  - Vehicle photo (or placeholder silhouette by type: Car/Motorcycle)
  - Name, make/model/year
  - Current year fuel efficiency (weighted average), unit matching fuel type (km/l or km/kWh)
  - YTD fuel cost
  - YTD total cost (fuel + maintenance)
- Cards are clickable → navigate to vehicle detail page

### 12.3 Sold Vehicles
- Separate section, visually muted
- Each sold vehicle card shows:
  - Vehicle photo (or placeholder)
  - Name, make/model/year
  - "Sold" indicator with sale date
  - Total cost of ownership
- Cards are clickable → vehicle detail page (historical view)

### 12.4 Vehicle CRUD
- User can **create** a vehicle: name, type (Car/Motorcycle), fuel type (Petrol/Diesel/Electric/Hybrid), make, model, year, license plate, purchase date (optional), purchase price (optional), photo (optional)
- User can **edit** a vehicle
- User can **mark as sold**: sale date, sale price, optional sale note
- User can **reactivate** a sold vehicle
- User can **delete** a vehicle (with confirmation)

---

## 13. Vehicles — Vehicle Detail Page

### 13.1 Header
- Back button → vehicles overview
- Vehicle name as dropdown switcher (all vehicles, grouped by Active/Sold)
- Edit button
- Action buttons: "Add Refueling", "Add Maintenance"
  - Desktop: in header row
  - Mobile: full-width pair
- Vehicle info card:
  - Vehicle photo (or type-based placeholder silhouette)
  - Name, make/model/year
  - Metadata badges: license plate, fuel type, vehicle type, status (Active with green dot / Sold muted)
  - For sold vehicles: sale date, sale price, sale note

### 13.2 Summary Stat Cards
- Grid (2 cols mobile → 7 cols desktop):
  - All-time weighted efficiency (km/l or km/kWh)
  - Current year weighted efficiency (with YoY change badge if prior year data exists)
  - Last 5 refuelings weighted efficiency
  - YTD km driven
  - YTD fuel cost
  - Average fuel cost/month (active) or Total cost of ownership (sold)
  - Average fuel cost/day (active) or Purchase-to-sale offset (sold)

### 13.3 YoY Comparison Row
- Shows when prior year data exists
- 3 metrics: YTD Km Driven, YTD Fuel Cost (inverted color), Efficiency

### 13.4 Performance Charts (always visible on detail pages per PRD §3.6)
- Fuel efficiency over time: line chart per-refueling data points
- Monthly fuel cost: bar chart
- Monthly km driven: bar chart
- Maintenance cost timeline: bar chart
- Time span selector + YoY toggle on efficiency, fuel cost, and km charts

### 13.5 Refueling Log Table
- Always visible; first 5 rows shown, older rows behind "Show N older" toggle
- Header: title, record count, "+ Add Refueling" button
- Columns: date, fuel amount (liters or kWh), cost per unit, total cost, odometer reading, efficiency (km/l or km/kWh), station, charged-at-home indicator (EVs only), note, receipt thumbnail, edit/delete
- Mobile: row-tap drawer

### 13.6 Maintenance Log Table
- Always visible; first 5 rows shown, older rows behind "Show N older" toggle
- Header: title, record count, "+ Add Maintenance" button
- Columns: date, description, cost, note, receipt thumbnail, edit/delete
- Mobile: row-tap drawer

### 13.7 Refueling CRUD
- User can **create** a refueling: date (default: today), fuel amount (liters or kWh based on fuel type), cost per unit (DKK/l or DKK/kWh), total cost (auto-computed, editable), odometer reading, station (optional), charged at home (checkbox, only for electric vehicles), note (optional), receipt (file, optional), trip counter photo (file, optional)
- When opened from overview: vehicle selector shown; from detail: vehicle pre-set
- "Save & Add Another" available
- Mobile: optimized for pump-side entry with camera access for receipt/odometer photos
- User can **edit** a refueling
- User can **delete** a refueling (with confirmation)

### 13.8 Maintenance CRUD
- User can **create** a maintenance event: date (default: today), description, cost, note (optional), receipt (file, optional)
- When opened from overview: vehicle selector shown; from detail: vehicle pre-set
- "Save & Add Another" available
- User can **edit** a maintenance event
- User can **delete** a maintenance event (with confirmation)

### 13.9 Calculated Metrics (verified by displayed values)
- Fuel efficiency: always weighted average (total km ÷ total fuel), never arithmetic mean
- All-time, current year, and rolling 5-refueling weighted averages
- Distance: yearly and YTD km driven derived from odometer readings
- Fuel costs: total, average/month, average/day, average cost per unit over time
- Maintenance costs: total for time span, per-year breakdown
- Total vehicle cost: fuel + maintenance combined
- Total cost of ownership (sold vehicles): lifetime fuel + maintenance, with purchase→sale price offset as secondary

---

## 14. EV Home Charging Crossover

### 14.1 Refueling Side
- Electric vehicle refueling dialog includes "Charged at home" checkbox
- When checked, the kWh is flagged as vehicle-related electricity consumption

### 14.2 Utility Side
- On the electricity utility detail page: total home-charging kWh displayed as supplementary metric
- Toggle to exclude home-charging kWh from the utility's consumption view
- Useful when a third party reimburses home charging costs

---

## 15. Accessibility

### 15.1 Keyboard Navigation
- Dialogs: focus trap (Tab cycles within), Escape closes
- Tab bars / time span selectors: arrow key navigation
- All interactive elements keyboard-accessible

### 15.2 ARIA
- Dialogs: `role="dialog"`, `aria-modal`, `aria-labelledby`
- Toggle buttons: `aria-pressed`
- Expandable sections: `aria-expanded`
- Tab bars: `role="tablist"`, `role="tab"`, `aria-selected`
- Charts: `role="img"` with descriptive `aria-label`

### 15.3 Visual
- Sufficient color contrast in both light and dark themes
- Focus indicators on interactive elements

---

## 16. Desktop vs Mobile — Key Differences

### 16.1 Navigation
- Desktop: sticky top nav bar with text links + settings gear
- Mobile: fixed bottom tab bar with icons (Home, Investment, Vehicles, Settings)

### 16.2 Dialogs
- Desktop: centered modal with backdrop blur
- Mobile: bottom sheet with drag handle
- Delete confirmations: always centered modal on both

### 16.3 Action Buttons
- Desktop: normal-sized buttons in section/table headers
- Mobile: full-width button pairs

### 16.4 Data Tables
- Desktop: all columns visible, inline edit/delete icon buttons per row
- Mobile: primary columns only, hidden columns via cyclable column (tap header to cycle, dot indicator), row-tap opens bottom drawer with all fields + Edit/Delete + prev/next navigation

### 16.5 Dropdowns/Switchers
- Desktop: absolute-positioned dropdown
- Mobile: full-width overlay

### 16.6 Time Span Selector
- Desktop/wide: pill button group
- Mobile/narrow (<410px): native `<select>` dropdown

### 16.7 Stat Card Grids
- Mobile: 2 columns
- Tablet: 3–4 columns
- Desktop: 6–7 columns

### 16.8 Content Cards/Grids
- Vehicle/Utility cards: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Dual charts: stacked (mobile) → side-by-side (desktop)
