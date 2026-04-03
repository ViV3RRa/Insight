# US-002: Tailwind Configuration and Design Tokens

## Story
As the Insight platform user, I want a precisely configured Tailwind setup so that all UI components use the definitive design tokens from the prototypes.

## Dependencies
- US-001: Project Scaffolding (must be completed first)

## Requirements
- Configure `tailwind.config.js` with the exact design tokens from the prototypes (NOT the outdated design-system.md spec)
- Dark mode strategy: `class` on `<html>` element
- Custom color scales:
  - `accent`: 50 (#f0fdf4), 100 (#dcfce7), 200 (#bbf7d0), 400 (#4ade80), 500 (#22c55e), 600 (#16a34a), 700 (#15803d)
  - `base`: 50 (#f7f9f7), 100 (#f0f2f0), 150 (#e7e9e7), 200 (#d3d5d3), 300 (#afb1af), 400 (#898b89), 500 (#6a6c6a), 600 (#515351), 700 (#3c3e3c), 750 (#313313), 800 (#252725), 900 (#161816)
  - Override `white` to `#fafcfa` (subtle green-tinted off-white)
- Custom shadows:
  - `card`: `0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)`
  - `card-dark`: `0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)`
  - `card-hover-dark`: `0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)`
- Max-width: `content: 1440px`
- Add global CSS in `src/index.css`:
  - `.font-mono-data` class: `font-family: 'DM Mono', monospace; font-variant-numeric: tabular-nums;`
  - Scrollbar styling (6px width, rounded thumb)
  - `.dark` scrollbar variant
  - Custom select arrow for `.form-select` class
  - Tab underline CSS (`.tab-btn.active::after`)
  - Skeleton shimmer animation (`@keyframes shimmer`, 1.5s ease-in-out infinite)
  - Toast animation (`@keyframes toast-in`, 0.25s ease-out)
  - Spinner animation (`@keyframes spin`, 0.7s linear infinite)
  - Dialog animations (desktop: scale 0.95→1 + fade; mobile: translateY(100%)→0)
  - Body `transition-colors duration-200` for smooth theme switching

## Shared Components Used
None — this story IS the design token foundation

## UI Specification
N/A — configuration story. This is the SINGLE SOURCE OF TRUTH for all design tokens.

## Design Reference
**Prototype (canonical token source -- use these, not design-system.md):**
- `design-artifacts/prototypes/portfolio-overview.html` L48--62 -- Tailwind config with green-tinted accent/base/white tokens
- `design-artifacts/prototypes/home-overview.html` L43--57 -- Same token set
- `design-artifacts/prototypes/ui-states.html` L44--57 -- Tokens (note: slightly different base scale, not green-tinted)

## Acceptance Criteria
- [ ] `tailwind.config.js` contains exact color, shadow, and maxWidth values listed above
- [ ] `darkMode: 'class'` is configured
- [ ] `bg-accent-700` resolves to `#15803d` (green, NOT teal)
- [ ] `bg-base-100` resolves to `#f0f2f0` (green-tinted gray, NOT stone)
- [ ] `bg-white` resolves to `#fafcfa` (NOT pure white `#ffffff`)
- [ ] `.font-mono-data` class works and applies tabular-nums
- [ ] All keyframe animations are defined and usable
- [ ] Dialog animation classes work for both desktop and mobile breakpoints
- [ ] Dark mode classes properly toggle when `dark` class is on `<html>`
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test file**: N/A — configuration story, validated by build succeeding
- Tailwind config validated by build process and component tests using design tokens
- Keyframe animations and custom CSS classes validated visually through component tests in later stories

## Technical Notes
- Files to create/modify: `tailwind.config.js`, `src/index.css`
- The `base-150` stop is non-standard in Tailwind — Tailwind v3 supports arbitrary stops in the config
- The `white` override changes ALL uses of `bg-white`, `text-white`, etc. This is intentional per the prototypes
- Do NOT use Tailwind's built-in `stone` or `gray` scales — the custom `base` scale replaces them
