# US-044: DataPoint CRUD Service

## Story
As the Insight platform user, I want to record and manage platform value data points so that the system can track my investment values over time and compute performance metrics.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types
- US-144: PocketBase Schema — Investment Collections
- US-051: Month-End Normalization / Interpolation Engine

## Requirements
- Create `src/services/dataPoints.ts` with the following functions:

**CRUD operations:**
- `getByPlatform(platformId: string)`: Fetch all data points for a platform. Filter by `ownerId` and `platformId`. Sort by `timestamp` ascending (chronological order — oldest first).
- `getByPlatformInRange(platformId: string, start: string, end: string)`: Fetch data points within a date range. Sort by `timestamp` ascending.
- `getOne(id: string)`: Fetch a single data point by ID. Verify ownership.
- `create(data: DataPointCreate)`: Create a new data point. Set `ownerId` to current user. Default `isInterpolated` to `false` if not specified. Default `timestamp` to now if not provided.
- `update(id: string, data: Partial<DataPointCreate>)`: Update a data point. If updating an interpolated data point (overriding it), set `isInterpolated` to `false` (the user is providing an actual observed value).
- `delete(id: string)`: Delete a data point. Verify ownership.

**Value semantics:**
- All values are in the platform's **native currency** (PRD §6.1.3). The service does not perform currency conversion — that happens at the aggregation layer.
- `isInterpolated` flag distinguishes system-generated month-end boundary values from user-observed values (PRD §6.2.3).
- `note` field is optional free text (PRD §3.5).

**Query helpers:**
- `getLatest(platformId: string)`: Return the most recent data point for a platform (by timestamp). Used for "current value" display and staleness checks.
- `getLatestBefore(platformId: string, date: string)`: Return the most recent data point at or before a given date. Used for boundary value lookups in calculations.
- `getEarliestAfter(platformId: string, date: string)`: Return the earliest data point after a given date. Used for interpolation calculations.
- `getMonthEndValue(platformId: string, year: number, month: number)`: Return the data point closest to (and on or before) the last day of the specified month. This is the month-end boundary value used in period calculations.

**Interpolation orchestration (PRD §6.2.3):**
After any mutation that changes the data point timeline, the service must trigger re-interpolation:

- After `create()`: Call `onDataPointCreated()` from US-051 with the platform's full data point list and the new point. Persist any returned interpolated points via `create()` with `isInterpolated: true`.
- After `update()` (if value or timestamp changed): Call `onDataPointUpdated()` from US-051. Delete stale interpolated points and persist new ones.
- After `delete()`: Call `onDataPointDeleted()` from US-051 with the remaining data points and the deleted point. Persist any returned re-interpolated points.

This service is the orchestrator — US-051 provides pure calculation functions that return interpolated points, and this service persists them. The interpolation trigger logic lives here, not in US-051 or in UI components.

**Data isolation:**
- All queries filter by `ownerId = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByPlatform()` returns all data points for a platform, sorted by timestamp ascending
- [ ] `getByPlatformInRange()` correctly filters by date range
- [ ] `create()` sets ownerId automatically and defaults isInterpolated to false
- [ ] `create()` defaults timestamp to current datetime if not provided
- [ ] `update()` allows changing value, timestamp, isInterpolated, and note
- [ ] Updating an interpolated data point sets isInterpolated to false (user override)
- [ ] `delete()` removes the data point
- [ ] `getLatest()` returns the most recent data point by timestamp
- [ ] `getLatestBefore(platformId, date)` returns the correct boundary data point
- [ ] `getEarliestAfter(platformId, date)` returns the next data point after the date
- [ ] `getMonthEndValue()` returns the appropriate month-end boundary value
- [ ] All values are stored in native currency (no conversion at this layer)
- [ ] All operations verify ownership
- [ ] After `create()`, interpolation is triggered and any missing month-end boundary points are auto-saved with `isInterpolated: true`
- [ ] After `update()` (value or timestamp change), affected interpolated points are recalculated and re-saved
- [ ] After `delete()`, missing month-end boundaries are detected and re-interpolated automatically
- [ ] Interpolation orchestration does not trigger infinite loops (interpolated point creation does not re-trigger interpolation)
- [ ] PRD §14 criterion 15: Data point registration works with value, timestamp, and optional note
- [ ] All tests pass and meet 90%+ line coverage target
- [ ] Zod schema parsing is verified for all service responses

## Testing Requirements
- **Test file**: `src/services/dataPoints.test.ts` (co-located)
- **Approach**: Mock PocketBase via MSW; test CRUD operations, ownership filtering, Zod parsing, error handling
- **Coverage target**: 90%+ line coverage
- Test getByPlatform returns data points sorted by timestamp ascending
- Test create defaults isInterpolated=false and timestamp=now when not provided
- Test update of an interpolated data point sets isInterpolated=false (user override)
- Test getLatest returns the most recent data point by timestamp
- Test getLatestBefore returns the correct boundary data point at or before a given date
- Test getEarliestAfter returns the earliest data point after a given date
- Test getMonthEndValue returns the appropriate month-end boundary value
- Test **interpolation orchestration**: create/update/delete triggers re-interpolation and persists returned interpolated points
- Test **interpolation guard**: creating a data point with isInterpolated=true does NOT re-trigger interpolation (no infinite loop)
- Verify all queries filter by `ownerId`
- Verify Zod schema parsing catches malformed responses
- Test error cases: not found, unauthorized

## Technical Notes
- File to create: `src/services/dataPoints.ts`
- PocketBase collection name: `data_points` (PRD §10)
- Service functions are designed as TanStack Query candidates: read functions are queryFns; `create`, `update`, `delete` are mutationFns.
- Suggested query keys: `['dataPoints', platformId]` for list, `['dataPoints', platformId, { start, end }]` for range queries. Mutations invalidate `['dataPoints', platformId]` on success.
- Collection fields: platform (relation), value, timestamp, isInterpolated, note (PRD §10)
- Sort by timestamp ascending for chronological queries: `{ sort: 'timestamp' }`
- For `getLatestBefore`, use PocketBase filter: `platformId = '${id}' && timestamp <= '${date}'` with sort `-timestamp` and limit 1
- For `getEarliestAfter`, use filter: `platformId = '${id}' && timestamp > '${date}'` with sort `timestamp` and limit 1
- The `getMonthEndValue` helper computes the last day of the month and delegates to `getLatestBefore`
- This service provides raw data access. The interpolation logic (creating/managing interpolated data points) lives in US-051
- Interpolation guard: when creating a data point with `isInterpolated: true` (i.e., saving an interpolated point), skip the interpolation trigger to avoid infinite recursion
- Error handling: throw for "data point not found", "unauthorized"
- All responses are parsed through Zod schemas (e.g., `dataPointSchema.parse(response)`) before returning — this validates the response shape and produces branded ID types at runtime
