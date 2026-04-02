# US-082: Meter Reading CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete meter readings so that I can record cumulative meter values that drive consumption calculations.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types
- US-145: PocketBase Schema — Home (Utilities) Collections

## Requirements
- Create `src/services/meterReadings.ts` with the following functions:

**CRUD operations:**
- `getByUtility(utilityId: string)`: Fetch all meter readings for a utility. Filter by `ownerId` and `utilityId`. Return sorted by timestamp descending (most recent first).
- `getOne(id: string)`: Fetch a single reading by ID. Verify ownership.
- `create(data: MeterReadingCreate)`: Create a new meter reading. Set `ownerId` to current user. Validate: value is required (non-negative number), utilityId is required.
- `update(id: string, data: Partial<MeterReadingCreate>)`: Update mutable fields (value, timestamp, note, attachment).
- `delete(id: string)`: Delete a meter reading. Verify ownership.

**Attachment handling:**
- `create()` and `update()` accept `FormData` when an attachment is included.
- Provide a helper `getAttachmentUrl(reading: MeterReading)`: Returns the full PocketBase file URL for the attachment, or null if none.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByUtility()` returns all readings for a utility, sorted by timestamp descending
- [ ] `create()` sets ownerId and validates required fields (value, utilityId)
- [ ] `update()` allows changing value, timestamp, note, attachment
- [ ] `delete()` removes the reading record
- [ ] Attachment upload works via FormData
- [ ] `getAttachmentUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 2: User can register meter readings with cumulative value, timestamp, and optional note
- [ ] All tests pass and meet coverage target
- [ ] Service functions validated by tests covering CRUD operations, ownership filtering, and error handling

## Testing Requirements
- **Test file**: `src/services/meterReadings.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test `getByUtility()` returns readings sorted by timestamp descending, filtered by utilityId and ownerId
- Test `getOne()` returns a single reading by ID and verifies ownership
- Test `create()` sets `ownerId` to current user and validates required fields (value, utilityId)
- Test `update()` allows changing mutable fields (value, timestamp, note, attachment)
- Test `delete()` removes the reading and verifies ownership
- Test attachment handling via FormData for create and update
- Test `getAttachmentUrl()` returns valid URL or null
- Test Zod parsing of PocketBase responses (valid and malformed)
- Test error cases: reading not found, unauthorized access, validation failures

## Technical Notes
- File to create: `src/services/meterReadings.ts`
- PocketBase collection name: `meter_readings` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['meterReadings', utilityId]`. Mutations invalidate `['meterReadings', utilityId]` on success.
- Collection fields: utility (relation), value, timestamp, note, attachment (PRD §10)
- Readings are cumulative — the value represents the total meter count at that moment, not consumption
- Consumption is derived as deltas between consecutive readings (handled by calculation utilities, not this service)
- Attachment URL: `pb.files.getUrl(record, record.attachment)`
- All responses are parsed through Zod schemas (e.g., `meterReadingSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
