# US-042: Portfolio CRUD Service

## Story
As the Insight platform user, I want to create, read, update, and delete portfolios so that I can organize my investment platforms into named groups (e.g. my own portfolio, a child's portfolio).

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types
- US-144: PocketBase Schema — Investment Collections

## Requirements
- Create `src/services/portfolios.ts` with the following functions:

**CRUD operations:**
- `getAll()`: Fetch all portfolios for the current user. Filter by `ownerId` field. Sort by `created` ascending (oldest first so default portfolio appears first).
- `getOne(id: string)`: Fetch a single portfolio by ID. Verify ownership.
- `create(data: PortfolioCreate)`: Create a new portfolio. Automatically set `ownerId` to current user ID.
- `update(id: string, data: Partial<PortfolioCreate>)`: Update portfolio fields. Verify ownership before update.
- `delete(id: string)`: Delete a portfolio. Verify ownership. Must NOT allow deletion of the default portfolio (the one with `isDefault: true`).

**Default portfolio logic** (PRD §6.1.1, §6.3):
- Exactly one portfolio must have `isDefault: true` per user at all times.
- When the first portfolio is created, it is automatically set as default.
- When changing the default, the service must:
  1. Set `isDefault: false` on the current default portfolio.
  2. Set `isDefault: true` on the new default portfolio.
  3. These two updates should happen atomically (or as close to atomic as PocketBase allows).
- The default portfolio is pre-selected when navigating to the Investment section (PRD §6.3).
- The default portfolio cannot be deleted. To delete it, the user must first reassign default to another portfolio.

**Helper functions:**
- `getDefault()`: Fetch the portfolio where `isDefault: true` for the current user. Returns the single default portfolio.
- `setDefault(id: string)`: Set a portfolio as the default, unsetting the previous default.

**Data isolation:**
- All queries filter by `ownerId = currentUserId` to ensure data isolation (PRD §10 note).
- Use the PocketBase client instance from `src/services/pb.ts`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getAll()` returns only portfolios owned by the current user
- [ ] `getAll()` returns portfolios sorted by creation date (oldest first)
- [ ] `getOne(id)` returns a single portfolio; throws if not found or not owned
- [ ] `create()` sets `ownerId` automatically from the authenticated user
- [ ] First portfolio created is automatically set as `isDefault: true`
- [ ] `update()` can change name and ownerName
- [ ] `delete()` removes a portfolio and throws/rejects if it is the default
- [ ] `getDefault()` returns exactly one portfolio with `isDefault: true`
- [ ] `setDefault(id)` unsets previous default and sets new default
- [ ] At no point can a user have zero default portfolios or more than one default
- [ ] All operations verify ownership (filter by ownerId field)
- [ ] PRD §14 criteria 10-11: Portfolio CRUD and default selection work correctly
- [ ] All tests pass and meet 90%+ line coverage target
- [ ] Zod schema parsing is verified for all service responses

## Testing Requirements
- **Test file**: `src/services/portfolios.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD operations, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test getAll returns portfolios sorted by created ascending (oldest first)
- Test first portfolio created is automatically set as default
- Test cannot delete the default portfolio (throws meaningful error)
- Test setDefault swap logic: old default unset, new default set, no intermediate state with zero or two defaults
- Test getDefault returns exactly one portfolio with isDefault=true
- Verify all queries filter by `ownerId`
- Verify Zod schema parsing catches malformed responses
- Test error cases: not found, unauthorized

## Technical Notes
- File to create: `src/services/portfolios.ts`
- PocketBase collection name: `portfolios` (PRD §10)
- Service functions are designed as TanStack Query candidates: `getAll`, `getOne`, `getDefault` are queryFns; `create`, `update`, `delete`, `setDefault` are mutationFns. Components must use `useQuery`/`useMutation` — never call service functions directly.
- Suggested query keys: `['portfolios']` for list, `['portfolios', id]` for single. Mutations should call `queryClient.invalidateQueries({ queryKey: ['portfolios'] })` on success.
- Use `pb.collection('portfolios')` for all operations
- The default-swap logic (unset old default, set new default) should be wrapped in a try/catch — if the second update fails, attempt to restore the first
- Error handling: throw meaningful errors for "portfolio not found", "cannot delete default portfolio", "unauthorized"
- Consider exporting a `PortfolioWithPlatforms` type or a separate fetch function that includes platform count for the overview — but this can be deferred to the UI story
- All responses are parsed through Zod schemas (e.g., `portfolioSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
