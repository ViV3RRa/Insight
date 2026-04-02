# US-055: PortfolioSwitcher Component

## Story
As the Insight platform user, I want a portfolio switcher dropdown on the Investment overview so that I can quickly switch between portfolios (e.g., my own vs. a child's) and manage them without navigating away.

## Dependencies
- US-032: DropdownSwitcher Component
- US-042: Portfolio CRUD Service

## Requirements
- Create a `PortfolioSwitcher` component specific to the Investment section (PRD §6.3)
- Desktop: dropdown trigger button (w-64) showing the current portfolio name + owner name separated by a dot
  - Active portfolio highlighted with check icon + edit button
  - Other portfolios clickable to switch, each with an edit button (Pencil icon)
  - "Add Portfolio" action at the bottom separated by a border-t divider
- Mobile: in-nav dropdown (full-width slide-down from navigation area)
  - Same content as desktop but full-width
  - Rendered inside the mobile nav bar area
- Default portfolio is pre-selected when navigating to the Investment section
- Switching portfolios updates all data on the overview page (summary cards, charts, tables)
- Edit button opens the PortfolioDialog (US-076)
- "Add Portfolio" opens the PortfolioDialog in add mode

## Shared Components Used
- `DropdownSwitcher` (US-032) — props: { items: portfolioItems, currentId: activePortfolio.id, overviewHref: "/investment", overviewLabel: "Investment Portfolio", onSelect: handlePortfolioSwitch }

## UI Specification

The PortfolioSwitcher wraps the shared `DropdownSwitcher` with portfolio-specific data and behavior.

**Desktop trigger button:**
```
[My Portfolio · Me ▾]
```
- Positioned in the page header, right of the h1 title on desktop
- On mobile: rendered in the nav bar's mobile header slot

**Dropdown content (via DropdownSwitcher):**
- No "Overview" link at top (this IS the overview — omit `overviewHref` or hide it)
- Active portfolio row: check icon (w-3.5 h-3.5 text-accent-600) + portfolio name (font-medium) + owner (text-xs text-base-400) + edit button (Pencil icon, p-1, text-base-400 hover:text-base-600)
- Inactive portfolio rows: clickable, show name + owner (text-xs text-base-400) + edit button (Pencil icon, same styling as active row's edit button)
- Divider (border-t border-base-100 dark:border-base-700)
- "Add Portfolio" row: Plus icon (w-3.5 h-3.5) + "Add Portfolio" label, text-sm text-base-400 hover:text-base-600

**Mobile variant (lg:hidden):**
- Full-width slide-down panel below nav
- Same content layout as desktop dropdown
- Triggered by tapping the portfolio name in the mobile nav

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Desktop dropdown: L142–172 (trigger button, flyout with checkmark/edit icons, add action)
- Mobile slide-down: L101–132 (same content, slide animation from nav)
- Mobile toggle function: L1154–1181

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-portfolio-switcher.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`

## Acceptance Criteria
- [ ] Desktop dropdown shows current portfolio name + owner with chevron
- [ ] Active portfolio shows check icon and edit button
- [ ] Other portfolios are clickable and trigger portfolio switch
- [ ] All portfolio items (active and inactive) show an edit pencil button
- [ ] "Add Portfolio" appears at the bottom with plus icon
- [ ] Mobile uses full-width slide-down from nav area
- [ ] Default portfolio is pre-selected on initial load
- [ ] Switching portfolios refreshes all overview data
- [ ] Edit button opens PortfolioDialog in edit mode
- [ ] "Add Portfolio" opens PortfolioDialog in add mode
- [ ] Click-outside dismisses the dropdown
- [ ] Dark mode styles apply correctly
- [ ] PRD §14 criterion 11: Default portfolio is pre-selected; user can switch between portfolios
- [ ] All tests pass and meet coverage target
- [ ] Component renders without console errors or warnings in test environment

## Testing Requirements
- **Test file**: `src/components/portfolio/PortfolioSwitcher.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test data rendering with mocked query results (portfolio list renders correctly)
- Test loading state (skeleton/spinner shown while portfolios query is pending)
- Test empty state (no portfolios scenario handled gracefully)
- Test error state (ErrorState component when portfolio query fails)
- Test that all portfolio options render with name and owner
- Test that the active/default portfolio shows a check icon
- Test that clicking an inactive portfolio fires the selection callback
- Test that the "Add Portfolio" action renders at the bottom with plus icon
- Test that the edit button (Pencil icon) appears on each portfolio item
- Test click-outside dismisses the dropdown
- Test that switching portfolio updates Zustand store

## Technical Notes
- File to create: `src/components/portfolio/PortfolioSwitcher.tsx`
- Portfolios fetched via TanStack Query: `useQuery({ queryKey: ['portfolios'], queryFn: portfolioService.getAll })`
- Active portfolio ID stored in Zustand store (`usePortfolioStore`), synced from URL params on mount; falls back to default portfolio on first load
- On mount: if no active portfolio in store, call `portfolioService.getDefault()` to set the initial selection in the store
- The edit button handler and add handler should accept callbacks from the parent to open the PortfolioDialog
- Export as named export: `export { PortfolioSwitcher }`
