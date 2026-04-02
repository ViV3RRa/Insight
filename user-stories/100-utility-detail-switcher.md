# US-100: Utility Detail — Utility Switcher

## Story
As the Insight platform user, I want a dropdown on the utility detail page to switch directly between utilities so that I can navigate without returning to the Home overview.

## Dependencies
- US-032: DropdownSwitcher Component
- US-088: Utility Icon Component
- US-081: Utility CRUD Service

## Requirements
- Render a DropdownSwitcher on the utility detail page (PRD §8.2)
- Dropdown trigger: utility name acts as clickable dropdown trigger
- Dropdown content:
  - "Home Overview" link at the top (navigates back to Home overview)
  - List of all utilities, each showing: UtilityIcon, name, unit (text-xs text-base-400), optional staleness badge, and current period value (font-mono-data text-sm)
  - Active utility highlighted with accent styling (active item value uses text-base-400 muted color)
  - Edit utility button at the bottom
- Desktop: absolute dropdown panel (w-80)
- Mobile: full-width slide-down from nav area

## Shared Components Used
- `DropdownSwitcher` (US-032) — props: { currentId: utility.id, items: allUtilities, onSelect: navigateToUtility, overviewHref: "/home", overviewLabel: "Home Overview" }
- `UtilityIcon` (US-088) — rendered inside each dropdown item

## UI Specification

**Dropdown panel content via DropdownSwitcher:**
- Overview link: Home icon + "Home Overview"
- Divider
- Utility list: each item shows UtilityIcon + name + unit (text-xs text-base-400) + optional staleness badge + current period value (font-mono-data text-sm)
  - Staleness badge: inline pill with animated pulse dot, same styling as StalenessIndicator (US-016)
  - Active item: value uses `text-base-400` muted color
  - Inactive items: value uses `text-base-400` muted color
- Active utility highlighted with `bg-accent-50/50 dark:bg-accent-900/15 border-l-2 border-accent-600`
- Divider
- Edit button: Pencil icon + "Edit Utility" — opens UtilityDialog (US-105) in edit mode

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Desktop dropdown trigger (utility name + icon + stale badge + chevron): L146-161
- Desktop dropdown panel (w-[340px]): L162-197
  - "Home Overview" link: L164-167
  - Utility list with icons, names, units, values, stale badges: L168-195
  - Active utility highlighted: L169-179
- Mobile switcher (in nav bar): L62-77
- Mobile dropdown panel: L91-135

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-switcher.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-switcher.png`

## Acceptance Criteria
- [ ] Utility name acts as dropdown trigger with chevron
- [ ] Dropdown shows "Home Overview" link at top
- [ ] All utilities listed with icons, names, units, current period values, and optional staleness badges
- [ ] Current utility highlighted with accent styling
- [ ] Other utilities clickable and navigate to their detail pages
- [ ] Each dropdown item shows current period value (font-mono-data text-sm text-base-400) and unit (text-xs text-base-400)
- [ ] Edit button at bottom opens UtilityDialog in edit mode
- [ ] Desktop: absolute dropdown w-80
- [ ] Mobile: full-width slide-down from nav
- [ ] Click-outside dismisses dropdown
- [ ] Uses shared DropdownSwitcher and UtilityIcon
- [ ] PRD §8.2: Detail page entity switcher for direct navigation

## Technical Notes
- Part of `src/components/home/UtilityDetail.tsx` header
- Utilities fetched via TanStack Query: `useQuery({ queryKey: ['utilities'], queryFn: utilityService.getAll })`
- Navigation: `navigate('/home/utility/{selectedId}')`
- Edit button handler opens UtilityDialog with current utility data
