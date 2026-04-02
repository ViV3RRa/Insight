# US-044: DataPoint CRUD Service

## Story
As the Insight platform user, I want to record and manage platform value data points so that the system can track my investment values over time and compute performance metrics.

## Dependencies
- US-004: PocketBase Client and Auth Service
- US-041: Investment TypeScript Types

## Requirements
- Create `src/services/dataPoints.ts` with the following functions:

**CRUD operations:**
- `getByPlatform(platformId: string)`: Fetch all data points for a platform. Filter by `owner` and `platformId`. Sort by `timestamp` ascending (chronological order — oldest first).
- `getByPlatformInRange(platformId: string, start: string, end: string)`: Fetch data points within a date range. Sort by `timestamp` ascending.
- `getOne(id: string)`: Fetch a single data point by ID. Verify ownership.
- `create(data: DataPointCreate)`: Create a new data point. Set `owner` to current user. Default `isInterpolated` to `false` if not specified. Default `timestamp` to now if not provided.
- `update(id: string, data: Partial<DataPointCreate>)`: Update a data point. If updating an interpolated data point (overriding it), set `isInterpolated` to `false` (the user is providing an actual observed value).
- `delete(id: string)`: Delete a data point. Verify ownership. Note: deleting a user-overridden month-end value should trigger re-interpolation (handled by the interpolation engine in US-051, not this service).

**Value semantics:**
- All values are in the platform's **native currency** (PRD §6.1.3). The service does not perform currency conversion — that happens at the aggregation layer.
- `isInterpolated` flag distinguishes system-generated month-end boundary values from user-observed values (PRD §6.2.3).
- `note` field is optional free text (PRD §3.5).

**Query helpers:**
- `getLatest(platformId: string)`: Return the most recent data point for a platform (by timestamp). Used for "current value" display and staleness checks.
- `getLatestBefore(platformId: string, date: string)`: Return the most recent data point at or before a given date. Used for boundary value lookups in calculations.
- `getEarliestAfter(platformId: string, date: string)`: Return the earliest data point after a given date. Used for interpolation calculations.
- `getMonthEndValue(platformId: string, year: number, month: number)`: Return the data point closest to (and on or before) the last day of the specified month. This is the month-end boundary value used in period calculations.

**Data isolation:**
- All queries filter by `owner = currentUserId`.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `getByPlatform()` returns all data points for a platform, sorted by timestamp ascending
- [ ] `getByPlatformInRange()` correctly filters by date range
- [ ] `create()` sets owner automatically and defaults isInterpolated to false
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
- [ ] PRD §14 criterion 15: Data point registration works with value, timestamp, and optional note

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
- Error handling: throw for "data point not found", "unauthorized"
