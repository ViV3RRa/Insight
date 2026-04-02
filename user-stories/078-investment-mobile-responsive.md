# US-078: Investment Section — Mobile Responsive Polish

## Story
As the Insight platform user, I want the entire Investment section to be fully functional and well-laid-out on mobile devices so that I can manage my portfolio on the go.

## Dependencies
- US-066: Portfolio Overview — Page Assembly
- US-067: Platform Detail — Header + Stat Cards
- US-073: Cash Platform Detail Page
- US-008: App Shell — Mobile Tab Bar

## Requirements
- Audit and polish all Investment section pages for mobile viewports (PRD §8.3, §13)
- **Portfolio Overview mobile:**
  - PortfolioSwitcher renders in mobile nav bar (title + subtitle)
  - Action buttons (Add Data Point, Add Transaction) full-width below header
  - Summary cards: `grid-cols-2` on mobile
  - YoY comparison row: single-column stacked with dividers between items
  - Performance accordion: full-width with no horizontal overflow
  - Platform tables: mobile column cycling (XIRR → Month Earnings → All-Time Gain/Loss → Updated) per PRD §8.3
  - Cash table: minimal columns on mobile
  - Allocation bar: full-width, legend wraps
- **Platform Detail mobile:**
  - Platform switcher in mobile nav with back button
  - Action buttons full-width below nav
  - Stat cards: `grid-cols-2`
  - Charts: full-width, h-48 (slightly shorter than desktop h-56)
  - Performance tables: mobile column cycling per PRD §8.3
  - Data points table: row tap opens MobileDrawer (US-027) with full details + Edit/Delete
  - Transactions table: row tap opens MobileDrawer with full details + Edit/Delete
  - Mobile abbreviations: "Dep."/"Wdl." for transaction types
- **Cash Platform Detail mobile:**
  - Same patterns as investment detail (switcher in nav, full-width buttons, drawers)
- Bottom padding: `pb-24` to clear mobile tab bar
- Touch targets: minimum 44×44px for all interactive elements
- No horizontal scrolling on any page at any viewport width

## Shared Components Used
- `MobileDrawer` (US-027) — for table row detail on mobile
- `MobileColumnCycler` (US-026) — for platform tables and performance tables
- All existing shared components with their mobile-responsive variants

## UI Specification

**Mobile column cycling in platform table:**
Cyclable columns (hidden on mobile, shown via cycler): XIRR, Month Earnings, All-Time Gain/Loss, Updated
Always-visible columns: Platform name, Current Value

**Mobile column cycling in yearly performance table:**
Cyclable: Earnings %, XIRR, Starting Value, Ending Value, Net Deposits
Always-visible: Period, Earnings

**Mobile column cycling in monthly performance table:**
Cyclable: Monthly XIRR, Start Value, End Value, Net Deposits
Always-visible: Period, Earnings

**Mobile table row drawers:**
- Data Point drawer: Date, Value (native + DKK), Source (Manual/Interpolated), Note
- Transaction drawer: Date, Type, Amount (native + DKK), Exchange Rate, Note, Attachment preview
- Performance drawer: Period, all metrics in a grid

## Design Reference
**Prototype:** `design-artifacts/prototypes/portfolio-overview.html` (responsive patterns throughout)
- Mobile nav with inline portfolio switcher: L79–91
- Mobile action buttons: L178–182
- Time span dropdown (<410px): L296 (select element)
- Mobile column cycling: L636–697

**Screenshots (mobile):**
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-add-platform.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-performance-expanded.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-top.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-transactions.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-perf-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-tx-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-dp-drawer.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-edit-platform.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-switcher.png`

## Acceptance Criteria
- [ ] Portfolio overview fully functional at 320px viewport width
- [ ] No horizontal scrolling on any investment page at any width
- [ ] Mobile column cycling works in platform tables (4 cyclable values with dot indicator)
- [ ] Mobile column cycling works in yearly performance tables
- [ ] Mobile column cycling works in monthly performance tables
- [ ] Tapping a data point row on mobile opens MobileDrawer with full details
- [ ] Tapping a transaction row on mobile opens MobileDrawer with full details
- [ ] Mobile drawers show Edit and Delete action buttons
- [ ] Transaction type uses abbreviated "Dep."/"Wdl." on mobile
- [ ] Action buttons use full-width layout on mobile
- [ ] PortfolioSwitcher renders in mobile nav area
- [ ] Platform switcher renders in mobile nav with back button
- [ ] Bottom padding clears mobile tab bar (pb-24)
- [ ] All touch targets ≥ 44×44px
- [ ] Charts scale gracefully without overflow
- [ ] PRD §8.3: Responsive design fully functional on mobile
- [ ] PRD §14 criterion 45: Application fully functional on mobile browsers
- [ ] Responsive behavior verified through existing component tests with responsive class assertions
- [ ] No horizontal overflow detected at any tested viewport width

## Testing Requirements
- **Test file**: N/A — visual regression / manual verification story
- Responsive behavior verified through existing component tests with responsive class assertions
- Consider snapshot tests for key responsive breakpoints (320px, 375px, 414px, 768px)
- Existing component tests (US-055 through US-077) should assert correct responsive Tailwind classes (e.g., `grid-cols-2`, `lg:grid-cols-6`, `lg:hidden`, `hidden lg:flex`)
- Mobile column cycling tests covered in US-062, US-060, US-061 component tests
- MobileDrawer integration tests covered in US-070, US-071 component tests
- Touch target size (44x44px minimum) verified via computed style assertions in component tests
- Bottom padding (pb-24) verified in US-066 page assembly test

## Technical Notes
- This story is a polish/audit pass, not new feature development
- Test at viewports: 320px, 375px, 414px, and 768px
- Key breakpoints: default (mobile), sm (640px), lg (1024px)
- MobileDrawer (US-027) is triggered via `onRowClick` prop on DataTable
- Mobile column cycling (US-026) is integrated via DataTable's responsive column config
- Ensure all dialogs render as bottom sheets on mobile (handled by DialogShell)
