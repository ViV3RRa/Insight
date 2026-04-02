# US-084: Monthly Consumption Calculation (Meter Reading Interpolation)

## Story
As the Insight platform user, I want monthly consumption automatically derived from my cumulative meter readings so that I can see per-month usage even when readings don't align to month boundaries.

## Dependencies
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create consumption calculation functions in `src/utils/consumption.ts`:

**Core algorithm** (PRD §5.1.2, §5.2):

Consumption between two consecutive readings = `current.value - previous.value` (delta).

**Month-boundary interpolation** (PRD §5.1.2):

When a reading pair spans a month boundary, linear interpolation splits the consumption proportionally across months:

1. For each pair of consecutive readings (sorted by timestamp):
   - Calculate total consumption: `delta = reading[i+1].value - reading[i].value`
   - Calculate total days: `totalDays = daysBetween(reading[i].timestamp, reading[i+1].timestamp)`
   - If both readings fall in the same month: assign all consumption to that month
   - If readings span month boundaries: distribute consumption proportionally by days in each month
     - For each month touched by the interval:
       - `daysInMonth = days of the interval that fall within this month`
       - `monthConsumption = delta * (daysInMonth / totalDays)`

2. Aggregate all partial-month consumptions for the same month.

**Multiple readings per month** (PRD §5.1.2, Session 2 §3.8):

If multiple readings exist within a single month, consumption is the delta between each consecutive pair. Monthly consumption is the sum of all deltas whose reading pairs fall within (or are interpolated into) that month.

**Functions:**

- `calculateMonthlyConsumption(readings: MeterReading[]): MonthlyConsumption[]`:
  - Input: all readings for a utility, sorted by timestamp ascending
  - Output: array of `{ month, year, consumption, isInterpolated }` for each month that has data
  - `isInterpolated` is true if any reading pair in that month required interpolation

- `interpolateConsumption(readingA: MeterReading, readingB: MeterReading): { month: string; year: number; consumption: number }[]`:
  - Distributes consumption between two readings across the months they span
  - Returns one entry per month touched

- `getConsumptionForPeriod(monthlyData: MonthlyConsumption[], startDate: Date, endDate: Date): number`:
  - Sums consumption for the specified date range

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Same-month readings: consumption is the delta, no interpolation needed
- [ ] Cross-month readings: consumption correctly split proportionally by days
- [ ] Multiple readings per month: all deltas within the month aggregated correctly
- [ ] Example: reading of 1000 on Jan 15, reading of 1100 on Feb 15 → ~48 kWh to January (16 days), ~52 kWh to February (15 days)
- [ ] Example: readings of 1000 on Jan 5, 1050 on Jan 20, 1100 on Feb 5 → January gets 50 + interpolated portion, February gets remainder
- [ ] Empty readings array returns empty consumption array
- [ ] Single reading returns empty consumption (need at least 2 for a delta)
- [ ] Negative deltas handled gracefully (meter reset scenario — flagged but not rejected)
- [ ] `isInterpolated` flag correctly set when month-boundary interpolation is used
- [ ] `getConsumptionForPeriod` correctly sums monthly consumption within the date range
- [ ] PRD §14 criterion 4: Monthly consumption correctly derived including multiple readings per month

## Technical Notes
- File to create: `src/utils/consumption.ts`
- Pure functions with no external dependencies — easy to unit test
- Date math: use Date objects internally, parsing ISO strings from MeterReading.timestamp
- Month granularity: consumption is bucketed by calendar month (e.g. "2026-01" for January 2026)
- The interpolation is linear (PRD §5.1.2) — proportional to calendar days
- Edge case: very first reading has no predecessor, so it cannot produce consumption — skip it
- Edge case: if `delta < 0` (meter was replaced/reset), the consumption module should flag this but not throw. The note field on the reading should explain the reset.
- Performance: this runs once per utility when loading data, not on every render
