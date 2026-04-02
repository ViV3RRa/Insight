# US-121: Vehicle Detail — YoY Comparison Row

## Story
As the Insight platform user, I want a year-over-year comparison on the vehicle detail page so that I can see how efficiency and costs compare to last year.

## Dependencies
- US-018: YoYComparisonRow Component
- US-113: Vehicle Cost Calculations
- US-111: Fuel Efficiency Calculation

## Requirements
- Always-visible YoY row below stat cards (PRD §3.2)
- Three comparison metrics:
  1. **YTD Fuel Cost**: current vs same period last year, % change
  2. **YTD Efficiency**: current year weighted avg vs prior year, % change
  3. **YTD km**: current vs same period last year, % change

## Shared Components Used
- `YoYComparisonRow` (US-018) — props: { metrics: [...] }

## UI Specification
Placed below stat cards with `mb-6 lg:mb-8` spacing. Uses standard YoYComparisonRow layout.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- YoY comparison row: L300–344
- Three metrics: YTD Km Driven, YTD Fuel Cost, Efficiency — each with current vs prior year values and percentage change

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] YoY row shows three metrics with prior year comparisons
- [ ] Cost increase shown in red, decrease in green (inverse)
- [ ] Efficiency increase shown in green, decrease in red (normal)
- [ ] Handles missing prior year data (N/A)
- [ ] Uses shared YoYComparisonRow

## Technical Notes
- Part of `src/components/vehicles/VehicleDetail.tsx`
- Data from vehicle metrics and prior-year calculations
