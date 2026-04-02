# US-133: Vehicles Section — Mobile Responsive Polish

## Story
As the Insight platform user, I want the entire Vehicles section to be fully functional on mobile devices so that I can record refuelings at the pump and review vehicle data on the go.

## Dependencies
- US-118: Vehicles Overview — Page Assembly
- US-129: Vehicle Detail — Page Assembly
- US-008: App Shell — Mobile Tab Bar

## Requirements
- Audit and polish all Vehicles pages for mobile (PRD §8.3, §13)
- **Vehicles Overview mobile:**
  - Title in mobile nav
  - Action buttons full-width
  - Vehicle cards: single column
  - Sold vehicles accordion functional
- **Vehicle Detail mobile:**
  - Vehicle switcher in mobile nav with back button
  - Action buttons full-width
  - Vehicle header card: stacked layout (photo on top, content below)
  - Stat cards: `grid-cols-2`
  - Charts: full-width, shorter height
  - Tables: secondary columns hidden (no cycling per ui-analysis §3.7)
  - Row actions hidden on mobile — but no drawers for vehicles (simpler than investment/utility)
- **Refueling form mobile optimization** (PRD §13):
  - Large touch targets for number inputs
  - Camera access for receipt and trip counter photos
  - Minimal scrolling needed
- Bottom padding: `pb-24`
- No horizontal scrolling

## Shared Components Used
- All shared components with mobile variants

## UI Specification

**Vehicle card on mobile:** Full-width single card (no grid).

**Table columns on mobile (from ui-analysis §4):** Simply hidden via `hidden sm:table-cell`, NOT column cycling.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Mobile nav with title + subtitle: L71–76
- Mobile action buttons (full-width): L103–107
- Vehicle cards grid responsive classes (1 col mobile, 2 sm, 3 lg): L110
- Mobile bottom tab bar: L292–312

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Mobile nav with back button + vehicle switcher: L75–91
- Mobile vehicle dropdown: L101–156
- Mobile action buttons (full-width): L210–214
- Vehicle header stacked layout (flex-col sm:flex-row): L218
- Stat cards responsive grid (2 cols mobile): L262
- Table columns hidden on mobile (hidden sm:table-cell): L467–472, L538–543
- Mobile bottom tab bar: L655–675

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] Overview and detail fully functional at 320px
- [ ] No horizontal scrolling
- [ ] Vehicle cards single column on mobile
- [ ] Vehicle header stacked on mobile
- [ ] Tables: secondary columns hidden on mobile
- [ ] Refueling form optimized for mobile (large inputs, camera)
- [ ] Bottom padding clears tab bar
- [ ] Touch targets ≥ 44×44px
- [ ] PRD §13: Refueling forms specifically optimized for mobile at pump
- [ ] PRD §14 criterion 45: Fully functional on mobile

## Technical Notes
- Polish/audit pass
- Test at: 320px, 375px, 414px, 768px
- Vehicles section does NOT use mobile column cycling or mobile drawers (simpler pattern)
