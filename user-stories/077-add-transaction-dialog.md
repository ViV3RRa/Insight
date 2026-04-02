# US-077: Add Transaction Dialog

## Story
As the Insight platform user, I want a dialog to record deposit and withdrawal transactions for my platforms so that I can track cash flows with exchange rates, notes, and attachments.

## Dependencies
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-041: Investment TypeScript Types
- US-045: Transaction CRUD Service
- US-043: Platform CRUD Service
- US-046: Exchange Rate Service

## Requirements
- Modal dialog for creating and editing transactions (PRD §9.4)
- **Fields:**
  1. **Platform** (select, required) — shown only when invoked from portfolio overview; pre-set and hidden when from detail page
  2. **Type** (radio: Deposit / Withdrawal, required) — styled radio buttons with green (deposit) and red (withdrawal) peer-checked styling
  3. **Amount** (number, positive, required) — in platform's native currency, with currency suffix
  4. **Exchange rate** (number) — auto-populated for non-DKK platforms via exchange rate service, editable. Hidden for DKK platforms.
  5. **Timestamp** (datetime-local, default: now)
  6. **Note** (text, optional)
  7. **Attachment** (file, optional) — statement, confirmation, etc.
- **"Save & Add Another"** button alongside primary Save (PRD §9):
  - Saves current record, clears all fields except platform selection, keeps dialog open
  - Timestamp resets to now, type resets to Deposit
- **Edit mode**: Pre-filled with existing values. No "Save & Add Another".
- Exchange rate auto-population: when a non-DKK platform is selected, fetch the latest rate via `exchangeRateService.getLatestRate(platform.currency, 'DKK')` and pre-fill. User can override.
- DKK equivalent preview: for non-DKK platforms, show `≈ {amount * exchangeRate} DKK` below the amount field

## Shared Components Used
- `DialogShell` (US-028) — props: { title: "Add Transaction" | "Edit Transaction", isOpen, onClose, maxWidth: "md" }
- `SelectInput` (US-030) — for Platform select
- `NumberInput` (US-030) — for Amount and Exchange Rate with currency suffixes
- `DateTimeInput` (US-030) — for Timestamp
- `TextInput` (US-030) — for Note
- `FileUpload` (US-031) — for Attachment
- `Button` (US-013) — Cancel, Save & Add Another, Save

## UI Specification

**Transaction type radio buttons:**
```
<div className="grid grid-cols-2 gap-3">
  <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors
    peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:font-medium
    dark:peer-checked:border-emerald-600 dark:peer-checked:bg-emerald-900/20 dark:peer-checked:text-emerald-400">
    <input type="radio" name="type" value="deposit" className="peer sr-only" />
    <ArrowDownLeft className="w-4 h-4" /> Deposit
  </label>
  <label className="... peer-checked:border-rose-500 peer-checked:bg-rose-50 peer-checked:text-rose-700 ...">
    <input type="radio" name="type" value="withdrawal" className="peer sr-only" />
    <ArrowUpRight className="w-4 h-4" /> Withdrawal
  </label>
</div>
```

**Exchange rate field (non-DKK only):**
```
<NumberInput label="Exchange Rate" value={exchangeRate} suffix={`${platform.currency}/DKK`} />
<p className="text-xs text-base-300 dark:text-base-500 mt-1">
  ≈ {formatCurrency(amount * exchangeRate)} DKK
</p>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L1295–1379 — Add Transaction from overview (with platform selector + exchange rate section)
- `design-artifacts/prototypes/platform-detail.html` L1722–1783 — Add Transaction from detail (type radios + amount + datetime + note + attachment)
- `design-artifacts/prototypes/platform-detail.html` L1785–1840 — Edit Transaction dialog

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-transactions.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-tx-drawer.png`

## Acceptance Criteria
- [ ] Dialog opens in create mode with Deposit selected and timestamp defaulting to now
- [ ] Dialog opens in edit mode pre-filled with existing transaction values
- [ ] Platform select shown when invoked from overview, hidden when from detail page
- [ ] Type radio shows styled Deposit (green) and Withdrawal (red) options
- [ ] Amount field shows currency suffix matching platform currency
- [ ] Amount is required and must be positive — validation error if empty, zero, or negative
- [ ] Exchange rate field shown only for non-DKK platforms
- [ ] Exchange rate auto-populated from latest exchange rate for selected platform's currency
- [ ] Exchange rate is editable (user can override)
- [ ] DKK equivalent preview shown below amount for non-DKK platforms
- [ ] Timestamp is required
- [ ] Note is optional
- [ ] Attachment file upload works (image/PDF)
- [ ] "Save & Add Another" saves, clears form (keeping platform), resets type to Deposit
- [ ] "Save & Add Another" not shown in edit mode
- [ ] Save calls transactionService.create() / transactionService.update()
- [ ] Desktop: centered modal (sm:max-w-md)
- [ ] Mobile: bottom sheet with drag handle
- [ ] PRD §9.4: Transaction dialog fields match spec
- [ ] PRD §14 criterion 16: User can register transactions with exchange rate, notes, attachments

## Technical Notes
- File: `src/components/portfolio/dialogs/TransactionDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; transaction?: Transaction; platformId?: string; portfolioId: string }`
- Exchange rate: `useQuery({ queryKey: ['exchangeRates', currency, date], queryFn: ... })` auto-populates on platform/date change (non-DKK)
- Use `useMutation` wrapping `transactionService.create()` / `transactionService.update()`; on success: invalidate `['transactions', platformId]`, show toast
- Attachment uses PocketBase FormData-based file upload
- Amount is always stored as positive; the `type` field determines the sign for calculations
- On "Save & Add Another": mutation success, toast, clear amount/note/attachment/timestamp, keep platform and reset type to deposit
