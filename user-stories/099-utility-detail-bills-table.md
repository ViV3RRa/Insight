# US-099: Utility Detail — Bills Table

## Story
As the Insight platform user, I want a collapsible bills table on the utility detail page so that I can review, edit, and manage utility bills with their coverage periods and amounts.

## Dependencies
- US-025: DataTable Component
- US-083: Utility Bill CRUD Service

## Requirements
- Render bills in an always-visible card (not collapsed) (PRD §5.4)
- Show 5 rows by default with a "Show N older bills" toggle at the bottom
- Table columns:
  1. **Period**: combined coverage period (e.g., "Jan 2025 – Dec 2025"), text-base-500
  2. **Amount**: bill amount in DKK (font-mono-data font-medium)
  3. **Date received**: bill received date (font-mono-data text-base-400, desktop only)
  4. **Note**: optional note text (text-base-500, desktop only)
  5. **Attachment**: link when file attached or dash (desktop only)
  6. **Actions**: Edit and Delete icon buttons (desktop only)
- Sorted by periodStart descending (most recent first)
- Edit opens BillDialog (US-108) pre-filled
- Delete triggers confirmation dialog (US-029)
- "Add Bill" button in section header
- Mobile: row tap opens MobileDrawer with full details + Edit/Delete buttons

## Shared Components Used
- `DataTable` (US-025) — props: { columns, data, showMoreThreshold: 5, onEdit, onDelete, onRowClick }
- `Button` (US-013) — for "+ Add Bill" action button in the card header

## UI Specification

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Period | left | combined "Mon YYYY – Mon YYYY" text-base-500 | always visible |
| Amount | right | font-mono-data font-medium + "DKK" | always visible |
| Date received | left | font-mono-data text-base-400 | hidden on mobile |
| Note | left | text-sm text-base-500 (or "—" in text-base-400) | hidden on mobile |
| Attachment | left | accent link or "—" text-base-300 | hidden on mobile |
| Actions | right | Edit/Delete icons | hidden on mobile (use drawer) |

**Card with header and action button:**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  <div className="px-3 lg:px-6 py-5 border-b border-base-100 dark:border-base-700">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold">Bills</h3>
        <span className="text-xs bg-base-100 dark:bg-base-700 text-base-400 px-2 py-0.5 rounded-full font-medium">{count}</span>
      </div>
      <Button variant="primary" size="sm" onClick={openAddBill}>+ Add Bill</Button>
    </div>
  </div>
  <DataTable ... />
  {/* "Show N older bills" toggle at bottom */}
  <button className="w-full py-3 text-xs font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 border-t border-base-100 dark:border-base-700/50">
    Show {hiddenCount} older bills <ChevronDown className="w-3.5 h-3.5" />
  </button>
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/utility-detail.html`
- Bills card: L752-840
  - Card header with title, count badge, "+ Add Bill" button (primary): L753-764
  - Table headers (Period, Amount, Date received, Note, Attachment, Actions): L766-775
  - Bill rows with inline edit/delete buttons: L777-833
  - "Show N older bills" toggle: L836-839
- Bill detail drawer (mobile): L948-986

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/detail-desktop-bills.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-tables.png`
- `design-artifacts/prototypes/screenshots/home/detail-desktop-edit-bill.png`
- `design-artifacts/prototypes/screenshots/home/detail-mobile-bill-drawer.png`

## Acceptance Criteria
- [ ] Bills table in an always-visible card (not collapsed)
- [ ] Card header shows title "Bills" + count badge + "+ Add Bill" button (primary variant)
- [ ] 5 rows visible by default with "Show N older bills" toggle at the bottom
- [ ] Period column shows combined coverage range (e.g., "Jan 2025 – Dec 2025") in text-base-500
- [ ] Amount shows bill total in DKK with font-mono-data font-medium
- [ ] Date received column (desktop only) in font-mono-data text-base-400
- [ ] Notes display as text-sm text-base-500 (or "—" in text-base-400 when empty)
- [ ] Attachment column shows accent-colored link or "—" in text-base-300
- [ ] "+ Add Bill" button in card header opens BillDialog
- [ ] Edit opens BillDialog pre-filled
- [ ] Delete opens confirmation dialog
- [ ] Desktop: inline edit/delete icon buttons per row
- [ ] Mobile: row tap opens MobileDrawer with full details + Edit/Delete
- [ ] Rows sorted by periodStart descending
- [ ] "Show N older bills" toggle at bottom with chevron icon (rotates 180deg when expanded)
- [ ] When expanded, a "Show less" link appears in the header area
- [ ] Uses shared DataTable

## Technical Notes
- This section is within `src/components/home/UtilityDetail.tsx`
- Bills fetched via `utilityBillService.getByUtility(utilityId)` from US-083
- Period dates formatted per locale settings (configurable date format)
- Attachment URL via `utilityBillService.getAttachmentUrl(bill)`
