# US-106: Home Section — Dark Mode Polish

## Story
As the Insight platform user, I want the entire Home section to render correctly in dark mode so that I can use the platform comfortably in low-light environments.

## Dependencies
- US-009: Theme Provider (Dark Mode Toggle)
- US-094: Home Overview — Page Assembly
- US-101: Utility Detail — Page Assembly

## Requirements
- Audit and polish all Home section pages and components for dark mode (PRD §8.4)
- All surfaces: correct dark mode background/shadow tokens
- All text: correct dark mode contrast
- Utility icon backgrounds: dark mode opacity variants (e.g. `dark:bg-amber-900/30`)
- Charts: legible with dark backgrounds, utility colors maintain contrast
- Chart area fills adjusted for dark backgrounds
- Staleness badges: dark mode variants
- All form elements, buttons, and toggles use dark mode tokens
- YoY comparison row readable in dark mode

## Shared Components Used
- All existing shared components — verify dark mode tokens in Home context

## UI Specification

**Key utility-specific dark mode considerations:**
- Utility icon backgrounds: use `/30` opacity on dark mode (e.g. `dark:bg-amber-900/30`)
- Chart bar colors: same hues work on both light/dark, but ensure axis/grid visibility
- Yearly table expansion: expanded row background visible in dark mode

## Design Reference
**Prototype:** all home prototypes use `darkMode: 'class'` -- toggle via `<html class="dark">`

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-dark.png`

## Acceptance Criteria
- [ ] All Home pages render correctly with dark class
- [ ] Page backgrounds: `dark:bg-base-900`
- [ ] Cards: `dark:bg-base-800` with `dark:shadow-card-dark`
- [ ] All text has appropriate dark mode contrast
- [ ] Utility icons use dark mode background variants
- [ ] Charts legible in dark mode
- [ ] Form elements use dark mode tokens
- [ ] Staleness badges use dark variants
- [ ] No missed white elements
- [ ] Sufficient contrast for accessibility
- [ ] PRD §14 criterion 46: Dark mode functional
- [ ] Dark mode styling verified through existing component tests checking dark: class variants

## Testing Requirements
- **Test file**: N/A — visual regression / manual verification story
- Dark mode verified through existing component tests checking `dark:` class variants
- No dedicated test file; dark mode correctness is ensured by:
  - Component tests in US-089 through US-101 asserting `dark:` Tailwind class presence (e.g., `dark:bg-base-800`, `dark:shadow-card-dark`, `dark:text-base-300`)
  - Manual verification with `<html class="dark">` toggle
  - Verifying all surfaces use correct dark mode background/shadow tokens
  - Verifying sufficient contrast for accessibility in dark mode
  - Verifying utility icon backgrounds use `/30` opacity variants (e.g., `dark:bg-amber-900/30`)

## Technical Notes
- Visual audit, not new features
- Toggle via Settings page or ThemeProvider
- Check every Home component file for missing `dark:` prefixes
- Utility colors (amber, blue, orange) need explicit dark variants in icon backgrounds
