# US-098: Utility Detail — Meter Readings Table

## Story
As the Insight platform user, I want a collapsible meter readings table on the utility detail page so that I can review, edit, and manage the raw readings that drive consumption calculations.

## Dependencies
- US-025: DataTable Component
- US-082: Meter Reading CRUD Service

## Requirements
- Render meter readings in an always-visible card (not collapsed) (PRD §5.4)
- Show 5 rows by default with a "Show N older readings" toggle at the bottom of the card
- Table columns:
  1. **Date**: formatted per locale settings
  2. **Reading**: cumulative meter value with unit suffix (font-mono-data)
  3. **Note**: optional note text (italic, muted)
  4. **Attachment**: Paperclip icon when file attached, dash when not
  5. **Actions**: Edit and Delete icon buttons (desktop only)
- Sorted by date descending (most recent first)
- Edit opens MeterReadingDialog (US-107) pre-filled
- Delete triggers confirmation dialog (US-029)
- "Add Reading" button in section header
- Mobile: row tap opens MobileDrawer with full details + Edit/Delete buttons

## Shared Components Used
- `DataTable` (US-025) — props: { columns, data, showMoreThreshold: 5, onEdit, onDelete, onRowClick }
- `Button` (US-013) — for "+ Add Reading" action button in the card header

## UI Specification

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Date | left | locale date format | always visible |
| Reading | right | font-mono-data + unit suffix | always visible |
| Note | left | italic text-xs text-base-300 | hidden on mobile |
| Attachment | center | Paperclip icon or dash | hidden on mobile |
| Actions | right | Edit/Delete icons | hidden on mobile (use drawer) |

**Card with header and action button:**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">Meter Readings</h3>
        <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">{count}</span>
      </div>
      <Button variant="secondary" size="sm" onClick={openAddReading}>+ Add Reading</Button>
    </div>
  </div>
  <DataTable ... />
  {/* "Show N older readings" toggle at bottom */}
  <button className="w-full py-3 text-xs font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 border-t border-base-100 dark:border-base-700/50">
    Show {hiddenCount} older readings <ChevronDown className="w-3.5 h-3.5" />
  </button>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Meter Readings card: L555-750
  - Card header with title, count badge, "+ Add Reading" button: L556-567
  - Table headers (Date, Meter value, Note, Attachment, Actions): L569-578
  - Reading rows with inline edit/delete buttons: L579-743
  - "Show N older readings" toggle: L746-749
- Reading detail drawer (mobile): L912-946

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-top.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-reading.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-reading-drawer.png`

## Acceptance Criteria
- [ ] Meter readings table in an always-visible card (not collapsed)
- [ ] Card header shows title "Meter Readings" + count badge + "+ Add Reading" button
- [ ] 5 rows visible by default with "Show N older readings" toggle at the bottom
- [ ] Date column formats per locale settings
- [ ] Reading column shows cumulative value with unit suffix (font-mono-data)
- [ ] Notes display as italic muted text
- [ ] Attachment column shows Paperclip icon or dash
- [ ] "+ Add Reading" button in section header opens MeterReadingDialog
- [ ] Edit opens MeterReadingDialog pre-filled
- [ ] Delete opens confirmation dialog
- [ ] Desktop: inline edit/delete icon buttons per row
- [ ] Mobile: row tap opens MobileDrawer with full details + Edit/Delete
- [ ] Rows sorted by date descending
- [ ] "Show N older readings" toggle at bottom with chevron icon (rotates 180deg when expanded)
- [ ] When expanded, a "Show less" link appears in the header area
- [ ] Uses shared DataTable
- [ ] All tests pass and meet coverage target
- [ ] Component rendering verified by tests covering data display, interactions, and edge states

## Testing Requirements
- **Test file**: `src/components/home/UtilityReadingsTable.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked service data via MSW
- **Coverage target**: 80%+ line coverage
- Test card header shows "Meter Readings" title, count badge, and "+ Add Reading" button
- Test 5 rows visible by default with "Show N older readings" toggle
- Test date column formats per locale settings
- Test reading column shows cumulative value with unit suffix (font-mono-data)
- Test notes display as italic muted text
- Test attachment column shows Paperclip icon when attached, dash when not
- Test "+ Add Reading" button fires callback to open MeterReadingDialog
- Test edit button opens MeterReadingDialog pre-filled
- Test delete button opens confirmation dialog
- Test rows sorted by date descending
- Test "Show N older readings" toggle expands/collapses
- Test empty state (no readings)

## Technical Notes
- This section is within `src/components/home/UtilityDetail.tsx`
- Readings fetched via `meterReadingService.getByUtility(utilityId)` from US-082
- Unit suffix from the parent utility's `unit` field (e.g. "kWh", "m³")
- Attachment URL via `meterReadingService.getAttachmentUrl(reading)`
