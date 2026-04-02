# US-067: Platform Detail — Header and Stat Cards

## Story
As the Insight platform user, I want a platform detail header with the platform's identity and six stat cards so that I can immediately see the platform's key performance metrics when I open its detail page.

## Dependencies
- US-014: StatCard Component
- US-016: StalenessIndicator Component
- US-039: PlatformIcon Component
- US-043: Platform CRUD Service
- US-048: XIRR Calculation
- US-049: Monthly Earnings
- US-050: Gain/Loss Calculation

## Requirements
- Platform header area (PRD §6.4):
  - Back button (left arrow) navigating to the portfolio overview
  - Platform icon (PlatformIcon md size, editable — click to update)
  - Platform name (editable inline or via dialog)
  - Currency badge (e.g., "EUR") as a small pill
  - Staleness badge when applicable (StalenessIndicator)
  - Desktop switcher trigger subtitle: "Investment · DKK · Updated Jan 31, 2026" — shows platform type, currency, and last-updated date (text-xs text-base-400). The "Updated" date is the date of the most recent data point.
- 6 StatCards in a responsive grid:
  1. **Current Value** — Variant A (simple) with sublabel for DKK equivalent on non-DKK platforms
  2. **Month Earnings** — Variant B (colored), emerald/rose
  3. **All-Time Gain/Loss** — Variant C (colored + badge), absolute + percentage
  4. **All-Time XIRR** — Variant D (unit suffix), "%" suffix
  5. **YTD Gain/Loss** — Variant C (colored + badge)
  6. **YTD XIRR** — Variant D (unit suffix)
- All values in the platform's native currency (XIRR calculated in native currency per PRD §6.2.1)
- Non-DKK platforms show DKK equivalent as sublabel on value cards

## Shared Components Used
- `StatCard` (US-014) — 6 instances:
  - Current Value: { label: "Current Value", value: formatCurrency(value, currency), variant: "simple", sublabel: currency !== "DKK" ? "≈ " + formatCurrency(valueDkk, "DKK") : undefined }
  - Month Earnings: { label: "Month Earnings", value: formatCurrency(monthEarnings, currency), variant: "colored", trend: monthEarnings >= 0 ? "positive" : "negative" }
  - All-Time Gain/Loss: { label: "All-Time Gain/Loss", value: formatCurrency(allTimeGain, currency), variant: "withBadge", badgeValue: formatPercent(allTimeGainPct), trend: allTimeGain >= 0 ? "positive" : "negative" }
  - All-Time XIRR: { label: "All-Time XIRR", value: formatNumber(allTimeXirr), variant: "withUnit", unitSuffix: "%" }
  - YTD Gain/Loss: { label: "YTD Gain/Loss", value: formatCurrency(ytdGain, currency), variant: "withBadge", badgeValue: formatPercent(ytdGainPct), trend: ytdGain >= 0 ? "positive" : "negative" }
  - YTD XIRR: { label: "YTD XIRR", value: formatNumber(ytdXirr), variant: "withUnit", unitSuffix: "%" }
- `PlatformIcon` (US-039) — props: { src: platform.iconUrl, name: platform.name, size: "md" }
- `StalenessIndicator` (US-016) — props: { severity: computed, size: "md" } (desktop) / { size: "lg" } (mobile)
- `Button` (US-013) — for back button and header action buttons

## UI Specification

**Header layout:**
```
<div className="flex items-center gap-3 mb-6 lg:mb-8">
  {/* Back button */}
  <button
    className="w-8 h-8 rounded-xl bg-base-50 dark:bg-base-700 flex items-center justify-center text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors"
    onClick={() => navigate('/investment')}
  >
    <ArrowLeft className="w-4 h-4" />
  </button>

  {/* Platform icon */}
  <PlatformIcon src={platform.iconUrl} name={platform.name} size="md" />

  {/* Name + badges */}
  <div className="flex items-center gap-2 flex-1">
    <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
      {platform.name}
    </h1>
    {/* Currency badge */}
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-base-100 dark:bg-base-700 text-base-400">
      {platform.currency}
    </span>
    {/* Staleness badge (if stale) */}
    {staleness && <StalenessIndicator severity={staleness} size="md" />}
  </div>
</div>
```

**Stat cards grid:**
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8
```

Same responsive grid as the portfolio overview summary cards.

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Platform Switcher Bar (back button + dropdown trigger + action buttons): L196–309
- Summary KPI Cards (6 stat cards grid): L311–343

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-top.png`

## Acceptance Criteria
- [ ] Back button navigates to portfolio overview
- [ ] Platform icon displays at md size (w-8 h-8 or w-10 h-10)
- [ ] Platform name renders as h1 text-2xl font-bold
- [ ] Currency badge shows as a pill next to the name
- [ ] Staleness badge appears when platform data is stale
- [ ] Desktop switcher trigger shows subtitle with platform type, currency, and last-updated date (e.g. "Investment · DKK · Updated Jan 31, 2026")
- [ ] 6 StatCards render in grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
- [ ] Current Value shows platform native currency value
- [ ] Non-DKK platforms show DKK equivalent as sublabel
- [ ] Gain/Loss cards show colored value with percentage badge
- [ ] XIRR cards show value with "%" suffix
- [ ] Month Earnings shows colored value
- [ ] All values are in the platform's native currency
- [ ] Uses shared StatCard, PlatformIcon, StalenessIndicator — no inline markup
- [ ] PRD §14 criterion 24: Platform detail page shows summary stat cards
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PlatformDetailHeader.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked platform data (header and stat cards render correctly)
- Test loading state (skeleton/spinner shown while platform data is pending)
- Test empty state (graceful handling when platform has no data points)
- Test error state (ErrorState component when platform query fails)
- Test that back button renders and fires navigation callback
- Test that platform name, icon, and currency badge display correctly
- Test that staleness badge appears when platform data is stale
- Test that desktop switcher subtitle shows platform type, currency, and last-updated date
- Test that 6 StatCards render in correct responsive grid (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6)
- Test that non-DKK platforms show DKK equivalent as sublabel on value cards
- Test that Gain/Loss cards show colored value with percentage badge
- Test that XIRR cards show value with "%" suffix

## Technical Notes
- This is a section within `src/components/portfolio/PlatformDetail.tsx`
- Platform data fetched by ID from URL params via `platformService.getOne(platformId)`
- Per-platform metrics computed using: XIRR (US-048), monthly earnings (US-049), gain/loss (US-050)
- DKK equivalent computed via currency conversion utilities (US-047)
- Staleness computed by checking latest data point date against current month
- The back button could also open the platform switcher dropdown (US-072) on mobile
