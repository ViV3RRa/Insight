# Performance Benchmarks

## Performance Targets (US-141 / PRD §13)

| Metric | Target |
|--------|--------|
| Page load (initial) | < 2 s |
| Chart render | < 500 ms |
| Time span change | < 200 ms |
| Dialog open | < 100 ms |
| XIRR calculation | < 100 ms |
| Bundle size (gzipped) | < 500 KB |

## Code Splitting

React.lazy is used for page-level components to split the bundle by route:

| Component | Route | Strategy |
|-----------|-------|----------|
| PortfolioOverview | /investment | `React.lazy` + `Suspense` |
| Settings | /settings | `React.lazy` + `Suspense` |

Placeholder pages (Home, Vehicles, etc.) are lightweight inline components and don't need code splitting. As real page components replace placeholders, they should also use `React.lazy`.

## React.memo — Chart Components

All chart components are wrapped with `React.memo` to prevent unnecessary re-renders when parent state changes but chart props remain the same. This is particularly impactful because Recharts components are expensive to re-render.

| Component | Section |
|-----------|---------|
| PortfolioOverviewValueCharts | Investment |
| PlatformDetailPerfChart | Investment |
| HomeOverviewChart | Home |
| UtilityDetailChart | Home |
| VehicleEfficiencyChart | Vehicles |
| VehicleFuelCostChart | Vehicles |
| VehicleKmChart | Vehicles |
| VehicleMaintenanceChart | Vehicles |

## useMemo — Data Transformations

Expensive data transformations inside components are memoized with `useMemo`:

| Component | What's memoized | Dependencies |
|-----------|----------------|--------------|
| PortfolioOverviewValueCharts | `areaChartData` (composite → Recharts format) | compositeData |
| PortfolioOverviewValueCharts | `mergedBarData` (monthly perf + YoY merge) | monthlyPerformance, yoyMonthlyPerformance, activeMode, yoyActive |
| PlatformDetailPerfChart | `mergedEarningsData` (earnings + YoY) | earningsData, yoyEarningsData |
| PlatformDetailPerfChart | `mergedXirrData` (XIRR + YoY) | xirrData, yoyXirrData |
| HomeOverviewChart | `chartData` (multi-utility aggregation) | utilities, metricsMap, priorYearMetricsMap, mode, timeSpan, yoyActive |
| UtilityDetailChart | `chartData` (mode-based data build) | mode, metrics, priorYearMetrics, timeSpan, yoyActive |
| VehicleEfficiencyChart | `filteredData`, `chartData` | data, timeSpan |
| VehicleFuelCostChart | `filteredData`, `chartData` | data, timeSpan, yoyActive |
| VehicleKmChart | `filteredData`, `chartData` | data, timeSpan, yoyActive |
| VehicleMaintenanceChart | `chartData` | data |
| PortfolioOverview | `compositeData`, `chartPlatforms`, `monthlyPerformance`, `yearlyTotals`, `allocationSegments`, `latestDataPointDate` | various aggregated data |

## TanStack Query Caching

All data fetching uses TanStack Query with a 5-minute stale time, preventing redundant network requests. PocketBase is self-hosted (< 10 ms latency), so no optimistic updates are needed (ADR-8).

## Vite Build Optimization

Vite automatically handles:
- Tree-shaking unused code
- CSS code splitting per route
- Asset hashing for cache busting
- Minification via esbuild/rollup
