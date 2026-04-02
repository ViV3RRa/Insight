# US-136: YoY Chart Overlay Integration

## Story
As the Insight platform user, I want to toggle a year-over-year overlay on charts across all sections so that I can visually compare current data to the same period last year.

## Dependencies
- US-020: YoYToggle Component
- US-059: Portfolio Overview — Portfolio Value Over Time
- US-091: Home Overview — Charts Area
- US-096: Utility Detail — Chart
- US-122: Vehicle Detail — Fuel Efficiency Chart
- US-123: Vehicle Detail — Monthly Fuel Cost Chart
- US-124: Vehicle Detail — Monthly km Chart

## Requirements
- YoY chart overlay is a **toggle** (not enabled by default) on chart cards (PRD §3.2)
- When enabled:
  - **Bar charts**: second semi-transparent bar set behind current data (opacity 0.3)
  - **Line charts**: dashed or ghost line for the prior year (strokeDasharray, opacity 0.4)
- Verify the overlay is correctly integrated in every chart across all sections:
  - Portfolio overview: value chart, performance bars
  - Platform detail: performance chart
  - Home overview: monthly consumption/cost chart
  - Utility detail: consumption/cost/cost-per-unit chart
  - Vehicle detail: efficiency, fuel cost, km charts
- Prior year data: shift current data back 12 months and align by month

## Shared Components Used
- `YoYToggle` (US-020) — already implemented, this verifies integration

## UI Specification

**Bar chart overlay:**
```
{yoyEnabled && <Bar dataKey="priorYear" fill={color} opacity={0.3} />}
<Bar dataKey="currentYear" fill={color} />
```

**Line chart overlay:**
```
{yoyEnabled && <Line dataKey="priorYear" stroke={color} strokeDasharray="5 5" opacity={0.4} />}
<Line dataKey="currentYear" stroke={color} />
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L283–287 — YoY toggle button
- `design-artifacts/prototypes/portfolio-overview.html` L325–340 — Chart placeholders with YoY overlay notes ("dashed ghost line for last year", "semi-transparent bars for last year")
- `design-artifacts/prototypes/home-overview.html` L322–325 — YoY toggle in home charts

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] YoY toggle present on all applicable charts
- [ ] Toggle OFF by default
- [ ] Bar charts: semi-transparent prior year bars behind current
- [ ] Line charts: dashed ghost line for prior year
- [ ] Prior year data correctly aligned by month
- [ ] Toggle state independent per chart
- [ ] Overlay disappears when toggle is off
- [ ] PRD §3.2: YoY chart overlay as a lens, not permanent
- [ ] PRD §14 criterion 40: YoY toggle overlays prior year on charts
- [ ] All tests pass and meet coverage target
- [ ] Integration tests verify YoY overlay behavior across all chart types

## Testing Requirements
- **Test file**: `src/test/integration/yoy-chart-overlay.test.tsx`
- **Approach**: Integration tests verifying cross-component behavior
- Test toggle enables prior year overlay on bar charts (semi-transparent bars rendered)
- Test toggle disables prior year overlay (overlay elements removed from DOM)
- Test prior year data renders with distinct styling (opacity 0.3 for bars, strokeDasharray + opacity 0.4 for lines)
- Test prior year data is correctly aligned by month (e.g., Jan current year aligns with Jan prior year)
- Test graceful handling when no prior year data exists (overlay not shown, no errors)
- Test toggle state is independent per chart (toggling one chart does not affect others)
- Test overlay renders correctly on line charts (dashed ghost line)

## Technical Notes
- Integration/audit story — verify each chart component
- Prior year data: for each month in current view, show the same month from the prior year
- Handle edge cases: no prior year data (just don't show overlay)
