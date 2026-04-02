# US-024: TabBar Component

## Story
As the Insight platform user, I want a tab bar to switch between views within a card (e.g., Yearly/Monthly performance tabs) so that related data views are organized in a compact, navigable layout.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `TabBar` component with underline indicator
- Active tab: green text with 2px green underline via ::after pseudo-element (defined in global CSS from US-002)
- Inactive tab: muted text, no underline
- Optional right-side content slot for auxiliary controls (e.g., ChartModeToggle)
- Border-bottom separator across the full width
- Used in: Performance Analysis card (Yearly/Monthly tabs), other tabbed views

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === TabBar === */
<div className="border-b border-base-150 dark:border-base-700">
  <div className="flex items-center justify-between">
    {/* Tab buttons */}
    <div className="flex gap-0">
      {/* Active tab */}
      <button
        className="
          tab-btn active
          relative px-4 py-2.5
          text-sm font-medium
          text-accent-700 dark:text-accent-400
          transition-colors duration-150
        "
      >
        Yearly
        {/* Green underline via CSS ::after pseudo-element:
            .tab-btn.active::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 2px;
              background-color: #15803d; (accent-700)
              border-radius: 1px 1px 0 0;
            }
        */}
      </button>

      {/* Inactive tab */}
      <button
        className="
          tab-btn
          relative px-4 py-2.5
          text-sm font-medium
          text-base-400 dark:text-base-400
          hover:text-base-600 dark:hover:text-base-300
          transition-colors duration-150
        "
      >
        Monthly
      </button>
    </div>

    {/* Optional right-side content slot */}
    <div className="flex items-center gap-2">
      {/* e.g., ChartModeToggle rendered here */}
    </div>
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L349--358 -- Yearly / Monthly tab bar with active underline + Earnings/XIRR toggle

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-performance-expanded.png`

## Acceptance Criteria
- [ ] Active tab uses text-accent-700 dark:text-accent-400
- [ ] Active tab has a 2px green underline via the .tab-btn.active::after CSS rule from US-002
- [ ] Inactive tabs use text-base-400 with hover:text-base-600
- [ ] Full-width border-b border-base-150 dark:border-base-700 separator
- [ ] Optional right-side content slot renders when `rightContent` prop is provided
- [ ] Clicking an inactive tab calls onChange with the tab value
- [ ] Tab buttons use text-sm font-medium
- [ ] Dark mode styles apply correctly (accent-400 for active, base-400 for inactive)
- [ ] Smooth transition on hover/active state changes (duration-150)
- [ ] Component accepts an array of tab definitions with labels and values

## Technical Notes
- File to create: `src/components/shared/TabBar.tsx`
- Props: `tabs: Array<{ label: string, value: string }>`, `activeTab: string`, `onChange: (value: string) => void`, `rightContent?: ReactNode`
- The `.tab-btn.active::after` CSS is defined in `src/index.css` per US-002 — this component applies the `tab-btn` and `active` classes
- The green underline uses accent-700 (#15803d) in light mode; ensure the dark mode CSS uses accent-400
- This is a controlled component — the parent manages the active tab
- Export as named export: `export { TabBar }`
