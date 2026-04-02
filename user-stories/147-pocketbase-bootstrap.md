# US-147: PocketBase Bootstrap & Migration Setup

## Story
As the Insight platform developer, I want PocketBase included in the project with automated startup and schema migrations so that `npm run dev` brings up both the frontend and backend with all collections ready — no manual Admin UI setup required.

## Dependencies
- US-001: Project Scaffolding (project structure must exist)

## Requirements

### 1. PocketBase Binary
- Download the PocketBase binary for the host platform (macOS arm64/amd64, Linux amd64)
- Place it at `pocketbase/pocketbase` (gitignored — downloaded via setup script)
- Create a setup script (`scripts/setup-pocketbase.sh`) that downloads the correct binary for the current OS/arch from the PocketBase GitHub releases
- Add `pocketbase/pb_data/` to `.gitignore` (runtime data)
- Add `pocketbase/pocketbase` to `.gitignore` (binary)
- **Do NOT gitignore** `pocketbase/pb_migrations/` — migrations are checked into source control

### 2. npm Scripts
Add the following scripts to `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `pb:setup` | `sh scripts/setup-pocketbase.sh` | Download PocketBase binary |
| `pb:serve` | `cd pocketbase && ./pocketbase serve` | Start PocketBase on port 8090 |
| `pb:dev` | `cd pocketbase && ./pocketbase serve` | Alias for clarity |
| `dev` | `concurrently "npm run pb:dev" "vite"` | Start both PocketBase and Vite together |

Install `concurrently` as a dev dependency for running both servers.

### 3. Migration Files
Create JavaScript migration files in `pocketbase/pb_migrations/` that PocketBase auto-applies on startup. Migrations run in alphabetical order by filename.

Files to create:

| File | Purpose | Creates |
|------|---------|---------|
| `001_settings.js` | Settings collection | `settings` (US-143) |
| `002_investment.js` | Investment collections | `portfolios`, `platforms`, `data_points`, `transactions`, `exchange_rates` (US-144) |
| `003_home.js` | Home collections | `utilities`, `meter_readings`, `utility_bills` (US-145) |
| `004_vehicles.js` | Vehicles collections | `vehicles`, `refuelings`, `maintenance_events` (US-146) |

Each migration file uses the PocketBase migration API:

```js
// pocketbase/pb_migrations/001_settings.js
migrate((app) => {
  const collection = new Collection({
    name: "settings",
    type: "base",
    fields: [
      // ... field definitions
    ],
    listRule: 'ownerId = @request.auth.id',
    viewRule: 'ownerId = @request.auth.id',
    createRule: '@request.auth.id != "" && @request.data.ownerId = @request.auth.id',
    updateRule: 'ownerId = @request.auth.id',
    deleteRule: 'ownerId = @request.auth.id',
  });
  app.save(collection);
}, (app) => {
  // Down migration
  const collection = app.findCollectionByNameOrId("settings");
  app.delete(collection);
});
```

The field definitions, relations, file constraints, and API rules for each collection are specified in US-143 through US-146. The migration files are the implementation of those specs.

### 4. Admin Account Seeding
- On first run, PocketBase prompts for admin account creation at `http://127.0.0.1:8090/_/`
- Document this in a `pocketbase/README.md` with setup instructions
- Optionally: create a seed script (`scripts/seed-admin.sh`) that uses the PocketBase CLI to create the admin account non-interactively for fully automated setup

### 5. Environment Configuration
- Ensure `.env` has `VITE_POCKETBASE_URL=http://127.0.0.1:8090` (from US-004)
- The PocketBase data directory is `pocketbase/pb_data/` (auto-created on first run)

## Project Structure

```
pocketbase/
├── pb_migrations/
│   ├── 001_settings.js
│   ├── 002_investment.js
│   ├── 003_home.js
│   └── 004_vehicles.js
├── pb_data/              ← gitignored, created at runtime
├── pocketbase            ← gitignored, downloaded via setup script
└── README.md             ← Setup instructions
scripts/
├── setup-pocketbase.sh   ← Downloads PocketBase binary
└── seed-admin.sh         ← (optional) Creates admin account
```

## Recommended Indexes

Add composite indexes to migration files for common query patterns. PocketBase supports indexes via the collection schema. These are important for performance with 7+ years of historical data (PRD §13).

| Migration | Collection | Index Fields | Purpose |
|-----------|-----------|-------------|---------|
| `002_investment.js` | `platforms` | `(ownerId, portfolioId)` | Fetch platforms by portfolio |
| `002_investment.js` | `data_points` | `(ownerId, platformId, timestamp)` | Time-series queries |
| `002_investment.js` | `transactions` | `(ownerId, platformId, timestamp)` | Transaction lookups |
| `002_investment.js` | `exchange_rates` | `(ownerId, fromCurrency, toCurrency, date)` UNIQUE | Prevent duplicate rates |
| `003_home.js` | `meter_readings` | `(ownerId, utilityId, timestamp)` | Consumption calculation |
| `003_home.js` | `utility_bills` | `(ownerId, utilityId, periodStart)` | Amortization queries |
| `004_vehicles.js` | `refuelings` | `(ownerId, vehicleId, date)` | Efficiency calculation |
| `004_vehicles.js` | `maintenance_events` | `(ownerId, vehicleId, date)` | Cost summation |

## Acceptance Criteria
- [ ] `npm run pb:setup` downloads the PocketBase binary for the current platform
- [ ] `npm run pb:serve` starts PocketBase on port 8090
- [ ] `npm run dev` starts both PocketBase and Vite concurrently
- [ ] On first startup, PocketBase auto-applies all migration files
- [ ] After migrations: all 12 collections exist (`settings`, `portfolios`, `platforms`, `data_points`, `transactions`, `exchange_rates`, `utilities`, `meter_readings`, `utility_bills`, `vehicles`, `refuelings`, `maintenance_events`)
- [ ] All collection schemas match the specs in US-143 through US-146
- [ ] All API rules enforce per-user data isolation
- [ ] `pocketbase/pb_data/` and the binary are gitignored
- [ ] `pocketbase/pb_migrations/` is checked into source control
- [ ] Admin UI accessible at `http://127.0.0.1:8090/_/` for manual inspection
- [ ] `pocketbase/README.md` documents setup steps (first-time admin creation)
- [ ] PRD §2: PocketBase self-hosted backend is functional
- [ ] PRD §13: Data ownership — all data in user's own PocketBase instance
- [ ] All bootstrap tests pass
- [ ] End-to-end setup verified on a clean environment

## Testing Requirements
- **Test file**: `scripts/test-pocketbase.sh` or integration test
- **Approach**: Script-level integration test
- Test `npm run pb:setup` downloads the PocketBase binary for the current platform (verify binary exists at `pocketbase/pocketbase` after setup)
- Test `npm run pb:serve` starts PocketBase and port 8090 responds to HTTP requests
- Test that all 12 collections exist after migration auto-apply: `settings`, `portfolios`, `platforms`, `data_points`, `transactions`, `exchange_rates`, `utilities`, `meter_readings`, `utility_bills`, `vehicles`, `refuelings`, `maintenance_events`
- Test `npm run dev` starts both Vite and PocketBase concurrently (both ports respond)
- Test that `pocketbase/pb_data/` and the binary are gitignored (verify with `git check-ignore`)
- Test that `pocketbase/pb_migrations/` is NOT gitignored (migrations are source-controlled)

## Technical Notes
- PocketBase is a single Go binary — no Docker, no database setup needed
- Migrations are auto-applied on startup; PocketBase tracks which have run in `pb_data/`
- The migration API uses `new Collection()` for creation and `app.findCollectionByNameOrId()` for lookups
- For relation fields, the target collection must exist — migration order matters (hence numbered filenames)
- `concurrently` allows stopping both servers with a single Ctrl+C
- PocketBase stores files in `pb_data/storage/` — no external file storage needed
- The setup script should detect OS (`uname -s`) and arch (`uname -m`) and download the matching release from `https://github.com/pocketbase/pocketbase/releases`
- **Multi-level cascade deletes**: Deleting a portfolio cascades to its platforms, which in turn cascade to their data_points and transactions. Similarly, deleting a utility cascades to meter_readings and utility_bills; deleting a vehicle cascades to refuelings and maintenance_events.
- **Settings API rule exception**: The `settings` collection uses `userId` (not `ownerId`) as its data isolation key. This is intentional — settings is a per-user singleton conceptually tied to the user account, while other collections use `ownerId` for multi-record data ownership. Both patterns enforce the same isolation; the naming difference reflects the 1:1 vs 1:N relationship.
