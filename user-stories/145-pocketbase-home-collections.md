# US-145: PocketBase Schema — Home (Utilities) Collections

## Story
As the Insight platform user, I want the home/utilities-related PocketBase collections created with correct schemas, relations, and file fields so that utility, meter reading, and bill data can be persisted.

## Dependencies
- US-147: PocketBase Bootstrap & Migration Setup (migration infrastructure must exist)
<!-- US-143 dependency removed: API rule pattern is a documentation concern, not a code dependency. See implementation-plan.md §3.3 -->

## Requirements
- Create 3 collections in PocketBase with the schemas below
- Configure relations between collections (meter_reading → utility, utility_bill → utility)
- Configure file fields with appropriate constraints
- Configure API rules for per-user data isolation on all collections
- These collections must exist before the home service stories (US-081 through US-083) can function

## Collection Schemas

### 1. `utilities`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `name` | Text | Yes | — | e.g. "Electricity", "Water", "Heat" |
| `unit` | Text | Yes | — | e.g. "kWh", "m³", "MWh" |
| `icon` | Text | Yes | — | Identifier from curated set: `bolt`, `droplet`, `flame`, `sun`, `wind`, `thermometer`, `wifi`, `trash` |
| `color` | Text | Yes | — | Preset palette color: `amber`, `blue`, `orange`, `emerald`, `violet`, `rose`, `cyan`, `slate` |

### 2. `meter_readings`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `utilityId` | Relation → `utilities` | Yes | — | Single relation, cascade delete |
| `value` | Number | Yes | — | Cumulative meter reading (non-negative) |
| `timestamp` | DateTime | Yes | — | When the reading was taken; defaults to now in frontend |
| `note` | Text | No | — | e.g. "meter replaced, reading reset" |
| `attachment` | File | No | — | Photo of meter display. Max size: 5 MB. MIME: `image/*` |

### 3. `utility_bills`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `utilityId` | Relation → `utilities` | Yes | — | Single relation, cascade delete |
| `amount` | Number | Yes | — | Total billed amount in DKK (positive) |
| `periodStart` | Date | Yes | — | First day the bill covers |
| `periodEnd` | Date | Yes | — | Last day the bill covers |
| `timestamp` | DateTime | No | — | Date bill was received/registered; defaults to now in frontend |
| `note` | Text | No | — | e.g. "Annual settlement bill" |
| `attachment` | File | No | — | Scanned bill / PDF. Max size: 10 MB. MIME: `image/*`, `application/pdf` |

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
- [ ] `utilities` collection exists with all fields matching schema
- [ ] `utilities.icon` and `utilities.color` are text fields (validated in frontend)
- [ ] `meter_readings` collection exists with relation to `utilities`
- [ ] `meter_readings.attachment` accepts images up to 5 MB
- [ ] `utility_bills` collection exists with relation to `utilities`
- [ ] `utility_bills.periodStart` and `periodEnd` are date fields
- [ ] `utility_bills.attachment` accepts images and PDFs up to 10 MB
- [ ] All 3 collections have API rules enforcing per-user data isolation
- [ ] Cascade delete: deleting a utility deletes its meter readings and bills
- [ ] PRD §10: All collection fields match spec
- [ ] All migration tests pass
- [ ] API rule tests confirm per-user data isolation on all 3 collections

## Testing Requirements
- **Test file**: `pocketbase/pb_migrations/003_home.test.js` or integration test
- **Approach**: Verify migration creates collections with correct schemas
- Test that migration `003_home.js` applies successfully on a fresh PocketBase instance
- Test that all 3 collections exist after migration: `utilities`, `meter_readings`, `utility_bills`
- Test that all fields exist with correct types after migration
- Test that `meter_readings.utilityId` is a relation to `utilities` with cascade delete
- Test that `utility_bills.utilityId` is a relation to `utilities` with cascade delete
- Test that `meter_readings.attachment` file field accepts images up to 5 MB
- Test that `utility_bills.attachment` file field accepts images and PDFs up to 10 MB
- Test that API rules enforce per-user data isolation on all 3 collections
- Test cascade delete behavior: deleting a utility deletes its meter_readings and utility_bills

## Technical Notes
- Implemented as migration file `pocketbase/pb_migrations/003_home.js` (auto-applied on PocketBase startup)
- The `icon` and `color` fields on `utilities` are stored as plain text; the frontend enforces the allowed values via the `UtilityIcon` and `UtilityColor` union types (US-080)
- `periodEnd` must be >= `periodStart` — validated in the frontend (US-104), not enforced at the PocketBase level
- Bill `attachment` allows larger files (10 MB) since scanned bills/PDFs can be bigger than photos
- PocketBase auto-generates `id` and `created` fields
