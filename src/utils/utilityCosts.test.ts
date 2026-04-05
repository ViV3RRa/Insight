import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildMeterReading, buildUtilityBill } from '@/test/factories/homeFactory'
import type { MeterReading, MonthlyConsumption, MonthlyCost } from '@/types/home'
import {
  calculateMonthlyCostPerUnit,
  calculateAverageCostPerUnit,
  calculateUtilityMetrics,
} from './utilityCosts'

const UTILITY_ID = 'util_001' as MeterReading['utilityId']

function reading(timestamp: string, value: number): MeterReading {
  return buildMeterReading({ utilityId: UTILITY_ID, timestamp, value })
}

describe('calculateMonthlyCostPerUnit', () => {
  it('correctly divides cost by consumption', () => {
    const consumption: MonthlyConsumption[] = [
      { month: '2026-01', year: 2026, consumption: 200, isInterpolated: false },
      { month: '2026-02', year: 2026, consumption: 150, isInterpolated: false },
    ]
    const costs: MonthlyCost[] = [
      { month: '2026-01', year: 2026, cost: 400 },
      { month: '2026-02', year: 2026, cost: 450 },
    ]

    const result = calculateMonthlyCostPerUnit(consumption, costs)

    expect(result).toEqual([
      { month: '2026-01', year: 2026, costPerUnit: 2 },
      { month: '2026-02', year: 2026, costPerUnit: 3 },
    ])
  })

  it('returns null when consumption is zero', () => {
    const consumption: MonthlyConsumption[] = [
      { month: '2026-01', year: 2026, consumption: 0, isInterpolated: false },
    ]
    const costs: MonthlyCost[] = [{ month: '2026-01', year: 2026, cost: 400 }]

    const result = calculateMonthlyCostPerUnit(consumption, costs)

    expect(result[0]!.costPerUnit).toBeNull()
  })

  it('returns null when cost data is missing for a month', () => {
    const consumption: MonthlyConsumption[] = [
      { month: '2026-01', year: 2026, consumption: 200, isInterpolated: false },
    ]
    const costs: MonthlyCost[] = []

    const result = calculateMonthlyCostPerUnit(consumption, costs)

    expect(result).toEqual([{ month: '2026-01', year: 2026, costPerUnit: null }])
  })

  it('returns null when consumption data is missing for a month', () => {
    const consumption: MonthlyConsumption[] = []
    const costs: MonthlyCost[] = [{ month: '2026-01', year: 2026, cost: 400 }]

    const result = calculateMonthlyCostPerUnit(consumption, costs)

    expect(result).toEqual([{ month: '2026-01', year: 2026, costPerUnit: null }])
  })

  it('handles months with data on only one side', () => {
    const consumption: MonthlyConsumption[] = [
      { month: '2026-01', year: 2026, consumption: 100, isInterpolated: false },
      { month: '2026-03', year: 2026, consumption: 200, isInterpolated: false },
    ]
    const costs: MonthlyCost[] = [
      { month: '2026-01', year: 2026, cost: 300 },
      { month: '2026-02', year: 2026, cost: 150 },
    ]

    const result = calculateMonthlyCostPerUnit(consumption, costs)

    expect(result).toEqual([
      { month: '2026-01', year: 2026, costPerUnit: 3 },
      { month: '2026-02', year: 2026, costPerUnit: null },
      { month: '2026-03', year: 2026, costPerUnit: null },
    ])
  })
})

describe('calculateAverageCostPerUnit', () => {
  const consumption: MonthlyConsumption[] = [
    { month: '2026-01', year: 2026, consumption: 200, isInterpolated: false },
    { month: '2026-02', year: 2026, consumption: 100, isInterpolated: false },
    { month: '2026-03', year: 2026, consumption: 300, isInterpolated: false },
  ]
  const costs: MonthlyCost[] = [
    { month: '2026-01', year: 2026, cost: 400 },
    { month: '2026-02', year: 2026, cost: 300 },
    { month: '2026-03', year: 2026, cost: 600 },
  ]

  it('calculates weighted average: totalCost / totalConsumption', () => {
    // total cost = 1300, total consumption = 600 → 1300/600 ≈ 2.1667
    const result = calculateAverageCostPerUnit(consumption, costs)

    expect(result).toBeCloseTo(1300 / 600)
  })

  it('filters by date range when provided', () => {
    // Only Jan + Feb: cost=700, consumption=300 → 700/300 ≈ 2.333
    const result = calculateAverageCostPerUnit(
      consumption,
      costs,
      new Date('2026-01-01'),
      new Date('2026-02-28'),
    )

    expect(result).toBeCloseTo(700 / 300)
  })

  it('returns null when total consumption is zero', () => {
    const zeroConsumption: MonthlyConsumption[] = [
      { month: '2026-01', year: 2026, consumption: 0, isInterpolated: false },
    ]
    const someCosts: MonthlyCost[] = [{ month: '2026-01', year: 2026, cost: 400 }]

    const result = calculateAverageCostPerUnit(zeroConsumption, someCosts)

    expect(result).toBeNull()
  })

  it('returns null when no consumption data at all', () => {
    const result = calculateAverageCostPerUnit([], costs)
    expect(result).toBeNull()
  })
})

describe('calculateUtilityMetrics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('produces all fields from readings and bills', () => {
    const readings = [
      reading('2026-01-01T00:00:00.000Z', 1000),
      reading('2026-01-31T00:00:00.000Z', 1200),
      reading('2026-02-28T00:00:00.000Z', 1500),
      reading('2026-03-15T00:00:00.000Z', 1700),
    ]
    const bills = [
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 600,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }),
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 900,
        periodStart: '2026-02-01',
        periodEnd: '2026-02-28',
      }),
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 500,
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
      }),
    ]

    const result = calculateUtilityMetrics(readings, bills)

    expect(result.monthlyConsumption.length).toBeGreaterThanOrEqual(2)
    expect(result.monthlyCost).toHaveLength(3)
    expect(result.monthlyCostPerUnit.length).toBeGreaterThanOrEqual(2)
    expect(result.ytdConsumption).toBeGreaterThan(0)
    expect(result.ytdCost).toBe(2000)
    expect(result.currentMonthCost).toBe(500)
    expect(result.currentMonthConsumption).toBeGreaterThan(0)
    expect(result.avgMonthlyCost).toBeCloseTo(2000 / 3)
  })

  it('returns zeros/nulls for empty readings and empty bills', () => {
    const result = calculateUtilityMetrics([], [])

    expect(result.monthlyConsumption).toEqual([])
    expect(result.monthlyCost).toEqual([])
    expect(result.monthlyCostPerUnit).toEqual([])
    expect(result.ytdConsumption).toBe(0)
    expect(result.ytdCost).toBe(0)
    expect(result.currentMonthConsumption).toBeNull()
    expect(result.currentMonthCost).toBeNull()
    expect(result.currentMonthCostPerUnit).toBeNull()
    expect(result.avgMonthlyCost).toBeNull()
    expect(result.costTrend).toBeNull()
  })

  it('computes YTD consumption by summing Jan to current month', () => {
    const readings = [
      reading('2026-01-01T00:00:00.000Z', 0),
      reading('2026-01-31T00:00:00.000Z', 100),
      reading('2026-02-28T00:00:00.000Z', 250),
      reading('2026-03-15T00:00:00.000Z', 400),
    ]

    const result = calculateUtilityMetrics(readings, [])

    // Total consumption across all months in 2026 (Jan-Mar)
    expect(result.ytdConsumption).toBeCloseTo(400, 0)
  })

  it('computes YTD cost by summing Jan to current month', () => {
    const bills = [
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 100,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }),
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 200,
        periodStart: '2026-02-01',
        periodEnd: '2026-02-28',
      }),
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 150,
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
      }),
    ]

    const result = calculateUtilityMetrics([], bills)

    expect(result.ytdCost).toBe(450)
  })

  it('pulls current month data correctly', () => {
    // Current month is 2026-03
    const readings = [
      reading('2026-03-01T00:00:00.000Z', 500),
      reading('2026-03-15T00:00:00.000Z', 600),
    ]
    const bills = [
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 300,
        periodStart: '2026-03-01',
        periodEnd: '2026-03-31',
      }),
    ]

    const result = calculateUtilityMetrics(readings, bills)

    expect(result.currentMonthConsumption).toBe(100)
    expect(result.currentMonthCost).toBe(300)
    expect(result.currentMonthCostPerUnit).toBe(3)
  })

  it('returns null for current month when no data', () => {
    // Bills only in January, no March data
    const bills = [
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 500,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }),
    ]

    const result = calculateUtilityMetrics([], bills)

    expect(result.currentMonthConsumption).toBeNull()
    expect(result.currentMonthCost).toBeNull()
    expect(result.currentMonthCostPerUnit).toBeNull()
  })

  it('computes avgMonthlyCost for current year', () => {
    const bills = [
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 300,
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }),
      buildUtilityBill({
        utilityId: UTILITY_ID,
        amount: 600,
        periodStart: '2026-02-01',
        periodEnd: '2026-02-28',
      }),
    ]

    const result = calculateUtilityMetrics([], bills)

    // avg = (300 + 600) / 2 = 450
    expect(result.avgMonthlyCost).toBe(450)
  })

  describe('costTrend', () => {
    it('returns "up" when recent avg is >5% higher than last year', () => {
      // Current: 2026-03. Last 3 months: 2026-01, 2026-02, 2026-03
      // Same months last year: 2025-01, 2025-02, 2025-03
      const bills = [
        // Last year: avg 100/month
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-03-01', periodEnd: '2025-03-31' }),
        // This year: avg 200/month (100% increase)
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-01-01', periodEnd: '2026-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-02-01', periodEnd: '2026-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-03-01', periodEnd: '2026-03-31' }),
      ]

      const result = calculateUtilityMetrics([], bills)

      expect(result.costTrend).toBe('up')
    })

    it('returns "down" when recent avg is >5% lower than last year', () => {
      const bills = [
        // Last year: avg 200/month
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2025-03-01', periodEnd: '2025-03-31' }),
        // This year: avg 100/month (50% decrease)
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2026-01-01', periodEnd: '2026-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2026-02-01', periodEnd: '2026-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2026-03-01', periodEnd: '2026-03-31' }),
      ]

      const result = calculateUtilityMetrics([], bills)

      expect(result.costTrend).toBe('down')
    })

    it('returns "flat" when difference is within 5%', () => {
      const bills = [
        // Last year: avg 100/month
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-03-01', periodEnd: '2025-03-31' }),
        // This year: avg 103/month (3% increase, within 5% threshold)
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 103, periodStart: '2026-01-01', periodEnd: '2026-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 103, periodStart: '2026-02-01', periodEnd: '2026-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 103, periodStart: '2026-03-01', periodEnd: '2026-03-31' }),
      ]

      const result = calculateUtilityMetrics([], bills)

      expect(result.costTrend).toBe('flat')
    })

    it('returns null when no prior year data exists', () => {
      const bills = [
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-01-01', periodEnd: '2026-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-02-01', periodEnd: '2026-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 200, periodStart: '2026-03-01', periodEnd: '2026-03-31' }),
      ]

      const result = calculateUtilityMetrics([], bills)

      expect(result.costTrend).toBeNull()
    })

    it('returns null when no recent data exists', () => {
      const bills = [
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
        buildUtilityBill({ utilityId: UTILITY_ID, amount: 100, periodStart: '2025-03-01', periodEnd: '2025-03-31' }),
      ]

      const result = calculateUtilityMetrics([], bills)

      expect(result.costTrend).toBeNull()
    })
  })
})
