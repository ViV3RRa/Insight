# US-108: Vehicle CRUD Service and Lifecycle

## Story
As the Insight platform user, I want to create, manage, and sell vehicles so that I can track each vehicle separately with full lifecycle support.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-107: Vehicle TypeScript Types

## Requirements
- Create `src/services/vehicles.ts` with the following functions:

**CRUD operations:**
- `getAll()`: Fetch all vehicles. Filter by `owner`. Return sorted: active first (alphabetical), then sold (by saleDate descending).
- `getOne(id: string)`: Fetch a single vehicle. Verify ownership.
- `create(data: VehicleCreate)`: Create a new vehicle. Set `owner`, `status` to `"active"`. Validate required fields: name, type, fuelType.
- `update(id: string, data: Partial<VehicleCreate>)`: Update mutable fields (name, type, make, model, year, licensePlate, fuelType, purchaseDate, purchasePrice, photo).
- `delete(id: string)`: Delete a vehicle. Verify ownership.

**Vehicle lifecycle — selling** (PRD §7.1.1, Session 2 §3.4):
- `markAsSold(id: string, saleDate: string, salePrice?: number, saleNote?: string)`: Set `status` to `"sold"`, record sale details.
- `reactivateVehicle(id: string)`: Set `status` back to `"active"`, clear sale fields. For corrections.
- Sold vehicles: appear muted in list, show total cost of ownership, retain all historical data.

**Photo handling:**
- `create()` and `update()` accept `FormData` when photo is included.
- `getVehiclePhotoUrl(vehicle: Vehicle)`: Returns PocketBase file URL for photo, or null.

**Filtering helpers:**
- `getActiveVehicles()`: Return only vehicles with `status: "active"`.
- `getSoldVehicles()`: Return only vehicles with `status: "sold"`.

**Data isolation:** All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getAll()` returns vehicles sorted: active first, then sold
- [ ] `create()` sets owner and status="active"
- [ ] `update()` allows changing mutable fields
- [ ] `markAsSold()` sets status, saleDate, salePrice, saleNote
- [ ] `reactivateVehicle()` restores active status and clears sale fields
- [ ] Photo upload works via FormData
- [ ] `getVehiclePhotoUrl()` returns valid URL or null
- [ ] `getActiveVehicles()` excludes sold
- [ ] `getSoldVehicles()` returns only sold
- [ ] All operations verify ownership
- [ ] PRD §14 criteria 27-29: Vehicle CRUD, selling, and muted sold vehicles

## Technical Notes
- File: `src/services/vehicles.ts`
- PocketBase collection: `vehicles` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete`, `markAsSold`, `reactivateVehicle` are mutationFns.
- Suggested query keys: `['vehicles']` for list, `['vehicles', id]` for single. Mutations invalidate `['vehicles']` on success.
- Photo: PocketBase file field, URL via `pb.files.getUrl(record, record.photo)`
- FuelType is mutable (in case user corrects it) though changing it after refueling data exists could cause unit confusion
