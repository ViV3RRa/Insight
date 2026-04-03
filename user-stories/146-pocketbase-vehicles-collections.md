# US-146: PocketBase Schema — Vehicles Collections

## Story
As the Insight platform user, I want the vehicles-related PocketBase collections created with correct schemas, relations, and file fields so that vehicle, refueling, and maintenance data can be persisted.

## Dependencies
- US-147: PocketBase Bootstrap & Migration Setup (migration infrastructure must exist)
<!-- US-143 dependency removed: API rule pattern is a documentation concern, not a code dependency. See implementation-plan.md §3.3 -->

## Requirements
- Create 3 collections in PocketBase with the schemas below
- Configure relations between collections (refueling → vehicle, maintenance_event → vehicle)
- Configure file fields with appropriate constraints (vehicle photos, receipts, trip counter photos)
- Configure API rules for per-user data isolation on all collections
- These collections must exist before the vehicle service stories (US-108 through US-110) can function

## Collection Schemas

### 1. `vehicles`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `name` | Text | Yes | — | User-defined label, e.g. "Family Car" |
| `type` | Text | No | — | e.g. "Car", "Motorcycle" |
| `make` | Text | No | — | e.g. "Toyota", "BMW" |
| `model` | Text | No | — | e.g. "Corolla", "R1250GS" |
| `year` | Number | No | — | Model year |
| `licensePlate` | Text | No | — | — |
| `fuelType` | Select | Yes | — | Options: `Petrol`, `Diesel`, `Electric`, `Hybrid` |
| `status` | Select | Yes | `active` | Options: `active`, `sold` |
| `purchaseDate` | Date | No | — | — |
| `purchasePrice` | Number | No | — | DKK |
| `saleDate` | Date | No | — | Populated when marked as sold |
| `salePrice` | Number | No | — | — |
| `saleNote` | Text | No | — | — |
| `photo` | File | No | — | Vehicle image. Max size: 5 MB. MIME: `image/*` |

### 2. `refuelings`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `vehicleId` | Relation → `vehicles` | Yes | — | Single relation, cascade delete |
| `date` | Date | Yes | — | Date of refueling |
| `fuelAmount` | Number | Yes | — | Liters (petrol/diesel) or kWh (electric) |
| `costPerUnit` | Number | Yes | — | DKK/liter or DKK/kWh |
| `totalCost` | Number | Yes | — | Computed or manually entered |
| `odometerReading` | Number | Yes | — | Total km at this refueling |
| `station` | Text | No | — | Service station name |
| `chargedAtHome` | Bool | Yes | `false` | Only relevant for EVs |
| `note` | Text | No | — | — |
| `receipt` | File | No | — | Receipt photo. Max size: 5 MB. MIME: `image/*` |
| `tripCounterPhoto` | File | No | — | Odometer photo. Max size: 5 MB. MIME: `image/*` |

### 3. `maintenance_events`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `vehicleId` | Relation → `vehicles` | Yes | — | Single relation, cascade delete |
| `date` | Date | Yes | — | Date of maintenance |
| `description` | Text | Yes | — | What was done |
| `cost` | Number | Yes | — | DKK |
| `note` | Text | No | — | — |
| `receipt` | File | No | — | Receipt image. Max size: 5 MB. MIME: `image/*`, `application/pdf` |

## API Rules (Data Isolation)

Apply the same pattern to **all 3 collections** (PRD §10):

| Action | Rule |
|--------|------|
| List/Search | `ownerId = @request.auth.id` |
| View | `ownerId = @request.auth.id` |
| Create | `@request.auth.id != "" && @request.data.ownerId = @request.auth.id` |
| Update | `ownerId = @request.auth.id` |
| Delete | `ownerId = @request.auth.id` |

## Acceptance Criteria
- [ ] `vehicles` collection exists with all fields matching schema
- [ ] `vehicles.fuelType` is a select with options: `Petrol`, `Diesel`, `Electric`, `Hybrid`
- [ ] `vehicles.status` defaults to `active`
- [ ] `vehicles.photo` accepts images up to 5 MB
- [ ] `refuelings` collection exists with relation to `vehicles`
- [ ] `refuelings.chargedAtHome` defaults to `false`
- [ ] `refuelings` has two file fields: `receipt` and `tripCounterPhoto`
- [ ] `maintenance_events` collection exists with relation to `vehicles`
- [ ] `maintenance_events.receipt` accepts images and PDFs up to 5 MB
- [ ] All 3 collections have API rules enforcing per-user data isolation
- [ ] Cascade delete: deleting a vehicle deletes its refuelings and maintenance events
- [ ] PRD §10: All collection fields match spec
- [ ] All migration tests pass
- [ ] API rule tests confirm per-user data isolation on all 3 collections

## Testing Requirements
- **Test file**: `pocketbase/pb_migrations/004_vehicles.test.js` or integration test
- **Approach**: Verify migration creates collections with correct schemas
- Test that migration `004_vehicles.js` applies successfully on a fresh PocketBase instance
- Test that all 3 collections exist after migration: `vehicles`, `refuelings`, `maintenance_events`
- Test that all fields exist with correct types after migration
- Test that `vehicles.fuelType` is a select with options: `Petrol`, `Diesel`, `Electric`, `Hybrid`
- Test that `vehicles.status` defaults to `active`
- Test that `refuelings.chargedAtHome` defaults to `false`
- Test that `refuelings` has two file fields: `receipt` (images, 5 MB) and `tripCounterPhoto` (images, 5 MB)
- Test that `maintenance_events.receipt` accepts images and PDFs up to 5 MB
- Test that API rules enforce per-user data isolation on all 3 collections
- Test cascade delete behavior: deleting a vehicle deletes its refuelings and maintenance_events

## Technical Notes
- Implemented as migration file `pocketbase/pb_migrations/004_vehicles.js` (auto-applied on PocketBase startup)
- The `fuelType` on vehicles drives which unit labels appear in the refueling dialog (liters vs kWh) and whether `chargedAtHome` is relevant (only for Electric)
- Sale-related fields (`saleDate`, `salePrice`, `saleNote`) are only populated when `status` is `sold`
- `refuelings` has two separate file fields for receipt and trip counter photo — PocketBase supports multiple file fields per collection
- PocketBase auto-generates `id` and `created` fields
