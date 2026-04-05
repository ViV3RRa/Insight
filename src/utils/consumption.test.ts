import { describe, it, expect } from 'vitest'
import { buildMeterReading } from '@/test/factories/homeFactory'
import type { MeterReading, MonthlyConsumption } from '@/types/home'
import {
  interpolateConsumption,
  calculateMonthlyConsumption,
  getConsumptionForPeriod,
} from './consumption'

const UTILITY_ID = 'util_001' as MeterReading['utilityId']

function reading(timestamp: string, value: number): MeterReading {
  return buildMeterReading({ utilityId: UTILITY_ID, timestamp, value })
}

describe('interpolateConsumption', () => {
  it('assigns entire delta to one month when both readings are in the same month', () => {
    const a = reading('2026-01-05T10:00:00.000Z', 1000)
    const b = reading('2026-01-20T10:00:00.000Z', 1100)

    const result = interpolateConsumption(a, b)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      month: '2026-01',
      year: 2026,
      consumption: 100,
    })
  })

  it('distributes consumption proportionally across two months', () => {
    // Jan 15 → Feb 15 = 31 days total
    // Jan portion: Jan 15 → Jan 31 = 16 days
    // Feb portion: Feb 1 → Feb 15 = 15 days
    const a = reading('2026-01-15T00:00:00.000Z', 1000)
    const b = reading('2026-02-15T00:00:00.000Z', 1100)

    const result = interpolateConsumption(a, b)

    expect(result).toHaveLength(2)
    // 100 * 16/31 ≈ 51.61
    expect(result[0]!.month).toBe('2026-01')
    expect(result[0]!.consumption).toBeCloseTo(51.61, 1)
    // 100 * 15/31 ≈ 48.39
    expect(result[1]!.month).toBe('2026-02')
    expect(result[1]!.consumption).toBeCloseTo(48.39, 1)
  })

  it('distributes consumption across multiple months for long intervals', () => {
    // Jan 15 → Apr 15 spans Jan, Feb, Mar, Apr
    const a = reading('2026-01-15T00:00:00.000Z', 1000)
    const b = reading('2026-04-15T00:00:00.000Z', 1300)

    const result = interpolateConsumption(a, b)

    expect(result).toHaveLength(4)
    expect(result.map((e) => e.month)).toEqual([
      '2026-01',
      '2026-02',
      '2026-03',
      '2026-04',
    ])

    // Sum of all portions should equal total delta
    const totalConsumption = result.reduce((sum, e) => sum + e.consumption, 0)
    expect(totalConsumption).toBeCloseTo(300, 5)
  })

  it('returns empty array for negative delta (meter reset)', () => {
    const a = reading('2026-01-15T00:00:00.000Z', 1100)
    const b = reading('2026-02-15T00:00:00.000Z', 500)

    expect(interpolateConsumption(a, b)).toEqual([])
  })

  it('returns empty array for zero delta', () => {
    const a = reading('2026-01-15T00:00:00.000Z', 1000)
    const b = reading('2026-02-15T00:00:00.000Z', 1000)

    expect(interpolateConsumption(a, b)).toEqual([])
  })

  it('handles readings on exact month boundaries', () => {
    // Feb 1 → Mar 1 spans Feb and Mar
    const a = reading('2026-02-01T00:00:00.000Z', 500)
    const b = reading('2026-03-01T00:00:00.000Z', 600)

    const result = interpolateConsumption(a, b)

    expect(result).toHaveLength(2)
    // 28 days total (Feb 2026 has 28 days)
    // Feb: Feb 1 → Feb 28 = 27 days
    // Mar: Mar 1 = 1 day
    expect(result[0]!.month).toBe('2026-02')
    expect(result[1]!.month).toBe('2026-03')

    const total = result.reduce((sum, e) => sum + e.consumption, 0)
    expect(total).toBeCloseTo(100, 5)
  })

  it('handles readings spanning a year boundary', () => {
    const a = reading('2025-12-15T00:00:00.000Z', 2000)
    const b = reading('2026-01-15T00:00:00.000Z', 2200)

    const result = interpolateConsumption(a, b)

    expect(result).toHaveLength(2)
    expect(result[0]!.month).toBe('2025-12')
    expect(result[0]!.year).toBe(2025)
    expect(result[1]!.month).toBe('2026-01')
    expect(result[1]!.year).toBe(2026)

    const total = result.reduce((sum, e) => sum + e.consumption, 0)
    expect(total).toBeCloseTo(200, 5)
  })

  it('handles same-day readings with different values', () => {
    const a = reading('2026-03-10T08:00:00.000Z', 100)
    const b = reading('2026-03-10T16:00:00.000Z', 150)

    // differenceInCalendarDays = 0 → should return empty (no days to distribute)
    const result = interpolateConsumption(a, b)
    expect(result).toEqual([])
  })
})

describe('calculateMonthlyConsumption', () => {
  it('returns empty array for empty readings', () => {
    expect(calculateMonthlyConsumption([])).toEqual([])
  })

  it('returns empty array for single reading', () => {
    const readings = [reading('2026-01-15T10:00:00.000Z', 1000)]
    expect(calculateMonthlyConsumption(readings)).toEqual([])
  })

  it('calculates same-month consumption with isInterpolated = false', () => {
    const readings = [
      reading('2026-01-05T10:00:00.000Z', 1000),
      reading('2026-01-20T10:00:00.000Z', 1100),
    ]

    const result = calculateMonthlyConsumption(readings)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      month: '2026-01',
      year: 2026,
      consumption: 100,
      isInterpolated: false,
    })
  })

  it('calculates cross-month consumption with isInterpolated = true', () => {
    const readings = [
      reading('2026-01-15T00:00:00.000Z', 1000),
      reading('2026-02-15T00:00:00.000Z', 1100),
    ]

    const result = calculateMonthlyConsumption(readings)

    expect(result).toHaveLength(2)
    expect(result[0]!.month).toBe('2026-01')
    expect(result[0]!.isInterpolated).toBe(true)
    expect(result[0]!.consumption).toBeCloseTo(51.61, 1)
    expect(result[1]!.month).toBe('2026-02')
    expect(result[1]!.isInterpolated).toBe(true)
    expect(result[1]!.consumption).toBeCloseTo(48.39, 1)
  })

  it('sums multiple readings per month', () => {
    // Jan 5 → Jan 20 (same month): 50
    // Jan 20 → Feb 5 (cross month): 50 total, distributed across Jan and Feb
    const readings = [
      reading('2026-01-05T00:00:00.000Z', 1000),
      reading('2026-01-20T00:00:00.000Z', 1050),
      reading('2026-02-05T00:00:00.000Z', 1100),
    ]

    const result = calculateMonthlyConsumption(readings)

    // Jan gets: 50 (same-month) + portion of 50 (Jan 20 → Feb 5 = 16 days total, Jan portion = 11 days)
    // Feb gets: portion of 50 (Feb portion = 5 days)
    expect(result.find((r) => r.month === '2026-01')).toBeDefined()
    expect(result.find((r) => r.month === '2026-02')).toBeDefined()

    // January: 50 + 50 * (11/16) = 50 + 34.375 = 84.375
    expect(result.find((r) => r.month === '2026-01')!.consumption).toBeCloseTo(
      84.375,
      1,
    )
    // February: 50 * (5/16) = 15.625
    expect(result.find((r) => r.month === '2026-02')!.consumption).toBeCloseTo(
      15.625,
      1,
    )
  })

  it('marks month as interpolated when any contributing interval is cross-month', () => {
    // Same-month pair + cross-month pair both contribute to January
    const readings = [
      reading('2026-01-05T00:00:00.000Z', 1000),
      reading('2026-01-20T00:00:00.000Z', 1050),
      reading('2026-02-05T00:00:00.000Z', 1100),
    ]

    const result = calculateMonthlyConsumption(readings)
    const jan = result.find((r) => r.month === '2026-01')!

    // Jan has both a same-month interval and a cross-month interval contributing
    // Since a cross-month interval contributes, isInterpolated should be true
    expect(jan.isInterpolated).toBe(true)
  })

  it('skips negative deltas (meter reset)', () => {
    const readings = [
      reading('2026-01-05T00:00:00.000Z', 1000),
      reading('2026-01-15T00:00:00.000Z', 500), // meter reset
      reading('2026-01-25T00:00:00.000Z', 600),
    ]

    const result = calculateMonthlyConsumption(readings)

    // First pair (1000 → 500) is skipped (negative)
    // Second pair (500 → 600) = 100
    expect(result).toHaveLength(1)
    expect(result[0]!.consumption).toBe(100)
    expect(result[0]!.isInterpolated).toBe(false)
  })

  it('handles zero delta gracefully', () => {
    const readings = [
      reading('2026-01-05T00:00:00.000Z', 1000),
      reading('2026-01-15T00:00:00.000Z', 1000), // no change
      reading('2026-01-25T00:00:00.000Z', 1050),
    ]

    const result = calculateMonthlyConsumption(readings)

    // First pair: delta=0 → skipped by interpolateConsumption (0 is not > 0)
    // Second pair: delta=50
    expect(result).toHaveLength(1)
    expect(result[0]!.consumption).toBe(50)
  })

  it('returns results sorted by month', () => {
    const readings = [
      reading('2025-11-15T00:00:00.000Z', 500),
      reading('2025-12-15T00:00:00.000Z', 600),
      reading('2026-01-15T00:00:00.000Z', 750),
      reading('2026-02-15T00:00:00.000Z', 900),
    ]

    const result = calculateMonthlyConsumption(readings)
    const months = result.map((r) => r.month)

    expect(months).toEqual([...months].sort())
  })

  it('handles very long intervals spanning many months', () => {
    const readings = [
      reading('2026-01-01T00:00:00.000Z', 0),
      reading('2026-06-30T00:00:00.000Z', 600),
    ]

    const result = calculateMonthlyConsumption(readings)

    // Should span Jan through Jun
    expect(result.length).toBeGreaterThanOrEqual(5)

    const totalConsumption = result.reduce((sum, e) => sum + e.consumption, 0)
    expect(totalConsumption).toBeCloseTo(600, 5)

    // All should be interpolated since it crosses months
    result.forEach((entry) => {
      expect(entry.isInterpolated).toBe(true)
    })
  })

  it('correctly sets year field in MonthlyConsumption', () => {
    const readings = [
      reading('2025-12-15T00:00:00.000Z', 1000),
      reading('2026-01-15T00:00:00.000Z', 1100),
    ]

    const result = calculateMonthlyConsumption(readings)

    expect(result.find((r) => r.month === '2025-12')!.year).toBe(2025)
    expect(result.find((r) => r.month === '2026-01')!.year).toBe(2026)
  })
})

describe('getConsumptionForPeriod', () => {
  const monthlyData: MonthlyConsumption[] = [
    { month: '2026-01', year: 2026, consumption: 100, isInterpolated: false },
    { month: '2026-02', year: 2026, consumption: 120, isInterpolated: true },
    { month: '2026-03', year: 2026, consumption: 90, isInterpolated: false },
    { month: '2026-04', year: 2026, consumption: 80, isInterpolated: true },
    { month: '2026-05', year: 2026, consumption: 110, isInterpolated: false },
  ]

  it('sums consumption for months within the date range', () => {
    const start = new Date(2026, 0, 1) // Jan 1
    const end = new Date(2026, 2, 31) // Mar 31

    const result = getConsumptionForPeriod(monthlyData, start, end)
    expect(result).toBe(310) // 100 + 120 + 90
  })

  it('includes partial-month boundaries', () => {
    // Start in middle of Jan, end in middle of Mar — should still include Jan and Mar
    const start = new Date(2026, 0, 15) // Jan 15
    const end = new Date(2026, 2, 10) // Mar 10

    const result = getConsumptionForPeriod(monthlyData, start, end)
    expect(result).toBe(310) // Jan + Feb + Mar
  })

  it('returns 0 for a period with no data', () => {
    const start = new Date(2025, 0, 1)
    const end = new Date(2025, 11, 31)

    expect(getConsumptionForPeriod(monthlyData, start, end)).toBe(0)
  })

  it('returns 0 for empty monthly data', () => {
    const start = new Date(2026, 0, 1)
    const end = new Date(2026, 11, 31)

    expect(getConsumptionForPeriod([], start, end)).toBe(0)
  })

  it('handles single month period', () => {
    const start = new Date(2026, 1, 1) // Feb 1
    const end = new Date(2026, 1, 28) // Feb 28

    expect(getConsumptionForPeriod(monthlyData, start, end)).toBe(120)
  })

  it('handles full year period', () => {
    const start = new Date(2026, 0, 1) // Jan 1
    const end = new Date(2026, 11, 31) // Dec 31

    const result = getConsumptionForPeriod(monthlyData, start, end)
    expect(result).toBe(500) // 100 + 120 + 90 + 80 + 110
  })
})
