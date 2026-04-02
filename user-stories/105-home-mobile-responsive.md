# US-105: Home Section — Mobile Responsive Polish

## Story
As the Insight platform user, I want the entire Home section to be fully functional and well-laid-out on mobile devices so that I can track utilities on the go.

## Dependencies
- US-094: Home Overview — Page Assembly
- US-101: Utility Detail — Page Assembly
- US-008: App Shell — Mobile Tab Bar

## Requirements
- Audit and polish all Home section pages for mobile viewports (PRD §8.3, §13)
- **Home Overview mobile:**
  - Title in mobile nav bar
  - Action buttons full-width below header
  - Utility summary cards: single column on mobile
  - YoY comparison row: single-column stacked with dividers
  - Chart card: full-width, responsive controls wrap
  - "+ Add Utility" link centered
- **Utility Detail mobile:**
  - Utility switcher in mobile nav with back button
  - Action buttons full-width below nav
  - Stat cards: `grid-cols-2` on mobile
  - Chart: full-width, shorter height (h-48)
  - Yearly table: mobile column cycling for secondary columns
  - Meter readings table: row tap opens MobileDrawer
  - Bills table: row tap opens MobileDrawer
- Bottom padding: `pb-24` for mobile tab bar
- Touch targets: minimum 44×44px
- No horizontal scrolling

## Shared Components Used
- `MobileDrawer` (US-027) — for table row details
- `MobileColumnCycler` (US-026) — for yearly/monthly tables
- All existing shared components with mobile variants

## UI Specification

**Mobile drawers for utility detail:**
- Reading drawer: Date, Reading value (with unit), Note, Attachment preview
- Bill drawer: Date, Amount, Period (start–end), Note, Attachment preview
- Month summary drawer: Month, Consumption, Cost, Cost/Unit, change %s

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html` (responsive patterns throughout)
- Mobile nav with inline title: L73-79
- Mobile action buttons: L105-109
- Time span dropdown (<410px): L344 (select element)
- Dialog bottom-sheet on mobile: L28-31 (CSS translateY animation)

**Screenshots (mobile):**
- `design-artifacts/prototypes/screenshots/home/overview-mobile-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-reading.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-bill.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-reading-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-bill-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-month-drawer.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-switcher.png`

## Acceptance Criteria
- [ ] Home overview fully functional at 320px viewport width
- [ ] Utility detail fully functional at 320px viewport width
- [ ] No horizontal scrolling on any Home page
- [ ] Mobile column cycling works in yearly/monthly tables
- [ ] Tapping reading row opens MobileDrawer
- [ ] Tapping bill row opens MobileDrawer
- [ ] Mobile drawers show Edit and Delete buttons
- [ ] Action buttons full-width on mobile
- [ ] Utility switcher in mobile nav
- [ ] Bottom padding clears tab bar
- [ ] All touch targets ≥ 44×44px
- [ ] Charts scale without overflow
- [ ] PRD §14 criterion 45: Fully functional on mobile browsers

## Technical Notes
- Polish/audit pass, not new features
- Test at: 320px, 375px, 414px, 768px
- Ensure dialogs render as bottom sheets on mobile
- MobileDrawer triggered via onRowClick on DataTable
