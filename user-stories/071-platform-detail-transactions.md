# US-071: Platform Detail — Transactions Table

## Story
As the Insight platform user, I want a collapsible transactions table on the platform detail page so that I can review all deposits and withdrawals with their amounts, exchange rates, notes, and attachments.

## Dependencies
- US-023: CollapsibleSection (Accordion) Component
- US-025: DataTable Component
- US-038: TransactionTypeBadge Component
- US-017: CurrencyDisplay Component
- US-045: Transaction CRUD Service

## Requirements
- Render transactions in a collapsible table, collapsed by default (PRD §3.6, §6.4 item 3)
- Table columns:
  1. **Date**: formatted per locale settings
  2. **Type**: Deposit (green badge) or Withdrawal (red badge) via TransactionTypeBadge
  3. **Amount**: native currency + DKK equivalent (CurrencyDisplay) for non-DKK platforms
  4. **Exchange Rate**: shown only for non-DKK platforms (the rate used at transaction time)
  5. **Note**: optional note text (italic, muted)
  6. **Attachment**: link/icon when a file is attached (Paperclip icon)
  7. **Actions**: Edit and Delete icon buttons (desktop only)
- Mobile: "Dep."/"Wdl." abbreviations for type badge (handled by TransactionTypeBadge)
- Mobile: note and attachment columns replaced by small icons in the date cell or hidden
- Sorted by date descending
- Edit opens TransactionDialog (US-079) pre-filled
- Delete triggers confirmation dialog (US-029)

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Transactions", icon: ArrowDownUp, count: transactions.length, defaultExpanded: false, children: <DataTable /> }
- `DataTable` (US-025) — props: { columns: transactionColumns, data: transactions, onEdit: openEditDialog, onDelete: openDeleteConfirm, onRowClick: openMobileDrawer }
- `TransactionTypeBadge` (US-038) — props: { type: transaction.type } — rendered in the Type cell
- `CurrencyDisplay` (US-017) — props: { amount: tx.amount, currency: platform.currency, dkkEquivalent: tx.amountDkk } — rendered in the Amount cell
- `Button` (US-013) — for "+ Add Transaction" header action button and row edit/delete actions

## UI Specification

**Placement:** Below the data points table (or above it — order per PRD is transactions before data points: §6.4 items 3, 4), with section spacing `mb-6 lg:mb-8`.

The `CollapsibleSection` wraps the `DataTable`.

**Exchange Rate column (non-DKK only):**
```
<span className="font-mono-data text-sm text-base-500">7,4600</span>
```
This column is only rendered when `platform.currency !== "DKK"`.

**Attachment column:**
```
{/* Has attachment */}
<a href={attachmentUrl} className="text-base-400 hover:text-accent-600 dark:hover:text-accent-400">
  <Paperclip className="w-3.5 h-3.5" />
</a>

{/* No attachment */}
<span className="text-base-200 dark:text-base-600">—</span>
```

**Table column definitions:**
| Column | Align | Format | Mobile |
|--------|-------|--------|--------|
| Date | left | locale date | always visible |
| Type | left | TransactionTypeBadge | always visible (abbreviated) |
| Amount | right | CurrencyDisplay | always visible |
| Exchange Rate | right | font-mono-data, 4 decimals | hidden on mobile |
| Note | left | italic text-xs | hidden on mobile |
| Attachment | center | Paperclip icon or dash | hidden on mobile (icon in drawer) |
| Actions | right | Edit/Delete icons | hidden on mobile (use drawer) |

## Design Reference
**Prototype:** `design-artifacts/prototypes/platform-detail.html`
- Transactions card (header with count badge + add button, table with date/type/amount/note/attachment/actions, show-more toggle): L791–964
- Mobile Transaction drawer: L971–1016

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-transactions.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-tx-drawer.png`

## Acceptance Criteria
- [ ] Transactions table is wrapped in CollapsibleSection, collapsed by default
- [ ] CollapsibleSection shows "Transactions" title with record count badge
- [ ] Type column shows green badge for Deposit, red for Withdrawal
- [ ] Mobile uses "Dep."/"Wdl." abbreviations via TransactionTypeBadge
- [ ] Amount uses CurrencyDisplay for native + DKK equivalent
- [ ] Exchange Rate column appears only for non-DKK platforms
- [ ] Attachment column shows Paperclip icon when file exists
- [ ] Notes display as italic muted text
- [ ] Edit opens TransactionDialog pre-filled
- [ ] Delete opens confirmation dialog
- [ ] Desktop: inline edit/delete icon buttons per row
- [ ] Mobile: entire row is tappable (opens MobileDrawer, US-073)
- [ ] Rows sorted by date descending
- [ ] Uses shared CollapsibleSection, DataTable, TransactionTypeBadge, CurrencyDisplay
- [ ] PRD §14 criterion 16: User can register transactions with exchange rate, notes, attachments
- [ ] PRD §14 criterion 43: Collapsible data tables collapsed by default

## Technical Notes
- This section is within `src/components/portfolio/PlatformDetail.tsx`
- Transactions fetched via `transactionService.getByPlatform(platformId)` from US-045
- Exchange rate display: show the rate stored on the transaction record (not the current rate)
- DKK equivalent: `tx.amount * tx.exchangeRate` for non-DKK, or just `tx.amount` for DKK
- Attachment URL constructed via PocketBase file URL utility
- Consider rendering the Exchange Rate column conditionally based on `platform.currency !== "DKK"` rather than showing an empty column
