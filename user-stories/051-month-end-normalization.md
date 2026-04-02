# US-051: Month-End Normalization / Interpolation Engine

## Story
As the Insight platform user, I want month-end boundary values automatically interpolated when I record data points after the month boundary so that all period calculations (monthly earnings, monthly XIRR, yearly summaries) have consistent boundary values without requiring me to record on exact month-end dates.

## Dependencies
- US-041: Investment TypeScript Types
- US-044: DataPoint CRUD Service

## Requirements
- Create `src/utils/interpolation.ts` with the following:

**Core concept** (PRD §6.2.3):
All period calculations use **month-end boundary values** — the platform value on the last day of each month (Jan 31, Feb 28/29, Mar 31, etc.). When the user records a data point after a month boundary, the system creates an interpolated data point for the missing boundary.

**Interpolation logic:**

- `interpolateMonthEndValue(prevValue: number, prevDate: Date, nextValue: number, nextDate: Date, targetDate: Date): number`:
  - Linear interpolation between two known points to estimate the value at `targetDate`.
  - Formula: `prevValue + (nextValue - prevValue) * ((targetDate - prevDate) / (nextDate - prevDate))`.
  - `targetDate` is always the last day of a month.
  - `prevDate` and `prevValue` are from the most recent data point before the target.
  - `nextDate` and `nextValue` are from the earliest data point after the target.

**Month-end boundary detection and creation:**

- `getMonthEndDate(year: number, month: number): Date`:
  - Returns the last day of the given month (handles leap years).
  - Jan = 31, Feb = 28/29, Mar = 31, etc.

- `findMissingMonthEnds(dataPoints: DataPoint[]): Date[]`:
  - Given a sorted array of data points, identifies month-end dates that fall between consecutive data points but have no actual data point recorded.
  - Only considers month boundaries between the earliest and latest data points.

- `computeInterpolatedPoint(dataPoints: DataPoint[], targetDate: Date): DataPoint | null`:
  - Given sorted data points and a target month-end date, finds the surrounding data points and computes the interpolated value.
  - Returns a DataPoint-like object with `isInterpolated: true`.
  - Returns `null` if interpolation is not possible (e.g. only one data point exists, or the target is outside the data range).

- `generateInterpolatedPoints(dataPoints: DataPoint[], platformId: string): InterpolatedPoint[]`:
  - Scans all data points for a platform and generates interpolated month-end values for any missing boundaries.
  - Returns an array of `{ platformId, value, timestamp, isInterpolated: true }` objects ready to be saved.

**Trigger scenarios** (PRD §6.2.3):

1. **Recording on the last day of the month** (e.g. Jan 31): The value is used directly as that month's boundary. No interpolation needed.
2. **Recording after the month boundary** (e.g. Feb 5 for January's end): The system creates an interpolated Jan 31 data point via linear interpolation between the previous month-end value (Dec 31) and the Feb 5 recording.
3. **Multiple recordings within a month**: The last recording in the month is the primary value. Additional mid-month recordings enrich value-over-time charts but do not affect month-end boundary calculations.

**Override and reversibility** (PRD §6.2.3):

- Interpolated data points are marked with `isInterpolated: true`.
- The user can **override** an interpolated value by entering an actual month-end value. This replaces the interpolated point and sets `isInterpolated: false`.
- The user can **reverse** an override by deleting the data point. When a month-end boundary point is missing, the system detects the gap and recomputes the interpolation, creating a new `isInterpolated: true` data point.

**Recalculation triggers:**

- `onDataPointCreated(dataPoints: DataPoint[], newPoint: DataPoint): InterpolatedPoint[]`: When a new data point is created, check if any month-end boundaries need interpolation or re-interpolation.
- `onDataPointDeleted(dataPoints: DataPoint[], deletedPoint: DataPoint): InterpolatedPoint[]`: When a data point is deleted, check if any month-end boundaries now need re-interpolation.
- `onDataPointUpdated(dataPoints: DataPoint[], updatedPoint: DataPoint): InterpolatedPoint[]`: When a data point value changes, re-interpolate any affected boundaries.

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] `interpolateMonthEndValue(10000, Dec 15, 10600, Jan 15, Dec 31)` returns 10309.68 (linear interpolation: 16 of 31 days elapsed, ratio = 16/31)
- [ ] `getMonthEndDate(2026, 1)` returns Jan 31, 2026
- [ ] `getMonthEndDate(2024, 2)` returns Feb 29, 2024 (leap year)
- [ ] `getMonthEndDate(2025, 2)` returns Feb 28, 2025 (non-leap year)
- [ ] `findMissingMonthEnds` correctly identifies gaps where month-end boundaries fall between data points
- [ ] `computeInterpolatedPoint` returns a DataPoint with isInterpolated=true
- [ ] `computeInterpolatedPoint` returns null when interpolation is impossible (only one data point)
- [ ] `generateInterpolatedPoints` produces all missing month-end values for a platform
- [ ] Data point recorded on month-end date is used directly (no interpolation)
- [ ] Data point recorded after month boundary triggers interpolation for the previous month-end
- [ ] User override: replacing an interpolated point sets isInterpolated=false
- [ ] Deletion of override: triggers re-interpolation of the missing boundary
- [ ] `onDataPointCreated` returns any new interpolated points needed
- [ ] `onDataPointDeleted` returns any re-interpolated points needed
- [ ] Multiple mid-month recordings do not affect month-end boundary selection
- [ ] PRD §14 criterion 19 (supporting): Month-end normalization enables accurate monthly metrics
- [ ] All tests pass and meet 100% coverage of exported functions

## Testing Requirements
- **Test file**: `src/utils/interpolation.test.ts` (co-located)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- Test interpolateMonthEndValue(10000, Dec 15, 10600, Jan 15, Dec 31) returns 10309.68 (linear interpolation: 16/31 days)
- Test getMonthEndDate handles leap years correctly (Feb 29, 2024 vs Feb 28, 2025)
- Test findMissingMonthEnds identifies all gaps where month-end boundaries fall between data points
- Test computeInterpolatedPoint returns a DataPoint with isInterpolated=true
- Test computeInterpolatedPoint returns null with only a single data point
- Test generateInterpolatedPoints produces all missing month-end values for a platform
- Test onDataPointCreated returns new interpolated points needed after a creation
- Test onDataPointDeleted returns re-interpolated points needed after a deletion
- Test onDataPointUpdated returns updated interpolated points when value changes
- Test edge cases: null returns, empty arrays, single data point

## Technical Notes
- File to create: `src/utils/interpolation.ts`
- Linear interpolation is straightforward: the ratio of time elapsed determines the ratio of value change
- Date math for "last day of month": `new Date(year, month, 0).getDate()` gives the last day (month is 1-indexed here since Date constructor month is 0-indexed, so `new Date(2026, 2, 0)` gives Feb 28, 2026)
- The interpolation engine is a pure computation layer. Saving interpolated points to PocketBase is the responsibility of the caller (typically the data point service or a higher-level orchestrator)
- The `onDataPointCreated/Deleted/Updated` functions return the interpolated points that need to be saved — they do not call PocketBase directly. This keeps the module testable.
- Consider an `InterpolatedPoint` type: `{ platformId: string; value: number; timestamp: string; isInterpolated: true }` that is compatible with `DataPointCreate`
- Performance: For a platform with 7+ years of monthly data, there are ~84 month-end boundaries. Interpolation is O(n) in the number of data points.
- Edge case: if the first-ever data point is mid-month, there is no prior point to interpolate from. The month-end value for that first month is either the data point itself (if on month-end) or cannot be interpolated (no prior data). Handle this gracefully by skipping interpolation for the first incomplete month.
