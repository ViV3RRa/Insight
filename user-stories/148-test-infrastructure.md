# US-148: Test Infrastructure & Conventions

## Story
As the Insight platform developer, I want a fully configured test infrastructure so that all subsequent test stories have a consistent foundation for writing unit, component, and integration tests.

## Dependencies
- US-001: Project Scaffolding (project structure must exist)

## Requirements

### 1. Test Framework Setup
- Install and configure **Vitest** as the test runner (fast, Vite-native, ESM-first)
- Install **jsdom** for DOM environment in component tests
- Configure `vitest.config.ts` (or extend `vite.config.ts`):
  - `environment: 'jsdom'` for component tests
  - `globals: true` for `describe`, `it`, `expect` without imports
  - `setupFiles: ['./src/test/setup.ts']`
  - `css: true` (Tailwind class assertions)
  - Coverage provider: `v8` or `istanbul`

### 2. Testing Library Setup
- Install `@testing-library/react` for component rendering
- Install `@testing-library/jest-dom` for DOM matchers (`toBeInTheDocument`, `toHaveClass`, etc.)
- Install `@testing-library/user-event` for realistic user interaction simulation

### 3. API Mocking Setup
- Install **MSW** (Mock Service Worker) v2 for intercepting PocketBase API calls
- Create `src/test/mocks/server.ts` — MSW server instance for tests
- Create `src/test/mocks/handlers.ts` — default request handlers for PocketBase endpoints
- Configure MSW to start before tests and reset between tests in `setup.ts`

### 4. Test Setup File
Create `src/test/setup.ts`:
- Import `@testing-library/jest-dom` matchers
- Start MSW server `beforeAll`, reset handlers `afterEach`, close `afterAll`
- Set up global mocks (e.g., `matchMedia` for responsive tests)
- Configure fake timers setup helper for date-dependent tests

### 5. Custom Render Utility
Create `src/test/utils.tsx`:
- `renderWithProviders(ui, options?)` — wraps components with all required providers:
  - `QueryClientProvider` with a fresh `QueryClient` per test (no cache sharing)
  - `MemoryRouter` for route-dependent components
  - `ThemeProvider` (or mock theme context)
- Re-export everything from `@testing-library/react`
- Export `createTestQueryClient()` — creates a QueryClient with `retry: false` and `gcTime: 0` for test isolation

### 6. Test Data Factories
Create `src/test/factories/` with factory functions for every entity:

| Factory File | Entities | Source Schema |
|---|---|---|
| `portfolioFactory.ts` | `Portfolio`, `PortfolioCreate` | US-041 |
| `platformFactory.ts` | `Platform`, `PlatformCreate` | US-041 |
| `dataPointFactory.ts` | `DataPoint`, `DataPointCreate` | US-041 |
| `transactionFactory.ts` | `Transaction`, `TransactionCreate` | US-041 |
| `exchangeRateFactory.ts` | `ExchangeRate` | US-041 |
| `utilityFactory.ts` | `Utility`, `UtilityCreate` | US-080 |
| `meterReadingFactory.ts` | `MeterReading`, `MeterReadingCreate` | US-080 |
| `utilityBillFactory.ts` | `UtilityBill`, `UtilityBillCreate` | US-080 |
| `vehicleFactory.ts` | `Vehicle`, `VehicleCreate` | US-107 |
| `refuelingFactory.ts` | `Refueling`, `RefuelingCreate` | US-107 |
| `maintenanceFactory.ts` | `MaintenanceEvent`, `MaintenanceEventCreate` | US-107 |
| `settingsFactory.ts` | `Settings` | US-010 |

Each factory:
- Returns a valid object that passes its Zod schema
- Accepts partial overrides: `buildPortfolio({ name: 'Custom' })`
- Uses `build` for single objects, `buildList(n)` for arrays
- Generates unique branded IDs per call
- Provides sensible defaults for all fields

### 7. PocketBase Client Mock
Create `src/test/mocks/pbMock.ts`:
- Mock implementation of the PocketBase client
- Supports `collection().getList()`, `collection().getOne()`, `collection().create()`, `collection().update()`, `collection().delete()`
- Returns factory-generated data by default
- Allows per-test override of responses

### 8. npm Scripts
Add to `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `test` | `vitest run` | Run all tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run with coverage report |
| `test:ui` | `vitest --ui` | Open Vitest UI dashboard |

### 9. Coverage Configuration
Configure in `vitest.config.ts`:
- Coverage thresholds:
  - `src/utils/`: 100% line coverage
  - `src/services/`: 90% line coverage
  - `src/components/shared/`: 90% line coverage
  - `src/components/{home,portfolio,vehicles}/`: 80% line coverage
  - `src/stores/`: 90% line coverage
  - Global minimum: 85% line coverage
- Exclude from coverage: `src/test/`, `*.d.ts`, `src/main.tsx`, config files
- Report formats: `text`, `lcov`, `html`

### 10. Test File Convention
- Co-located test files next to source: `src/utils/xirr.ts` → `src/utils/xirr.test.ts`
- Component tests: `StatCard.tsx` → `StatCard.test.tsx`
- Service tests: `portfolios.ts` → `portfolios.test.ts`
- Use `describe` blocks per function/component, `it` blocks per behavior
- Name test files with `.test.ts(x)` suffix (not `.spec`)

## Project Structure

```
src/
├── test/
│   ├── setup.ts                 ← Global test setup
│   ├── utils.tsx                ← Custom render, test QueryClient
│   ├── factories/
│   │   ├── index.ts             ← Re-exports all factories
│   │   ├── portfolioFactory.ts
│   │   ├── platformFactory.ts
│   │   ├── dataPointFactory.ts
│   │   ├── transactionFactory.ts
│   │   ├── exchangeRateFactory.ts
│   │   ├── utilityFactory.ts
│   │   ├── meterReadingFactory.ts
│   │   ├── utilityBillFactory.ts
│   │   ├── vehicleFactory.ts
│   │   ├── refuelingFactory.ts
│   │   ├── maintenanceFactory.ts
│   │   └── settingsFactory.ts
│   └── mocks/
│       ├── server.ts            ← MSW server instance
│       ├── handlers.ts          ← Default MSW handlers
│       └── pbMock.ts            ← PocketBase client mock
```

## Acceptance Criteria
- [ ] `npm test` runs all tests and reports results
- [ ] `npm run test:watch` starts Vitest in watch mode
- [ ] `npm run test:coverage` generates coverage report with configured thresholds
- [ ] `renderWithProviders()` wraps components with QueryClient, Router, and Theme providers
- [ ] Each test gets a fresh QueryClient instance (no cache leakage between tests)
- [ ] MSW intercepts PocketBase API calls in tests
- [ ] MSW handlers reset between tests (no state leakage)
- [ ] All 12 entity factories produce valid Zod-schema-compliant objects
- [ ] Factories accept partial overrides for customization
- [ ] Factory IDs are unique branded types per call
- [ ] PocketBase client mock supports standard CRUD operations
- [ ] Coverage thresholds enforce minimum coverage per directory
- [ ] Vitest resolves Tailwind classes (css: true)
- [ ] Date-dependent tests use Vitest fake timers (no flakiness)

## Technical Notes
- Files to create: `vitest.config.ts` (or extend vite.config), `src/test/setup.ts`, `src/test/utils.tsx`, all factory files, all mock files
- Vitest is chosen over Jest for native Vite integration, ESM support, and faster execution
- MSW v2 uses the `http` and `HttpResponse` API (not the legacy `rest` handlers)
- Each factory should use a counter or `crypto.randomUUID()` for unique IDs, then brand them via the Zod schema
- The custom render utility follows the Testing Library pattern: https://testing-library.com/docs/react-testing-library/setup#custom-render
- `QueryClient` in tests should have `defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } }` to avoid async leakage
- Consider installing `@vitest/coverage-v8` for V8-based coverage (faster than Istanbul)
- Consider installing `@vitest/ui` for the browser-based test dashboard
