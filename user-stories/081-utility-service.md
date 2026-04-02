# US-081: Utility CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete utilities so that I can manage which household meters and services are tracked.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types
- US-145: PocketBase Schema — Home (Utilities) Collections

## Requirements
- Create `src/services/utilities.ts` with the following functions:

**CRUD operations:**
- `getAll()`: Fetch all utilities for the current user. Filter by `ownerId`. Return sorted alphabetically by name.
- `getOne(id: string)`: Fetch a single utility by ID. Verify ownership.
- `create(data: UtilityCreate)`: Create a new utility. Set `ownerId` to current user. Validate required fields: name, unit, icon, color.
- `update(id: string, data: Partial<UtilityCreate>)`: Update utility fields. All fields are mutable.
- `delete(id: string)`: Delete a utility. Verify ownership. Consider warning if utility has associated readings or bills.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getAll()` returns all utilities for the current user, sorted alphabetically
- [ ] `getOne()` returns a single utility by ID, verifying ownership
- [ ] `create()` sets ownerId and validates required fields (name, unit, icon, color)
- [ ] `update()` allows changing all fields (name, unit, icon, color)
- [ ] `delete()` removes the utility record
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 1: User can create, edit, and delete utilities with name and unit
- [ ] All tests pass and meet coverage target
- [ ] Service functions validated by tests covering CRUD operations, ownership filtering, and error handling

## Testing Requirements
- **Test file**: `src/services/utilities.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test `getAll()` returns utilities for current user sorted alphabetically
- Test `getOne()` returns a single utility by ID and verifies ownership
- Test `create()` sets `ownerId` to current user and validates required fields
- Test `update()` allows changing all mutable fields (name, unit, icon, color)
- Test `delete()` removes utility and verifies ownership
- Test all operations filter by `ownerId` (data isolation)
- Test Zod parsing of PocketBase responses (valid and malformed)
- Test error cases: utility not found, unauthorized access, validation failures

## Technical Notes
- File to create: `src/services/utilities.ts`
- PocketBase collection name: `utilities` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['utilities']` for list, `['utilities', id]` for single. Mutations invalidate `['utilities']` on success.
- Collection fields: name, unit, icon, color (PRD §10)
- Icon values are from the curated set per PRD §5.1.1 and §9.5
- Color values are from the preset palette per PRD §5.1.1 and §9.5
- Error handling: throw for "utility not found", "unauthorized", "validation failed"
- All responses are parsed through Zod schemas (e.g., `utilitySchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
