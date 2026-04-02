# US-007: App Shell — Desktop Top Navigation

## Story
As the Insight platform user, I want a persistent top navigation bar on desktop so that I can switch between sections and access settings.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens (must be completed first)
- US-006: React Router Setup (must be completed first)

## Requirements
- Create `src/components/layout/AppShell.tsx` — wraps all authenticated content
- Desktop top navigation bar (hidden on mobile via `hidden lg:flex`):
  - Left side: "Insight" brand text + section nav links (Home, Investment, Vehicles)
  - Right side: Settings gear icon button
  - Active section highlighted with accent color and background pill
  - Inactive sections in muted text with hover state
- Navigation is sticky at top (`sticky top-0 z-30`)
- Main content area below nav with max-width constraint and padding
- Nav bar uses card shadow for subtle elevation
- Section links navigate to their overview pages using react-router `<Link>` or `<NavLink>`
- Settings icon navigates to `/settings`
- PRD §8.1: Desktop horizontal top navigation bar with section links and settings icon

## Shared Components Used
None — this story IS the AppShell shared layout component

## UI Specification
Canonical markup from prototypes:

```html
<nav class="bg-white dark:bg-base-800 shadow-card dark:shadow-card-dark sticky top-0 z-30 relative">
  <div class="max-w-[1440px] mx-auto px-3 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-10">
        <div class="hidden lg:block text-xl font-bold tracking-tight">Insight</div>
        <div class="hidden lg:flex gap-1">
          <!-- Active tab -->
          <a class="px-4 py-2 text-sm rounded-lg font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-700/20">Home</a>
          <!-- Inactive tab -->
          <a class="px-4 py-2 text-sm rounded-lg text-base-400 hover:text-base-600 dark:hover:text-base-200 transition-colors">Investment</a>
        </div>
      </div>
      <div class="hidden lg:flex items-center">
        <button class="w-9 h-9 rounded-xl bg-base-150 dark:bg-base-700 flex items-center justify-center text-base-500 dark:text-base-300 hover:bg-base-200 dark:hover:bg-base-600 transition-colors">
          <!-- Settings gear icon (lucide-react Settings) w-4 h-4 -->
        </button>
      </div>
    </div>
  </div>
</nav>
```

Main content area:
```html
<main class="max-w-[1440px] mx-auto px-3 lg:px-8 py-6 lg:py-10 pb-24 lg:pb-10">
  {children / Outlet}
</main>
```

- Dark mode: bg-base-800, shadow-card-dark, accent-400 text for active

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L62--89 -- Desktop nav with brand + section links + settings gear
- `design-artifacts/prototypes/portfolio-overview.html` L68--99 -- Desktop nav with portfolio switcher context
- `design-artifacts/prototypes/vehicles-overview.html` -- Nav section (same structure)

**Screenshots:** all `overview-desktop-top.png` files show this nav
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-top.png`

## Acceptance Criteria
- [ ] Top nav is visible on desktop (lg+) screens
- [ ] Top nav is hidden on mobile (<lg) screens
- [ ] "Insight" brand text renders at top-left
- [ ] Three section links render: Home, Investment, Vehicles
- [ ] Active section is highlighted with accent color and bg pill
- [ ] Clicking a section navigates to its overview page
- [ ] Settings gear icon renders at top-right and navigates to /settings
- [ ] Nav is sticky and stays at top when scrolling
- [ ] Works in both light and dark mode
- [ ] Visual output matches prototype screenshots: overview-desktop-top (any section)
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test file**: `src/components/layout/AppShell.test.tsx`
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+
- Test rendering of navigation links
- Test active route highlighting
- Test responsive visibility classes
- Test navigation triggers route changes

## Technical Notes
- Files to create: `src/components/layout/AppShell.tsx`
- Use `useLocation()` from react-router to determine active section
- Use lucide-react `Settings` icon (w-4 h-4)
- The AppShell contains both desktop nav AND mobile nav (US-008) — but this story only implements the desktop portion
- The mobile header area within the nav (for detail page titles/switchers) is a slot filled by child pages
