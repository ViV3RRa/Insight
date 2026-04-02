# US-092: Home Overview — Add Utility Link

## Story
As the Insight platform user, I want an "Add Utility" link at the bottom of the Home overview so that I can create new utilities to track.

## Dependencies
- US-081: Utility CRUD Service
- US-088: Utility Icon Component

## Requirements
- Text link at the bottom of the Home overview page (PRD §5.3)
- Styled as a full-width centered text button: "+ Add Utility"
- Clicking opens the UtilityDialog (US-105) in create mode
- Matches the styling of the "+ Add Platform" link on the Portfolio overview

## Shared Components Used
- `Button` (US-013) — add-item text variant

## UI Specification

```
<div className="text-center py-4">
  <button
    onClick={() => setShowUtilityDialog(true)}
    className="text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors"
  >
    + Add Utility
  </button>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Add Utility button: L395-399

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`

## Acceptance Criteria
- [ ] "+ Add Utility" link renders at the bottom of the overview page
- [ ] Clicking opens UtilityDialog in create mode
- [ ] Styled as muted text with hover effect
- [ ] Centered horizontally
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering click behavior and styling

## Testing Requirements
- **Test file**: `src/components/home/AddUtilityLink.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 80%+ line coverage
- Test "+ Add Utility" link renders with correct text
- Test click fires callback to open UtilityDialog in create mode
- Test muted text styling with hover effect classes
- Test centered horizontal alignment (text-center)

## Technical Notes
- This is part of the HomeOverview page assembly (US-096)
- The UtilityDialog (US-105) handles the actual creation
