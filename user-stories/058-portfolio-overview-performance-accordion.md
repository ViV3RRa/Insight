# US-058: Portfolio Overview — Performance Charts Accordion Shell

## Story
As the Insight platform user, I want the performance charts section on the portfolio overview to be collapsible so that the default view stays clean while I can expand it when I want to analyze trends.

## Dependencies
- US-023: CollapsibleSection (Accordion) Component

## Requirements
- Render a `CollapsibleSection` wrapping the performance charts and analysis content
- Collapsed by default per PRD §6.3 item 3
- Title: "Performance Charts & Analysis"
- Icon: BarChart3 or TrendingUp from lucide-react
- No count badge (this section is not a record list)
- When expanded, reveals the chart cards and performance analysis tabs (US-059, US-060, US-061)
- Expanding/collapsing is smooth with chevron rotation animation

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Performance Charts & Analysis", icon: BarChart3, defaultExpanded: false, children: <PerformanceChartsContent /> }

## UI Specification

**Placement:** Below the YoY comparison row, with section spacing `mb-6 lg:mb-8`.

The `CollapsibleSection` handles its own card shell (border, rounded-2xl, button with chevron). The content inside the expanded area contains:
- Portfolio value charts (US-059) — `mt-4`
- Performance analysis tabs (US-060, US-061) — `mt-6`

These child sections are arranged vertically with `space-y-6` inside the expanded content area.

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Collapsible toggle button: L264–272
- Expanded content wrapper: L273–611

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-performance-expanded.png`

## Acceptance Criteria
- [ ] CollapsibleSection renders with title "Performance Charts & Analysis"
- [ ] Section is collapsed by default
- [ ] Clicking the header toggles expanded/collapsed state
- [ ] Chevron rotates 180 degrees on expand
- [ ] Expanded content area shows chart cards and performance analysis
- [ ] Content children have vertical spacing (space-y-6)
- [ ] Uses the shared CollapsibleSection component — no custom accordion markup
- [ ] aria-expanded attribute toggles correctly
- [ ] Dark mode styles apply correctly
- [ ] PRD §6.3 item 3: Performance charts are in a collapsible accordion, collapsed by default
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioOverviewPerformanceAccordion.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test that the section renders collapsed by default (children not visible)
- Test that clicking the header expands the section (children become visible)
- Test that clicking again collapses the section
- Test that the chevron rotates on expand/collapse
- Test aria-expanded attribute toggles correctly
- Test that expanded content area renders child components (chart cards and performance tabs)
- Test that children have correct vertical spacing (space-y-6)
- Test that the title "Performance Charts & Analysis" renders correctly

## Technical Notes
- This is a section within `src/components/portfolio/PortfolioOverview.tsx`
- The expanded content renders US-059 (value charts) and the performance analysis container (US-060, US-061) as children
- No data fetching in this component — it is purely a layout wrapper
- The CollapsibleSection manages its own expanded state internally (uncontrolled mode)
