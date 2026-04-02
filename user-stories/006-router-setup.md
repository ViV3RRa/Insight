# US-006: React Router Setup

## Story
As the Insight platform user, I want proper routing so that I can navigate between sections and detail pages with URL-based navigation.

## Dependencies
- US-001: Project Scaffolding (must be completed first)
- US-004: PocketBase Client and Auth Service (must be completed first)
- US-005: Login Page (must be completed first)

## Requirements
- Configure `react-router-dom` with the following route structure:
  - `/login` — Login page (public)
  - `/` — Redirect to `/home` (default section after login, PRD §8.1)
  - `/home` — Home overview page
  - `/home/:utilityId` — Utility detail page
  - `/investment` — Portfolio overview page (default portfolio pre-selected)
  - `/investment/platform/:platformId` — Platform detail page (investment or cash)
  - `/vehicles` — Vehicles overview page
  - `/vehicles/:vehicleId` — Vehicle detail page
  - `/settings` — Settings page
- Protected routes: all routes except `/login` require authentication
- Auth guard: redirect to `/login` if not authenticated
- After login: redirect to `/home` (PRD §2.2)
- Wrap the app in `BrowserRouter` in `src/main.tsx`
- Update `src/App.tsx` to render the router with route definitions

## Shared Components Used
N/A

## UI Specification
N/A — routing/infrastructure story

## Acceptance Criteria
- [ ] Unauthenticated users are redirected to `/login`
- [ ] After login, user lands on `/home`
- [ ] All defined routes render placeholder content
- [ ] Browser back/forward navigation works
- [ ] Direct URL access works (e.g., navigating directly to `/investment`)
- [ ] Unknown routes redirect to `/home`

## Technical Notes
- Files to modify: `src/App.tsx`, `src/main.tsx`
- Create a `ProtectedRoute` wrapper component that checks `auth.isAuthenticated()`
- Use `<Outlet>` for nested layouts (AppShell wrapping section content)
- Placeholder components for each route (just section name as text) — real pages come later
