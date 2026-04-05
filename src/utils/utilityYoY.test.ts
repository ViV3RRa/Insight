import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateChangePercent,
  calculateUtilityYoY,
  calculateHomeYoY,
  calculateYearlySummaries,
  calculateMonthlySummaries,
} from './utilityYoY'
import { buildMeterReading, buildUtilityBill } from '@/test/factories'
import type { UtilityMetrics } from '@/types/home'

function buildMetrics(overrides: Partial<UtilityMetrics> = {}): UtilityMetrics {
  return {
    monthlyConsumption: [],
    monthlyCost: [],
    monthlyCostPerUnit: [],
    ytdConsumption: 0,
    ytdCost: 0,
    currentMonthConsumption: null,
    currentMonthCost: null,
    currentMonthCostPerUnit: null,
    avgMonthlyCost: null,
    costTrend: null,
    ...overrides,
  }
}

describe('calculateChangePercent', () => {
  it('returns positive change percent', () => {
    expect(calculateChangePercent(120, 100)).toBe(20)
  })

  it('returns negative change percent', () => {
    expect(calculateChangePercent(80, 100)).toBe(-20)
  })

  it('returns null when previous is zero', () => {
    expect(calculateChangePercent(100, 0)).toBeNull()
  })

  it('handles negative previous value correctly using abs', () => {
    // ((50 - (-100)) / |-100|) * 100 = 150%
    expect(calculateChangePercent(50, -100)).toBe(150)
  })
})

describe('calculateUtilityYoY', () => {
  it('computes correct YTD, current month, and avg monthly comparison', () => {
    const current = buildMetrics({
      ytdCost: 3000,
      currentMonthCost: 800,
      avgMonthlyCost: 750,
    })
    const prior = buildMetrics({
      ytdCost: 2500,
      currentMonthCost: 600,
      avgMonthlyCost: 625,
    })

    const result = calculateUtilityYoY(current, prior)

    expect(result.ytdCost.current).toBe(3000)
    expect(result.ytdCost.previous).toBe(2500)
    expect(result.ytdCost.changePercent).toBe(20)

    expect(result.currentMonthCost.current).toBe(800)
    expect(result.currentMonthCost.previous).toBe(600)
    expect(result.currentMonthCost.changePercent).toBeCloseTo(33.33, 1)

    expect(result.avgMonthlyCost.current).toBe(750)
    expect(result.avgMonthlyCost.previous).toBe(625)
    expect(result.avgMonthlyCost.changePercent).toBe(20)
  })

  it('handles null current month and avg values', () => {
    const current = buildMetrics({ ytdCost: 1000 })
    const prior = buildMetrics({ ytdCost: 0 })

    const result = calculateUtilityYoY(current, prior)

    expect(result.currentMonthCost.current).toBe(0)
    expect(result.currentMonthCost.previous).toBe(0)
    expect(result.currentMonthCost.changePercent).toBeNull()
    expect(result.ytdCost.changePercent).toBeNull()
  })
})

describe('calculateHomeYoY', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-05T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('aggregates across multiple utilities correctly', () => {
    const currentMetrics = [
      buildMetrics({ ytdCost: 2000, currentMonthCost: 500, avgMonthlyCost: 500 }),
      buildMetrics({ ytdCost: 1000, currentMonthCost: 300, avgMonthlyCost: 250 }),
    ]
    const priorMetrics = [
      buildMetrics({ ytdCost: 1800, currentMonthCost: 450, avgMonthlyCost: 450 }),
      buildMetrics({ ytdCost: 900, currentMonthCost: 200, avgMonthlyCost: 225 }),
    ]

    const result = calculateHomeYoY(currentMetrics, priorMetrics)

    expect(result.ytdTotalCost.current).toBe(3000)
    expect(result.ytdTotalCost.previous).toBe(2700)
    expect(result.ytdTotalCost.changePercent).toBeCloseTo(11.11, 1)

    expect(result.currentMonthCost.current).toBe(800)
    expect(result.currentMonthCost.previous).toBe(650)
    expect(result.currentMonthCost.changePercent).toBeCloseTo(23.08, 1)

    expect(result.avgMonthlyCost.current).toBe(750)
    expect(result.avgMonthlyCost.previous).toBe(675)
    expect(result.avgMonthlyCost.changePercent).toBeCloseTo(11.11, 1)
  })

  it('generates correct periodLabel format', () => {
    const result = calculateHomeYoY(
      [buildMetrics({ ytdCost: 100 })],
      [buildMetrics({ ytdCost: 50 })],
    )

    expect(result.periodLabel).toBe('Jan 1 – Apr 5, 2025')
  })

  it('handles missing prior year data with null change percents', () => {
    const currentMetrics = [
      buildMetrics({ ytdCost: 1000, currentMonthCost: 300, avgMonthlyCost: 250 }),
    ]
    const priorMetrics = [
      buildMetrics({ ytdCost: 0, currentMonthCost: 0, avgMonthlyCost: 0 }),
    ]

    const result = calculateHomeYoY(currentMetrics, priorMetrics)

    expect(result.ytdTotalCost.changePercent).toBeNull()
    expect(result.currentMonthCost.changePercent).toBeNull()
    expect(result.avgMonthlyCost.changePercent).toBeNull()
  })

  it('handles empty metrics arrays', () => {
    const result = calculateHomeYoY([], [])

    expect(result.ytdTotalCost.current).toBe(0)
    expect(result.ytdTotalCost.previous).toBe(0)
    expect(result.ytdTotalCost.changePercent).toBeNull()
    expect(result.periodLabel).toBe('Jan 1 – Apr 5, 2025')
  })
})

describe('calculateYearlySummaries', () => {
  const utilityId = 'util_001' as ReturnType<typeof buildMeterReading>['utilityId']

  it('returns empty result for no data', () => {
    expect(calculateYearlySummaries([], [])).toEqual([])
  })

  it('single year — change percents are null', () => {
    const readings = [
      buildMeterReading({ utilityId, value: 0, timestamp: '2025-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-01-31T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-02-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 250, timestamp: '2025-02-28T00:00:00Z' }),
    ]
    const bills = [
      buildUtilityBill({ utilityId, amount: 300, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
      buildUtilityBill({ utilityId, amount: 300, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
    ]

    const result = calculateYearlySummaries(readings, bills)

    expect(result).toHaveLength(1)
    expect(result[0]!.year).toBe(2025)
    expect(result[0]!.totalConsumption).toBe(250)
    expect(result[0]!.totalCost).toBe(600)
    expect(result[0]!.consumptionChangePercent).toBeNull()
    expect(result[0]!.costChangePercent).toBeNull()
    expect(result[0]!.avgCostPerUnit).toBeCloseTo(2.4, 5)
  })

  it('two years — correct change percents', () => {
    const readings = [
      // 2024: same-month pairs to avoid cross-month interpolation
      buildMeterReading({ utilityId, value: 0, timestamp: '2024-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 200, timestamp: '2024-01-31T00:00:00Z' }),
      // 2025: value stays at 200 so (Jan31→Jan1) pair has 0 delta → skipped
      buildMeterReading({ utilityId, value: 200, timestamp: '2025-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 500, timestamp: '2025-01-31T00:00:00Z' }),
    ]
    const bills = [
      buildUtilityBill({ utilityId, amount: 1000, periodStart: '2024-01-01', periodEnd: '2024-01-31' }),
      buildUtilityBill({ utilityId, amount: 1500, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
    ]

    const result = calculateYearlySummaries(readings, bills)

    expect(result).toHaveLength(2)
    expect(result[0]!.year).toBe(2024)
    expect(result[0]!.totalConsumption).toBe(200)
    expect(result[0]!.consumptionChangePercent).toBeNull()
    expect(result[0]!.costChangePercent).toBeNull()

    expect(result[1]!.year).toBe(2025)
    // Consumption: 300 vs 200 → 50%
    expect(result[1]!.consumptionChangePercent).toBe(50)
    // Cost: 1500 vs 1000 → 50%
    expect(result[1]!.costChangePercent).toBe(50)
  })
})

describe('calculateMonthlySummaries', () => {
  const utilityId = 'util_001' as ReturnType<typeof buildMeterReading>['utilityId']

  it('returns correct per-month values for given year', () => {
    // Same-month reading pairs to avoid cross-month interpolation
    const readings = [
      buildMeterReading({ utilityId, value: 0, timestamp: '2025-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-01-31T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-02-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 250, timestamp: '2025-02-28T00:00:00Z' }),
    ]
    const bills = [
      buildUtilityBill({ utilityId, amount: 200, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
      buildUtilityBill({ utilityId, amount: 300, periodStart: '2025-02-01', periodEnd: '2025-02-28' }),
    ]

    const result = calculateMonthlySummaries(readings, bills, 2025)

    expect(result).toHaveLength(2)

    expect(result[0]!.month).toBe('2025-01')
    expect(result[0]!.consumption).toBe(100)
    expect(result[0]!.cost).toBe(200)
    expect(result[0]!.costPerUnit).toBe(2)

    expect(result[1]!.month).toBe('2025-02')
    expect(result[1]!.consumption).toBe(150)
    expect(result[1]!.cost).toBe(300)
    expect(result[1]!.costPerUnit).toBe(2)
  })

  it('computes consumption/cost change vs same month prior year', () => {
    const readings = [
      // 2024: same-month pair
      buildMeterReading({ utilityId, value: 0, timestamp: '2024-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2024-01-31T00:00:00Z' }),
      // 2025: same-month pair (value stays at 100 so cross-year pair has 0 delta)
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 220, timestamp: '2025-01-31T00:00:00Z' }),
    ]
    const bills = [
      buildUtilityBill({ utilityId, amount: 200, periodStart: '2024-01-01', periodEnd: '2024-01-31' }),
      buildUtilityBill({ utilityId, amount: 300, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
    ]

    const result = calculateMonthlySummaries(readings, bills, 2025)

    expect(result).toHaveLength(1)
    expect(result[0]!.month).toBe('2025-01')
    // Consumption: 120 vs 100 → 20%
    expect(result[0]!.consumptionChangePercent).toBe(20)
    // Cost: 300 vs 200 → 50%
    expect(result[0]!.costChangePercent).toBe(50)
  })

  it('returns null change percents when no prior year data', () => {
    const readings = [
      buildMeterReading({ utilityId, value: 0, timestamp: '2025-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2025-01-31T00:00:00Z' }),
    ]
    const bills = [
      buildUtilityBill({ utilityId, amount: 200, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
    ]

    const result = calculateMonthlySummaries(readings, bills, 2025)

    expect(result).toHaveLength(1)
    expect(result[0]!.consumptionChangePercent).toBeNull()
    expect(result[0]!.costChangePercent).toBeNull()
  })

  it('returns empty array when no data for requested year', () => {
    const readings = [
      buildMeterReading({ utilityId, value: 0, timestamp: '2024-01-01T00:00:00Z' }),
      buildMeterReading({ utilityId, value: 100, timestamp: '2024-02-01T00:00:00Z' }),
    ]
    const bills: ReturnType<typeof buildUtilityBill>[] = []

    const result = calculateMonthlySummaries(readings, bills, 2025)

    expect(result).toEqual([])
  })

  it('returns null costPerUnit when consumption is zero', () => {
    // No readings for 2025 means 0 consumption, but we do have a bill cost
    // Because we only get months with data, we need at least a cost entry
    const readings: ReturnType<typeof buildMeterReading>[] = []
    const bills = [
      buildUtilityBill({ utilityId, amount: 200, periodStart: '2025-01-01', periodEnd: '2025-01-31' }),
    ]

    const result = calculateMonthlySummaries(readings, bills, 2025)

    expect(result).toHaveLength(1)
    expect(result[0]!.consumption).toBe(0)
    expect(result[0]!.costPerUnit).toBeNull()
  })
})

describe('edge cases', () => {
  it('zero previous year values → null change percent', () => {
    expect(calculateChangePercent(500, 0)).toBeNull()
    expect(calculateChangePercent(0, 0)).toBeNull()
  })
})
