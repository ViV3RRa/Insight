# US-008: App Shell — Mobile Bottom Tab Bar

## Story
As the Insight platform user, I want a fixed bottom tab bar on mobile so that I can navigate between sections with one thumb.

## Dependencies
- US-007: App Shell — Desktop Top Navigation (must be completed first)

## Requirements
- Create `src/components/layout/BottomTabBar.tsx`
- Fixed bottom navigation bar visible only on mobile (`lg:hidden`)
- Four tabs: Home, Investment, Vehicles, Settings
- Each tab shows an icon above a label
- Active tab uses accent color; inactive tabs use muted base-400
- Tab bar has top border and solid background (not transparent)
- Always visible — even on detail pages (PRD §8.1)
- Tapping a tab navigates to the section's overview page
- Bottom padding on main content (`pb-24 lg:pb-10`) clears the tab bar

## Shared Components Used
None — this story IS the BottomTabBar shared layout component

## UI Specification
Canonical markup from prototypes:

```html
<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 z-30 lg:hidden">
  <div class="flex items-center justify-around h-16">
    <!-- Active tab -->
    <a class="flex flex-col items-center gap-1 px-4 py-2 text-accent-600 dark:text-accent-400">
      <svg class="w-5 h-5"><!-- icon --></svg>
      <span class="text-[10px] font-medium">Home</span>
    </a>
    <!-- Inactive tab -->
    <a class="flex flex-col items-center gap-1 px-4 py-2 text-base-400">
      <svg class="w-5 h-5"><!-- icon --></svg>
      <span class="text-[10px] font-medium">Investment</span>
    </a>
  </div>
</nav>
```

Icons (from lucide-react): Home, TrendingUp (Investment), Car (Vehicles), Settings

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L403--423 -- Mobile bottom tab bar (Home active)
- `design-artifacts/prototypes/portfolio-overview.html` L1472--1492 -- Mobile bottom tab bar (Investment active)

**Screenshots:** all `overview-mobile-top.png` files show the tab bar
- `design-artifacts/prototypes/screenshots/home/overview-mobile-top.png`
- `design-artifacts/prototypes/screenshots/investment/overview-mobile-top.png`

## Acceptance Criteria
- [ ] Bottom tab bar is visible on mobile (<lg) screens
- [ ] Bottom tab bar is hidden on desktop (lg+) screens
- [ ] Four tabs render with correct icons and labels
- [ ] Active tab is highlighted with accent color
- [ ] Tapping a tab navigates to the correct section
- [ ] Tab bar is fixed at bottom and stays visible when scrolling
- [ ] Main content has enough bottom padding to not be obscured by the tab bar
- [ ] Works in both light and dark mode
- [ ] Visual output matches prototype screenshots: overview-mobile-top
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test file**: `src/components/layout/BottomTabBar.test.tsx`
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+
- Test rendering of navigation links
- Test active route highlighting
- Test responsive visibility classes
- Test navigation triggers route changes

## Technical Notes
- File to create: `src/components/layout/BottomTabBar.tsx`
- Integrate into `AppShell.tsx` below the `<main>` content area
- Use `useLocation()` to determine active tab
- lucide-react icons: `Home`, `TrendingUp`, `Car`, `Settings`
- The tab bar height is `h-16` (64px), matching the top nav height
