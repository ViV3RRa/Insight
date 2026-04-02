# US-020: YoYToggle Component

## Story
As the Insight platform user, I want a toggle button to overlay year-over-year data on charts so that I can compare current performance against the same period last year.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `YoYToggle` button component per PRD §3.2
- Two visual states: inactive (default) and active
- Inactive: outlined style with ArrowLeftRight icon
- Active: green accent background with filled styling
- Toggles between states on click
- Used inside chart card headers alongside ChartModeToggle
- Not enabled by default — it is a lens the user activates

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Inactive state === */
<button
  className="
    inline-flex items-center gap-1.5
    px-2.5 py-1.5 text-xs font-medium
    rounded-lg
    border border-base-200 dark:border-base-600
    text-base-400 dark:text-base-400
    hover:text-base-600 hover:border-base-300
    dark:hover:text-base-300 dark:hover:border-base-500
    transition-colors duration-150
  "
>
  <svg className="w-3.5 h-3.5">
    {/* ArrowLeftRight icon from lucide-react */}
  </svg>
  YoY
</button>

/* === Active state === */
<button
  className="
    inline-flex items-center gap-1.5
    px-2.5 py-1.5 text-xs font-medium
    rounded-lg
    bg-accent-50 dark:bg-accent-900/30
    text-accent-600 dark:text-accent-400
    border border-accent-200 dark:border-accent-700
    transition-colors duration-150
  "
>
  <svg className="w-3.5 h-3.5">
    {/* ArrowLeftRight icon from lucide-react */}
  </svg>
  YoY
</button>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L322--325 -- YoY toggle button with arrow icon
- `design-artifacts/prototypes/portfolio-overview.html` L283--287 -- YoY toggle in investment charts

## Acceptance Criteria
- [ ] Inactive state uses border border-base-200 text-base-400 with no accent background
- [ ] Active state uses bg-accent-50 text-accent-600 border-accent-200
- [ ] ArrowLeftRight icon renders at w-3.5 h-3.5
- [ ] Clicking toggles between inactive and active states
- [ ] onChange callback is called with the new boolean state
- [ ] Dark mode: inactive uses dark:border-base-600, active uses dark:bg-accent-900/30 dark:text-accent-400
- [ ] Label reads "YoY"
- [ ] Transition-colors duration-150 for smooth state changes

## Technical Notes
- File to create: `src/components/shared/YoYToggle.tsx`
- Props: `active: boolean`, `onChange: (active: boolean) => void`
- The ArrowLeftRight icon comes from lucide-react
- This is a controlled component — the parent manages the active state
- Export as named export: `export { YoYToggle }`
