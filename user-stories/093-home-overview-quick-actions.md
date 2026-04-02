# US-093: Home Overview — Quick Actions

## Story
As the Insight platform user, I want quick-add buttons for "Add Reading" and "Add Bill" on the Home overview so that I can enter data with minimal navigation.

## Dependencies
- US-013: Button Component

## Requirements
- Two action buttons accessible from the Home overview page (PRD §5.3 item 5):
  - **"+ Add Reading"** — secondary button, opens MeterReadingDialog (US-107) with utility select visible
  - **"+ Add Bill"** — primary button, opens BillDialog (US-108) with utility select visible
- Desktop: buttons in the page header row (right-aligned)
- Mobile: full-width button pair below the header (`flex gap-2 mb-4 lg:hidden`)

## Shared Components Used
- `Button` (US-013) — props: secondary for "Add Reading", primary for "Add Bill"

## UI Specification

**Desktop (in header row):**
```
<div className="hidden lg:flex items-center gap-2">
  <Button variant="secondary" size="sm" onClick={openAddReading}>+ Add Reading</Button>
  <Button variant="primary" size="sm" onClick={openAddBill}>+ Add Bill</Button>
</div>
```

**Mobile (below header):**
```
<div className="flex gap-2 mb-4 lg:hidden">
  <Button variant="secondary" fullWidth onClick={openAddReading}>+ Add Reading</Button>
  <Button variant="primary" fullWidth onClick={openAddBill}>+ Add Bill</Button>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Desktop header action buttons: L99-102 ("+ Add Reading" secondary + "+ Add Bill" primary)
- Mobile action buttons: L105-109 (flex row, each flex-1)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-top.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-reading.png`
- `design-artifacts/prototypes/screenshots/home/overview-mobile-add-bill.png`

## Acceptance Criteria
- [ ] "Add Reading" button opens MeterReadingDialog with utility select
- [ ] "Add Bill" button opens BillDialog with utility select
- [ ] Desktop: buttons in header row, sm size
- [ ] Mobile: full-width buttons below header
- [ ] Correct button variants (secondary for Reading, primary for Bill)
- [ ] PRD §5.3 item 5: Quick actions accessible from overview

## Technical Notes
- These buttons are part of the HomeOverview page assembly (US-096)
- The dialogs (US-107, US-108) need to accept an optional `utilityId` prop — when omitted, they show a utility select dropdown
