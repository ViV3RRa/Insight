# US-072: Platform Detail — Platform Switcher

## Story
As the Insight platform user, I want a dropdown on the platform detail page to switch directly between platforms so that I can navigate without returning to the portfolio overview every time.

## Dependencies
- US-032: DropdownSwitcher Component
- US-043: Platform CRUD Service

## Requirements
- Render a DropdownSwitcher on the platform detail page (PRD §8.2)
- Dropdown trigger: platform name acts as a clickable dropdown trigger
- Dropdown content grouped into sections:
  - "Portfolio Overview" link at the top (navigates back to overview)
  - "Active Platforms" section header + list of active investment platforms
  - "Cash Accounts" section header + list of active cash platforms
  - "Closed" section header + list of closed platforms (if any)
- Active platform (current page) highlighted with accent styling
- Edit platform button at the bottom of the dropdown
- Desktop: absolute dropdown panel (w-64 to w-80)
- Mobile: full-width slide-down from nav area

## Shared Components Used
- `DropdownSwitcher` (US-032) — props: { currentId: platform.id, items: allPlatformItems, sections: [{ key: "investment", label: "Active Platforms" }, { key: "cash", label: "Cash Accounts" }, { key: "closed", label: "Closed" }], onSelect: navigateToPlatform, overviewHref: "/investment", overviewLabel: "Portfolio Overview" }
- `PlatformIcon` (US-039) — rendered inside each dropdown item (via DropdownSwitcher's item icon slot)
- `Button` (US-013) — for "Edit Platform" action button at the bottom of the dropdown

## UI Specification

**Desktop trigger (in header):**
The platform name in the page header (h1) doubles as the dropdown trigger. The `DropdownSwitcher` trigger replaces the static h1 text:
```
<DropdownSwitcher
  triggerLabel={platform.name}
  currentId={platform.id}
  ...
/>
```

**Dropdown panel content via DropdownSwitcher:**
- Overview link: LayoutGrid icon + "Portfolio Overview"
- Divider
- Section: "Active Platforms" — investment platforms with icons, each showing:
  - Left: PlatformIcon (sm) + name + currency badge (text-xs text-base-400) + staleness badge (if applicable, sm size inline with currency)
  - Right: current value (font-mono-data text-sm, right-aligned) + return % (font-mono-data text-xs, colored emerald/rose)
- Section: "Cash Accounts" — cash platforms with icons, each showing:
  - Left: PlatformIcon (sm) + name + currency badge
  - Right: current value only (font-mono-data text-sm, with currency suffix for non-DKK)
- Section: "Closed" — closed platforms (if any), muted text
- Overview link shows total portfolio value right-aligned (font-mono-data text-xs text-base-400, e.g. "1.759.504 DKK")
- Divider
- Edit button: Pencil icon + "Edit Platform" — opens PlatformDialog (US-077) in edit mode

**Mobile (lg:hidden):**
Full-width slide-down from nav, same content as desktop.

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Desktop dropdown trigger (icon + name + subtitle + staleness + chevron): L205–217
- Desktop dropdown panel (overview link, grouped platforms, edit action): L219–301
- Mobile slide-down from nav (same content, full-width): L108–191
- Mobile toggle function: L1658–1677

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-switcher.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-switcher.png`

## Acceptance Criteria
- [ ] Platform name acts as a dropdown trigger with chevron
- [ ] Dropdown shows "Portfolio Overview" link at the top
- [ ] Platforms are grouped by: Active Platforms, Cash Accounts, Closed
- [ ] Section headers use uppercase tracking-wider text-[10px] styling
- [ ] Current platform is highlighted with accent bg and border-l-2
- [ ] Other platforms are clickable and navigate to their detail pages
- [ ] Each platform item shows its circular icon (PlatformIcon sm)
- [ ] Investment platform items display current value and return % (colored emerald/rose) right-aligned
- [ ] Cash platform items display current value right-aligned (no return %)
- [ ] Non-DKK platform values show currency suffix (e.g. "EUR")
- [ ] Stale platforms show staleness badge (sm size) inline with currency below name
- [ ] Overview link shows total portfolio value right-aligned
- [ ] Edit button at the bottom opens PlatformDialog in edit mode
- [ ] Desktop: absolute dropdown w-64 to w-80
- [ ] Mobile: full-width slide-down from nav
- [ ] Click-outside dismisses the dropdown
- [ ] Closed platforms shown with muted styling
- [ ] Uses shared DropdownSwitcher and PlatformIcon — no inline dropdown markup
- [ ] PRD §8.2: Detail page entity switcher for direct navigation

## Technical Notes
- The DropdownSwitcher is used in the header of `src/components/portfolio/PlatformDetail.tsx`
- Platforms fetched via TanStack Query: `useQuery({ queryKey: ['platforms', portfolioId], queryFn: () => platformService.getByPortfolio(portfolioId) })`
- Active portfolio ID from Zustand `usePortfolioStore`
- Navigation on select: `navigate('/investment/platform/{selectedId}')` or `/investment/cash/{selectedId}` depending on type
- The edit button handler opens PlatformDialog with the current platform's data
- On mobile, the trigger is placed in the nav bar's mobile header slot (alongside the back button)
