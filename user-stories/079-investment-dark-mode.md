# US-079: Investment Section — Dark Mode Polish

## Story
As the Insight platform user, I want the entire Investment section to render correctly in dark mode so that I can use the platform comfortably in low-light environments.

## Dependencies
- US-009: Theme Provider (Dark Mode Toggle)
- US-066: Portfolio Overview — Page Assembly
- US-067: Platform Detail — Header + Stat Cards
- US-073: Cash Platform Detail Page

## Requirements
- Audit and polish all Investment section pages and components for dark mode (PRD §8.4)
- Ensure all surfaces use correct dark mode tokens:
  - Page background: `dark:bg-base-900`
  - Card surfaces: `dark:bg-base-800`
  - Card shadows: `dark:shadow-card-dark`
  - Input backgrounds: `dark:bg-base-900`
  - Input borders: `dark:border-base-600`
  - Dividers: `dark:border-base-700`
- Ensure all text uses correct dark mode tokens:
  - Primary text: `dark:text-base-100` or `dark:text-white`
  - Secondary text: `dark:text-base-400`
  - Muted text: `dark:text-base-500`
  - Positive values: `dark:text-emerald-400`
  - Negative values: `dark:text-rose-400`
- Charts must be legible in dark mode:
  - Grid lines and axis text use muted dark tokens
  - Bar colors maintain contrast against dark backgrounds
  - Area chart fills adjusted for dark backgrounds
- Allocation bar and legend readable in dark mode
- Platform icons maintain ring styling: `dark:ring-white/10`
- Staleness badges use dark variants (amber/rose backgrounds with `/30` opacity)
- All buttons, toggles, and form elements use dark mode variants
- Closed platforms: `opacity-60` remains readable in dark mode

## Shared Components Used
- All existing shared components — this story verifies their dark mode tokens are applied correctly in the Investment context

## UI Specification

**Key dark mode color mappings (from ui-analysis §1.3):**
| Element | Dark Token |
|---------|-----------|
| Page bg | `dark:bg-base-900` |
| Card bg | `dark:bg-base-800` |
| Card shadow | `dark:shadow-card-dark` |
| Primary text | `dark:text-base-100` |
| Secondary text | `dark:text-base-400` |
| Muted text | `dark:text-base-500` |
| Active nav/tab | `dark:text-accent-400` |
| Primary button | `dark:bg-accent-600 dark:hover:bg-accent-700` |
| Input bg | `dark:bg-base-900` |
| Input border | `dark:border-base-600` |
| Divider | `dark:border-base-700` |
| Segmented control bg | `dark:bg-base-700` |
| Active pill | `dark:bg-base-600` |

## Design Reference
**Prototype:** all investment prototypes use `darkMode: 'class'` — toggle via `<html class="dark">`

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-dark.png`

## Acceptance Criteria
- [ ] All investment pages render correctly with `dark` class on html element
- [ ] Page background uses `dark:bg-base-900`
- [ ] Cards use `dark:bg-base-800` with `dark:shadow-card-dark`
- [ ] All text has appropriate dark mode contrast
- [ ] Positive/negative values use `dark:text-emerald-400` / `dark:text-rose-400`
- [ ] Charts are legible with dark backgrounds
- [ ] Form elements (inputs, selects, radios) use dark mode tokens
- [ ] Dialogs use dark mode backgrounds and text
- [ ] Allocation bar colors are distinguishable in dark mode
- [ ] Platform icons have appropriate ring styling in dark mode
- [ ] Staleness badges use dark mode opacity variants
- [ ] Closed/muted elements remain readable in dark mode
- [ ] No white "flash" elements that were missed during dark mode conversion
- [ ] Sufficient color contrast for accessibility (WCAG AA minimum)
- [ ] PRD §8.4: Light and dark mode both functional
- [ ] PRD §14 criterion 46: Light mode and dark mode are both functional and togglable

## Technical Notes
- This story is a visual audit, not new feature development
- Verify by toggling dark mode via Settings page (US-010) or ThemeProvider (US-009)
- The `dark` class strategy (Tailwind `darkMode: 'class'`) is set on `<html>` element
- Check every Investment section component file for missing `dark:` prefixes
- Pay special attention to chart colors — Recharts may need explicit dark mode color props
- Test with dark mode screenshots as reference: detail-desktop-dark
