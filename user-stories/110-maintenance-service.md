# US-110: Maintenance Event CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete maintenance events so that I can track service costs and history for each vehicle.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-107: Vehicle TypeScript Types
- US-146: PocketBase Schema — Vehicles Collections

## Requirements
- Create `src/services/maintenanceEvents.ts` with the following functions:

**CRUD operations:**
- `getByVehicle(vehicleId: string)`: Fetch all maintenance events for a vehicle. Filter by `ownerId` and `vehicleId`. Return sorted by date descending.
- `getOne(id: string)`: Fetch a single event. Verify ownership.
- `create(data: MaintenanceEventCreate)`: Create a new event. Set `ownerId`. Validate: vehicleId, date, description, cost (non-negative) are required.
- `update(id: string, data: Partial<MaintenanceEventCreate>)`: Update mutable fields.
- `delete(id: string)`: Delete a maintenance event. Verify ownership.

**File handling:**
- `create()` and `update()` accept `FormData` for receipt.
- `getReceiptUrl(event: MaintenanceEvent)`: Returns PocketBase file URL for receipt, or null.

**Data isolation:** All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByVehicle()` returns all events for a vehicle, sorted by date descending
- [ ] `create()` sets ownerId and validates required fields (date, description, cost)
- [ ] `update()` allows changing all mutable fields
- [ ] `delete()` removes the event record
- [ ] Receipt upload via FormData
- [ ] `getReceiptUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 32: User can register maintenance events
- [ ] All tests pass and meet coverage target
- [ ] Service functions parse responses through Zod schemas

## Testing Requirements
- **Test file**: `src/services/maintenanceEvents.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test `getByVehicle()` returns events sorted by date descending
- Test `create()` sets `ownerId` and validates required fields (vehicleId, date, description, cost)
- Test `update()` allows changing all mutable fields
- Test `delete()` removes the event and verifies ownership
- Test `getReceiptUrl()` returns valid URL or null
- Test all operations filter by `ownerId` (data isolation)
- Test Zod parsing rejects malformed PocketBase responses

## Technical Notes
- File: `src/services/maintenanceEvents.ts`
- PocketBase collection: `maintenance_events` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['maintenanceEvents', vehicleId]`. Mutations invalidate `['maintenanceEvents', vehicleId]` on success.
- Receipt URL: `pb.files.getUrl(record, record.receipt)`
- All responses are parsed through Zod schemas (e.g., `maintenanceEventSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
