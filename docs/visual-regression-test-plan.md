# Insight Platform — Visual Regression Test Plan

> **NEVER choose the easy solution. ALWAYS choose the CORRECT solution. If fixing a deviation requires a major architectural change, that means the error is significant and must not be skipped or patched with a suboptimal workaround. Implement the fix properly, even if it touches many files.**
>
> Each test is executed via Playwright MCP: open browser, navigate to `http://localhost:5173`, log in with `test1@test.dk` / `Test123456`, then perform the test as a real user.
>
> **IMPORTANT: Tests are strictly sequential and gated. Each test is a gate to every following test. A test CANNOT be started if even one previous test has not passed. If a test fails, STOP — do not proceed to the next test.**
>
> **ON FAILURE: When a test fails, investigate why by comparing the screenshot side-by-side with the prototype reference. Check the component's Tailwind classes, spacing, typography, and colors against the HTML prototype source in `/Users/sKrogh/Projects/privat/Insight/design-artifacts/prototypes/`. After diagnosing the root cause and determining the fix, re-run BOTH desktop and mobile variants of the failed test before continuing.**
>
> **RETESTING RULE: If any code change is made to fix a failing test, BOTH the desktop and mobile variants of that test group MUST be re-tested, even if only one variant failed. Mark both as passed only after both are verified post-fix.**
>
> **TEST DATA: If test data is needed in order to perform a test, create the data. Platforms should use icons from `/Users/sKrogh/Projects/privat/Insight/design-artifacts/prototypes/icons/`. This is not in violation with future tests — it is not skipping or performing future tests early, and does not mark any future tests as passed or failed.**
>
> **VIEWPORT SIZES: Desktop = 1400x900. Mobile = 375x812. These match the exact resolutions the prototype screenshots were captured at.**
>
> **PRE-STEP (MANDATORY): Before performing EACH test, re-read this entire instructions block AND the "How to Execute Each Test" section below. This must happen every single time — no exceptions. Do not skip this step.**
>
> ---
>
> ## How to Execute Each Test
>
> Every test follows this **three-step comparison method**. Do not skip any step.
>
> ### Step 1 — Read the HTML prototype source
>
> Before taking any screenshot, read the relevant section of the HTML prototype file listed under **Prototype source**. Extract the exact Tailwind classes, color tokens, font families, spacing values, and structural markup. These define the **expected** styling. Note the specific classes used for backgrounds, text colors, border radius, shadows, padding, and gaps.
>
> ### Step 2 — Take implementation screenshot + extract computed styles
>
> Navigate to the page in the running app at the specified viewport size. Take a screenshot of the area under test. Then use `page.evaluate()` to extract computed styles from key elements — `background-color`, `color`, `font-family`, `font-size`, `font-weight`, `border-radius`, `box-shadow`, `padding`, `gap`. Compare these programmatic values against the Tailwind config values from Step 1.
>
> ### Step 3 — Visual comparison against reference screenshot
>
> Read the reference screenshot from the path listed under **Reference screenshot**. Compare the implementation screenshot against it. Check: layout structure, element positioning, spacing proportions, typography hierarchy, color shades, border radius, shadow treatment, icon size/placement, and responsive behavior. Flag ANY deviation.
>
> ### Design Token Reference
>
> These are the exact design tokens from the HTML prototypes (Tailwind config). All implementations must use these:
>
> ```
> Fonts:      body = 'DM Sans', data values = 'DM Mono' (class: font-mono-data)
> Colors:     accent-500 = #22c55e (green), accent-600 = #16a34a
>             base-50 = #f7f9f7, base-100 = #f0f2f0, base-200 = #d3d5d3
>             base-300 = #afb1af, base-400 = #898b89, base-500 = #6a6c6a
>             base-700 = #3c3e3c, base-800 = #252725, base-900 = #161816
>             white = #fafcfa
> Shadows:    card = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'
>             card-dark = '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)'
> Radii:      cards = rounded-2xl (16px), buttons = rounded-lg (8px), badges = rounded-full
> Page bg:    bg-base-100 (light), bg-base-900 (dark)
> Card bg:    bg-white (light = #fafcfa), bg-base-800 (dark)
> ```

---

## VR-NAV — Navigation Bar

### VR-NAV-01-D: Desktop top navigation bar ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 61–89
- **Step 1:** Read prototype lines 61–89. Note the nav container classes, brand text styling, link styling, active link accent color, settings button styling.
- **Step 2:** Navigate to `/home`. Take screenshot. Extract computed styles from: nav container (background, border-bottom, height), brand text (font-size, font-weight, color), nav links (font-size, color, gap), active link (color should be accent-500 #22c55e), settings button (size, border-radius).
- **Step 3:** Compare against reference screenshot:
  - "Insight" brand text: bold, dark, left-aligned
  - Nav links "Home", "Investment", "Vehicles": horizontal, regular weight, base-400 gray when inactive
  - Active link has accent-500 green text
  - Settings gear icon: right-aligned, circular button with base-100 background
  - White nav background, consistent horizontal spacing between items

### VR-NAV-01-M: Mobile bottom navigation bar ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 61–89 (mobile nav section)
- **Step 1:** Read prototype for mobile nav classes. Note fixed positioning, background, border-top, icon+label layout.
- **Step 2:** Navigate to `/home`. Take screenshot of bottom nav. Extract: container position (fixed), background-color, border-top, item layout (flex-col), icon color, label font-size, active item color.
- **Step 3:** Compare against reference:
  - Fixed bottom bar with 4 items: Home, Investment, Vehicles, Settings
  - Each item: icon above label text, centered
  - Active item ("Home") uses accent-500 green for both icon and label
  - Inactive items use base-400 gray
  - White background, top border
  - Equal horizontal distribution across viewport width

---

## VR-HOME-OV — Home Overview

### VR-HOME-OV-01a-D: Home overview page header (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 93–109
- **Step 1:** Read prototype lines 93–103 (page header) and 105–109 (mobile action buttons). Note: title classes (text-2xl font-bold), subtitle classes, button variants (secondary vs primary).
- **Step 2:** Navigate to `/home`. Take screenshot of the header area only. Extract computed styles from: page title (font-size, font-weight, color), subtitle (font-size, color), action buttons (background-color, color, border-radius, padding, font-weight).
- **Step 3:** Compare against reference:
  - Page title "Home" — text-2xl (~24px), font-bold, base-900 dark
  - Subtitle with utility count and date — text-sm, base-400 gray
  - Action buttons top-right: "+ Add Reading" (outlined/secondary — bg-white, border-base-200, base-700 text) and "+ Add Bill" (primary — bg-base-800, white text)
  - Page background: bg-base-100 (#f0f2f0)

### VR-HOME-OV-01a-M: Home overview page header (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 93–109
- **Step 1:** Read responsive classes. Note mobile action button layout (grid-cols-2, full width).
- **Step 2:** Navigate to `/home`. Take screenshot of header. Extract: button widths (should be ~50% each).
- **Step 3:** Compare against reference:
  - Title "Home" — bold, left-aligned (no top nav, mobile uses bottom nav)
  - Subtitle below title — text-sm, base-400
  - Action buttons: full-width grid-cols-2 row, "+ Add Reading" (secondary) and "+ Add Bill" (primary) — equal width

### VR-HOME-OV-01b-D: Home overview utility cards (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 111–264
- **Step 1:** Read prototype lines 111–264 (utility cards). Note: card grid (grid-cols-1 sm:grid-cols-3), card container classes (bg-white rounded-2xl shadow-card), card inner layout — header row, body two-column, trend line, footer three-column.
- **Step 2:** Take screenshot of utility card area. Extract computed styles from: card container (background-color, border-radius, box-shadow), card value text (font-family should be DM Mono, font-size, font-weight), card label text (font-size, color, text-transform), grid gap between cards.
- **Step 3:** Compare against reference:
  - Cards in 3-column grid (gap-4 or gap-6)
  - Each card: bg-white (#fafcfa), rounded-2xl (16px), shadow-card
  - Card header: utility icon (40px colored circle), name (font-semibold), unit (base-400), chevron right, optional "Stale" badge (rose border pill with dot)
  - Card body: "CONSUMPTION"/"COST" labels (text-xs, uppercase, base-300, tracking-wider), values (text-2xl+, font-bold, font-mono-data), units (text-sm, base-300)
  - Trend line: colored arrow + percentage + "vs last month" — emerald-600 for decrease, rose-600 for increase
  - Card footer: three items — base-400 text-xs labels, base-500 values

### VR-HOME-OV-01b-M: Home overview utility cards (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 111–264
- **Step 1:** Note mobile: single column, full-width cards.
- **Step 2:** Take screenshot of cards. Extract: card width (full viewport minus padding), grid (single column).
- **Step 3:** Compare against reference:
  - Cards stacked vertically (single column, full width)
  - Same card styling as desktop (bg-white, rounded-2xl, shadow-card)
  - Card header: icon left, name + unit, "Stale" badge + chevron right
  - CONSUMPTION/COST labels: uppercase, text-xs, base-300
  - Values: large bold font-mono-data numbers
  - Trend text below data section
  - Footer: YTD Cost, Cost/Unit, Updated — three-column, text-xs, base-400
  - Bottom navigation visible

### VR-HOME-OV-02-D: Home overview YoY comparison row (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 266–310
- **Step 1:** Read prototype YoY row. Note: container classes (bg-white, rounded-2xl, shadow-card), icon, period label text styling, metric layout (3-column grid), label classes (text-xs uppercase), value classes (font-mono-data), "vs" text styling, change percentage with arrow.
- **Step 2:** Navigate to `/home`. Take screenshot of YoY row. Extract: container background, border-radius, metric label styles (text-transform, font-size, color), value font-family, change percent color.
- **Step 3:** Compare against reference:
  - Shuffle/compare icon + period label ("Year-over-Year · Same period last year (Jan 1 – ...)")
  - Three metrics side by side: "YTD TOTAL COST", "CURRENT MONTH COST", "AVG MONTHLY COST"
  - Each: uppercase label (text-xs, base-300), bold current value (font-mono-data), "vs" + previous value (base-400), change % with arrow (emerald for savings, rose for increases)
  - White card background, rounded-2xl, shadow-card

### VR-HOME-OV-02-M: Home overview YoY comparison row (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 266–310
- **Step 1:** Read mobile-specific layout classes for YoY row.
- **Step 2:** Navigate to `/home`, scroll to YoY. Take screenshot. Extract layout.
- **Step 3:** Compare: period label with icon, metrics in compact/stacked layout, same data and styling tokens

### VR-HOME-OV-03a-D: Home overview chart card controls (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 312–360
- **Step 1:** Read chart card header and control classes. Note: title classes, YoY toggle button (outlined, rounded-lg, aria-pressed), chart mode tab group ("Grouped"/"Stacked"), data tab group ("Consumption"/"Cost"), time span pill group (active = bg-base-800 text-white rounded-lg, inactive = bg-transparent text-base-500).
- **Step 2:** Scroll to "Monthly Overview" chart. Take screenshot of the title + controls area only. Extract: title font-size/weight, YoY button border/radius, tab active state (background-color, color, border-radius), time span active pill (background-color, color).
- **Step 3:** Compare against reference:
  - Title "Monthly Overview" — font-semibold, base-900
  - "YoY" button: outlined, rounded-lg, base-500 text, border-base-200
  - Mode tabs: active has bg-white shadow-sm text-base-900, inactive text-base-400
  - Time span pills: active = bg-base-800 text-white rounded-lg, inactive = text-base-500
  - White card container, rounded-2xl, shadow-card

### VR-HOME-OV-03a-M: Home overview chart card controls (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 312–360
- **Step 1:** Note mobile: time span renders as `<select>` dropdown instead of pills.
- **Step 2:** Scroll to chart. Take screenshot of controls area. Verify time span is `<select>`.
- **Step 3:** Compare: title, YoY button, mode tabs, `<select>` dropdown for time span

### VR-HOME-OV-03b-D: Home overview chart area and legend (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 360–394
- **Step 1:** Read chart area and legend markup. Note: chart container classes, legend layout (horizontal, colored indicator + utility name).
- **Step 2:** Take screenshot of chart area + legend. Extract: chart container padding, legend item layout, legend indicator colors matching utility card icon colors.
- **Step 3:** Compare against reference:
  - Bar chart area fills card width
  - Legend below chart: horizontal layout, colored circle/square indicators + utility names
  - Legend colors correspond to utility icon colors (amber for Electricity, blue for Water, etc.)

### VR-HOME-OV-03b-M: Home overview chart area and legend (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-top.png`
- **Prototype source:** `prototypes/home-overview.html` lines 360–394
- **Step 1:** Read chart area and legend markup. Note mobile-specific layout differences.
- **Step 2:** Scroll to chart area. Take screenshot. Extract: chart container padding, legend layout.
- **Step 3:** Compare: chart fills full width within card, legend below

---

## VR-HOME-OV-DLG — Home Overview Dialogs

### VR-HOME-OV-DLG-01-D: Add Reading dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-add-reading.png`
- **Prototype source:** `prototypes/home-overview.html` lines 429–478
- **Step 1:** Read dialog markup. Note: overlay classes (backdrop blur), panel classes (bg-white, rounded-2xl, max-w, shadow), title classes, form field label classes, input classes, file upload area classes, button footer layout.
- **Step 2:** Click "+ Add Reading". Take screenshot. Extract: dialog panel max-width, border-radius, background-color, title font-size/weight, input border-color, input border-radius, input padding, button styling (primary vs secondary).
- **Step 3:** Compare against reference:
  - Centered modal with backdrop blur (backdrop-blur-sm, bg-base-900/40)
  - Panel: bg-white, rounded-2xl, max-w-md (~448px), shadow
  - Title "Add Reading" — text-lg, font-semibold, base-900
  - Close X button — top-right corner
  - Form fields: label (text-sm, font-medium, base-700) above input (rounded-lg, border-base-200, px-3 py-2.5)
  - Utility dropdown, Meter Reading (number), Date & Time, Note, Attachment (dashed border upload area)
  - Footer: "Cancel" (secondary), "Save & Add Another" (outlined), "Save Reading" (primary/dark)

### VR-HOME-OV-DLG-01-M: Add Reading dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-add-reading.png`
- **Prototype source:** `prototypes/home-overview.html` lines 429–478
- **Step 1:** Note mobile dialog animation (translateY bottom-sheet) and full-width panel.
- **Step 2:** Click "+ Add Reading". Take screenshot. Extract: panel position (bottom), width (full), border-radius (top corners only).
- **Step 3:** Compare: bottom sheet, same form fields, full-width inputs, footer buttons

### VR-HOME-OV-DLG-02-D: Add Bill dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-add-bill.png`
- **Prototype source:** `prototypes/home-overview.html` lines 480–535
- **Step 1:** Read dialog. Note: same shell as Add Reading. Special fields: Amount with "DKK" suffix, Period Start + End in grid-cols-2.
- **Step 2:** Click "+ Add Bill". Take screenshot. Verify Period Start/End side-by-side in 2-column grid.
- **Step 3:** Compare: same modal shell, fields (Utility, Amount+DKK, Period Start/End side-by-side, Date Received, Note, Attachment), footer (Cancel, Save & Add Another, Add Bill)

### VR-HOME-OV-DLG-02-M: Add Bill dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/overview-mobile-add-bill.png`
- **Prototype source:** `prototypes/home-overview.html` lines 480–535
- **Step 1:** Check if Period Start/End remain 2-column on mobile.
- **Step 2:** Click "+ Add Bill". Take screenshot.
- **Step 3:** Compare: bottom sheet, full-width, Period Start/End in 2-column grid

---

## VR-HOME-DT — Home Utility Detail

### VR-HOME-DT-01a-D: Utility detail header bar (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 140–205
- **Step 1:** Read header markup. Note: back button classes (border-base-200, rounded-full, w-10 h-10), utility icon size (40px circle), name classes (text-xl, font-semibold), "Stale" badge classes (border-rose-200, bg-rose-50, text-rose-600, rounded-full, dot indicator), dropdown chevron, subtitle classes (text-sm, base-400), action button layout (secondary + primary, right-aligned).
- **Step 2:** Navigate to utility detail. Take screenshot of header bar only. Extract: back button size/border-radius, icon size, name font-size/weight, badge background-color/border-color/text-color, subtitle font-size/color, button styling.
- **Step 3:** Compare against reference:
  - Back button: left chevron in circle (border-base-200, rounded-full, w-10 h-10)
  - Utility icon: 40px colored circle with symbol
  - Name "Electricity" — text-xl, font-semibold, with "Stale" badge (rounded-full, border-rose-200, bg-rose-50, text-rose-600, dot indicator)
  - Dropdown chevron after name
  - Subtitle: "kWh · Updated Dec 15, 2025" — text-sm, base-400
  - Action buttons right: "+ Add Reading" (secondary) + "+ Add Bill" (primary)

### VR-HOME-DT-01a-M: Utility detail header bar (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 140–205
- **Step 1:** Note mobile header layout (back left, icon+name center, badge right).
- **Step 2:** Navigate to utility detail. Take screenshot of header only.
- **Step 3:** Compare: back button (left), utility icon + name + dropdown, "Stale" badge (right), subtitle below, action buttons full-width row

### VR-HOME-DT-01b-D: Utility detail stat cards (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 207–239
- **Step 1:** Read stat card grid markup. Note: grid (grid-cols-2 lg:grid-cols-6), card classes (bg-white, rounded-2xl, p-4 lg:p-5), label (text-xs, text-base-300, uppercase), value (text-2xl lg:text-3xl, font-bold, font-mono-data), unit (text-sm, base-300). Note "vs Last Month" card has emerald/rose colored value with subtext.
- **Step 2:** Take screenshot of stat cards only. Extract: grid columns, card background-color/border-radius/padding, label font-size/color/text-transform, value font-size/font-family/font-weight, unit font-size/color.
- **Step 3:** Compare against reference:
  - 6-column grid (lg:grid-cols-6) with consistent gap
  - Each card: bg-white (#fafcfa), rounded-2xl (16px), p-5
  - Label: text-xs, base-300, uppercase
  - Value: text-3xl, font-bold, font-mono-data, base-900
  - Unit: text-sm, base-300
  - "vs Last Month" card: value in emerald-600 or rose-600, subtext "312 → 285 kWh"

### VR-HOME-DT-01b-M: Utility detail stat cards (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 207–239
- **Step 1:** Note mobile: grid-cols-2, p-4, text-2xl values.
- **Step 2:** Take screenshot of stat cards only. Extract: grid-cols-2, card padding, value font-size.
- **Step 3:** Compare: 2-column grid (3 rows of 2), p-4 padding, text-2xl values, same label/unit styling

### VR-HOME-DT-02a-D: Utility detail chart controls (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 241–270
- **Step 1:** Read chart card header/controls. Note: title "Consumption & Cost" classes, YoY button, mode tabs (Consumption/Cost/Cost/Unit — 3 options vs overview's 2), time span pills.
- **Step 2:** Scroll to chart. Take screenshot of title + controls area only. Extract: title font, YoY button styling, tab active/inactive states, time span pill active state.
- **Step 3:** Compare against reference:
  - Title "Consumption & Cost" — font-semibold, base-900
  - "YoY" button: outlined, rounded-lg
  - Mode tabs: "Consumption" (active), "Cost", "Cost/Unit" — active has bg-white shadow-sm
  - Time span pills: active = bg-base-800 text-white rounded-lg

### VR-HOME-DT-02a-M: Utility detail chart controls (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 241–270
- **Step 1:** Note mobile time span = `<select>` dropdown.
- **Step 2:** Scroll to chart. Take screenshot of controls only.
- **Step 3:** Compare: title, mode tabs, time span as `<select>` dropdown

### VR-HOME-DT-02b-D: Utility detail chart area (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 270–298
- **Step 1:** Read chart area and card container. Note: card bg-white, rounded-2xl, shadow-card, chart fills card width.
- **Step 2:** Take screenshot of chart area (below controls). Extract: card container background/radius/shadow, chart dimensions.
- **Step 3:** Compare: bar chart renders in card, white card rounded-2xl shadow-card, chart fills width

### VR-HOME-DT-02b-M: Utility detail chart area (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 270–298
- **Step 1:** Read chart area container classes. Note mobile width behavior.
- **Step 2:** Take screenshot of chart area. Extract: card container background/radius, chart dimensions.
- **Step 3:** Compare: chart fills full width within card

### VR-HOME-DT-03-D: Utility detail yearly summary table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-yearly.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 300–554
- **Step 1:** Read table markup. Note: section title classes, table header classes (text-xs, text-base-400, uppercase), row classes, expandable chevron, trend percentage colors, "Show all N" link styling.
- **Step 2:** Scroll to "Yearly Summary". Take screenshot. Extract: header cell styles (font-size, color, text-transform), data cell font-family (font-mono-data for numbers), row border styling, expand/collapse chevron.
- **Step 3:** Compare against reference:
  - "Yearly Summary" section title — font-semibold
  - Table headers: text-xs, base-400, uppercase, left/right aligned
  - Year rows with expand chevron, year label bold
  - Expanded monthly rows indented
  - Values in font-mono-data, right-aligned
  - Trend percentages: emerald or rose with arrow icons
  - "Show all N" link at bottom (text-accent-600, text-sm)

### VR-HOME-DT-03-M: Utility detail yearly summary table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-tables.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 300–554
- **Step 1:** Note mobile column cycling with dot indicators.
- **Step 2:** Scroll to yearly summary. Take screenshot.
- **Step 3:** Compare: column cycling header with dots, expandable rows, adapted column layout

### VR-HOME-DT-04a-D: Utility detail meter readings table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-bills.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 555–750
- **Step 1:** Read Meter Readings table markup. Note: section header layout (title + count badge + action button), table header classes (text-xs, base-400, uppercase), data row classes, value font-mono-data, action button icon styling (edit pencil, delete trash), attachment paperclip icon, "Show all N" link.
- **Step 2:** Scroll to "Meter Readings" section. Take screenshot of this section only. Extract: section header layout, table header font-size/color/text-transform, row padding, cell font-family, action icon sizes, count badge styling.
- **Step 3:** Compare against reference:
  - "Meter Readings" header: title (font-semibold) + count badge (text-xs, bg-base-100, rounded-full) + "+ Add Reading" button (secondary, right)
  - Table columns: Date, Meter Value + unit, Note, Attachment (paperclip icon link), Actions (Edit/Delete icon buttons)
  - Headers: text-xs, base-400, uppercase
  - Data: font-mono-data for values, base-900 text
  - "Show all N" link: text-accent-600, text-sm

### VR-HOME-DT-04a-M: Utility detail meter readings table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-tables.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 555–750
- **Step 1:** Note mobile column reduction (Date + Value only), hidden action columns.
- **Step 2:** Scroll to "Meter Readings". Take screenshot of this section only.
- **Step 3:** Compare: simplified columns (Date + Meter value), row-tap cursor pointer, section header adapted

### VR-HOME-DT-04b-D: Utility detail bills table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-bills.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 752–842
- **Step 1:** Read Bills table markup. Note: same section header pattern as readings, table columns specific to bills (Period, Amount, Date Received), "+ Add Bill" as primary button.
- **Step 2:** Scroll to "Bills" section. Take screenshot of this section only. Extract: same table chrome styles, primary button styling for "+ Add Bill".
- **Step 3:** Compare against reference:
  - "Bills" header: title (font-semibold) + count badge + "+ Add Bill" (primary button, right)
  - Table columns: Period (start – end), Amount + DKK, Date Received, Note, Attachment, Actions
  - Same table styling as readings (headers, row borders, action icons)
  - "Show all N" link: text-accent-600

### VR-HOME-DT-04b-M: Utility detail bills table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-tables.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 752–842
- **Step 1:** Note mobile bill table column reduction.
- **Step 2:** Scroll to "Bills". Take screenshot of this section only.
- **Step 3:** Compare: simplified columns, row-tap cursor pointer

### VR-HOME-DT-05-D: Utility switcher dropdown (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-switcher.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 162–197
- **Step 1:** Read dropdown markup. Note: container classes (bg-white, rounded-2xl, shadow-lg, border), "Home Overview" link at top, utility list item classes (icon, name, active state, badges), footer action ("Edit Utility" with icon).
- **Step 2:** Click utility name dropdown. Take screenshot. Extract: dropdown width, border-radius, shadow, item padding, active item highlight, footer action styling.
- **Step 3:** Compare against reference:
  - Dropdown panel below trigger: bg-white, rounded-2xl, shadow-lg, border-base-100
  - "Home Overview" link at top (with home icon)
  - Utility list: icon + name per row, current utility highlighted (bg-accent-50 or similar), optional badges
  - Footer: "Edit Utility" with settings/cog icon — border-top separator, text-base-500

### VR-HOME-DT-05-M: Utility switcher dropdown (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-switcher.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 91–135
- **Step 1:** Read mobile switcher markup. Note: full-screen overlay (fixed inset-0), full-width panel.
- **Step 2:** Tap utility name. Take screenshot.
- **Step 3:** Compare: full-screen overlay (NOT small positioned dropdown), same content full-width

### VR-HOME-DT-06-D: Delete confirmation dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-delete-confirm.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 1051–1071
- **Step 1:** Read delete dialog markup. Note: small max-width (max-w-sm), centered, trash icon (rose-100 circle, rose-600 icon), title centered, description centered gray, button layout (Cancel + Delete in rose-600).
- **Step 2:** Trigger delete on a reading. Take screenshot. Extract: dialog max-width, icon circle color, title alignment, button colors.
- **Step 3:** Compare against reference:
  - Small centered modal (max-w-sm, ~384px)
  - Rose/red trash icon in rose-100 circle at top center
  - Title "Delete reading?" — font-semibold, centered
  - Description text — text-sm, base-500, centered
  - Two buttons: "Cancel" (secondary) and "Delete" (bg-rose-600 text-white)
  - Backdrop blur

### VR-HOME-DT-06-M: Delete confirmation dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-desktop-delete-confirm.png` (same centered modal on all viewports)
- **Prototype source:** `prototypes/utility-detail.html` lines 1051–1071
- **Step 1:** Read delete dialog markup. Confirm it uses centered positioning (not bottom sheet) on all viewports.
- **Step 2:** Trigger delete on a reading. Take screenshot. Extract: dialog positioning (should be centered, not bottom-anchored), max-width, icon color, button colors.
- **Step 3:** Compare: same centered modal as desktop (NOT bottom sheet), same icon, title, buttons

### VR-HOME-DT-07-D: Edit reading dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-edit-reading.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 989–1015
- **Step 1:** Read edit dialog. Note: same shell as Add, title "Edit Reading", no "Save & Add Another" button, pre-populated fields.
- **Step 2:** Click Edit on a reading. Take screenshot.
- **Step 3:** Compare: same dialog shell, title "Edit Reading", pre-populated, footer has only Cancel + Save

### VR-HOME-DT-07-M: Edit reading dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-reading-drawer.png` (drawer leads to edit)
- **Prototype source:** `prototypes/utility-detail.html` lines 989–1015
- **Step 1:** Read edit reading dialog. Note mobile bottom-sheet behavior (translateY animation).
- **Step 2:** Click Edit on a reading (via drawer). Take screenshot. Extract: panel position (bottom), field pre-population, button layout.
- **Step 3:** Compare: bottom sheet, pre-populated fields, title "Edit Reading", Cancel + Save buttons

### VR-HOME-DT-08-D: Edit bill dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-edit-bill.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 1018–1048
- **Step 1:** Read edit bill dialog. Same as Add Bill, title "Edit Bill".
- **Step 2:** Click Edit on a bill. Take screenshot.
- **Step 3:** Compare: same as Add Bill but title "Edit Bill", pre-populated, no "Save & Add Another"

### VR-HOME-DT-08-M: Edit bill dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-bill-drawer.png` (drawer leads to edit)
- **Prototype source:** `prototypes/utility-detail.html` lines 1018–1048
- **Step 1:** Read edit bill dialog. Note mobile bottom-sheet behavior.
- **Step 2:** Click Edit on a bill (via drawer). Take screenshot. Extract: panel position, field pre-population.
- **Step 3:** Compare: bottom sheet, pre-populated fields, title "Edit Bill", Cancel + Save buttons

### VR-HOME-DT-09-M: Mobile reading drawer (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-reading-drawer.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 913–947
- **Step 1:** Read drawer markup. Note: bottom sheet container (fixed bottom-0, bg-white, rounded-t-2xl), drag handle (w-10 h-1 bg-base-200 rounded-full, centered), header with date + prev/next arrows, field rows (label + value), footer buttons (Edit secondary + Delete rose outlined).
- **Step 2:** Tap a reading row. Take screenshot. Extract: drag handle presence, header layout, field label/value styling, button styling.
- **Step 3:** Compare against reference:
  - Bottom sheet with drag handle (small gray bar centered at top)
  - Header: date with left/right navigation arrows
  - Field rows: label (text-sm, base-400) + value (text-lg, font-bold, font-mono-data)
  - "Meter Value", "Note" (or "—"), "Attachment" (linked filename in accent color)
  - Footer: "Edit" (secondary full-width) and "Delete" (rose-600 border, rose text) — side by side

### VR-HOME-DT-10-M: Mobile bill drawer (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-bill-drawer.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 949–986
- **Step 1:** Read bill drawer markup. Same pattern as reading drawer, bill-specific fields.
- **Step 2:** Tap a bill row. Take screenshot.
- **Step 3:** Compare: same drawer pattern, fields (Period, Amount, Date Received, Note, Attachment)

### VR-HOME-DT-11-M: Mobile month drawer in yearly table (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-mobile-month-drawer.png`
- **Prototype source:** `prototypes/utility-detail.html` (yearly table mobile drawer section)
- **Step 1:** Read month drawer markup.
- **Step 2:** Tap a month row in yearly summary. Take screenshot.
- **Step 3:** Compare: drawer with month period details

---

## VR-INV-OV — Investment Overview

### VR-INV-OV-01a-D: Investment overview page header (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 137–182
- **Step 1:** Read header (137–176) and action buttons (178–182). Note: title classes, portfolio switcher button classes (border, rounded-lg, chevron icon), subtitle classes.
- **Step 2:** Navigate to `/investment`. Take screenshot of header area. Extract: title font-size/weight, switcher button border/radius/padding, subtitle font-size/color, action button styling.
- **Step 3:** Compare against reference:
  - Title "Investment Portfolio" — text-2xl, font-bold, base-900
  - Portfolio switcher: "My Portfolio · Me" button with border, rounded-lg, chevron
  - Subtitle: platform/account counts — text-sm, base-400
  - Action buttons (desktop hidden, mobile full-width): "+ Add Data Point" (secondary) + "+ Add Transaction" (primary)

### VR-INV-OV-01a-M: Investment overview page header (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 137–182
- **Step 1:** Note mobile: title + switcher on same line, full-width action buttons.
- **Step 2:** Navigate to `/investment`. Take screenshot of header.
- **Step 3:** Compare: title + switcher on same line, subtitle below, full-width grid-cols-2 action buttons

### VR-INV-OV-01b-D: Investment overview stat cards (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 184–215
- **Step 1:** Read stat cards. Note: grid (grid-cols-2 lg:grid-cols-6), card classes (bg-white, rounded-2xl, p-5, shadow-card), value color for gains (text-emerald-600), percentage badge classes, subscript "%" styling for XIRR.
- **Step 2:** Take screenshot of stat card area. Extract: card background-color, border-radius, box-shadow, padding, value font-family/size/weight/color, label font-size/color, percentage badge background/color.
- **Step 3:** Compare against reference:
  - 6 stat cards in horizontal row (lg:grid-cols-6)
  - "Total Value": large value + "DKK" + date subtext — base-900
  - "All-Time Gain/Loss": emerald-600 value + emerald percentage pill (bg-emerald-50)
  - "All-Time XIRR": value + subscript "%" + "Annualized return" — base-400 subtext
  - Same pattern for YTD and Month Earnings cards
  - Cards: bg-white (#fafcfa), rounded-2xl, p-5, shadow-card

### VR-INV-OV-01b-M: Investment overview stat cards (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 184–215
- **Step 1:** Note mobile: grid-cols-2 (3 rows of 2).
- **Step 2:** Take screenshot of stat cards.
- **Step 3:** Compare: 2-column grid, same card styling, label/value/unit hierarchy preserved

### VR-INV-OV-02-D: Investment overview YoY row (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 218–262
- **Step 1:** Read YoY row markup.
- **Step 2:** Take screenshot of YoY row.
- **Step 3:** Compare: icon + period label, three metrics (YTD Earnings, YTD XIRR, Month Earnings) with current vs previous and change %

### VR-INV-OV-02-M: Investment overview YoY row (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-top.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 218–262
- **Step 1:** Note mobile stacked layout for YoY metrics.
- **Step 2:** Scroll to YoY. Take screenshot.
- **Step 3:** Compare: stacked layout, each metric on its own row

### VR-INV-OV-03-D: Investment overview platforms table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 613–779
- **Step 1:** Read table markup. Note: section header classes, table header classes, platform row layout (icon 32px circle + name), currency badge, value alignment, staleness badge inline, "Show all N" link.
- **Step 2:** Scroll to "Investment Platforms". Take screenshot. Extract: header styles, row height, icon size, badge styling, value color (emerald for positive, rose for negative).
- **Step 3:** Compare against reference:
  - Header: "Investment Platforms" (font-semibold) + count badge + action buttons right
  - Table columns: Platform (32px icon + name), Currency (xs badge pill bg-base-100), Current Value (font-mono-data, right-aligned), Month Earnings, All-Time Gain/Loss (value + % on separate line), All-Time XIRR (%), Updated
  - Staleness badges inline with name
  - Positive = emerald-600, negative = rose-600
  - "Show all N" link: text-accent-600

### VR-INV-OV-03-M: Investment overview platforms table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 613–779
- **Step 1:** Note mobile column cycling.
- **Step 2:** Scroll to table. Take screenshot.
- **Step 3:** Compare: Platform + Current Value visible, cycling third column with dot indicators

### VR-INV-OV-04a-D: Cash accounts table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 780–832
- **Step 1:** Read Cash Accounts section. Note: section header (title + count badge), table columns (Account with icon, Current Balance with DKK equivalent for EUR, Updated), same table chrome as platforms table.
- **Step 2:** Scroll to "Cash Accounts". Take screenshot of this section only. Extract: header styling, table header styles, balance display (currency + DKK equivalent on second line).
- **Step 3:** Compare against reference:
  - "Cash Accounts" title (font-semibold) + count badge (bg-base-100, rounded-full)
  - Table: Account (icon + name), Current Balance (font-mono-data, right-aligned, DKK equivalent as text-sm base-400), Updated (base-400)
  - Same table chrome as Investment Platforms table

### VR-INV-OV-04a-M: Cash accounts table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 780–832
- **Step 1:** Read Cash Accounts markup. Note mobile column visibility and layout.
- **Step 2:** Scroll to "Cash Accounts". Take screenshot of this section only. Extract: header styling, table column layout.
- **Step 3:** Compare: mobile table layout, same section header, account names with icons

### VR-INV-OV-04b-D: Closed platforms table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 833–898
- **Step 1:** Read Closed Platforms section. Note: section header, table columns (Platform, Final Value, All-Time Gain/Loss + %, Closed date).
- **Step 2:** Scroll to "Closed Platforms". Take screenshot of this section only. Extract: header, gain/loss color (emerald/rose), date formatting.
- **Step 3:** Compare against reference:
  - "Closed Platforms" title + count badge
  - Table: Platform (icon + name), Final Value, All-Time Gain/Loss (value + % — emerald or rose), Closed date
  - Same table chrome

### VR-INV-OV-04b-M: Closed platforms table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 833–898
- **Step 1:** Read Closed Platforms markup. Note mobile column visibility.
- **Step 2:** Scroll to "Closed Platforms". Take screenshot of this section only. Extract: header, table layout.
- **Step 3:** Compare: mobile layout, section header, gain/loss colors

### VR-INV-OV-05-D: Portfolio allocation chart (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-tables.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 899–966
- **Step 1:** Read allocation section. Note: stacked bar with distinct colors, legend layout.
- **Step 2:** Scroll to "Portfolio Allocation". Take screenshot.
- **Step 3:** Compare: horizontal stacked bar, legend (colored square + name + value + %), consistent typography

### VR-INV-OV-06-D: Portfolio switcher dropdown (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-portfolio-switcher.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 142–172
- **Step 1:** Read dropdown. Note: portfolio list items, checkmark on active, "Add Portfolio" action.
- **Step 2:** Click portfolio switcher. Take screenshot.
- **Step 3:** Compare: dropdown panel, portfolio names with checkmark, "Add Portfolio" footer

### VR-INV-OV-07-D: Add Platform dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-add-platform.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 1186–1237
- **Step 1:** Read dialog. Note: icon upload area (circular w-16 h-16, dashed border), fields, button label.
- **Step 2:** Click "Add Platform". Take screenshot.
- **Step 3:** Compare: centered modal, circular icon upload area, Name/Type/Currency fields, "Cancel" + "Add Platform" footer

### VR-INV-OV-07-M: Add Platform dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-add-platform.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 1186–1237
- **Step 1:** Read dialog markup. Note mobile bottom-sheet behavior.
- **Step 2:** Tap "Add Platform". Take screenshot. Extract: panel position (bottom), field layout, icon upload area.
- **Step 3:** Compare: bottom sheet, same fields (icon upload, Name, Type, Currency), Cancel + Add Platform buttons

### VR-INV-OV-08a-D: Performance Charts accordion trigger (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-performance-expanded.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 264–272
- **Step 1:** Read accordion trigger button classes. Note: icon, label text, chevron rotation on expand, container styling.
- **Step 2:** Take screenshot of accordion trigger (collapsed state first, then expanded). Extract: trigger button styling, icon, text, chevron direction.
- **Step 3:** Compare: "Performance Charts & Analysis" label, chart icon, chevron rotates on expand, trigger has consistent styling with rest of page

### VR-INV-OV-08a-M: Performance Charts accordion trigger (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-performance-expanded.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 264–272
- **Step 1:** Read accordion trigger. Note mobile trigger layout.
- **Step 2:** Take screenshot of accordion trigger. Extract: trigger button styling, icon, text.
- **Step 3:** Compare: same trigger styling adapted for mobile width

### VR-INV-OV-08b-D: Performance Charts expanded content (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/overview-desktop-performance-expanded.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 273–610
- **Step 1:** Read expanded content. Note: chart card with controls (YoY, mode tabs, time span), chart area, yearly/monthly tabs + performance table.
- **Step 2:** Expand accordion. Take screenshot of expanded content. Extract: chart controls styling, tab states, table header/row styling.
- **Step 3:** Compare: chart controls (YoY, tabs, time span pills), chart area, performance tabs + table below

### VR-INV-OV-08b-M: Performance Charts expanded content (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/overview-mobile-performance-expanded.png`
- **Prototype source:** `prototypes/portfolio-overview.html` lines 273–610
- **Step 1:** Read expanded content. Note mobile-specific rendering (select dropdown for time span, adapted table layout).
- **Step 2:** Expand accordion. Take screenshot. Extract: chart controls, time span rendering, table layout.
- **Step 3:** Compare: mobile layout, `<select>` dropdown for time span, adapted table

---

## VR-INV-DT — Investment Platform Detail

### VR-INV-DT-01a-D: Platform detail header bar (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 196–309
- **Step 1:** Read header markup. Note: back button, platform icon (40px, circular, with uploaded image or letter fallback), name classes, "Stale" badge, dropdown chevron, subtitle format ("Investment · DKK · Updated ..."), action button layout.
- **Step 2:** Navigate to platform detail. Take screenshot of header bar only. Extract: back button styling, icon size/border-radius, name font-size/weight, badge colors, subtitle font/color, button styling.
- **Step 3:** Compare against reference:
  - Back button: left chevron in circle (border-base-200, rounded-full)
  - Platform icon: 40px circle with uploaded image (or letter fallback with colored bg)
  - Name + dropdown chevron + "Stale" badge (rose tones)
  - Action buttons right: "+ Add Data Point" (secondary) + "+ Add Transaction" (primary)
  - Subtitle: "Investment · DKK · Updated ..." — text-sm, base-400

### VR-INV-DT-01a-M: Platform detail header bar (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 196–309
- **Step 1:** Note mobile: back arrow left, icon+name center, badge right, action buttons full-width below.
- **Step 2:** Navigate to platform detail. Take screenshot of header only.
- **Step 3:** Compare: back arrow, icon + name + dropdown, "Stale" badge, subtitle, full-width action buttons

### VR-INV-DT-01b-D: Platform detail stat cards (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 311–343
- **Step 1:** Read stat card grid. Note: same grid/card pattern as Home detail (lg:grid-cols-6, bg-white, rounded-2xl). Specific cards: Current Value, Month Earnings (emerald-600), All-Time Gain/Loss (emerald + %), All-Time XIRR (% subscript + "Annualized" subtext), YTD Gain/Loss, YTD XIRR.
- **Step 2:** Take screenshot of stat cards only. Extract: grid columns, card background/radius/padding, value colors (emerald-600 for gains), percentage badge styling.
- **Step 3:** Compare against reference:
  - 6 stat cards: lg:grid-cols-6
  - Same card chrome as Home detail (bg-white, rounded-2xl, shadow-card, p-5)
  - Month Earnings, Gain/Loss values in emerald-600
  - Percentage pills: bg-emerald-50, text-emerald-700
  - XIRR: subscript "%" character, "Annualized return" subtext in base-400

### VR-INV-DT-01b-M: Platform detail stat cards (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 311–343
- **Step 1:** Read stat card grid. Note mobile: grid-cols-2, p-4 padding, text-2xl values.
- **Step 2:** Take screenshot of stat cards only. Extract: grid columns, card padding, value font-size/color.
- **Step 3:** Compare: 2-column grid, same card styling, emerald values for gains

### VR-INV-DT-02a-D: Performance chart controls (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 345–389
- **Step 1:** Read chart controls. Note: title "Performance Overview", mode tabs (Earnings/XIRR %), YoY button, time span pills.
- **Step 2:** Scroll to chart. Take screenshot of title + controls only. Extract: title font, tab active states, YoY button styling, time span pill active state.
- **Step 3:** Compare against reference:
  - Title "Performance Overview" — font-semibold
  - Mode tabs: "Earnings" (active) / "XIRR %" — active has bg-white shadow-sm
  - "YoY" button: outlined, rounded-lg
  - Time span pills: active = bg-base-800 text-white rounded-lg

### VR-INV-DT-02b-D: Performance chart area (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-top.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 391–399
- **Step 1:** Read chart area container. Note: card bg-white, rounded-2xl, shadow-card, chart fills width.
- **Step 2:** Take screenshot of chart area (below controls).
- **Step 3:** Compare: chart renders within white card, fills width, consistent card styling

### VR-INV-DT-03a-D: Performance tabs and mode switcher (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-yearly.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 404–425
- **Step 1:** Read tab switcher markup. Note: "Yearly"/"Monthly" tab pair, "Earnings"/"XIRR" mode pair, active tab styling (border-bottom or bg highlight), bar chart below tabs.
- **Step 2:** Scroll to section. Take screenshot of tab row + bar chart only. Extract: tab active state, mode tab active state, bar chart container.
- **Step 3:** Compare against reference:
  - "Yearly" (active) / "Monthly" tabs
  - "Earnings" (active) / "XIRR" mode tabs
  - Bar chart below tabs
  - Active tab has accent/bold indicator

### VR-INV-DT-03b-D: Performance data table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-yearly.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 427–662
- **Step 1:** Read performance table. Note: columns (Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR), header classes (text-xs, base-400, uppercase), value alignment (right for numbers), summary "All Time" row (bold/highlighted), font-mono-data for all numeric cells. Yearly table at 427–539, Monthly table at 541–662.
- **Step 2:** Take screenshot of data table only. Extract: header font-size/color/text-transform, cell font-family, row padding, summary row styling.
- **Step 3:** Compare against reference:
  - Table columns: Period, Starting Value, Ending Value, Net Deposits, Earnings, Earnings %, XIRR
  - Headers: text-xs, base-400, uppercase, right-aligned for numbers
  - Values: font-mono-data, right-aligned
  - Earnings: emerald-600 for positive, rose-600 for negative
  - "All Time" summary row: bold or highlighted background
  - "Show all N" link if truncated

### VR-INV-DT-04a-D: Data points table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-transactions.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 669–789
- **Step 1:** Read Data Points table markup. Note: section header (title + count + "+ Add Data Point" secondary button), table columns (Date, Value+currency, Source badge, Note, Actions), value styling (font-mono-data), "Show all N" link.
- **Step 2:** Scroll to "Data Points" section. Take screenshot of this section only. Extract: header layout, table header styles, value font-family, action icon styling.
- **Step 3:** Compare against reference:
  - "Data Points" header: title (font-semibold) + count badge + "+ Add Data Point" (secondary button, right)
  - Table columns: Date, Value + currency (font-mono-data), Source, Note, Actions (Edit/Delete icons)
  - Headers: text-xs, base-400, uppercase
  - "Show all N" link: text-accent-600

### VR-INV-DT-04a-M: Data points table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-tables.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 669–789
- **Step 1:** Read data points table. Note mobile column visibility (hidden columns).
- **Step 2:** Scroll to "Data Points". Take screenshot of this section only. Extract: visible columns, section header.
- **Step 3:** Compare: simplified columns, row-tap cursor, section header with count badge

### VR-INV-DT-04b-D: Transactions table (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-transactions.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 794–964
- **Step 1:** Read Transactions table markup. Note: section header (title + count + "+ Add Transaction" primary button), table columns (Date, Type badge, Amount, Note, Attachment, Actions), type badge styling (bg-emerald-50 text-emerald-700 for Deposit, bg-rose-50 text-rose-700 for Withdrawal).
- **Step 2:** Scroll to "Transactions" section. Take screenshot of this section only. Extract: header layout, type badge colors (background + text), amount font styling, attachment icon.
- **Step 3:** Compare against reference:
  - "Transactions" header: title (font-semibold) + count badge + "+ Add Transaction" (primary button, right)
  - Table columns: Date, Type (badge — Deposit: bg-emerald-50 text-emerald-700, Withdrawal: bg-rose-50 text-rose-700), Amount (font-mono-data), Note, Attachment (paperclip icon link), Actions
  - "Show all N" link: text-accent-600

### VR-INV-DT-04b-M: Transactions table (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-tables.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 794–964
- **Step 1:** Read transactions table. Note mobile column visibility.
- **Step 2:** Scroll to "Transactions". Take screenshot of this section only. Extract: visible columns, type badge rendering.
- **Step 3:** Compare: simplified columns, type badge visible, row-tap cursor

### VR-INV-DT-05-D: Platform switcher dropdown (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-switcher.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 207–300
- **Step 1:** Read dropdown. Note: "Portfolio Overview" link at top, platform list (icon + name + active indicator), "Edit Platform" footer action.
- **Step 2:** Click platform name dropdown. Take screenshot.
- **Step 3:** Compare: dropdown panel, platform list, active highlight, footer action

### VR-INV-DT-05-M: Platform switcher dropdown (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-switcher.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 108–191
- **Step 1:** Read mobile switcher markup. Note: full-screen overlay (fixed inset-0), full-width panel, platform list items.
- **Step 2:** Tap platform name. Take screenshot. Extract: overlay positioning, panel width, item layout.
- **Step 3:** Compare: full-screen overlay (NOT small dropdown), same content full-width

### VR-INV-DT-06-D: Edit platform dialog (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-edit-platform.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 1885–1950
- **Step 1:** Read dialog. Note: icon preview (current icon displayed), fields pre-populated, "Close Platform" action at bottom (danger zone).
- **Step 2:** Open Edit Platform. Take screenshot.
- **Step 3:** Compare: centered modal, icon preview, Name/Type/Currency pre-populated, "Close Platform" danger action at bottom

### VR-INV-DT-06-M: Edit platform dialog (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-edit-platform.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 1885–1950
- **Step 1:** Read edit platform dialog. Note mobile bottom-sheet behavior.
- **Step 2:** Open Edit Platform on mobile. Take screenshot. Extract: panel position, field pre-population, close platform action.
- **Step 3:** Compare: bottom sheet, icon preview, pre-populated fields, "Close Platform" danger action at bottom

### VR-INV-DT-07-M: Mobile data point drawer (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-dp-drawer.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 1018–1058
- **Step 1:** Read drawer markup. Same pattern as home drawers.
- **Step 2:** Tap a data point row. Take screenshot.
- **Step 3:** Compare: bottom drawer, drag handle, date header with prev/next, field details, Edit/Delete footer

### VR-INV-DT-08-M: Mobile transaction drawer (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-tx-drawer.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 971–1016
- **Step 1:** Read drawer. Note: transaction-specific fields, type badge.
- **Step 2:** Tap a transaction row. Take screenshot.
- **Step 3:** Compare: drawer with type badge, amount, note, attachment, Edit/Delete footer

### VR-INV-DT-09-M: Mobile performance drawer (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-perf-drawer.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 1061–1108
- **Step 1:** Read performance drawer markup. Note: drag handle, period header with nav arrows, field rows (Starting Value, Ending Value, Net Deposits, Earnings, XIRR).
- **Step 2:** Tap a performance table row. Take screenshot. Extract: drawer layout, field styling.
- **Step 3:** Compare: drawer with drag handle, period details, field label/value pairs

### VR-INV-DT-10-M: Mobile transactions table (mobile only) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/investment/detail-mobile-transactions.png`
- **Prototype source:** `prototypes/platform-detail.html` lines 794–964
- **Step 1:** Read transactions table. Note mobile-specific column visibility and layout.
- **Step 2:** Scroll to transactions. Take screenshot. Extract: visible columns, type badge rendering, row layout.
- **Step 3:** Compare: mobile-adapted table with type badges, simplified columns

---

## VR-DARK — Dark Mode

### VR-DARK-01-D: Home overview dark mode (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/overview-desktop-dark.png`
- **Prototype source:** All prototypes — dark mode uses `dark:` Tailwind variants
- **Step 1:** Review dark mode token mapping: page bg = bg-base-900 (#161816), card bg = bg-base-800 (#252725), primary text = base-100 (#f0f2f0), secondary text = base-400, shadows = shadow-card-dark. Accent colors (emerald, rose) remain unchanged.
- **Step 2:** Enable dark mode via settings. Navigate to `/home`. Take screenshot. Extract: page background-color, card background-color, primary text color, label text color, nav background-color.
- **Step 3:** Compare against reference:
  - Page bg: base-900 (#161816)
  - Card bg: base-800 (#252725)
  - Primary text: base-100 white/light
  - Labels: base-400 gray
  - Accent colors (emerald, rose) preserved
  - Nav bar: dark bg with light text
  - Borders: base-700
  - Shadow: shadow-card-dark

### VR-DARK-02-D: Investment detail dark mode (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/investment/detail-desktop-dark.png`
- **Prototype source:** `prototypes/platform-detail.html` (dark: variant classes throughout)
- **Step 1:** Review dark mode token mapping (same as VR-DARK-01-D): page bg = bg-base-900, card bg = bg-base-800, text = base-100, borders = base-700, shadows = shadow-card-dark.
- **Step 2:** Enable dark mode, navigate to platform detail. Take screenshot. Extract: page background-color, card background-color, text color, table header bg, border colors.
- **Step 3:** Compare: all dark variants applied — tables dark header/rows, stat cards dark bg, buttons maintain contrast

---

## VR-SHARED — Shared Component Visual Consistency

### VR-SHARED-01-D: Stat card consistency across sections (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** Compare `screenshots/home/detail-desktop-top.png` with `screenshots/investment/detail-desktop-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 207–239 and `prototypes/platform-detail.html` lines 311–343
- **Step 1:** Read stat card markup from both prototypes. Verify they use identical Tailwind classes for card container, label, value, and unit.
- **Step 2:** Take screenshots of stat cards on Home detail and Investment detail. Extract computed styles from both: card background-color, border-radius, box-shadow, padding, label font-size/color/text-transform, value font-size/font-family/font-weight.
- **Step 3:** Compare: all extracted values must be identical between sections. Same card shell, same typography hierarchy, same spacing.

### VR-SHARED-01-M: Stat card consistency across sections (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** Compare `screenshots/home/detail-mobile-top.png` with `screenshots/investment/detail-mobile-top.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 207–239 and `prototypes/platform-detail.html` lines 311–343
- **Step 1:** Read stat card markup. Verify mobile grid/padding classes are identical.
- **Step 2:** Extract mobile card styles from both sections: grid-cols, padding, value font-size.
- **Step 3:** Compare: same 2-column grid, same card styling between sections

### VR-SHARED-02-D: Table styling consistency across sections (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** Compare `screenshots/home/detail-desktop-bills.png` with `screenshots/investment/detail-desktop-transactions.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 555–842 and `prototypes/platform-detail.html` lines 669–964
- **Step 1:** Read table markup from both prototypes. Verify they use identical Tailwind classes for table headers, rows, cells, action icons, and "Show all" links.
- **Step 2:** Extract table styles from both: header font-size/color/text-transform, row padding, cell font-family, action button styling, "Show all" link styling.
- **Step 3:** Compare: all table chrome must be identical — headers, row borders, action icons, show-all links

### VR-SHARED-02-M: Table styling consistency across sections (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** Compare `screenshots/home/detail-mobile-tables.png` with `screenshots/investment/detail-mobile-tables.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 555–842 and `prototypes/platform-detail.html` lines 669–964
- **Step 1:** Read table markup. Note mobile column visibility classes.
- **Step 2:** Extract mobile table styles from both sections: row height, visible columns, text alignment.
- **Step 3:** Compare: row height, text alignment, simplified column styling must be identical

### VR-SHARED-03-D: Dialog styling consistency (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** Compare `screenshots/home/overview-desktop-add-reading.png` with `screenshots/investment/overview-desktop-add-platform.png`
- **Prototype source:** `prototypes/home-overview.html` lines 429–478 and `prototypes/portfolio-overview.html` lines 1186–1237
- **Step 1:** Read dialog markup from both. Verify they use the same dialog shell classes (overlay, panel max-width, border-radius, padding, title, close button, footer button layout).
- **Step 2:** Open Add Reading (Home) and Add Platform (Investment). Extract dialog styles: panel max-width, border-radius, background, title font, input styling, button layout.
- **Step 3:** Compare: same modal shell — border-radius, padding, backdrop blur, title styling, input styling, button placement, close X button

### VR-SHARED-03-M: Dialog styling consistency (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** Compare `screenshots/home/overview-mobile-add-reading.png` with `screenshots/investment/overview-mobile-add-platform.png`
- **Prototype source:** `prototypes/home-overview.html` lines 429–478 and `prototypes/portfolio-overview.html` lines 1186–1237
- **Step 1:** Read dialog markup. Verify both use same bottom-sheet animation and panel classes on mobile.
- **Step 2:** Open dialogs on both sections. Extract: panel positioning, width, border-radius, field styling.
- **Step 3:** Compare: same bottom sheet behavior, same form field styling

### VR-SHARED-04-D: Switcher dropdown consistency (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** Compare `screenshots/home/detail-desktop-switcher.png` with `screenshots/investment/detail-desktop-switcher.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 162–197 and `prototypes/platform-detail.html` lines 207–300
- **Step 1:** Read switcher dropdown markup from both. Verify same container classes (bg-white, rounded-2xl, shadow-lg), item row layout, footer action pattern.
- **Step 2:** Open switchers on both sections. Extract: dropdown width, border-radius, shadow, item row padding, footer action styling.
- **Step 3:** Compare: same dropdown shell, item layout, footer action styling

### VR-SHARED-04-M: Switcher dropdown consistency (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** Compare `screenshots/home/detail-mobile-switcher.png` with `screenshots/investment/detail-mobile-switcher.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 91–135 and `prototypes/platform-detail.html` lines 108–191
- **Step 1:** Read mobile switcher markup from both. Verify same full-screen overlay classes and item layout.
- **Step 2:** Open switchers on both sections. Extract: overlay positioning, panel width, item layout.
- **Step 3:** Compare: same full-screen overlay behavior and styling

### VR-SHARED-05-D: Delete confirmation consistency (desktop) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 1400x900
- **Reference screenshot:** `screenshots/home/detail-desktop-delete-confirm.png`
- **Prototype source:** `prototypes/utility-detail.html` lines 1051–1071 (same pattern used across all sections)
- **Step 1:** Read delete dialog markup. Verify same classes used for icon, title, description, and buttons across all delete confirmations.
- **Step 2:** Trigger delete on Home (reading) and Investment (data point). Take screenshots of both. Extract: dialog max-width, icon circle color, title alignment, button colors.
- **Step 3:** Compare: same centered modal, same rose trash icon, same button styling (Cancel secondary + Delete rose-600)

### VR-SHARED-05-M: Delete confirmation consistency (mobile) ✅ PASSED
- **⚠️ MANDATORY FIRST STEP: Re-read the FULL instructions block at the top of this file before doing ANYTHING else. This step may under NO circumstances be skipped! ⚠️**
- **Viewport:** 375x812
- **Reference screenshot:** `screenshots/home/detail-desktop-delete-confirm.png` (same centered modal on all viewports)
- **Prototype source:** `prototypes/utility-detail.html` lines 1051–1071
- **Step 1:** Read delete dialog. Confirm centered positioning (not bottom sheet) applies on mobile too.
- **Step 2:** Trigger delete on mobile in both sections. Take screenshots. Extract: dialog positioning (centered, not bottom).
- **Step 3:** Compare: same centered modal on mobile (NOT bottom sheet), identical between sections
