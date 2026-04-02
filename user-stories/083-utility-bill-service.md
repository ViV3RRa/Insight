# US-083: Utility Bill CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete utility bills so that I can track costs and have them automatically amortized across covered months.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create `src/services/utilityBills.ts` with the following functions:

**CRUD operations:**
- `getByUtility(utilityId: string)`: Fetch all bills for a utility. Filter by `owner` and `utilityId`. Return sorted by `periodStart` descending (most recent first).
- `getOne(id: string)`: Fetch a single bill by ID. Verify ownership.
- `create(data: UtilityBillCreate)`: Create a new bill. Set `owner` to current user. Validate: amount is required (positive number), utilityId is required, periodStart and periodEnd are required, periodEnd >= periodStart.
- `update(id: string, data: Partial<UtilityBillCreate>)`: Update mutable fields (amount, periodStart, periodEnd, timestamp, note, attachment).
- `delete(id: string)`: Delete a bill record. Verify ownership.

**Attachment handling:**
- `create()` and `update()` accept `FormData` when an attachment is included.
- Provide a helper `getAttachmentUrl(bill: UtilityBill)`: Returns the full PocketBase file URL for the attachment, or null if none.

**Data isolation:**
- All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByUtility()` returns all bills for a utility, sorted by periodStart descending
- [ ] `create()` sets owner and validates required fields (amount, utilityId, periodStart, periodEnd)
- [ ] `create()` validates periodEnd >= periodStart
- [ ] `update()` allows changing amount, periodStart, periodEnd, timestamp, note, attachment
- [ ] `delete()` removes the bill record
- [ ] Attachment upload works via FormData
- [ ] `getAttachmentUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 3: User can register bills with amount, period range, optional note, and optional attachment

## Technical Notes
- File to create: `src/services/utilityBills.ts`
- PocketBase collection name: `utility_bills` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['utilityBills', utilityId]`. Mutations invalidate `['utilityBills', utilityId]` on success.
- Collection fields: utility (relation), amount, periodStart, periodEnd, note, attachment, timestamp (PRD §10)
- Bills have a period range (periodStart to periodEnd) which is used for amortization across months
- The `timestamp` field is when the bill was received/registered (defaults to now), distinct from the period dates
- Amortization logic is in a separate calculation utility (US-085), not this service
