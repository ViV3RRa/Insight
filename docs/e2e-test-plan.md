# Insight Platform — E2E Test Plan

> Each test is executed via Playwright MCP: open browser, navigate to `http://localhost:5173`, log in with `test1@test.dk` / `Test123456`, then perform the test as a real user.
>
> **IMPORTANT: Tests are strictly sequential and gated. Each test is a gate to every following test. A test CANNOT be started if even one previous test has not passed. If a test fails, STOP — do not proceed to the next test.**
>
> **ON FAILURE: When a test fails, investigate why. Check whether the feature has been implemented, whether it's wired up correctly, and what `/Users/sKrogh/Projects/privat/Insight/Project Documents/metrics-dashboard-prd-v2.md` says the expected behavior should be. After diagnosing the root cause and determining the fix, prompt the user with your findings and proposed solution BEFORE implementing any changes. Do not auto-fix. Wait for user approval, then fix, then re-run the failed test before continuing.**
>
> **TEST DATA: If test data is needed in order to perform a test, create the data. This is not in violation with future tests — it is not skipping or performing future tests early, and does not mark any future tests as passed or failed. If you are not able to create the necessary test data, that should be considered a bug and the test should fail.**
>
> **PRE-STEP (MANDATORY): Before performing EACH test, re-read this entire instructions block. This must happen every single time — no exceptions. Do not skip this step.**

---

## AUTH — Authentication & Route Protection

### AUTH-01: Login page renders for unauthenticated user ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `http://localhost:5173`
- Verify redirected to `/login`
- Verify login form is visible: email input, password input, sign-in button, "Insight" title

### AUTH-02: Invalid credentials show error ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On login page, enter email `wrong@test.dk`, password `wrong`
- Click Sign In
- Verify an error message is displayed

### AUTH-03: Successful login redirects to Home ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Enter email `test1@test.dk`, password `Test123456`
- Click Sign In
- Verify URL is `/home`
- Verify Home page content is visible

### AUTH-04: Session persists across reload ✅ PASSED
- **First: re-read the instructions at the top of this file**
- After logging in, reload the page
- Verify still on `/home` (not redirected to login)

### AUTH-05: Protected routes redirect when not authenticated ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Clear session/cookies
- Navigate directly to `/investment`
- Verify redirected to `/login`

---

## NAV-D — Desktop Navigation

### NAV-D-01: Top navigation bar is visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Log in (desktop viewport: 1280x800)
- Verify sticky top nav bar is visible
- Verify it contains: "Insight" brand text, "Home" link, "Investment" link, "Vehicles" link, settings gear icon

### NAV-D-02: Section links navigate correctly ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Investment" link in top nav
- Verify URL is `/investment`
- Click "Vehicles" link
- Verify URL is `/vehicles`
- Click "Home" link
- Verify URL is `/home`

### NAV-D-03: Active section link is highlighted ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/investment`
- Verify the "Investment" link has active/highlighted styling
- Verify "Home" and "Vehicles" do not

### NAV-D-04: Settings gear navigates to settings ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click the settings gear icon in top nav
- Verify URL is `/settings`

---

## NAV-M — Mobile Navigation

### NAV-M-01: Bottom tab bar is visible, top nav hidden ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Log in (mobile viewport: 375x812)
- Verify bottom tab bar is visible with 4 tabs: Home, Investment, Vehicles, Settings
- Verify top navigation bar is NOT visible

### NAV-M-02: Tabs navigate correctly ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Tap "Investment" tab
- Verify URL is `/investment`
- Tap "Vehicles" tab
- Verify URL is `/vehicles`
- Tap "Settings" tab
- Verify URL is `/settings`
- Tap "Home" tab
- Verify URL is `/home`

### NAV-M-03: Active tab is highlighted ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/vehicles`
- Verify the Vehicles tab has active styling
- Verify other tabs do not

### NAV-M-04: Bottom tab bar stays visible when scrolling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a page with scrollable content
- Scroll down
- Verify bottom tab bar is still visible

---

## SET — Settings

### SET-01: Settings page renders all controls ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/settings`
- Verify "Date format" toggle is visible with two options
- Verify "Dark mode" toggle switch is visible
- Verify "Home currency" shows "DKK" as read-only
- Verify "Demo mode" toggle switch is visible

### SET-02: Date format toggle works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On settings page, verify the current date format selection
- Click the other date format option
- Verify the selection changes visually
- Navigate to a page with record dates in a table and verify format changed

### SET-03: Dark mode toggle works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On settings page, toggle dark mode ON
- Verify the page theme changes immediately (e.g., dark background)
- Toggle dark mode OFF
- Verify theme reverts to light

### SET-04: Dark mode persists across reload ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Toggle dark mode ON
- Reload the page
- Verify dark mode is still active
- Toggle back OFF

### SET-05: Demo mode toggle shows banner ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Toggle demo mode ON
- Verify a visible demo mode banner/badge appears
- Navigate to `/home` — verify banner is still visible
- Navigate to `/investment` — verify banner is still visible
- Navigate to `/vehicles` — verify banner is still visible

### SET-06: Demo mode toggle off hides banner ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Toggle demo mode OFF
- Verify the demo mode banner disappears

---

## FMT — Formatting & Locale

### FMT-01: Numbers use Danish locale ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to any page with numeric values (e.g., Investment overview stat cards)
- Verify large numbers use period as thousands separator (e.g., `1.000` not `1,000`)

### FMT-02: Currency displays DKK suffix ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify DKK values show with "DKK" suffix

### FMT-03: Percentages use comma decimal ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Find a percentage display (e.g., XIRR or gain %)
- Verify it uses comma as decimal separator and ends with `%`

### FMT-04: Date format respects settings ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Set date format to `YYYY-MM-DD` in settings
- Navigate to a table with record dates — verify format is `YYYY-MM-DD`
- Change to `DD/MM/YYYY` in settings
- Return to same table — verify format changed to `DD/MM/YYYY`

---

## HOME-O — Home Overview Page

### HOME-O-01: Page loads as default after login ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Log in fresh
- Verify URL is `/home`
- Verify page heading or content indicating Home section

### HOME-O-02: Quick action buttons visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Desktop: verify "Add Reading" and "Add Bill" buttons in header area
- Mobile: verify full-width button pair

### HOME-O-03: Utility summary cards render ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify at least one utility card is displayed
- Verify each card shows: utility icon, utility name, consumption value with unit, cost value, YTD cost, cost per unit, last updated

### HOME-O-04: Utility card click navigates to detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click on a utility summary card
- Verify URL changes to `/home/{utilityId}`
- Verify utility detail page loads

### HOME-O-05: Monthly overview chart renders ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Back on Home overview
- Verify a bar chart is visible
- Verify mode toggle (Consumption / Cost) is present
- Verify layout toggle (Grouped / Stacked) is present
- Verify time span selector is present (default: YTD)
- Verify YoY toggle is present

### HOME-O-06: Chart mode toggle works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Cost" mode
- Verify chart updates (bars change)
- Click "Consumption" mode
- Verify chart updates back

### HOME-O-07: Chart layout toggle works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Stacked"
- Verify chart layout changes to stacked bars
- Click "Grouped"
- Verify chart layout changes to grouped bars

### HOME-O-08: Chart time span selector works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Select "All" time span
- Verify chart updates to show all data
- Select "YTD"
- Verify chart returns to YTD view

### HOME-O-09: Add Utility link opens dialog ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Find and click the "Add Utility" link/button
- Verify a dialog opens with fields: icon picker, color picker, name, unit

### HOME-O-10: Add Reading button opens dialog ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Reading" button
- Verify dialog opens
- Verify utility selector is shown (since opened from overview)
- Close dialog

### HOME-O-11: Add Bill button opens dialog ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Bill" button
- Verify dialog opens
- Verify utility selector is shown (since opened from overview)
- Close dialog

---

## HOME-U — Utility CRUD

### HOME-U-01: Create utility ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Utility"
- Select an icon (e.g., bolt)
- Select a color (e.g., amber)
- Enter name "Test Electricity"
- Enter unit "kWh"
- Click Save
- Verify dialog closes
- Verify new utility card appears on overview

### HOME-U-02: Edit utility ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to the created utility's detail page
- Open edit utility dialog (via edit action)
- Change name to "Test Electricity Updated"
- Click Save
- Verify name updates

### HOME-U-03: Delete utility ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open delete action for the utility
- Verify confirmation dialog appears
- Confirm delete
- Verify utility is removed from overview

---

## HOME-D — Utility Detail Page

### HOME-D-01: Header elements render ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a utility detail page
- Verify: back button, utility icon, utility name, action buttons ("Add Reading", "Add Bill")

### HOME-D-02: Back button returns to overview ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click back button
- Verify URL is `/home`

### HOME-D-03: Dropdown switcher works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a utility detail page, click the utility name (dropdown trigger)
- Verify dropdown opens showing all utilities + overview link
- Click a different utility
- Verify page switches to that utility's detail

### HOME-D-04: Stat cards render ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify 6 stat cards visible: current month consumption, current month cost, change vs last month, YTD consumption, YTD cost, cost per unit

### HOME-D-05: Chart is always visible (not collapsible) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify consumption/cost chart is visible without needing to expand anything
- Verify mode toggle (Consumption / Cost / Cost per Unit) is present
- Verify time span selector and YoY toggle are present

### HOME-D-06: Chart mode toggle — Cost per Unit shows line chart ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Cost per Unit" mode
- Verify chart changes to a line chart
- Click "Consumption"
- Verify chart changes back to bar chart

### HOME-D-07: Yearly summary table renders with expandable rows ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify yearly summary table is visible
- Verify at least one year row with: consumption, avg/month, change %, cost, avg cost, cost/unit, cost change %
- Click on a year row
- Verify monthly sub-rows expand showing: month, consumption, change %, cost, cost/unit, change %

### HOME-D-08: Meter readings table — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Meter Readings" section exists and table is always visible (not collapsed)
- Verify table headers: date, reading value, note, attachment
- If more than 5 readings exist, verify only first 5 rows shown and a "Show N older readings" toggle is visible at the bottom
- Click toggle — verify all rows become visible and "Show less" link appears

### HOME-D-09: Bills table — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Bills" section exists and table is always visible (not collapsed)
- Verify table headers: period, amount, date received, note, attachment
- If more than 5 bills exist, verify only first 5 rows shown and a "Show N older bills" toggle is visible at the bottom
- Click toggle — verify all rows become visible and "Show less" link appears

---

## HOME-R — Meter Reading CRUD

### HOME-R-01: Create reading from detail page ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On utility detail, click "Add Reading"
- Verify dialog opens
- Verify utility is pre-set (no utility selector)
- Enter value (e.g., 15000)
- Verify timestamp defaults to approximately now
- Enter note "Test reading"
- Click Save
- Verify dialog closes
- Expand readings table — verify new reading appears

### HOME-R-02: Save & Add Another ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Reading"
- Enter value 15100
- Click "Save & Add Another"
- Verify dialog stays open and form clears
- Enter value 15200
- Click Save
- Verify dialog closes
- Verify both readings appear in table

### HOME-R-03: Edit reading ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Expand readings table
- Click edit on a reading (desktop: pencil icon)
- Verify dialog opens pre-populated with the reading's values
- Change the note
- Click Save
- Verify note updates in table

### HOME-R-04: Delete reading ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete on a reading
- Verify delete confirmation dialog appears (centered modal)
- Click cancel — verify dialog closes, reading still exists
- Click delete again, confirm
- Verify reading is removed from table

---

## HOME-B — Bill CRUD

### HOME-B-01: Create bill from detail page ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On utility detail, click "Add Bill"
- Verify utility is pre-set
- Enter amount 1200
- Enter period start (e.g., first of current month)
- Enter period end (e.g., last of current month)
- Click Save
- Verify dialog closes
- Expand bills table — verify new bill appears

### HOME-B-02: Bill validation — period end before start ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Bill"
- Enter amount 500
- Set period end BEFORE period start
- Attempt to save
- Verify validation error appears

### HOME-B-03: Edit bill ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click edit on a bill
- Change amount
- Click Save
- Verify amount updates in table

### HOME-B-04: Delete bill ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete on a bill
- Confirm deletion
- Verify bill is removed

---

## INV-O — Investment Overview Page

### INV-O-01: Page loads with portfolio switcher ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/investment`
- Verify portfolio switcher is visible showing current portfolio name and owner

### INV-O-02: Summary cards render (6 cards) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify 6 stat cards: Total Value, All-Time Gain/Loss, All-Time XIRR, YTD Gain/Loss, YTD XIRR, Month Earnings

### INV-O-03: YoY comparison row visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify always-visible YoY row with metrics: YTD Earnings, YTD XIRR, Month Earnings — each with current, previous, change %

### INV-O-04: Performance accordion — collapsed by default ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Performance Charts & Analysis" section exists and is collapsed
- Click to expand
- Verify charts become visible (area chart + bar chart)

### INV-O-05: Performance accordion — value chart and bar chart ✅ PASSED ✅ PASSED
- **First: re-read the instructions at the top of this file**
- With accordion expanded:
- Verify stacked area chart (portfolio value over time) is present
- Verify performance bar chart with Earnings/XIRR toggle is present

### INV-O-06: Performance accordion — tabbed analysis ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify tab bar with "Yearly" and "Monthly" tabs
- Click "Yearly" — verify bar chart and summary table with columns: Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR, and a totals row
- Click "Monthly" — verify table changes to: Period, Starting Value, Ending Value, Net Deposits, Earnings, Monthly XIRR

### INV-O-07: Investment platforms table renders ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify table with platform rows showing: icon, name, currency, current value, month earnings, gain/loss, XIRR, updated
- Verify staleness badges where applicable

### INV-O-08: Platform row click navigates to detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click on a platform row
- Verify URL changes to `/investment/platform/{platformId}`

### INV-O-09: Cash accounts table renders ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify cash platform rows (visually distinct) with: icon, name, balance, updated

### INV-O-10: Closed platforms section ✅ PASSED
- **First: re-read the instructions at the top of this file**
- If closed platforms exist: verify muted/dimmed section with closure dates
- Verify closed platform rows are clickable

### INV-O-11: Portfolio allocation section ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify allocation visualization (proportional bar) showing platform shares
- Verify cash and investment platforms visually distinguishable

### INV-O-12: Quick action buttons ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Desktop: verify "Add Data Point" and "Add Transaction" in platforms table header
- Verify "Add Platform" link below platform tables

### INV-O-13: Add Data Point from overview opens dialog with platform selector ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Data Point"
- Verify dialog opens with platform selector visible
- Close dialog

### INV-O-14: Add Transaction from overview opens dialog with platform selector ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Transaction"
- Verify dialog opens with platform selector and type (Deposit/Withdrawal) radio buttons
- Close dialog

---

## INV-O-M — Investment Overview Mobile

### INV-O-M-01: Mobile action buttons ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport (375x812)
- Navigate to `/investment`
- Verify full-width "Add Data Point" and "Add Transaction" buttons above summary cards

### INV-O-M-02: Platform table column cycling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify primary columns visible (name, value)
- Verify cyclable column header — tap to cycle
- Verify dot indicator shows current position
- Tap header — verify column switches (e.g., from XIRR to Month Earnings)

---

## INV-PF — Portfolio CRUD

### INV-PF-01: Create portfolio ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open portfolio switcher
- Click "Add Portfolio"
- Enter name "Test Portfolio", owner "Test Owner"
- Save
- Verify new portfolio appears in switcher

### INV-PF-02: Switch portfolio ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open portfolio switcher
- Click a different portfolio
- Verify overview updates to show that portfolio's data

### INV-PF-03: Edit portfolio ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open portfolio switcher
- Click edit icon on a portfolio
- Change name
- Save
- Verify name updates in switcher

### INV-PF-04: Delete non-default portfolio ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify a non-default portfolio can be deleted
- Delete it
- Verify it no longer appears in switcher

### INV-PF-05: Default portfolio pre-selected ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate away and back to `/investment`
- Verify the default portfolio is pre-selected

---

## INV-PL — Platform CRUD

### INV-PL-01: Create investment platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Platform"
- Verify dialog with: icon upload, name, type (investment/cash), currency (DKK/EUR)
- Enter name "Test Platform DKK", select type "investment", currency "DKK"
- Save
- Verify platform appears in investment platforms table

### INV-PL-02: Create cash platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Platform"
- Enter name "Test Cash", select type "cash", currency "DKK"
- Save
- Verify platform appears in cash accounts section

### INV-PL-03: Create EUR platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Platform"
- Enter name "Test Platform EUR", select type "investment", currency "EUR"
- Save
- Verify platform appears with EUR currency indicator

### INV-PL-04: Edit platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to platform detail
- Open edit dialog
- Verify type and currency are NOT editable (read-only / badge display)
- Change name
- Save
- Verify name updates

### INV-PL-05: Close platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit an active platform
- Find "Close Platform" option
- Enter closure date and optional note
- Confirm
- Verify platform appears in closed platforms section (muted)

### INV-PL-06: Reopen closed platform ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit a closed platform
- Find "Reopen" option
- Confirm
- Verify platform returns to active platforms

---

## INV-PD — Investment Platform Detail Page

### INV-PD-01: Header renders correctly ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to an investment platform detail
- Verify: back button, platform icon, platform name, currency badge
- Verify subtitle shows type, currency, last updated

### INV-PD-02: Back button returns to overview ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click back button
- Verify URL is `/investment`

### INV-PD-03: Dropdown switcher works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click platform name
- Verify dropdown shows: overview link (with portfolio total value), all platforms grouped by type
- Click a different platform
- Verify page switches

### INV-PD-04: Stat cards render (6 cards) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify: Current Value, Month Earnings, All-Time Gain/Loss, All-Time XIRR, YTD Gain/Loss, YTD XIRR

### INV-PD-05: Performance chart always visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify performance chart is visible (not inside a collapsible section)
- Verify Earnings/XIRR mode toggle, time span selector, YoY toggle

### INV-PD-06: Performance chart — Earnings mode ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Select "Earnings" mode
- Verify bar chart with green positive / red negative bars

### INV-PD-07: Performance chart — XIRR mode ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Select "XIRR %" mode
- Verify line chart with area fill

### INV-PD-08: Performance tabs always visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Yearly" / "Monthly" tabs visible (not collapsible)
- Click "Yearly" — verify bar chart and summary table with totals row
- Click "Monthly" — verify monthly table

### INV-PD-09: Transactions table — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Transactions" section is always visible (not collapsed)
- Verify columns: date, type badge, amount, exchange rate (if non-DKK), note, attachment
- If more than 5 transactions exist, verify only first 5 rows shown and a "Show N older" toggle is visible at the bottom

### INV-PD-10: Data points table — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Data Points" section is always visible (not collapsed)
- Verify columns: date, value, source indicator, note
- If more than 5 data points exist, verify only first 5 rows shown and a "Show N older" toggle is visible at the bottom

---

## INV-DP — Data Point CRUD

### INV-DP-01: Create data point from platform detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On platform detail, click "Add Data Point"
- Verify platform is pre-set (no selector)
- Enter value
- Verify timestamp defaults to now
- Enter optional note
- Click Save
- Expand data points table — verify entry appears

### INV-DP-02: Save & Add Another ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Data Point"
- Enter value
- Click "Save & Add Another"
- Verify dialog stays open and form clears
- Enter another value
- Click Save
- Verify both entries appear

### INV-DP-03: Edit data point ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click edit on a data point
- Change value
- Save
- Verify value updates

### INV-DP-04: Delete data point ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete on a data point
- Verify confirmation dialog
- Confirm
- Verify point removed

### INV-DP-05: Interpolated data point visual distinction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- If interpolated data points exist: verify they are visually distinguished (e.g., "est." badge or different styling)

---

## INV-TX — Transaction CRUD

### INV-TX-01: Create deposit transaction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On platform detail, click "Add Transaction"
- Verify platform is pre-set
- Select type "Deposit"
- Enter amount
- Verify timestamp defaults to now
- Click Save
- Expand transactions table — verify entry with deposit badge (green)

### INV-TX-02: Create withdrawal transaction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Transaction"
- Select type "Withdrawal"
- Enter amount
- Click Save
- Verify entry with withdrawal badge (red)

### INV-TX-03: Transaction on EUR platform — exchange rate ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a EUR platform
- Click "Add Transaction"
- Verify exchange rate field is shown and auto-populated
- Verify DKK equivalent displayed when amount and rate are filled
- Edit the exchange rate manually
- Verify DKK equivalent updates
- Save

### INV-TX-04: Transaction with attachment ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Transaction"
- Fill required fields
- Attach a file (image)
- Save
- Verify attachment indicator appears in table row

### INV-TX-05: Edit transaction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click edit on a transaction
- Change amount
- Save
- Verify amount updates

### INV-TX-06: Delete transaction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete, confirm
- Verify removed

---

## INV-CASH — Cash Platform Detail

### INV-CASH-01: Cash platform header ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a cash platform
- Verify: icon, name, currency badge
- Verify NO XIRR or gain/loss stat cards

### INV-CASH-02: Balance and balance history ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify current balance displayed
- Verify balance history line chart is visible

### INV-CASH-03: Transactions table ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify transactions table is always visible (first 5 rows shown, older behind toggle)
- Verify "Add Transaction" button

### INV-CASH-04: Data points table ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify data points table is always visible (first 5 rows shown, older behind toggle)
- Verify "Add Data Point" button

---

## INV-CUR — Currency Display

### INV-CUR-01: DKK platform values show DKK only ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a DKK platform
- Verify values display in DKK without secondary currency line

### INV-CUR-02: EUR platform values show dual currency ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a EUR platform
- Verify values show native EUR on primary line
- Verify DKK equivalent below with "≈" prefix in smaller/muted text

### INV-CUR-03: Portfolio totals in DKK ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On portfolio overview, verify summary card values are in DKK

---

## INV-CL — Closed Platform Behavior

### INV-CL-01: Closed platform appears muted on overview ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify closed platform rows have muted/dimmed appearance

### INV-CL-02: Closed platform detail shows closure info ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a closed platform's detail page
- Verify closure date and closure note are displayed in header

### INV-CL-03: Closed platforms excluded from portfolio totals ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify portfolio total value does not include closed platform values

---

## VEH-O — Vehicles Overview Page

### VEH-O-01: Page renders with heading and subtitle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/vehicles`
- Verify heading "Vehicles"
- Verify subtitle with active/sold count

### VEH-O-02: Action buttons present ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Desktop: verify "Add Refueling", "Add Maintenance", "Add Vehicle" buttons
- Mobile: verify "Add Refueling" + "Add Vehicle" pair

### VEH-O-03: Active vehicle cards render ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify at least one vehicle card
- Each card shows: photo/silhouette, name, make/model/year, efficiency, YTD fuel cost, YTD total cost

### VEH-O-04: Vehicle card click navigates to detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click a vehicle card
- Verify URL changes to `/vehicles/{vehicleId}`

### VEH-O-05: Sold vehicles section (if applicable) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- If sold vehicles exist: verify separate muted section with sold cards
- Sold cards show: name, "Sold" indicator, sale date, total cost of ownership

---

## VEH-C — Vehicle CRUD

### VEH-C-01: Create vehicle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Vehicle"
- Verify dialog with: photo upload, name, type, fuel type, make, model, year, license plate
- Enter name "Test Car", type "Car", fuel type "Petrol"
- Save
- Verify vehicle card appears on overview

### VEH-C-02: Edit vehicle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to vehicle detail, open edit dialog
- Change name
- Save
- Verify name updates

### VEH-C-03: Mark vehicle as sold ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit vehicle
- Click "Mark as Sold"
- Enter sale date and sale price
- Save
- Verify vehicle moves to sold section on overview

### VEH-C-04: Reactivate sold vehicle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit the sold vehicle
- Click "Reactivate Vehicle"
- Verify vehicle returns to active section

### VEH-C-05: Delete vehicle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit vehicle, click "Delete Vehicle"
- Confirm deletion
- Verify vehicle removed from overview

---

## VEH-D — Vehicle Detail Page

### VEH-D-01: Header renders ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to vehicle detail
- Verify: back button, vehicle name, vehicle info card (photo/silhouette, name, make/model/year, badges for license plate, fuel type, type, status)

### VEH-D-02: Back button returns to overview ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click back button
- Verify URL is `/vehicles`

### VEH-D-03: Dropdown switcher works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click vehicle name
- Verify dropdown with all vehicles grouped by Active/Sold + overview link
- Switch to another vehicle
- Verify page updates

### VEH-D-04: Action buttons ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Desktop: verify "Edit" text, "Add Refueling", "Add Maintenance" buttons
- Mobile: verify full-width "Add Refueling" + "Add Maintenance" pair

### VEH-D-05: Stat cards render (7 cards) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify stat cards: All-time efficiency, current year efficiency, last 5 fills efficiency, YTD km, YTD fuel cost, avg/month, avg/day

### VEH-D-06: Sold vehicle stat cards differ ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a sold vehicle detail page: verify "Total Cost" and "Purchase→Sale" cards instead of avg/month and avg/day

### VEH-D-07: Sold vehicle info in header ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On sold vehicle detail: verify sale date, sale price, sale note displayed in header card

### VEH-D-08: Performance charts visible ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify charts are visible (not inside a collapsed section):
  - Fuel efficiency line chart
  - Monthly fuel cost bar chart
  - Monthly km driven bar chart
  - Maintenance cost bar chart

### VEH-D-09: Chart time span and YoY toggles ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify time span selector on efficiency, fuel cost, and km charts
- Verify YoY toggle on those same charts
- Verify maintenance chart has NO time span or YoY controls

### VEH-D-10: Refueling log — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Refueling Log" section is always visible (not collapsed)
- Verify columns: date, fuel amount, cost/unit, total cost, odometer, efficiency, station
- If more than 5 refuelings exist, verify only first 5 rows shown and a "Show N older" toggle at bottom

### VEH-D-11: Maintenance log — visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Verify "Maintenance Log" section is always visible (not collapsed)
- Verify columns: date, description, cost, note
- If more than 5 events exist, verify only first 5 rows shown and a "Show N older" toggle at bottom

---

## VEH-R — Refueling CRUD

### VEH-R-01: Create refueling from detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On vehicle detail, click "Add Refueling"
- Verify vehicle is pre-set
- Verify fields: date, fuel amount, cost per unit, total cost, odometer, station, note
- Verify fuel label matches vehicle fuel type (e.g., "Fuel (L)" for Petrol)
- Fill in: date, fuel amount 45, cost per unit 12.5, odometer 55000
- Verify total cost auto-computes (562.5)
- Click Save
- Expand refueling log — verify entry

### VEH-R-02: Total cost auto-compute ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open refueling dialog
- Enter fuel amount 50, cost per unit 13
- Verify total cost shows 650
- Manually edit total cost to 700
- Verify it stays at 700 (manual override)

### VEH-R-03: Save & Add Another ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Refueling"
- Fill fields, click "Save & Add Another"
- Verify dialog stays open and form clears
- Fill again, click Save
- Verify both entries in table

### VEH-R-04: Refueling from overview with vehicle selector ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On vehicles overview, click "Add Refueling"
- Verify vehicle selector is shown
- Select a vehicle
- Fill fields, Save

### VEH-R-05: Edit refueling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click edit on a refueling entry
- Change fuel amount
- Save, verify update

### VEH-R-06: Delete refueling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete, confirm
- Verify removed

---

## VEH-R-EV — Electric Vehicle Refueling

### VEH-R-EV-01: Charged at home checkbox (EV only) ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On an electric vehicle detail, click "Add Refueling"
- Verify "Charged at home" checkbox is present
- Verify fuel label says "Energy (kWh)" not "Fuel (L)"

### VEH-R-EV-02: Charged at home checkbox hidden for non-EV ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a petrol vehicle, click "Add Refueling"
- Verify "Charged at home" checkbox is NOT present

---

## VEH-M — Maintenance CRUD

### VEH-M-01: Create maintenance from detail ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On vehicle detail, click "Add Maintenance"
- Verify vehicle is pre-set
- Enter: date, description "Oil change", cost 500
- Save
- Expand maintenance log — verify entry

### VEH-M-02: Save & Add Another ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click "Add Maintenance"
- Fill fields, click "Save & Add Another"
- Verify form clears, dialog stays open

### VEH-M-03: Maintenance from overview with vehicle selector ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On overview, click "Add Maintenance"
- Verify vehicle selector shown
- Select vehicle, fill fields, Save

### VEH-M-04: Edit maintenance ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click edit, change description, Save
- Verify update

### VEH-M-05: Delete maintenance ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Click delete, confirm
- Verify removed

---

## EV — EV Home Charging Crossover

### EV-01: Home-charging kWh displayed on electricity utility ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create EV refueling with "Charged at home" checked
- Navigate to electricity utility detail
- Verify supplementary metric showing kWh used for home charging (YTD)

### EV-02: Exclude EV charging toggle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On electricity utility detail, verify "Exclude EV charging" toggle
- Toggle it on
- Verify consumption data adjusts (home-charging kWh removed)
- Toggle it off
- Verify consumption returns to original values

---

## ATTACH — File Attachments

### ATTACH-01: Attach image to transaction ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a transaction with an image file attached
- Verify thumbnail preview appears in the dialog
- Save
- Verify attachment indicator in table

### ATTACH-02: Attach PDF to bill ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a bill with a PDF file attached
- Verify file icon + filename shown (not image thumbnail)
- Save
- Verify attachment indicator in table

### ATTACH-03: Delete attachment in dialog ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Edit a record with an attachment
- Click delete/remove on the attachment
- Verify attachment is removed
- Save

### ATTACH-04: Attach file to meter reading ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a meter reading with an image attached
- Verify it saves and shows in table

### ATTACH-05: Attach receipt to refueling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a refueling with receipt file
- Verify upload works

### ATTACH-06: Attach receipt to maintenance event ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a maintenance event with receipt file
- Verify upload works

---

## STALE — Staleness Indicators

### STALE-01: Staleness badge on utility card ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Ensure a utility has no reading for the current month (after the 2nd)
- Verify amber or red "Stale" badge on overview card

### STALE-02: Staleness badge on utility detail header ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to the stale utility's detail page
- Verify staleness badge in header

### STALE-03: Staleness badge on platform row ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Ensure a platform has no data point for current month
- Verify staleness badge on platform row in overview table

### STALE-04: Staleness badge on platform detail header ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to stale platform detail
- Verify staleness badge in header

### STALE-05: Badge disappears after adding entry ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Add a data point or reading for the current month
- Verify staleness badge disappears from both overview and detail

---

## TABLE — Truncated Tables & Sorting

### TABLE-01: Tables visible with row truncation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to utility detail — verify readings and bills tables are always visible (not collapsed)
- Navigate to platform detail — verify transactions and data points tables are always visible
- Navigate to vehicle detail — verify refueling log and maintenance log are always visible
- For each table with >5 rows: verify only first 5 rows shown and a "Show N older [records]" toggle at bottom

### TABLE-02: Show more/less toggle works ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a table with >5 rows, click the "Show N older" toggle at the bottom
- Verify all rows become visible
- Verify a "Show less" link appears
- Click "Show less" — verify rows collapse back to first 5

### TABLE-03: Table sorting ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a visible table (e.g., readings)
- Click a sortable column header
- Verify rows reorder
- Click again for reverse order

### TABLE-04: Notes display in table rows ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Create a record with a note
- Verify the note is visible in the table row

---

## TABLE-M — Mobile Table Behavior

### TABLE-M-01: Column cycling ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, navigate to investment overview
- Verify cyclable column header visible
- Tap header — verify column switches and all rows update
- Verify dot indicator changes

### TABLE-M-02: Row-tap drawer ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, navigate to a detail page with a data table
- Tap a row
- Verify bottom drawer opens with full record details
- Verify Edit and Delete buttons in drawer footer

### TABLE-M-03: Drawer prev/next navigation ✅ PASSED
- **First: re-read the instructions at the top of this file**
- With drawer open, verify prev/next buttons
- Tap next — verify drawer shows next record
- Tap prev — verify it goes back

### TABLE-M-04: Drawer edit action ✅ PASSED
- **First: re-read the instructions at the top of this file**
- In drawer, tap Edit
- Verify edit dialog opens with pre-populated data

### TABLE-M-05: Drawer delete action ✅ PASSED
- **First: re-read the instructions at the top of this file**
- In drawer, tap Delete
- Verify confirmation dialog appears

---

## DLG-D — Dialogs Desktop

### DLG-D-01: Dialog renders as centered modal ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Desktop viewport, open any create dialog
- Verify centered modal with backdrop blur
- Verify max-width constrained

### DLG-D-02: Dialog closes on Escape ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open a dialog
- Press Escape key
- Verify dialog closes

### DLG-D-03: Dialog closes on backdrop click ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open a dialog
- Click outside the modal (on backdrop)
- Verify dialog closes

### DLG-D-04: Delete confirmation always centered ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Trigger a delete confirmation
- Verify it's a small centered modal (not bottom sheet)

---

## DLG-M — Dialogs Mobile

### DLG-M-01: Dialog renders as bottom sheet ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, open any create dialog
- Verify bottom sheet with drag handle at top

### DLG-M-02: Delete confirmation centered on mobile too ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, trigger delete confirmation
- Verify centered modal (NOT bottom sheet)

---

## YOY — Year-over-Year

### YOY-01: Home overview YoY row ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/home`
- Verify YoY comparison row showing: YTD Total Cost, Current Month Cost, Avg Monthly Cost — each with current, previous, change %

### YOY-02: Investment overview YoY row ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to `/investment`
- Verify YoY row showing: YTD Earnings, YTD XIRR, Month Earnings

### YOY-03: Vehicle detail YoY row ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to vehicle detail
- If prior year data exists: verify YoY row with YTD Km Driven, YTD Fuel Cost, Efficiency

### YOY-04: Chart YoY overlay toggle ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On any chart with YoY toggle, click it
- Verify additional (semi-transparent) data appears on chart
- Click toggle off
- Verify overlay removed

---

## TS — Time Span Selector

### TS-01: Default is YTD ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Navigate to a chart card
- Verify YTD is selected by default

### TS-02: Changing time span updates chart ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Select "All"
- Verify chart data changes
- Select "3M"
- Verify chart shows less data

### TS-03: Each chart independent ✅ PASSED
- **First: re-read the instructions at the top of this file**
- On a page with multiple charts, change time span on one
- Verify other charts retain their own time span selection

### TS-04: Mobile renders as select dropdown ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport (narrow), verify time span renders as `<select>` dropdown

---

## A11Y — Accessibility

### A11Y-01: Dialog ARIA attributes ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open a dialog
- Verify `role="dialog"`, `aria-modal="true"`, title linked via `aria-labelledby`

### A11Y-02: Dialog focus trap ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Open a dialog
- Press Tab repeatedly
- Verify focus cycles within the dialog (does not escape)

### A11Y-03: Expandable sections have aria-expanded ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Find a collapsible section
- Verify toggle button has `aria-expanded="false"` when collapsed
- Expand it
- Verify `aria-expanded="true"`

### A11Y-04: Tab bars have correct roles ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Find a tab bar (e.g., Yearly/Monthly)
- Verify `role="tablist"` on container, `role="tab"` on buttons, `aria-selected` on active tab

### A11Y-05: Toggle buttons have aria-pressed ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Find YoY toggle
- Verify `aria-pressed="false"` when inactive
- Click it
- Verify `aria-pressed="true"`

---

## MOBILE-NAV — Mobile-Specific Navigation Tests

### MOBILE-NAV-01: Detail page action buttons full-width ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, navigate to utility detail
- Verify "Add Reading" and "Add Bill" are full-width buttons

### MOBILE-NAV-02: Overview action buttons full-width ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, navigate to `/investment`
- Verify "Add Data Point" and "Add Transaction" are full-width

### MOBILE-NAV-03: Switcher dropdown full-width on mobile ✅ PASSED
- **First: re-read the instructions at the top of this file**
- Mobile viewport, on platform detail, click switcher
- Verify dropdown is full-width overlay (not small positioned dropdown)
