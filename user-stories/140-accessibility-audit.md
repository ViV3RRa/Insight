# US-140: Accessibility Audit and Fixes

## Story
As the Insight platform user, I want the platform to meet basic accessibility standards so that all interactive elements are keyboard-navigable and screen-reader friendly.

## Dependencies
- All UI stories completed (US-001 through US-139)

## Requirements
- Audit and fix accessibility across the entire platform (PRD §13):
  - **ARIA labels** on all interactive elements (buttons, links, inputs, dialogs, tabs)
  - **Sufficient color contrast** in both light and dark themes (WCAG AA minimum: 4.5:1 for text, 3:1 for large text)
  - **Keyboard navigation**: all dialogs, forms, dropdowns, tabs navigable via keyboard
  - **Focus management**: focus trapped in modals, returns to trigger on close
  - **Screen reader**: meaningful alt text on images, aria-labels on icon-only buttons
  - **Skip links**: optional but good practice for navigation
- Key areas to audit:
  - Dialog shell: `role="dialog"`, `aria-modal="true"`, focus trap
  - Tab bar: `role="tablist"`, `role="tab"`, `aria-selected`
  - Dropdown switcher: `aria-expanded`, `aria-haspopup`
  - Charts: `aria-label` describing what the chart shows
  - Icon-only buttons: `aria-label` (e.g. edit, delete, settings)
  - Color-coded indicators: not relying on color alone (also use text/icon)
  - Mobile bottom sheet: `role="dialog"`, swipe-to-dismiss accessible alternative

## Shared Components Used
- All shared components — audit their accessibility attributes

## UI Specification
N/A — this is an audit and fix story

## Design Reference
**Prototype (accessibility patterns to verify):**
- `design-artifacts/prototypes/portfolio-overview.html` — Dialog `role="dialog" aria-modal="true"` (L1187, L1239, etc.)
- `design-artifacts/prototypes/ui-states.html` — All UI state patterns need ARIA compliance
- All prototypes: keyboard navigation (Escape closes dialogs), focus management

## Acceptance Criteria
- [ ] All dialogs have `role="dialog"` and `aria-modal="true"`
- [ ] Focus trapped in open dialogs
- [ ] Focus returns to trigger element on dialog close
- [ ] Tab bar uses ARIA tablist/tab roles
- [ ] Dropdown switchers use aria-expanded/aria-haspopup
- [ ] All icon-only buttons have aria-labels
- [ ] All form inputs have associated labels
- [ ] Color contrast passes WCAG AA in both themes
- [ ] Charts have descriptive aria-labels
- [ ] Platform icon images have alt text
- [ ] Vehicle photos have alt text
- [ ] Change indicators not relying solely on color (also use +/- prefix)
- [ ] Keyboard can reach all interactive elements
- [ ] Escape key closes dialogs and dropdowns
- [ ] PRD §13: ARIA labels, sufficient contrast, keyboard navigation
- [ ] Automated axe-core audit passes on every page with zero violations
- [ ] Accessibility fixes validated in both light and dark themes

## Testing Requirements
- **Test file**: N/A — audit/verification story
- **Approach**: Testing IS the deliverable — automated accessibility testing with axe-core
- Run axe-core on every page (Home overview, utility detail, portfolio overview, platform detail, vehicles overview, vehicle detail, settings) and fix all violations
- Verify WCAG AA color contrast (4.5:1 for text, 3:1 for large text) in both light and dark themes
- Test keyboard navigation: Tab through all interactive elements, verify focus order is logical
- Test focus trap in all dialogs: focus cannot escape modal, returns to trigger on close
- Test Escape key closes all dialogs and dropdowns
- Integrate axe-core checks into the CI test suite (e.g., `vitest-axe` or `jest-axe`) for ongoing regression prevention

## Technical Notes
- Use browser accessibility tools (axe DevTools, Lighthouse) to audit
- Focus trap: use a focus-trap library or custom implementation in DialogShell
- Charts (Recharts) have limited accessibility — add wrapper aria-label describing the data
- Staleness badges already use text ("Stale") alongside color — verify
- Change indicators already use +/- prefix alongside color — verify
