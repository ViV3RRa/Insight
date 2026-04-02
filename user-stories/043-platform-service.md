# US-043: Platform CRUD Service and Lifecycle

## Story
As the Insight platform user, I want to create, manage, and close investment and cash platforms so that I can track each financial entity separately within a portfolio.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types
- US-144: PocketBase Schema — Investment Collections

## Requirements
- Create `src/services/platforms.ts` with the following functions:

**CRUD operations:**
- `getByPortfolio(portfolioId: string)`: Fetch all platforms belonging to a portfolio. Filter by `ownerId` and `portfolioId`. Return sorted: active platforms first (alphabetical by name), then closed platforms (by `closedDate` descending).
- `getOne(id: string)`: Fetch a single platform by ID. Verify ownership.
- `create(data: PlatformCreate)`: Create a new platform. Set `ownerId` to current user. Set `status` to `"active"`. Validate that `type` and `currency` are provided (required on creation).
- `update(id: string, data: Partial<PlatformCreate>)`: Update mutable platform fields. **Type and currency are immutable after creation** (PRD §9.2) — the update function must reject attempts to change `type` or `currency` fields. Mutable fields: `name`, `icon`.
- `delete(id: string)`: Delete a platform. Verify ownership. Consider warning if platform has associated data points or transactions (but do not block deletion).

**Platform lifecycle — closing a platform** (PRD §6.1.2, §6.6, §9.2):
- `closePlatform(id: string, closedDate: string, closureNote?: string)`: Set `status` to `"closed"`, record `closedDate` and optional `closureNote`. This is a one-way operation in the normal flow.
- `reopenPlatform(id: string)`: Set `status` back to `"active"`, clear `closedDate` and `closureNote`. Available for correction.
- Closed platforms:
  - Appear muted in the platform list on the portfolio overview (PRD §6.6).
  - Are **excluded** from current portfolio totals and current allocation calculations (PRD §6.6).
  - Their detail pages show all historical data up to the closure date (PRD §6.6).
  - The closure date and closure note are displayed in the detail page header.

**Immutability enforcement** (PRD §9.2):
- `type` field: Set on creation as `"investment"` or `"cash"`. Not editable after. The platform dialog shows this field only on creation, not when editing.
- `currency` field: Set on creation (e.g. "DKK", "EUR"). Not editable after. Changing currency would invalidate all historical data points and transactions.
- The service layer must enforce this regardless of what the UI sends.

**Filtering helpers:**
- `getActivePlatforms(portfolioId: string)`: Return only platforms with `status: "active"`.
- `getClosedPlatforms(portfolioId: string)`: Return only platforms with `status: "closed"`.
- `getInvestmentPlatforms(portfolioId: string)`: Return active platforms with `type: "investment"`.
- `getCashPlatforms(portfolioId: string)`: Return active platforms with `type: "cash"`.

**Icon handling:**
- The `icon` field is a PocketBase file field (image upload, PRD §9.2, §10).
- `create()` and `update()` accept `FormData` when an icon image is included.
- Provide a helper `getPlatformIconUrl(platform: Platform)`: Returns the full URL for the platform's icon image via PocketBase file URL construction.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByPortfolio()` returns all platforms for a given portfolio, owned by current user
- [ ] Platforms are sorted: active first (alphabetical), then closed (by closedDate descending)
- [ ] `create()` sets ownerId, status="active", and requires type and currency
- [ ] `update()` allows changing name and icon
- [ ] `update()` rejects changes to `type` field with a meaningful error
- [ ] `update()` rejects changes to `currency` field with a meaningful error
- [ ] `closePlatform()` sets status="closed", closedDate, and optional closureNote
- [ ] `reopenPlatform()` sets status="active" and clears closedDate and closureNote
- [ ] `getActivePlatforms()` excludes closed platforms
- [ ] `getClosedPlatforms()` returns only closed platforms
- [ ] `getInvestmentPlatforms()` returns only active investment-type platforms
- [ ] `getCashPlatforms()` returns only active cash-type platforms
- [ ] `delete()` removes the platform record
- [ ] `getPlatformIconUrl()` returns a valid PocketBase file URL for the icon
- [ ] Icon upload works via FormData
- [ ] All operations verify ownership
- [ ] PRD §14 criteria 12-14: Platform CRUD, type/currency lock, and closure work correctly
- [ ] All tests pass and meet 90%+ line coverage target
- [ ] Zod schema parsing is verified for all service responses

## Testing Requirements
- **Test file**: `src/services/platforms.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD operations, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test getByPortfolio returns platforms filtered by portfolioId and ownerId
- Test create with type "investment" sets status to "active" and requires type and currency
- Test create with type "cash" sets status to "active" and requires type and currency
- Test closePlatform sets status="closed", closedDate, and optional closureNote
- Test reopenPlatform sets status="active" and clears closedDate and closureNote
- Test update rejects changes to `type` field with meaningful error
- Test update rejects changes to `currency` field with meaningful error
- Test getActivePlatforms excludes closed platforms
- Test getClosedPlatforms returns only closed platforms
- Test getInvestmentPlatforms returns only active investment-type platforms
- Test getCashPlatforms returns only active cash-type platforms
- Verify all queries filter by `ownerId`
- Verify Zod schema parsing catches malformed responses
- Test error cases: not found, unauthorized

## Technical Notes
- File to create: `src/services/platforms.ts`
- PocketBase collection name: `platforms` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete`, `closePlatform`, `reopenPlatform` are mutationFns.
- Suggested query keys: `['platforms', portfolioId]` for list by portfolio, `['platforms', id]` for single. Mutations invalidate `['platforms', portfolioId]` on success.
- Collection fields include: portfolio (relation), name, icon, type, currency, status, closedDate, closureNote (PRD §10)
- For icon file uploads, use `new FormData()` and append the file as PocketBase expects
- PocketBase file URL pattern: `pb.files.getUrl(record, record.icon)`
- The immutability check on `type` and `currency` should happen in the service layer (not just the UI) as a defensive measure
- When deleting a platform, consider whether to cascade-delete associated data points and transactions, or let PocketBase handle it via relation rules
- Error handling: throw for "platform not found", "cannot change type after creation", "cannot change currency after creation", "unauthorized"
- All responses are parsed through Zod schemas (e.g., `platformSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
