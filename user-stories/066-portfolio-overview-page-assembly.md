# US-066: Portfolio Overview — Page Assembly + Quick-Add

## Story
As the Insight platform user, I want all portfolio overview sections assembled into a complete page with quick-add action buttons so that I have a single, cohesive view of my portfolio with easy access to data entry.

## Dependencies
- US-055: PortfolioSwitcher Component
- US-056: Portfolio Overview — Summary Cards Section
- US-057: Portfolio Overview — YoY Comparison Section
- US-058: Portfolio Overview — Performance Charts Accordion Shell
- US-059: Portfolio Overview — Portfolio Value Over Time
- US-060: Portfolio Overview — Performance Analysis Yearly Tab
- US-061: Portfolio Overview — Performance Analysis Monthly Tab
- US-062: Portfolio Overview — Investment Platforms Table
- US-063: Portfolio Overview — Cash Accounts Table
- US-064: Portfolio Overview — Closed Platforms Section
- US-065: Portfolio Overview — Allocation Section
- US-013: Button Component

## Requirements
- Assemble all portfolio overview sections (US-055 through US-065) into the complete page
- Page header with title, portfolio switcher, and action buttons (PRD §6.3 item 6)
- Quick-add buttons:
  - "+ Add Data Point" — secondary button, opens DataPointDialog (US-078)
  - "+ Add Transaction" — primary button, opens TransactionDialog (US-079)
  - "+ Add Platform" — text link at the bottom of the platform tables area
- Desktop: "+ Add Data Point" and "+ Add Transaction" buttons in the **Investment Platforms card header** (inside US-062), not the page header
- Mobile: switcher in the mobile nav area + full-width action button pair below the header (above summary cards)
- Data fetching via TanStack Query; active portfolio ID from Zustand `usePortfolioStore`; dialog open states in local component state

## Shared Components Used
- `Button` (US-013) — props for action buttons:
  - Add Data Point: { variant: "secondary", size: "sm", children: "+ Add Data Point" }
  - Add Transaction: { variant: "primary", size: "sm", children: "+ Add Transaction" }
- `PortfolioSwitcher` (US-055) — rendered in the header area

## UI Specification

**Desktop layout:**
```
<div className="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {/* Page header (NO action buttons on desktop — those live in the Investment Platforms card header) */}
  <div className="hidden lg:flex items-center justify-between mb-8">
    <div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-base-900 dark:text-white">
          Investment Portfolio
        </h1>
        <PortfolioSwitcher />
      </div>
      <p className="text-sm text-base-400">{platformCountSummary}</p>
    </div>
  </div>

  {/* Mobile action buttons */}
  <div className="flex gap-2 mb-4 lg:hidden">
    <Button variant="secondary" fullWidth>+ Add Data Point</Button>
    <Button variant="primary" fullWidth>+ Add Transaction</Button>
  </div>

  {/* Summary Cards (US-056) */}
  {/* YoY Comparison (US-057) */}
  {/* Performance Accordion (US-058, containing US-059, US-060, US-061) */}
  {/* Investment Platforms Table (US-062) — desktop action buttons are in this card's header */}
  {/* Cash Accounts Table (US-063) */}
  {/* Closed Platforms (US-064) — only if any exist */}
  {/* Portfolio Allocation (US-065) */}

  {/* Add Platform link */}
  <button className="w-full py-3 text-sm font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 mt-2 mb-2">
    <PlusIcon className="w-4 h-4" />
    Add Platform
  </button>
</div>
```

**Mobile header (in nav bar):**
The PortfolioSwitcher renders in the mobile nav slot showing the current portfolio name + a subtitle "Investment Portfolio".

**Section ordering (top to bottom):**
1. Page header (h1 + PortfolioSwitcher + subtitle — NO desktop action buttons here)
2. Mobile action buttons (lg:hidden)
3. Summary Cards (US-056)
4. YoY Comparison (US-057)
5. Performance Charts Accordion (US-058)
6. Investment Platforms Table (US-062) — desktop action buttons are in this card's header
7. Cash Accounts Table (US-063)
8. Closed Platforms (US-064)
9. Portfolio Allocation (US-065)
10. "+ Add Platform" text link (full-width, with plus icon)

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html`
- Full page: L135–971 (header → summary cards → YoY → performance accordion → platforms table → cash table → closed → allocation → add platform)
- Add Platform button: L967–971

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-tables.png`

## Acceptance Criteria
- [ ] Page renders all sections in the correct order
- [ ] Desktop header shows h1 "Investment Portfolio" + PortfolioSwitcher + subtitle (no action buttons in page header)
- [ ] Mobile: PortfolioSwitcher in nav, action button pair below header
- [ ] "+ Add Data Point" opens the DataPointDialog
- [ ] "+ Add Transaction" opens the TransactionDialog
- [ ] "+ Add Platform" opens the PlatformDialog
- [ ] Mobile action buttons use full-width flex-1 layout
- [ ] Desktop action buttons appear in the Investment Platforms card header (US-062), not the page header
- [ ] "+ Add Platform" link appears at the bottom of the page (after allocation), full-width with plus icon
- [ ] Sections have correct vertical spacing (mb-6 lg:mb-8 between sections)
- [ ] Page content uses max-w-[1440px] mx-auto with correct horizontal padding
- [ ] Bottom padding accounts for mobile tab bar (pb-24 lg:pb-10)
- [ ] Data refreshes when the active portfolio changes
- [ ] All sections use their respective shared components
- [ ] PRD §6.3 item 6: Quick-add buttons distributed contextually
- [ ] PRD §14 criterion 23: Portfolio overview shows all required elements

## Technical Notes
- File: `src/components/portfolio/PortfolioOverview.tsx`
- Route: `/investment` (registered in US-006)
- Active portfolio ID from Zustand `usePortfolioStore`. Dialog open states in local component `useState`.
- Custom hook `usePortfolioData(portfolioId)` encapsulates:
  1. `useQuery({ queryKey: ['portfolios'], queryFn: portfolioService.getAll })`
  2. `useQuery({ queryKey: ['platforms', portfolioId], queryFn: () => platformService.getByPortfolio(portfolioId), enabled: !!portfolioId })`
  3. `useQuery({ queryKey: ['transactions', portfolioId], ... })` and `['dataPoints', portfolioId]` as needed
- TanStack Query automatically re-fetches when `portfolioId` changes (it's part of the query key)
