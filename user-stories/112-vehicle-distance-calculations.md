# US-112: Vehicle Distance Calculations

## Story
As the Insight platform user, I want yearly and YTD kilometers driven derived from odometer readings so that I can track my driving distance over time.

## Dependencies
- US-107: Vehicle TypeScript Types

## Requirements
- Add distance calculation functions to `src/utils/vehicleMetrics.ts`:

**Functions:**

- `calculateTotalKmDriven(refuelings: Refueling[]): number`:
  - Total distance: last odometer reading - first odometer reading
  - Returns 0 if fewer than 2 refuelings

- `calculateYearlyKm(refuelings: Refueling[]): { year: number; km: number }[]`:
  - Km driven per calendar year
  - For each year: find last refueling of the year and first refueling of the year (or last of prior year), compute delta
  - Uses interpolation if year boundaries don't align with refueling dates

- `calculateYtdKm(refuelings: Refueling[]): number`:
  - Km driven from Jan 1 of current year to most recent refueling
  - Needs at least one refueling in the current year and one reference point

- `calculateMonthlyKm(refuelings: Refueling[]): { month: string; year: number; km: number }[]`:
  - Monthly km breakdown for charting
  - Derived from odometer deltas distributed across months based on refueling dates

**PRD §7.2 references:**
- Total km driven each year
- Km driven this year so far (YTD)

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Total km: last odometer - first odometer across all refuelings
- [ ] Yearly km breakdown computed correctly
- [ ] YTD km from Jan 1 to most recent refueling
- [ ] Monthly km breakdown for charting
- [ ] Returns 0 or empty when insufficient data
- [ ] Handles non-chronological refueling entries (sorts internally)
- [ ] PRD §14 criterion 35: Yearly and YTD km derived from odometer readings
- [ ] All tests pass and meet coverage target
- [ ] Each AC input/output example is a dedicated test case

## Testing Requirements
- **Test file**: `src/utils/vehicleMetrics.test.ts` (co-located)
- **Approach**: Pure function unit tests — no mocking required
- **Coverage target**: 100% of exported functions
- All AC items with specific input -> output values become test cases
- Test total km: last odometer minus first odometer across all refuelings
- Test `< 2` refuelings returns 0
- Test yearly km breakdown computed correctly across year boundaries
- Test YTD km from Jan 1 to most recent refueling
- Test monthly km breakdown for charting
- Test non-chronological refueling entries are sorted internally before calculation
- Test empty refuelings array returns 0 or empty array as appropriate

## Technical Notes
- File: `src/utils/vehicleMetrics.ts`
- Odometer readings are cumulative totals (like meter readings for utilities)
- Distance = delta between consecutive odometer readings
- For year/month boundaries that don't coincide with refueling dates, use linear interpolation of odometer values
