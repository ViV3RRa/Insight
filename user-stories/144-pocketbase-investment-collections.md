# US-144: PocketBase Schema — Investment Collections

## Story
As the Insight platform user, I want the investment-related PocketBase collections created with correct schemas, relations, and file fields so that the portfolio, platform, data point, transaction, and exchange rate data can be persisted.

## Dependencies
- US-147: PocketBase Bootstrap & Migration Setup (migration infrastructure must exist)
<!-- US-143 dependency removed: API rule pattern is a documentation concern, not a code dependency. See implementation-plan.md §3.3 -->

## Requirements
- Create 5 collections in PocketBase with the schemas below
- Configure relations between collections (platform → portfolio, data_point → platform, etc.)
- Configure file fields with appropriate constraints
- Configure API rules for per-user data isolation on all collections
- These collections must exist before the investment service stories (US-042 through US-046) can function

## Collection Schemas

### 1. `portfolios`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `name` | Text | Yes | — | e.g. "My Portfolio" |
| `ownerName` | Text | Yes | — | Who the portfolio is for, e.g. "Me", "Erik" |
| `isDefault` | Bool | Yes | `false` | Exactly one per user should be true |

### 2. `platforms`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `portfolioId` | Relation → `portfolios` | Yes | — | Single relation, cascade delete |
| `name` | Text | Yes | — | e.g. "Nordnet", "Mintos" |
| `icon` | File | Yes | — | Image file. Max size: 2 MB. MIME: `image/jpeg`, `image/png`, `image/webp`. Displayed as circular thumbnail. |
| `type` | Select | Yes | — | Options: `investment`, `cash` |
| `currency` | Text | Yes | — | e.g. "DKK", "EUR" |
| `status` | Select | Yes | `active` | Options: `active`, `closed` |
| `closedDate` | Date | No | — | Date the platform was closed |
| `closureNote` | Text | No | — | Reason/context for closing |

### 3. `data_points`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `platformId` | Relation → `platforms` | Yes | — | Single relation, cascade delete |
| `value` | Number | Yes | — | Platform value in native currency |
| `timestamp` | DateTime | Yes | — | Defaults to now in frontend |
| `isInterpolated` | Bool | Yes | `false` | True for system-generated month-end values |
| `note` | Text | No | — | Optional context |

### 4. `transactions`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `platformId` | Relation → `platforms` | Yes | — | Single relation, cascade delete |
| `type` | Select | Yes | — | Options: `deposit`, `withdrawal` |
| `amount` | Number | Yes | — | Always positive; sign derived from type |
| `exchangeRate` | Number | No | — | Rate at time of transaction for non-DKK |
| `timestamp` | DateTime | Yes | — | — |
| `note` | Text | No | — | — |
| `attachment` | File | No | — | Max size: 5 MB. MIME: `image/*`, `application/pdf` |

### 5. `exchange_rates`

**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `ownerId` | Relation → `users` | Yes | — | Data isolation key |
| `fromCurrency` | Text | Yes | — | e.g. "EUR" |
| `toCurrency` | Text | Yes | — | Always "DKK" for now |
| `rate` | Number | Yes | — | e.g. 7.46 means 1 EUR = 7.46 DKK |
| `date` | Date | Yes | — | Date this rate applies to |
| `source` | Select | Yes | `auto` | Options: `auto`, `manual` |

## API Rules (Data Isolation)

Apply the same pattern to **all 5 collections** (PRD §10):

| Action | Rule |
|--------|------|
| List/Search | `ownerId = @request.auth.id` |
| View | `ownerId = @request.auth.id` |
| Create | `@request.auth.id != "" && @request.data.ownerId = @request.auth.id` |
| Update | `ownerId = @request.auth.id` |
| Delete | `ownerId = @request.auth.id` |

## Acceptance Criteria
- [ ] `portfolios` collection exists with all fields matching schema
- [ ] `platforms` collection exists with relation to `portfolios` and file field for `icon`
- [ ] `platforms.icon` accepts only image files up to 2 MB
- [ ] `platforms.type` is a select with options: `investment`, `cash`
- [ ] `platforms.status` defaults to `active`
- [ ] `data_points` collection exists with relation to `platforms`
- [ ] `data_points.isInterpolated` defaults to `false`
- [ ] `transactions` collection exists with relation to `platforms`
- [ ] `transactions.type` is a select with options: `deposit`, `withdrawal`
- [ ] `transactions.attachment` accepts images and PDFs up to 5 MB
- [ ] `exchange_rates` collection exists with all fields
- [ ] `exchange_rates.source` is a select with options: `auto`, `manual`
- [ ] All 5 collections have API rules enforcing per-user data isolation
- [ ] Cascade delete: deleting a portfolio deletes its platforms; deleting a platform deletes its data points and transactions
- [ ] PRD §10: All collection fields match spec
- [ ] All migration tests pass
- [ ] API rule tests confirm per-user data isolation on all 5 collections

## Testing Requirements
- **Test file**: `pocketbase/pb_migrations/002_investment.test.js` or integration test
- **Approach**: Verify migration creates collections with correct schemas
- Test that migration `002_investment.js` applies successfully on a fresh PocketBase instance
- Test that all 5 collections exist after migration: `portfolios`, `platforms`, `data_points`, `transactions`, `exchange_rates`
- Test that all fields exist with correct types after migration (spot-check key fields per collection)
- Test that `platforms.portfolioId` is a relation to `portfolios` with cascade delete
- Test that `data_points.platformId` is a relation to `platforms` with cascade delete
- Test that `transactions.platformId` is a relation to `platforms` with cascade delete
- Test that `platforms.icon` file field accepts only images up to 2 MB
- Test that `transactions.attachment` file field accepts images and PDFs up to 5 MB
- Test that API rules enforce per-user data isolation on all 5 collections
- Test cascade delete behavior: deleting a portfolio deletes its platforms, which in turn deletes their data_points and transactions
- Test that indexes are created for common query patterns (e.g., `(ownerId, platformId, timestamp)` on data_points)

## Technical Notes
- Implemented as migration file `pocketbase/pb_migrations/002_investment.js` (auto-applied on PocketBase startup)
- Relation fields: use "Cascade delete" option so child records are cleaned up automatically
- The `icon` field on platforms is required — every platform must have an icon image (PRD §9.2, §10)
- The `attachment` field on transactions is optional — supports receipt uploads
- PocketBase auto-generates `id` and `created` fields; do not define them manually
- Consider creating a unique index on `exchange_rates` for `(ownerId, fromCurrency, toCurrency, date)` to prevent duplicate rates
