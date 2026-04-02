# US-085: Bill Amortization Calculation

## Story
As the Insight platform user, I want multi-month bills automatically distributed across their covered months so that per-month cost views are accurate even when bills span multiple months.

## Dependencies
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create bill amortization functions in `src/utils/amortization.ts`:

**Core algorithm** (PRD §5.1.3):

When a bill covers multiple months, the platform distributes the cost **equally** across the covered months.

```
monthsInPeriod = number of calendar months from periodStart to periodEnd (inclusive)
amortizedMonthlyAmount = bill.amount / monthsInPeriod
```

**Example** (PRD §5.1.3): A yearly bill of 12,000 covering Jan–Dec is shown as 1,000/month.

**Functions:**

- `amortizeBill(bill: UtilityBill): MonthlyCost[]`:
  - Input: a single bill with periodStart and periodEnd
  - Output: array of `{ month, year, cost }` entries, one per covered month
  - Each entry has `cost = bill.amount / totalMonths`

- `amortizeAllBills(bills: UtilityBill[]): MonthlyCost[]`:
  - Input: all bills for a utility
  - Output: aggregated monthly costs — if multiple bills contribute to the same month, their amortized amounts are summed

- `getMonthlyCost(bills: UtilityBill[], month: string, year: number): number`:
  - Returns the total amortized cost for a specific month

- `getCostForPeriod(bills: UtilityBill[], startDate: Date, endDate: Date): number`:
  - Sums amortized costs for all months within the date range

**Month counting:**
- A bill from Jan 1 to Jan 31 = 1 month
- A bill from Jan 1 to Mar 31 = 3 months
- A bill from Jan 15 to Feb 14 = 2 months (spans January and February)
- Partial months are included as full months in the count (the distribution is equal across all touched months)

## Shared Components Used
N/A — backend/data layer story

## UI Specification
N/A — backend/data layer story

## Acceptance Criteria
- [ ] Single-month bill: full amount assigned to that month
- [ ] Multi-month bill: amount divided equally across all covered months
- [ ] Example: 12,000 bill covering Jan–Dec → 1,000/month for 12 months
- [ ] Example: 3,000 bill covering Jan 1–Mar 31 → 1,000/month for 3 months
- [ ] Multiple bills contributing to same month: amounts summed correctly
- [ ] Overlapping bill periods handled correctly (amounts aggregate)
- [ ] Bill with periodStart === periodEnd (single day): assigned to that one month
- [ ] `getMonthlyCost` returns correct amount for a specific month
- [ ] `getCostForPeriod` sums correctly across a date range
- [ ] Empty bills array returns empty cost array
- [ ] PRD §14 criterion 5: Multi-month bills are amortized correctly across covered months

## Technical Notes
- File to create: `src/utils/amortization.ts`
- Pure functions with no external dependencies — easy to unit test
- Month counting: iterate from periodStart month to periodEnd month inclusive
- Use `{ month: "YYYY-MM", year: number }` format to key monthly buckets
- The equal distribution is a simplification — PRD explicitly states equal distribution, not pro-rata by days
- This feeds into cost-per-unit calculations (US-086) and UI cost displays
