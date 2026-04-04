import { describe, it, expect } from 'vitest'
import { buildDataPoint } from '@/test/factories'
import type { DataPoint } from '@/types/investment'
import {
  interpolateMonthEndValue,
  getMonthEndDate,
  findMissingMonthEnds,
  computeInterpolatedPoint,
  generateInterpolatedPoints,
  onDataPointCreated,
  onDataPointDeleted,
  onDataPointUpdated,
} from './interpolation'

const PLATFORM_ID = 'plat_001' as DataPoint['platformId']

function dp(timestamp: string, value: number, overrides?: Partial<DataPoint>): DataPoint {
  return buildDataPoint({ platformId: PLATFORM_ID, timestamp, value, ...overrides })
}

/** Helper to create UTC dates matching ISO timestamp conventions. */
function utc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day)) // month is 1-indexed here for readability
}

describe('interpolateMonthEndValue', () => {
  it('linearly interpolates between two values', () => {
    const prev = utc(2025, 12, 15) // Dec 15
    const next = utc(2026, 1, 15) // Jan 15
    const target = utc(2025, 12, 31) // Dec 31

    const result = interpolateMonthEndValue(10000, prev, 10600, next, target)
    // 16 days out of 31 days total → ratio = 16/31 ≈ 0.5161
    // 10000 + 600 * (16/31) ≈ 10309.68
    expect(result).toBeCloseTo(10309.68, 1)
  })

  it('returns prevValue when target equals prevDate', () => {
    const date = utc(2026, 1, 1)
    const next = utc(2026, 2, 1)
    expect(interpolateMonthEndValue(100, date, 200, next, date)).toBe(100)
  })

  it('returns nextValue when target equals nextDate', () => {
    const prev = utc(2026, 1, 1)
    const date = utc(2026, 2, 1)
    expect(interpolateMonthEndValue(100, prev, 200, date, date)).toBe(200)
  })

  it('handles decreasing values', () => {
    const prev = utc(2026, 1, 1)
    const next = utc(2026, 2, 1)
    const mid = utc(2026, 1, 16) // roughly halfway
    const result = interpolateMonthEndValue(1000, prev, 500, next, mid)
    expect(result).toBeLessThan(1000)
    expect(result).toBeGreaterThan(500)
  })
})

describe('getMonthEndDate', () => {
  it('returns Jan 31 for month 1', () => {
    const date = getMonthEndDate(2026, 1)
    expect(date.getUTCFullYear()).toBe(2026)
    expect(date.getUTCMonth()).toBe(0) // January
    expect(date.getUTCDate()).toBe(31)
  })

  it('returns Feb 29 for leap year', () => {
    const date = getMonthEndDate(2024, 2)
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(1) // February
    expect(date.getUTCDate()).toBe(29)
  })

  it('returns Feb 28 for non-leap year', () => {
    const date = getMonthEndDate(2025, 2)
    expect(date.getUTCFullYear()).toBe(2025)
    expect(date.getUTCMonth()).toBe(1) // February
    expect(date.getUTCDate()).toBe(28)
  })

  it('returns Dec 31 for month 12', () => {
    const date = getMonthEndDate(2026, 12)
    expect(date.getUTCFullYear()).toBe(2026)
    expect(date.getUTCMonth()).toBe(11) // December
    expect(date.getUTCDate()).toBe(31)
  })

  it('handles April with 30 days', () => {
    const date = getMonthEndDate(2026, 4)
    expect(date.getUTCDate()).toBe(30)
  })
})

describe('findMissingMonthEnds', () => {
  it('returns empty array for empty input', () => {
    expect(findMissingMonthEnds([])).toEqual([])
  })

  it('returns empty array for single data point', () => {
    expect(findMissingMonthEnds([dp('2026-01-15T00:00:00.000Z', 100)])).toEqual([])
  })

  it('identifies missing month-end between two data points', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    const missing = findMissingMonthEnds(points)
    // Jan 31 and Feb 28 fall between Jan 15 and Mar 15
    expect(missing).toHaveLength(2)
    expect(missing[0]!.getUTCDate()).toBe(31)
    expect(missing[0]!.getUTCMonth()).toBe(0) // Jan
    expect(missing[1]!.getUTCDate()).toBe(28)
    expect(missing[1]!.getUTCMonth()).toBe(1) // Feb
  })

  it('does not include month-ends that have a data point', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-01-31T00:00:00.000Z', 10200), // exactly on month-end
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    const missing = findMissingMonthEnds(points)
    // Jan 31 is covered, only Feb 28 should be missing
    expect(missing).toHaveLength(1)
    expect(missing[0]!.getUTCMonth()).toBe(1) // Feb
  })

  it('returns empty when consecutive points are within same month', () => {
    const points = [
      dp('2026-01-05T00:00:00.000Z', 100),
      dp('2026-01-20T00:00:00.000Z', 200),
    ]
    expect(findMissingMonthEnds(points)).toEqual([])
  })

  it('handles data spanning many months', () => {
    const points = [
      dp('2026-01-10T00:00:00.000Z', 100),
      dp('2026-06-20T00:00:00.000Z', 600),
    ]
    const missing = findMissingMonthEnds(points)
    // Jan 31, Feb 28, Mar 31, Apr 30, May 31 = 5 month-ends
    expect(missing).toHaveLength(5)
  })

  it('handles leap year February', () => {
    const points = [
      dp('2024-01-15T00:00:00.000Z', 100),
      dp('2024-03-15T00:00:00.000Z', 300),
    ]
    const missing = findMissingMonthEnds(points)
    expect(missing).toHaveLength(2) // Jan 31, Feb 29
    expect(missing[1]!.getUTCDate()).toBe(29) // leap year
  })
})

describe('computeInterpolatedPoint', () => {
  it('returns null for empty array', () => {
    expect(computeInterpolatedPoint([], utc(2026, 1, 31))).toBeNull()
  })

  it('returns null for single data point', () => {
    const points = [dp('2026-01-15T00:00:00.000Z', 100)]
    expect(computeInterpolatedPoint(points, utc(2026, 1, 31))).toBeNull()
  })

  it('returns null when target is before all data points', () => {
    const points = [
      dp('2026-02-15T00:00:00.000Z', 100),
      dp('2026-03-15T00:00:00.000Z', 200),
    ]
    expect(computeInterpolatedPoint(points, utc(2026, 1, 31))).toBeNull()
  })

  it('returns null when target is after all data points', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 100),
      dp('2026-02-15T00:00:00.000Z', 200),
    ]
    expect(computeInterpolatedPoint(points, utc(2026, 3, 31))).toBeNull()
  })

  it('returns interpolated point with correct properties', () => {
    const points = [
      dp('2025-12-15T00:00:00.000Z', 10000),
      dp('2026-01-15T00:00:00.000Z', 10600),
    ]
    const target = utc(2025, 12, 31) // Dec 31
    const result = computeInterpolatedPoint(points, target)

    expect(result).not.toBeNull()
    expect(result!.isInterpolated).toBe(true)
    expect(result!.platformId).toBe(PLATFORM_ID)
    expect(result!.value).toBeCloseTo(10309.68, 1)
    expect(result!.timestamp).toBe(target.toISOString())
  })

  it('uses nearest bracketing points', () => {
    const points = [
      dp('2026-01-10T00:00:00.000Z', 100),
      dp('2026-01-20T00:00:00.000Z', 200),
      dp('2026-02-10T00:00:00.000Z', 300),
    ]
    const target = utc(2026, 1, 31) // Jan 31
    const result = computeInterpolatedPoint(points, target)

    expect(result).not.toBeNull()
    // Should interpolate between Jan 20 (200) and Feb 10 (300)
    // 11 days out of 21 days → ratio = 11/21 ≈ 0.5238
    // 200 + 100 * (11/21) ≈ 252.38
    expect(result!.value).toBeCloseTo(252.38, 1)
  })
})

describe('generateInterpolatedPoints', () => {
  it('returns empty array for empty input', () => {
    expect(generateInterpolatedPoints([], 'plat_001')).toEqual([])
  })

  it('returns empty array for single data point', () => {
    const points = [dp('2026-01-15T00:00:00.000Z', 100)]
    expect(generateInterpolatedPoints(points, 'plat_001')).toEqual([])
  })

  it('generates interpolated points for all missing month-ends', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')

    // Jan 31 and Feb 28 need interpolation
    expect(results).toHaveLength(2)
    expect(results[0]!.isInterpolated).toBe(true)
    expect(results[1]!.isInterpolated).toBe(true)
    expect(results[0]!.platformId).toBe('plat_001')
    expect(results[1]!.platformId).toBe('plat_001')
  })

  it('excludes existing interpolated data points from calculation', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-01-31T00:00:00.000Z', 10200, { isInterpolated: true }), // old interpolated
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')

    // Should still generate for Jan 31 and Feb 28 since the existing one is interpolated
    expect(results).toHaveLength(2)
  })

  it('skips month-ends that have actual data points', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-01-31T00:00:00.000Z', 10200, { isInterpolated: false }), // actual recording
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')

    // Jan 31 has a real data point, only Feb 28 needs interpolation
    expect(results).toHaveLength(1)
  })

  it('sets platformId from argument', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 100),
      dp('2026-03-15T00:00:00.000Z', 300),
    ]
    const results = generateInterpolatedPoints(points, 'custom_plat')
    for (const r of results) {
      expect(r.platformId).toBe('custom_plat')
    }
  })
})

describe('onDataPointCreated', () => {
  it('returns interpolated points after adding a new data point', () => {
    const existing = [dp('2026-01-15T00:00:00.000Z', 10000)]
    const newPoint = dp('2026-03-15T00:00:00.000Z', 10600)

    const results = onDataPointCreated(existing, newPoint)
    // Jan 31 and Feb 28 need interpolation
    expect(results).toHaveLength(2)
    expect(results.every((r) => r.isInterpolated)).toBe(true)
  })

  it('returns empty array when new point is the only one', () => {
    const newPoint = dp('2026-01-15T00:00:00.000Z', 10000)
    const results = onDataPointCreated([], newPoint)
    expect(results).toEqual([])
  })

  it('excludes old interpolated points from calculation', () => {
    const existing = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-01-31T00:00:00.000Z', 10100, { isInterpolated: true }),
    ]
    const newPoint = dp('2026-03-15T00:00:00.000Z', 10600)

    const results = onDataPointCreated(existing, newPoint)
    // Recalculates from actual points only
    expect(results).toHaveLength(2)
  })
})

describe('onDataPointDeleted', () => {
  it('re-interpolates after removing a data point', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-02-15T00:00:00.000Z', 10300),
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    // Delete the middle point
    const results = onDataPointDeleted(points, points[1]!)
    // Now Jan 31 and Feb 28 need interpolation between Jan 15 and Mar 15
    expect(results).toHaveLength(2)
  })

  it('returns empty when only one point remains', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 100),
      dp('2026-03-15T00:00:00.000Z', 300),
    ]
    const results = onDataPointDeleted(points, points[1]!)
    expect(results).toEqual([])
  })

  it('returns empty when no points remain', () => {
    const point = dp('2026-01-15T00:00:00.000Z', 100)
    const results = onDataPointDeleted([point], point)
    expect(results).toEqual([])
  })
})

describe('onDataPointUpdated', () => {
  it('re-interpolates with updated value', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-03-15T00:00:00.000Z', 10600),
    ]
    // Update the second point's value
    const updated = { ...points[1]!, value: 11000 }
    const results = onDataPointUpdated(points, updated)

    expect(results).toHaveLength(2)
    // Values should reflect the new higher ending value
    expect(results[0]!.value).toBeGreaterThan(10000)
  })

  it('re-interpolates with updated timestamp', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 10000),
      dp('2026-02-15T00:00:00.000Z', 10300),
      dp('2026-04-15T00:00:00.000Z', 10900),
    ]
    // Move the middle point to March
    const updated = { ...points[1]!, timestamp: '2026-03-15T00:00:00.000Z' }
    const results = onDataPointUpdated(points, updated)

    // Now Jan 31, Feb 28, Mar 31 need interpolation
    expect(results).toHaveLength(3)
  })

  it('returns empty when only the updated point exists', () => {
    const point = dp('2026-01-15T00:00:00.000Z', 100)
    const updated = { ...point, value: 200 }
    const results = onDataPointUpdated([point], updated)
    expect(results).toEqual([])
  })
})

describe('edge cases', () => {
  it('handles data point exactly on month-end — no interpolation needed', () => {
    const points = [
      dp('2026-01-31T00:00:00.000Z', 10000), // exact month-end
      dp('2026-02-28T00:00:00.000Z', 10300), // exact month-end
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    // Both month-ends are covered by actual data points
    expect(results).toEqual([])
  })

  it('handles first incomplete month gracefully', () => {
    // First point is mid-January, no prior data exists
    const points = [
      dp('2026-01-20T00:00:00.000Z', 100),
      dp('2026-02-20T00:00:00.000Z', 200),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    // Jan 31 falls between the two points, so it gets interpolated
    expect(results).toHaveLength(1)
    expect(results[0]!.value).toBeGreaterThan(100)
    expect(results[0]!.value).toBeLessThan(200)
  })

  it('handles unsorted input by sorting internally', () => {
    const points = [
      dp('2026-03-15T00:00:00.000Z', 10600),
      dp('2026-01-15T00:00:00.000Z', 10000),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    expect(results).toHaveLength(2) // Jan 31 and Feb 28
  })

  it('multiple mid-month recordings do not affect boundary selection', () => {
    const points = [
      dp('2026-01-05T00:00:00.000Z', 100),
      dp('2026-01-10T00:00:00.000Z', 110),
      dp('2026-01-20T00:00:00.000Z', 130),
      dp('2026-02-15T00:00:00.000Z', 200),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    // Only Jan 31 needs interpolation (between Jan 20 and Feb 15)
    expect(results).toHaveLength(1)
    expect(results[0]!.value).toBeGreaterThan(130)
    expect(results[0]!.value).toBeLessThan(200)
  })

  it('returns empty when all data points are interpolated', () => {
    const points = [
      dp('2026-01-15T00:00:00.000Z', 100, { isInterpolated: true }),
      dp('2026-03-15T00:00:00.000Z', 300, { isInterpolated: true }),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    expect(results).toEqual([])
  })

  it('cross-year boundary interpolation works', () => {
    const points = [
      dp('2025-12-15T00:00:00.000Z', 1000),
      dp('2026-01-15T00:00:00.000Z', 1100),
    ]
    const results = generateInterpolatedPoints(points, 'plat_001')
    // Dec 31 falls between the two points
    expect(results).toHaveLength(1)
    const resultDate = new Date(results[0]!.timestamp)
    expect(resultDate.getUTCMonth()).toBe(11) // December
    expect(resultDate.getUTCDate()).toBe(31)
  })
})
