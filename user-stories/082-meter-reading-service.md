# US-082: Meter Reading CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete meter readings so that I can record cumulative meter values that drive consumption calculations.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create `src/services/meterReadings.ts` with the following functions:

**CRUD operations:**
- `getByUtility(utilityId: string)`: Fetch all meter readings for a utility. Filter by `owner` and `utilityId`. Return sorted by timestamp descending (most recent first).
- `getOne(id: string)`: Fetch a single reading by ID. Verify ownership.
- `create(data: MeterReadingCreate)`: Create a new meter reading. Set `owner` to current user. Validate: value is required (non-negative number), utilityId is required.
- `update(id: string, data: Partial<MeterReadingCreate>)`: Update mutable fields (value, timestamp, note, attachment).
- `delete(id: string)`: Delete a meter reading. Verify ownership.

**Attachment handling:**
- `create()` and `update()` accept `FormData` when an attachment is included.
- Provide a helper `getAttachmentUrl(reading: MeterReading)`: Returns the full PocketBase file URL for the attachment, or null if none.

**Data isolation:**
- All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByUtility()` returns all readings for a utility, sorted by timestamp descending
- [ ] `create()` sets owner and validates required fields (value, utilityId)
- [ ] `update()` allows changing value, timestamp, note, attachment
- [ ] `delete()` removes the reading record
- [ ] Attachment upload works via FormData
- [ ] `getAttachmentUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 2: User can register meter readings with cumulative value, timestamp, and optional note

## Technical Notes
- File to create: `src/services/meterReadings.ts`
- PocketBase collection name: `meter_readings` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['meterReadings', utilityId]`. Mutations invalidate `['meterReadings', utilityId]` on success.
- Collection fields: utility (relation), value, timestamp, note, attachment (PRD §10)
- Readings are cumulative — the value represents the total meter count at that moment, not consumption
- Consumption is derived as deltas between consecutive readings (handled by calculation utilities, not this service)
- Attachment URL: `pb.files.getUrl(record, record.attachment)`
