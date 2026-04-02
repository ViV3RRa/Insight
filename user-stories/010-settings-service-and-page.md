# US-010: Settings Service and Settings Page

## Story
As the Insight platform user, I want a settings page so that I can configure my date format, theme, and demo mode preferences.

## Dependencies
- US-004: PocketBase Client and Auth Service (must be completed first)
- US-007: App Shell — Desktop Top Navigation (must be completed first)
- US-009: Theme Provider (must be completed first)
- US-143: PocketBase Schema — Settings Collection

## Requirements
- Create `src/services/settings.ts`: CRUD for user settings in PocketBase
  - `getOrCreateSettings(): Promise<Settings>`: Fetch the current user's settings. If no settings record exists (first login), create one with defaults (`dateFormat: "YYYY-MM-DD"`, `theme: "light"`, `demoMode: false`) and return it. Uses the authenticated user's ID from the PocketBase client — callers do not pass `userId`.
  - `updateSettings(data: Partial<SettingsCreate>): Promise<Settings>`: Update the current user's settings. Uses authenticated user's ID internally.
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
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test files**: `src/services/settings.test.ts`, `src/components/layout/Settings.test.tsx`, `src/stores/settingsStore.test.ts`
- **Service tests**: Mock PocketBase via MSW. Test `getOrCreateSettings()` upsert pattern (returns existing or creates with defaults). Test `updateSettings()` partial updates.
- **Component tests**: RTL — date format toggle, theme toggle, demo mode toggle, DKK read-only display. Test that toggling theme calls both store and mutation.
- **Store tests**: Test hydration from PocketBase, `setDateFormat`, `setTheme`, `setDemoMode`, initial defaults.
- **Coverage target**: 90%+

## Technical Notes
- Files to create: `src/services/settings.ts`, `src/components/layout/Settings.tsx`, `src/stores/settingsStore.ts`
- PocketBase collection: `settings` with fields: userId, dateFormat, theme, demoMode
- `getOrCreateSettings()` implements the upsert pattern: query for existing settings → if none found, create with defaults → return the record. This runs on app init and guarantees a settings record always exists.
- On app init: fetch settings via `useQuery({ queryKey: ['settings'], queryFn: settingsService.getSettings })` and hydrate the Zustand store
- Settings changes: optimistically update Zustand store immediately, then persist via `useMutation` calling `settingsService.updateSettings`
- Theme toggle calls `useThemeStore().setTheme()` AND triggers the settings mutation
- All responses are parsed through Zod schemas (e.g., `settingsSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
