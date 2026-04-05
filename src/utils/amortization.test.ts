import { describe, it, expect } from 'vitest'
import { amortizeBill, amortizeAllBills, getMonthlyCost, getCostForPeriod } from './amortization'
import { buildUtilityBill } from '@/test/factories/homeFactory'

describe('amortizeBill', () => {
  it('distributes a single-month bill entirely to that month', () => {
    const bill = buildUtilityBill({
      amount: 500,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    })

    const result = amortizeBill(bill)

    expect(result).toEqual([{ month: '2026-01', year: 2026, cost: 500 }])
  })

  it('distributes 12,000 over Jan–Dec into 1,000/month × 12', () => {
    const bill = buildUtilityBill({
      amount: 12000,
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    })

    const result = amortizeBill(bill)

    expect(result).toHaveLength(12)
    for (const entry of result) {
      expect(entry.cost).toBe(1000)
      expect(entry.year).toBe(2026)
    }
    expect(result[0]!.month).toBe('2026-01')
    expect(result[11]!.month).toBe('2026-12')
  })

  it('distributes 3,000 over Jan–Mar into 1,000/month × 3', () => {
    const bill = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })

    const result = amortizeBill(bill)

    expect(result).toHaveLength(3)
    expect(result).toEqual([
      { month: '2026-01', year: 2026, cost: 1000 },
      { month: '2026-02', year: 2026, cost: 1000 },
      { month: '2026-03', year: 2026, cost: 1000 },
    ])
  })

  it('assigns entire amount when periodStart === periodEnd (single day)', () => {
    const bill = buildUtilityBill({
      amount: 250,
      periodStart: '2026-06-15',
      periodEnd: '2026-06-15',
    })

    const result = amortizeBill(bill)

    expect(result).toEqual([{ month: '2026-06', year: 2026, cost: 250 }])
  })

  it('counts distinct calendar months when dates span partial months (Jan 15 – Feb 14 = 2 months)', () => {
    const bill = buildUtilityBill({
      amount: 2000,
      periodStart: '2026-01-15',
      periodEnd: '2026-02-14',
    })

    const result = amortizeBill(bill)

    expect(result).toHaveLength(2)
    expect(result).toEqual([
      { month: '2026-01', year: 2026, cost: 1000 },
      { month: '2026-02', year: 2026, cost: 1000 },
    ])
  })

  it('handles cross-year bill: Nov 2025 – Feb 2026 = 4 months at 1,000 each', () => {
    const bill = buildUtilityBill({
      amount: 4000,
      periodStart: '2025-11-01',
      periodEnd: '2026-02-28',
    })

    const result = amortizeBill(bill)

    expect(result).toHaveLength(4)
    expect(result).toEqual([
      { month: '2025-11', year: 2025, cost: 1000 },
      { month: '2025-12', year: 2025, cost: 1000 },
      { month: '2026-01', year: 2026, cost: 1000 },
      { month: '2026-02', year: 2026, cost: 1000 },
    ])
  })

  it('distributes zero-amount bill without errors', () => {
    const bill = buildUtilityBill({
      amount: 0,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })

    const result = amortizeBill(bill)

    expect(result).toHaveLength(3)
    for (const entry of result) {
      expect(entry.cost).toBe(0)
    }
  })

  it('uses equal distribution, not pro-rata by days', () => {
    // Feb has 28 days, Mar has 31 — both get equal share
    const bill = buildUtilityBill({
      amount: 2000,
      periodStart: '2026-02-01',
      periodEnd: '2026-03-31',
    })

    const result = amortizeBill(bill)

    expect(result[0]!.cost).toBe(1000)
    expect(result[1]!.cost).toBe(1000)
  })

  it('returns correct month keys in YYYY-MM format', () => {
    const bill = buildUtilityBill({
      amount: 100,
      periodStart: '2026-05-10',
      periodEnd: '2026-07-20',
    })

    const result = amortizeBill(bill)

    expect(result.map((e) => e.month)).toEqual(['2026-05', '2026-06', '2026-07'])
  })
})

describe('amortizeAllBills', () => {
  it('returns empty array for empty input', () => {
    expect(amortizeAllBills([])).toEqual([])
  })

  it('aggregates overlapping bills — amounts sum per month', () => {
    const bill1 = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })
    const bill2 = buildUtilityBill({
      amount: 600,
      periodStart: '2026-02-01',
      periodEnd: '2026-03-31',
    })

    const result = amortizeAllBills([bill1, bill2])

    expect(result).toHaveLength(3)
    // Jan: 1000 (bill1 only)
    expect(result[0]).toEqual({ month: '2026-01', year: 2026, cost: 1000 })
    // Feb: 1000 (bill1) + 300 (bill2) = 1300
    expect(result[1]).toEqual({ month: '2026-02', year: 2026, cost: 1300 })
    // Mar: 1000 (bill1) + 300 (bill2) = 1300
    expect(result[2]).toEqual({ month: '2026-03', year: 2026, cost: 1300 })
  })

  it('returns results sorted chronologically', () => {
    const bill1 = buildUtilityBill({
      amount: 100,
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
    })
    const bill2 = buildUtilityBill({
      amount: 200,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    })

    const result = amortizeAllBills([bill1, bill2])

    expect(result[0]!.month).toBe('2026-01')
    expect(result[1]!.month).toBe('2026-06')
  })

  it('handles non-overlapping bills correctly', () => {
    const bill1 = buildUtilityBill({
      amount: 1000,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    })
    const bill2 = buildUtilityBill({
      amount: 2000,
      periodStart: '2026-03-01',
      periodEnd: '2026-03-31',
    })

    const result = amortizeAllBills([bill1, bill2])

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ month: '2026-01', year: 2026, cost: 1000 })
    expect(result[1]).toEqual({ month: '2026-03', year: 2026, cost: 2000 })
  })

  it('handles single bill same as amortizeBill', () => {
    const bill = buildUtilityBill({
      amount: 600,
      periodStart: '2026-04-01',
      periodEnd: '2026-06-30',
    })

    const result = amortizeAllBills([bill])

    expect(result).toEqual([
      { month: '2026-04', year: 2026, cost: 200 },
      { month: '2026-05', year: 2026, cost: 200 },
      { month: '2026-06', year: 2026, cost: 200 },
    ])
  })
})

describe('getMonthlyCost', () => {
  it('returns correct amortized cost for a specific month', () => {
    const bill = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })

    expect(getMonthlyCost([bill], '2026-02', 2026)).toBe(1000)
  })

  it('returns 0 for a month with no bills', () => {
    const bill = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })

    expect(getMonthlyCost([bill], '2026-06', 2026)).toBe(0)
  })

  it('sums overlapping bills for same month', () => {
    const bill1 = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })
    const bill2 = buildUtilityBill({
      amount: 600,
      periodStart: '2026-02-01',
      periodEnd: '2026-03-31',
    })

    // Feb: 1000 (bill1) + 300 (bill2) = 1300
    expect(getMonthlyCost([bill1, bill2], '2026-02', 2026)).toBe(1300)
  })

  it('returns 0 for empty bills array', () => {
    expect(getMonthlyCost([], '2026-01', 2026)).toBe(0)
  })
})

describe('getCostForPeriod', () => {
  it('sums costs for all months within the date range', () => {
    const bill = buildUtilityBill({
      amount: 12000,
      periodStart: '2026-01-01',
      periodEnd: '2026-12-31',
    })

    // Q1: Jan + Feb + Mar = 3 × 1000 = 3000
    const result = getCostForPeriod([bill], new Date(2026, 0, 1), new Date(2026, 2, 31))

    expect(result).toBe(3000)
  })

  it('includes months at the boundaries of the range', () => {
    const bill = buildUtilityBill({
      amount: 6000,
      periodStart: '2026-01-01',
      periodEnd: '2026-06-30',
    })

    // Exactly Jan–Jun
    const result = getCostForPeriod([bill], new Date(2026, 0, 1), new Date(2026, 5, 30))

    expect(result).toBe(6000)
  })

  it('returns 0 when no bills fall in the range', () => {
    const bill = buildUtilityBill({
      amount: 1000,
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    })

    const result = getCostForPeriod([bill], new Date(2026, 5, 1), new Date(2026, 11, 31))

    expect(result).toBe(0)
  })

  it('returns 0 for empty bills array', () => {
    const result = getCostForPeriod([], new Date(2026, 0, 1), new Date(2026, 11, 31))

    expect(result).toBe(0)
  })

  it('handles cross-year periods correctly', () => {
    const bill = buildUtilityBill({
      amount: 4000,
      periodStart: '2025-11-01',
      periodEnd: '2026-02-28',
    })

    // Get costs for Dec 2025 – Jan 2026 (2 months × 1000)
    const result = getCostForPeriod([bill], new Date(2025, 11, 1), new Date(2026, 0, 31))

    expect(result).toBe(2000)
  })

  it('sums multiple overlapping bills within the period', () => {
    const bill1 = buildUtilityBill({
      amount: 3000,
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    })
    const bill2 = buildUtilityBill({
      amount: 600,
      periodStart: '2026-02-01',
      periodEnd: '2026-03-31',
    })

    // Feb–Mar: bill1 contributes 2000, bill2 contributes 600 → total 2600
    const result = getCostForPeriod([bill1, bill2], new Date(2026, 1, 1), new Date(2026, 2, 31))

    expect(result).toBe(2600)
  })
})
