# US-010: Settings Service and Settings Page

## Story
As the Insight platform user, I want a settings page so that I can configure my date format, theme, and demo mode preferences.

## Dependencies
- US-004: PocketBase Client and Auth Service (must be completed first)
- US-007: App Shell — Desktop Top Navigation (must be completed first)
- US-009: Theme Provider (must be completed first)

## Requirements
- Create `src/services/settings.ts`: CRUD for user settings in PocketBase
  - `getSettings(userId)`: Fetch current settings
  - `updateSettings(userId, data)`: Update settings
  - Settings fields (PRD §3.8, §10):
    - `dateFormat`: `"YYYY-MM-DD"` or `"DD/MM/YYYY"` (default: `"YYYY-MM-DD"`)
    - `theme`: `"light"` or `"dark"` (default: `"light"`)
    - `demoMode`: boolean (default: `false`)
- Create `src/components/layout/Settings.tsx`: Settings page UI
  - Date format toggle between the two options
  - Theme toggle (light/dark) — syncs with ThemeProvider
  - Home currency display: "DKK" (read-only, for reference, PRD §3.8)
  - Demo mode toggle (on/off)
- Settings are stored per user in PocketBase (PRD §3.8)
- Create a `useSettingsStore` Zustand store so any component can access current settings without prop drilling

## Shared Components Used
None — the Settings page is built with raw Tailwind (it's a simple form page, not a data-heavy view)

## UI Specification
- Page title: "Settings" with `text-2xl font-bold tracking-tight`
- Card container: `bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark p-5`
- Each setting as a row with label on left, control on right
- Toggle switches for theme and demo mode
- Segmented control for date format (two options)
- Accessible from desktop settings gear icon and mobile bottom tab "Settings"
- Screenshots: No dedicated settings screenshot exists — follow the card/form patterns from prototypes

## Acceptance Criteria
- [ ] Settings page renders at /settings route
- [ ] Date format can be toggled between YYYY-MM-DD and DD/MM/YYYY
- [ ] Theme toggle switches between light and dark mode immediately
- [ ] Demo mode toggle exists (functionality implemented in US-156)
- [ ] Home currency shows "DKK" as read-only
- [ ] Settings persist to PocketBase and survive page reload
- [ ] `useSettingsStore()` provides current settings to any component
- [ ] PRD §14 criterion 48: Date format is configurable

## Technical Notes
- Files to create: `src/services/settings.ts`, `src/components/layout/Settings.tsx`, `src/stores/settingsStore.ts`
- PocketBase collection: `settings` with fields: userId, dateFormat, theme, demoMode
- Create settings record on first login if it doesn't exist (upsert pattern)
- On app init: fetch settings via `useQuery({ queryKey: ['settings'], queryFn: settingsService.getSettings })` and hydrate the Zustand store
- Settings changes: optimistically update Zustand store immediately, then persist via `useMutation` calling `settingsService.updateSettings`
- Theme toggle calls `useThemeStore().setTheme()` AND triggers the settings mutation
