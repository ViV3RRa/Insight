# US-009: Theme Provider (Light/Dark Mode)

## Story
As the Insight platform user, I want to toggle between light and dark mode so that I can use the platform comfortably in different lighting conditions.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens (must be completed first)
- US-006: React Router Setup (must be completed first)

## Requirements
- Create a `useThemeStore` Zustand store that manages the current theme
- Theme options: `"light"` or `"dark"` (PRD §3.8)
- Default theme: light mode (PRD §8.4)
- Toggle mechanism: adds/removes `dark` class on `<html>` element (Tailwind class-based dark mode)
- Persist theme preference in localStorage (immediate) and sync to PocketBase settings when available
- `useThemeStore` exposes `{ theme, toggleTheme, setTheme }` directly (no wrapper hook needed)
- Body transition: `transition-colors duration-200` for smooth theme switching
- PRD §8.4: "Both themes must maintain sufficient color contrast and readability"

## Shared Components Used
N/A

## UI Specification
N/A — store story. The visual effect is the `dark` class toggling all `dark:` variants across the entire app.

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/home-overview.html` L83--85 -- Dark mode toggle button (desktop, in nav)
- All prototypes: `<html class="">` toggles `dark` class; `darkMode: 'class'` in Tailwind config

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-dark.png`
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-dark.png`

## Acceptance Criteria
- [ ] Light mode renders by default (no `dark` class on html)
- [ ] Toggling adds `dark` class to `<html>`, switching all colors to dark variants
- [ ] Theme preference persists across page reloads (localStorage)
- [ ] Body background smoothly transitions between light and dark
- [ ] `useThemeStore()` returns current theme and toggle function
- [ ] PRD §14 criterion 46: Light mode and dark mode are both functional and togglable

## Technical Notes
- File to create: `src/stores/themeStore.ts`
- Use Zustand store + `useEffect` to sync `dark` class on `<html>` when theme changes
- Persist in localStorage via Zustand's `persist` middleware: `theme: "light" | "dark"`
- Later (when Settings service exists), sync to PocketBase `settings.theme` via a TanStack Query mutation
