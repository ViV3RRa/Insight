# US-045: Transaction CRUD Service

## Story
As the Insight platform user, I want to record and manage deposit and withdrawal transactions so that the system can accurately compute XIRR, gain/loss, and net deposit metrics.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types
- US-144: PocketBase Schema — Investment Collections

## Requirements
- Create `src/services/transactions.ts` with the following functions:

**CRUD operations:**
- `getByPlatform(platformId: string)`: Fetch all transactions for a platform. Filter by `ownerId` and `platformId`. Sort by `timestamp` ascending (chronological).
- `getByPlatformInRange(platformId: string, start: string, end: string)`: Fetch transactions within a date range. Sort by `timestamp` ascending.
- `getOne(id: string)`: Fetch a single transaction by ID. Verify ownership.
- `create(data: TransactionCreate | FormData)`: Create a new transaction. Set `ownerId` to current user. Accept either a typed object or `FormData` (when file attachment is included).
- `update(id: string, data: Partial<TransactionCreate> | FormData)`: Update a transaction. Accept typed object or `FormData`.
- `delete(id: string)`: Delete a transaction. Verify ownership.

**Amount semantics** (PRD §6.1.4):
- `amount` is always stored as a **positive number**. The sign is derived from `type`:
  - `"deposit"` = money flowing into the platform (negative cash flow in XIRR)
  - `"withdrawal"` = money flowing out of the platform (positive cash flow in XIRR)
- The service should validate that `amount > 0` on create and update.

**Exchange rate handling** (PRD §4.3, §9.4):
- For non-DKK platforms, `exchangeRate` records the rate at the time of the transaction.
- When creating a transaction on a non-DKK platform, the exchange rate should be auto-populated from the exchange rate service (fetched for the transaction date). The user can override it.
- For DKK platforms, `exchangeRate` is `null`.
- The DKK equivalent of a transaction = `amount * exchangeRate`.

**File attachments** (PRD §3.3, §6.1.4):
- Transactions support an optional `attachment` field (statement, confirmation, etc.).
- File uploads use PocketBase's `FormData`-based file fields.
- Provide a helper `getAttachmentUrl(transaction: Transaction)`: Returns the full URL for the transaction's attachment file, or null if no attachment.

**Query helpers:**
- `getNetDeposits(platformId: string, start: string, end: string)`: Calculate net deposits within a date range. `netDeposits = Σ deposits - Σ withdrawals`. Returns the net amount in native currency.
- `getDepositSum(platformId: string, start: string, end: string)`: Sum of all deposit amounts in range.
- `getByPortfolio(portfolioId: string)`: Fetch all transactions across all platforms in a portfolio. Used for portfolio-level aggregation.
- `getByPortfolioInRange(portfolioId: string, start: string, end: string)`: Fetch portfolio-level transactions in a date range.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByPlatform()` returns all transactions for a platform, sorted by timestamp ascending
- [ ] `getByPlatformInRange()` correctly filters by date range
- [ ] `create()` sets ownerId automatically
- [ ] `create()` validates that amount is positive (> 0)
- [ ] `create()` accepts FormData for file attachment uploads
- [ ] `update()` allows changing type, amount, exchangeRate, timestamp, note, and attachment
- [ ] `update()` validates that amount remains positive
- [ ] `delete()` removes the transaction
- [ ] `getNetDeposits()` correctly computes Σ deposits - Σ withdrawals for a date range
- [ ] `getDepositSum()` returns the sum of deposit amounts in the range
- [ ] `getByPortfolio()` returns transactions across all platforms in the portfolio
- [ ] `getAttachmentUrl()` returns valid PocketBase file URL or null
- [ ] Exchange rate is stored for non-DKK platform transactions
- [ ] Exchange rate is null for DKK platform transactions
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 16: Transaction registration works with type, amount, exchange rate, notes, and attachments
- [ ] All tests pass and meet 90%+ line coverage target
- [ ] Zod schema parsing is verified for all service responses

## Testing Requirements
- **Test file**: `src/services/transactions.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD operations, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test getByPlatform returns transactions sorted by timestamp ascending
- Test create with type "deposit" stores amount as positive number
- Test create with type "withdrawal" stores amount as positive number
- Test create validates amount > 0 (rejects zero or negative)
- Test create accepts FormData for file attachment uploads
- Test getNetDeposits correctly computes deposits minus withdrawals for a date range
- Test getDepositSum returns sum of deposit amounts in range
- Test getByPortfolio returns transactions across all platforms in the portfolio
- Test getAttachmentUrl returns valid PocketBase file URL or null
- Test exchange rate is stored for non-DKK platform transactions
- Test exchange rate is null for DKK platform transactions
- Verify all queries filter by `ownerId`
- Verify Zod schema parsing catches malformed responses
- Test error cases: not found, unauthorized

## Technical Notes
- File to create: `src/services/transactions.ts`
- PocketBase collection name: `transactions` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['transactions', platformId]` for list, `['transactions', portfolioId]` for portfolio-level. Mutations invalidate `['transactions', platformId]` on success.
- Collection fields: platform (relation), type, amount, exchangeRate, timestamp, note, attachment (PRD §10)
- For FormData uploads: `const formData = new FormData(); formData.append('attachment', file); formData.append('amount', String(amount));` etc.
- PocketBase file URL: `pb.files.getUrl(record, record.attachment)`
- The `getNetDeposits` helper can be computed client-side from the fetched transactions, or use PocketBase's aggregate features if available
- For `getByPortfolio`, first fetch all platform IDs for the portfolio, then query transactions with a filter like `platformId IN ('id1','id2',...)`
- Error handling: throw for "transaction not found", "amount must be positive", "unauthorized"
- All responses are parsed through Zod schemas (e.g., `transactionSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
