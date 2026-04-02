# US-143: PocketBase Schema — Settings Collection

## Story
As the Insight platform user, I want the `settings` PocketBase collection created with the correct schema so that user preferences can be persisted server-side.

## Dependencies
- US-147: PocketBase Bootstrap & Migration Setup (migration infrastructure must exist)

## Requirements
- Create the `settings` collection in PocketBase with the schema below
- Configure API rules so each user can only read/write their own settings record
- This collection must exist before US-010 (Settings Service) can function

## Collection Schema

**Collection name:** `settings`
**Type:** Base collection

| Field | PocketBase Type | Required | Default | Notes |
|-------|----------------|----------|---------|-------|
| `userId` | Relation → `users` | Yes | — | Single relation, cascade delete. Data isolation key. |
| `dateFormat` | Select | Yes | `YYYY-MM-DD` | Options: `YYYY-MM-DD`, `DD/MM/YYYY` |
| `theme` | Select | Yes | `light` | Options: `light`, `dark` |
| `demoMode` | Bool | Yes | `false` | — |

## API Rules (Data Isolation)

All rules filter by the authenticated user's ID to enforce per-user data isolation (PRD §10):

| Action | Rule |
|--------|------|
| List/Search | `userId = @request.auth.id` |
| View | `userId = @request.auth.id` |
| Create | `@request.auth.id != "" && @request.data.userId = @request.auth.id` |
| Update | `userId = @request.auth.id` |
| Delete | `userId = @request.auth.id` |

## Acceptance Criteria
- [ ] `settings` collection exists in PocketBase
- [ ] All fields match the schema above with correct types and defaults
- [ ] `userId` is a relation to the `users` collection
- [ ] `dateFormat` is a select field with exactly two options
- [ ] `theme` is a select field with exactly two options
- [ ] `demoMode` defaults to false
- [ ] API rules enforce data isolation — a user can only CRUD their own settings
- [ ] Creating a settings record without `userId` matching auth ID is rejected
- [ ] PRD §10: Collection fields match spec
- [ ] All migration tests pass
- [ ] API rule tests confirm per-user data isolation

## Testing Requirements
- **Test file**: `pocketbase/pb_migrations/001_settings.test.js` or integration test
- **Approach**: Verify migration creates collection with correct schema
- Test that migration `001_settings.js` applies successfully on a fresh PocketBase instance
- Test that `settings` collection exists after migration
- Test that all fields exist with correct types: `userId` (relation), `dateFormat` (select), `theme` (select), `demoMode` (bool)
- Test that `dateFormat` select has exactly two options: `YYYY-MM-DD`, `DD/MM/YYYY`
- Test that `theme` select has exactly two options: `light`, `dark`
- Test that `demoMode` defaults to `false`
- Test that API rules filter by `userId` — a user cannot read/update another user's settings
- Test that create rule enforces `userId = @request.auth.id` (cannot create settings for another user)

## Technical Notes
- Implemented as migration file `pocketbase/pb_migrations/001_settings.js` (auto-applied on PocketBase startup)
- This is the simplest collection — use it as the template for the API rule pattern applied to all other collections
- Only one settings record per user is expected; the frontend service (US-010) handles upsert logic
