# US-110: Maintenance Event CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete maintenance events so that I can track service costs and history for each vehicle.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-107: Vehicle TypeScript Types

## Requirements
- Create `src/services/maintenanceEvents.ts` with the following functions:

**CRUD operations:**
- `getByVehicle(vehicleId: string)`: Fetch all maintenance events for a vehicle. Filter by `owner` and `vehicleId`. Return sorted by date descending.
- `getOne(id: string)`: Fetch a single event. Verify ownership.
- `create(data: MaintenanceEventCreate)`: Create a new event. Set `owner`. Validate: vehicleId, date, description, cost (non-negative) are required.
- `update(id: string, data: Partial<MaintenanceEventCreate>)`: Update mutable fields.
- `delete(id: string)`: Delete a maintenance event. Verify ownership.

**File handling:**
- `create()` and `update()` accept `FormData` for receipt.
- `getReceiptUrl(event: MaintenanceEvent)`: Returns PocketBase file URL for receipt, or null.

**Data isolation:** All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByVehicle()` returns all events for a vehicle, sorted by date descending
- [ ] `create()` sets owner and validates required fields (date, description, cost)
- [ ] `update()` allows changing all mutable fields
- [ ] `delete()` removes the event record
- [ ] Receipt upload via FormData
- [ ] `getReceiptUrl()` returns valid URL or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 32: User can register maintenance events

## Technical Notes
- File: `src/services/maintenanceEvents.ts`
- PocketBase collection: `maintenance_events` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['maintenanceEvents', vehicleId]`. Mutations invalidate `['maintenanceEvents', vehicleId]` on success.
- Receipt URL: `pb.files.getUrl(record, record.receipt)`
