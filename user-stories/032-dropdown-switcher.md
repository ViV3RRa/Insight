# US-032: DropdownSwitcher Component

## Story
As the Insight platform user, I want a dropdown on detail pages to switch between sibling entities (utilities, platforms, vehicles) so that I can navigate directly without going back to the overview page.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `DropdownSwitcher` component per PRD §8.2
- Detail page entity selector: entity name acts as a dropdown trigger
- Desktop: absolute dropdown panel (w-64 to w-80)
- Mobile: full-width slide-down from the navigation area
- Active item highlighted with accent styling
- Overview link at the top of the dropdown list
- Support for section headers within the list (e.g., "Investment Platforms" / "Cash Platforms")
- Click-outside dismiss
- Used on utility detail, platform detail, and vehicle detail pages

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Trigger button === */
<button
  className="
    inline-flex items-center gap-1.5
    text-base font-semibold text-base-900 dark:text-white
    hover:text-accent-700 dark:hover:text-accent-400
    transition-colors duration-150
  "
>
  Nordnet
  <svg
    className="
      w-4 h-4 text-base-400
      transition-transform duration-200
    "
    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    {/* ChevronDown icon */}
  </svg>
</button>

/* === Desktop dropdown (sm+) === */
<div
  className="
    absolute top-full left-0 mt-1 z-30
    w-64 sm:w-72
    bg-white dark:bg-base-800
    rounded-xl shadow-lg
    border border-base-150 dark:border-base-700
    py-1
    max-h-80 overflow-y-auto
    hidden sm:block
  "
>
  {/* Overview link */}
  <a
    href="/portfolio"
    className="
      flex items-center gap-2 px-3 py-2
      text-sm text-base-500 dark:text-base-400
      hover:bg-base-50 dark:hover:bg-base-700
    "
  >
    <svg className="w-4 h-4">{/* LayoutGrid icon */}</svg>
    Portfolio Overview
  </a>

  <div className="border-t border-base-100 dark:border-base-700 my-1" />

  {/* Section header */}
  <div className="px-3 py-1.5">
    <span className="text-[10px] font-medium uppercase tracking-wider text-base-300 dark:text-base-500">
      Investment Platforms
    </span>
  </div>

  {/* Active item */}
  <button
    className="
      w-full flex items-center gap-2.5 px-3 py-2 text-left
      bg-accent-50/50 dark:bg-accent-900/20
      border-l-2 border-accent-600 dark:border-accent-400
    "
  >
    {/* Platform icon */}
    <div className="w-5 h-5 rounded-full bg-base-200 flex-shrink-0" />
    <span className="text-sm font-medium text-base-900 dark:text-white truncate">
      Nordnet
    </span>
  </button>

  {/* Inactive item */}
  <button
    className="
      w-full flex items-center gap-2.5 px-3 py-2 text-left
      hover:bg-base-50 dark:hover:bg-base-700
      border-l-2 border-transparent
    "
  >
    <div className="w-5 h-5 rounded-full bg-base-200 flex-shrink-0" />
    <span className="text-sm text-base-700 dark:text-base-300 truncate">
      Interactive Brokers
    </span>
  </button>

  <div className="border-t border-base-100 dark:border-base-700 my-1" />

  {/* Section header */}
  <div className="px-3 py-1.5">
    <span className="text-[10px] font-medium uppercase tracking-wider text-base-300 dark:text-base-500">
      Cash Platforms
    </span>
  </div>

  {/* Inactive item */}
  <button
    className="
      w-full flex items-center gap-2.5 px-3 py-2 text-left
      hover:bg-base-50 dark:hover:bg-base-700
      border-l-2 border-transparent
    "
  >
    <div className="w-5 h-5 rounded-full bg-base-200 flex-shrink-0" />
    <span className="text-sm text-base-700 dark:text-base-300 truncate">
      Revolut
    </span>
  </button>
</div>

/* === Mobile dropdown (<sm) === */
<div
  className="
    sm:hidden
    fixed inset-x-0 top-0 z-30
    bg-white dark:bg-base-800
    shadow-lg
    border-b border-base-150 dark:border-base-700
    overflow-y-auto
    transition-all duration-300 ease-out
  "
  style={{
    maxHeight: isOpen ? '70vh' : '0',
    opacity: isOpen ? 1 : 0,
  }}
>
  {/* Same content as desktop but full-width */}
  <div className="py-2">
    {/* Overview link, section headers, items (same markup as above) */}
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L142--172 -- Desktop dropdown (trigger button + flyout with checkmark, edit icons, divider, add action)
- `design-artifacts/prototypes/portfolio-overview.html` L101--132 -- Mobile slide-down dropdown (same content, different animation)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-portfolio-switcher.png`

## Acceptance Criteria
- [ ] Trigger button shows entity name with a chevron that rotates on open
- [ ] Desktop: absolute dropdown w-64 to w-72 with rounded-xl shadow-lg border
- [ ] Mobile: full-width slide-down with max-height animation
- [ ] Active item uses bg-accent-50/50 with border-l-2 border-accent-600
- [ ] Inactive items use hover:bg-base-50 with border-l-2 border-transparent
- [ ] Overview link appears at the top with a LayoutGrid icon
- [ ] Section headers use text-[10px] font-medium uppercase tracking-wider
- [ ] Items show entity icon (w-5 h-5) + truncated name
- [ ] Click-outside dismisses the dropdown
- [ ] Clicking an item calls onSelect and closes the dropdown
- [ ] Dropdown scrolls if items exceed max-h-80 (desktop)
- [ ] Dark mode styles apply correctly

## Technical Notes
- File to create: `src/components/shared/DropdownSwitcher.tsx`
- Props: `currentId: string`, `items: Array<{ id: string, name: string, icon?: string, section?: string }>`, `sections?: Array<{ key: string, label: string }>`, `onSelect: (id: string) => void`, `overviewHref: string`, `overviewLabel: string`
- Use a `useClickOutside` hook for click-outside dismiss
- The mobile variant uses a max-height animation for smooth slide-down
- Consider using React Portal for the mobile variant to avoid z-index issues
- Export as named export: `export { DropdownSwitcher }`
