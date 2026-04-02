# US-081: Utility CRUD Service

## Story
As the Insight platform user, I want to create, edit, and delete utilities so that I can manage which household meters and services are tracked.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create `src/services/utilities.ts` with the following functions:

**CRUD operations:**
- `getAll()`: Fetch all utilities for the current user. Filter by `owner`. Return sorted alphabetically by name.
- `getOne(id: string)`: Fetch a single utility by ID. Verify ownership.
- `create(data: UtilityCreate)`: Create a new utility. Set `owner` to current user. Validate required fields: name, unit, icon, color.
- `update(id: string, data: Partial<UtilityCreate>)`: Update utility fields. All fields are mutable.
- `delete(id: string)`: Delete a utility. Verify ownership. Consider warning if utility has associated readings or bills.

**Data isolation:**
- All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getAll()` returns all utilities for the current user, sorted alphabetically
- [ ] `getOne()` returns a single utility by ID, verifying ownership
- [ ] `create()` sets owner and validates required fields (name, unit, icon, color)
- [ ] `update()` allows changing all fields (name, unit, icon, color)
- [ ] `delete()` removes the utility record
- [ ] All operations verify ownership
- [ ] PRD §14 criterion 1: User can create, edit, and delete utilities with name and unit

## Technical Notes
- File to create: `src/services/utilities.ts`
- PocketBase collection name: `utilities` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['utilities']` for list, `['utilities', id]` for single. Mutations invalidate `['utilities']` on success.
- Collection fields: name, unit, icon, color (PRD §10)
- Icon values are from the curated set per PRD §5.1.1 and §9.5
- Color values are from the preset palette per PRD §5.1.1 and §9.5
- Error handling: throw for "utility not found", "unauthorized", "validation failed"
