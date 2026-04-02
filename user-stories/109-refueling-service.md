# US-109: Refueling CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete refueling records so that I can track fuel consumption, costs, and odometer readings for each vehicle.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-107: Vehicle TypeScript Types

## Requirements
- Create `src/services/refuelings.ts` with the following functions:

**CRUD operations:**
- `getByVehicle(vehicleId: string)`: Fetch all refuelings for a vehicle. Filter by `owner` and `vehicleId`. Return sorted by date descending.
- `getOne(id: string)`: Fetch a single refueling. Verify ownership.
- `create(data: RefuelingCreate)`: Create a new refueling. Set `owner`. Validate: vehicleId, date, fuelAmount (positive), costPerUnit (positive), odometerReading (positive) are required. Auto-compute `totalCost = fuelAmount * costPerUnit` if not explicitly provided.
- `update(id: string, data: Partial<RefuelingCreate>)`: Update mutable fields.
- `delete(id: string)`: Delete a refueling record. Verify ownership.

**File handling:**
- `create()` and `update()` accept `FormData` for receipt and tripCounterPhoto.
- `getReceiptUrl(refueling: Refueling)`: Returns PocketBase file URL for receipt, or null.
- `getTripCounterPhotoUrl(refueling: Refueling)`: Returns URL for trip counter photo, or null.

**Data isolation:** All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByVehicle()` returns all refuelings for a vehicle, sorted by date descending
- [ ] `create()` sets owner and validates required fields
- [ ] `create()` auto-computes totalCost if not provided
- [ ] `update()` allows changing all mutable fields
- [ ] `delete()` removes the refueling record
- [ ] Receipt and tripCounterPhoto upload via FormData
- [ ] `getReceiptUrl()` and `getTripCounterPhotoUrl()` return valid URLs or null
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 30: User can register refueling events with fuel-type-appropriate units

## Technical Notes
- File: `src/services/refuelings.ts`
- PocketBase collection: `refuelings` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['refuelings', vehicleId]`. Mutations invalidate `['refuelings', vehicleId]` on success.
- `chargedAtHome` field is only meaningful for electric vehicles
- `totalCost` can be auto-computed (`fuelAmount * costPerUnit`) but the user can override it (e.g. if there's a discount or surcharge)
- File URLs: `pb.files.getUrl(record, record.receipt)` and `pb.files.getUrl(record, record.tripCounterPhoto)`
