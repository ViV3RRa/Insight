# US-141: Performance Optimization (Charts with 7+ Years of Data)

## Story
As the Insight platform user, I want charts and calculations to render smoothly even with 7+ years of monthly data across multiple entities so that the platform remains responsive as my data grows.

## Dependencies
- All chart and calculation stories completed

## Requirements
- Performance audit and optimization (PRD §13):
  - Charts render smoothly with 7+ years of monthly data (84+ data points per series)
  - Multiple entities (e.g. 5+ platforms, 3+ utilities) don't cause visible lag
  - Calculations (XIRR, consumption, amortization) complete quickly
- **Optimization strategies:**
  - Memoize expensive calculations (useMemo) — XIRR, aggregations, monthly consumption
  - Avoid recalculating when data hasn't changed
  - Lazy load chart libraries if bundle is too large
  - Virtual scrolling for very long data tables (100+ rows)
  - TimeSpanSelector filtering: compute chart data only for visible range
  - Consider web workers for XIRR if it blocks the UI thread
- **Metrics targets:**
  - Page load to interactive: < 2 seconds
  - Chart render after data load: < 500ms
  - Time span change (rechart): < 200ms
  - Dialog open: < 100ms

## Shared Components Used
N/A — optimization story

## UI Specification
N/A — optimization story

## Acceptance Criteria
- [ ] Charts render without jank with 84+ data points per series
- [ ] Multiple chart series (5+ platforms) render smoothly
- [ ] XIRR calculation completes in < 100ms per platform
- [ ] Page loads within 2 seconds on reasonable hardware
- [ ] Time span selector change is perceptibly instant
- [ ] Scrolling through long tables is smooth
- [ ] No memory leaks from chart rerenders
- [ ] Bundle size reasonable (< 500kb gzipped)
- [ ] PRD §13: Charts render smoothly with 7+ years of data
- [ ] Performance benchmarks documented and all targets met
- [ ] Bundle size analysis confirms < 500kb gzipped

## Testing Requirements
- **Test file**: N/A — audit/verification story
- **Approach**: Testing IS the deliverable — performance benchmarks and profiling
- Run Lighthouse performance audit on all main pages; target score >= 90
- Analyze bundle size with `vite-bundle-visualizer` or equivalent; confirm < 500kb gzipped total
- Profile render performance: charts with 84+ data points must render in < 500ms
- Profile time span selector change: chart re-render must complete in < 200ms
- Profile XIRR calculation: must complete in < 100ms per platform with 7+ years of data
- Verify no memory leaks from chart re-renders using Chrome DevTools memory profiling
- Test page load to interactive: < 2 seconds on reasonable hardware

## Technical Notes
- Profile with React DevTools and Chrome Performance tab
- Key memoization targets:
  - `calculateMonthlyConsumption()` → memoize per utility
  - `computePlatformXIRR()` → memoize per platform + time window
  - `amortizeAllBills()` → memoize per utility
  - Chart data transformations → useMemo with data as dependency
- Recharts `<ResponsiveContainer>` can cause unnecessary rerenders — use React.memo on chart components
- DataTable: consider virtualization only if users have 100+ records (unlikely for most entities)
- Consider code splitting: each section's components lazily loaded when navigating to that tab
