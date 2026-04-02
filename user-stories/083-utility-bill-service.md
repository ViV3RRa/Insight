# US-083: Utility Bill CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete utility bills so that I can track costs and have them automatically amortized across covered months.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types
- US-145: PocketBase Schema — Home (Utilities) Collections

## Requirements
- Create `src/services/utilityBills.ts` with the following functions:

**CRUD operations:**
- `getByUtility(utilityId: string)`: Fetch all bills for a utility. Filter by `ownerId` and `utilityId`. Return sorted by `periodStart` descending (most recent first).
- `getOne(id: string)`: Fetch a single bill by ID. Verify ownership.
- `create(data: UtilityBillCreate)`: Create a new bill. Set `ownerId` to current user. Validate: amount is required (positive number), utilityId is required, periodStart and periodEnd are required, periodEnd >= periodStart.
- `update(id: string, data: Partial<UtilityBillCreate>)`: Update mutable fields (amount, periodStart, periodEnd, timestamp, note, attachment).
- `delete(id: string)`: Delete a bill record. Verify ownership.

**Attachment handling:**
- `create()` and `update()` accept `FormData` when an attachment is included.
- Provide a helper `getAttachmentUrl(bill: UtilityBill)`: Returns the full PocketBase file URL for the attachment, or null if none.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByUtility()` returns all bills for a utility, sorted by periodStart descending
- [ ] `create()` sets ownerId and validates required fields (amount, utilityId, periodStart, periodEnd)
- [ ] `create()` validates periodEnd >= periodStart
- [ ] `update()` allows changing amount, periodStart, periodEnd, timestamp, note, attachment
- [ ] `delete()` removes the bill record
- [ ] Attachment upload works via FormData
- [ ] `getAttachmentUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 3: User can register bills with amount, period range, optional note, and optional attachment
- [ ] All tests pass and meet coverage target
- [ ] Service functions validated by tests covering CRUD operations, ownership filtering, and error handling

## Testing Requirements
- **Test file**: `src/services/utilityBills.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test `getByUtility()` returns bills sorted by periodStart descending, filtered by utilityId and ownerId
- Test `getOne()` returns a single bill by ID and verifies ownership
- Test `create()` sets `ownerId` to current user and validates required fields (amount, utilityId, periodStart, periodEnd)
- Test `create()` validates periodEnd >= periodStart
- Test `update()` allows changing mutable fields (amount, periodStart, periodEnd, timestamp, note, attachment)
- Test `delete()` removes the bill and verifies ownership
- Test attachment handling via FormData for create and update
- Test `getAttachmentUrl()` returns valid URL or null
- Test Zod parsing of PocketBase responses (valid and malformed)
- Test error cases: bill not found, unauthorized access, validation failures

## Technical Notes
- File to create: `src/services/utilityBills.ts`
- PocketBase collection name: `utility_bills` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['utilityBills', utilityId]`. Mutations invalidate `['utilityBills', utilityId]` on success.
- Collection fields: utility (relation), amount, periodStart, periodEnd, note, attachment, timestamp (PRD §10)
- Bills have a period range (periodStart to periodEnd) which is used for amortization across months
- The `timestamp` field is when the bill was received/registered (defaults to now), distinct from the period dates
- Amortization logic is in a separate calculation utility (US-085), not this service
- All responses are parsed through Zod schemas (e.g., `utilityBillSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
